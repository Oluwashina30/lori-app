import type { AssistantBlock } from "./types";
import type { ChatApiResponse } from "./api-client";

/**
 * Maps a real backend /chat response into the AssistantBlock[] shape the
 * chat UI renders. The backend currently returns one reply string per
 * action; this splits it into a "confirmation" block for state-changing
 * actions and an "insight" block for anything conversational, mirroring
 * the two-block pattern the mock generator used.
 *
 * If you later have the backend emit a proactive follow-up insight in the
 * same call (e.g. "logged your expense" + "you're over budget on food"),
 * update src/services/actionExecutor.ts on the backend to return a second
 * string, and split it into two blocks here instead of one.
 */
export function mapChatResponseToBlocks(response: ChatApiResponse): AssistantBlock[] {
  const isStateChange =
    response.action === "create_goal" ||
    response.action === "add_contribution" ||
    response.action === "log_expense";

  if (response.needsClarification) {
    return [{ kind: "insight", text: response.reply }];
  }

  return [{ kind: isStateChange ? "confirmation" : "insight", text: response.reply }];
}

/** Formats the current time like "7:45pm", matching the design's timestamps. */
export function formatChatTimestamp(date: Date = new Date()): string {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const suffix = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${hours}:${minutes}${suffix}`;
}

