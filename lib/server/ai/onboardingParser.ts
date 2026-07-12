import Anthropic from "@anthropic-ai/sdk";
import { CAPTURE_GOAL_TOOL } from "./tools";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface CapturedGoal {
  name: string;
  category: "home" | "car" | "travel" | "education" | "wedding" | "business" | "emergency_fund" | "other";
  targetAmount?: number;
  deadline?: string;
  confidence: "high" | "medium" | "low";
  summary: string;
}

/**
 * Onboarding-only counterpart to intentParser.ts's parseIntent — same
 * forced-tool-call pattern, but always calls the single capture_goal tool
 * (no chit_chat fallback needed; onboarding always has a goal to extract).
 *
 * seedCategory lets a goal-type card tap (e.g. "Travel") seed the call
 * without any free text — Claude still fills in a sensible name/summary.
 */
export async function captureGoal(message: string, seedCategory?: string): Promise<CapturedGoal> {
  const systemPrompt = `You are the onboarding intent-parser for an AI savings app. A new user is describing a savings goal, either by typing freely or by tapping a category card. Extract what they've told you into the capture_goal tool.

${seedCategory ? `The user tapped the "${seedCategory}" category card.` : ""}

Rules:
- Never invent a targetAmount or deadline the user didn't state or clearly imply — omit the field instead.
- "confidence" reflects the extraction as a whole: high if name+category+amount+deadline are all clear, medium if some are missing but the goal itself is clear, low if the description is vague.
- "summary" is a short, warm, second-person confirmation — this is shown directly to the user.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system: systemPrompt,
    messages: [{ role: "user", content: message || `I want to save for: ${seedCategory}` }],
    tools: [CAPTURE_GOAL_TOOL] as unknown as Anthropic.Tool[],
    tool_choice: { type: "tool", name: "capture_goal" },
  });

  const toolUse = response.content.find((b) => b.type === "tool_use") as
    | Anthropic.ToolUseBlock
    | undefined;

  if (!toolUse) {
    // Forced tool_choice should make this unreachable, but fall back to a
    // minimal draft rather than throw — the follow-up screens can fill the rest.
    return {
      name: seedCategory ?? "New goal",
      category: (seedCategory as CapturedGoal["category"]) ?? "other",
      confidence: "low",
      summary: "Let's fill in the details.",
    };
  }

  return toolUse.input as CapturedGoal;
}
