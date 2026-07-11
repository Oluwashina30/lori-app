import Anthropic from "@anthropic-ai/sdk";
import { AI_TOOLS, AiToolName } from "./tools";

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
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<ParsedIntent> {
  const systemPrompt = `You are the intent-parsing layer of an AI savings app. Your job: read the user's message, decide which single tool applies, and call it with accurate extracted data.

Currency: ${context.currency}
User's active goals: ${
    context.activeGoals.length
      ? context.activeGoals
          .map((g) => `"${g.name}" (${g.currentAmount}/${g.targetAmount})`)
          .join(", ")
      : "none yet"
  }
${context.recentSpendSummary ? `Recent spending: ${context.recentSpendSummary}` : ""}

Rules:
- Always call exactly one tool. If nothing financial is happening, call chit_chat.
- For add_contribution and request_insight, use goalNameHint to loosely match one of the active goals above — don't invent a goal name that isn't close to an existing one.
- Numbers: strip currency symbols/commas, return plain numbers.
- Be conservative about create_goal — only create a NEW goal if the user is clearly describing something not already in their active goals list.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    system: systemPrompt,
    messages: [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user" as const, content: message },
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
    assistantReply: textBlock?.text ?? generateFallbackReply(toolUse.name as AiToolName, toolUse.input),
  };
}

// If Claude doesn't emit accompanying text (common when tool_choice forces a call),
// generate a serviceable reply from the structured data so the chat never feels empty.
function generateFallbackReply(tool: AiToolName, input: any): string {
  switch (tool) {
    case "create_goal":
      return `Created a new goal: "${input.name}" — target ${input.targetAmount}.`;
    case "add_contribution":
      return `Added ${input.amount} toward "${input.goalNameHint}".`;
    case "log_expense":
      return `Logged ${input.amount} under ${input.category}.`;
    case "request_insight":
      return `Let me pull that up.`;
    default:
      return `Got it.`;
  }
}
