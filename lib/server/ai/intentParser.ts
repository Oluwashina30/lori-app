import Anthropic from "@anthropic-ai/sdk";
import { AI_TOOLS, AiToolName } from "./tools";
import { formatCurrency } from "@/lib/utils";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ParsedIntent {
  tool: AiToolName;
  input: Record<string, any>;
  assistantReply: string; // natural language reply to show the user in chat
}

export interface UserContext {
  currency: string;
  activeGoals: { name: string; currentAmount: number; targetAmount: number }[];
  recentSpendSummary?: string; // e.g. "Last 7 days: food ₦18,000, transport ₦9,500"
}

export interface ImageAttachment {
  /** Base64-encoded image bytes, no data-URL prefix. */
  data: string;
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
}

/**
 * Sends the user's chat message + live context to Claude, forces a tool call,
 * and returns the structured action alongside a conversational reply.
 *
 * Two-pass approach:
 *  1. Force tool_choice to guarantee structured extraction (no free text mixed in)
 *  2. Ask for a short natural-language reply separately in the same call via
 *     a "reply" the model embeds in tool input isn't ideal — instead we do
 *     a single call with tool_choice "auto" and a system prompt that pushes
 *     the model to always call a tool, using chit_chat as the fallback.
 */
export async function parseIntent(
  message: string,
  context: UserContext,
  history: { role: "user" | "assistant"; content: string }[] = [],
  image?: ImageAttachment
): Promise<ParsedIntent> {
  const fmt = (v: number) => formatCurrency(v, context.currency);
  const systemPrompt = `You are the intent-parsing layer of an AI savings app. Your job: read the user's message, decide which single tool applies, and call it with accurate extracted data.

User's currency: ${context.currency}
User's active goals: ${
    context.activeGoals.length
      ? context.activeGoals
          .map((g) => `"${g.name}" (${fmt(g.currentAmount)}/${fmt(g.targetAmount)})`)
          .join(", ")
      : "none yet"
  }
${context.recentSpendSummary ? `Recent spending: ${context.recentSpendSummary}` : ""}

Rules:
- Always call exactly one tool. If nothing financial is happening, call chit_chat.
- For add_contribution and request_insight, use goalNameHint to loosely match one of the active goals above — don't invent a goal name that isn't close to an existing one.
- Numbers passed to tools: strip currency symbols/commas, return plain numbers.
- In your natural-language reply text, always write money amounts using the exact currency symbol shown above (e.g. "${fmt(1000)}"), never a different currency's symbol.
- Be conservative about create_goal — only create a NEW goal if the user is clearly describing something not already in their active goals list.
- If the user attaches a photo (e.g. a receipt), read the total amount and merchant/category off it directly and call log_expense (or add_contribution if it's clearly a savings deposit slip) — don't ask them to retype what's already visible in the image.`;

  const userContent: Anthropic.MessageParam["content"] = image
    ? [
        { type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data } },
        { type: "text", text: message || "Here's a photo — please log it." },
      ]
    : message;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: systemPrompt,
    messages: [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user" as const, content: userContent },
    ],
    tools: AI_TOOLS as any,
    tool_choice: { type: "auto" },
  });

  const toolUse = response.content.find((b) => b.type === "tool_use") as
    | Anthropic.ToolUseBlock
    | undefined;
  const textBlock = response.content.find((b) => b.type === "text") as
    | Anthropic.TextBlock
    | undefined;

  if (!toolUse) {
    // Model replied with plain text only — treat as chit_chat
    return {
      tool: "chit_chat",
      input: {},
      assistantReply: textBlock?.text ?? "Got it.",
    };
  }

  return {
    tool: toolUse.name as AiToolName,
    input: toolUse.input as Record<string, any>,
    assistantReply:
      textBlock?.text ?? generateFallbackReply(toolUse.name as AiToolName, toolUse.input, context.currency),
  };
}

// If Claude doesn't emit accompanying text (common when tool_choice forces a call),
// generate a serviceable reply from the structured data so the chat never feels empty.
function generateFallbackReply(tool: AiToolName, input: any, currency: string): string {
  switch (tool) {
    case "create_goal":
      return `Created a new goal: "${input.name}" — target ${formatCurrency(input.targetAmount, currency)}.`;
    case "add_contribution":
      return `Added ${formatCurrency(input.amount, currency)} toward "${input.goalNameHint}".`;
    case "log_expense":
      return `Logged ${formatCurrency(input.amount, currency)} under ${input.category}.`;
    case "request_insight":
      return `Let me pull that up.`;
    default:
      return `Got it.`;
  }
}
