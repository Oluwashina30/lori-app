// Every possible thing the AI can decide to do with a chat message,
// expressed as an Anthropic tool schema. The model MUST pick one.
// Keep these tight — vague schemas produce vague extractions.

export const AI_TOOLS = [
  {
    name: "create_goal",
    description:
      "Create a new savings goal. Use when the user states an intention to save FOR something new, " +
      "or the AI infers a sensible goal from context (e.g. 'I want to save for a new phone').",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Short goal name, e.g. 'New iPhone'" },
        targetAmount: { type: "number", description: "Target amount in the user's currency" },
        deadline: {
          type: "string",
          format: "date",
          description: "ISO date if the user mentioned a timeframe, otherwise omit",
        },
        category: {
          type: "string",
          enum: ["emergency_fund", "travel", "gadget", "education", "housing", "vehicle", "event", "other"],
        },
        initialContribution: {
          type: "number",
          description: "If the user also mentions putting money in right away",
        },
      },
      required: ["name", "targetAmount"],
    },
  },
  {
    name: "add_contribution",
    description:
      "Add money to an EXISTING goal. Use when the user says they saved/added/put money toward a goal that " +
      "already exists. Match by name loosely (e.g. 'phone fund' matches 'New iPhone').",
    input_schema: {
      type: "object",
      properties: {
        goalNameHint: { type: "string", description: "Best-guess name of the existing goal to match against" },
        amount: { type: "number" },
      },
      required: ["goalNameHint", "amount"],
    },
  },
  {
    name: "log_expense",
    description:
      "Log a spending event that is NOT a contribution to a goal — regular spending the user mentions in passing " +
      "(e.g. 'spent 5k on transport today'). Used for spending-pattern analysis, not goal progress.",
    input_schema: {
      type: "object",
      properties: {
        amount: { type: "number" },
        category: {
          type: "string",
          enum: ["food", "transport", "subscriptions", "shopping", "bills", "entertainment", "health", "other"],
        },
        description: { type: "string" },
      },
      required: ["amount", "category"],
    },
  },
  {
    name: "request_insight",
    description:
      "The user is asking a question about their savings/spending rather than reporting a transaction " +
      "(e.g. 'how am I doing on my travel goal', 'where is my money going'). Triggers the insight engine.",
    input_schema: {
      type: "object",
      properties: {
        focus: {
          type: "string",
          enum: ["goal_progress", "spending_breakdown", "forecast", "general"],
        },
        goalNameHint: { type: "string", description: "If the question is about a specific goal" },
      },
      required: ["focus"],
    },
  },
  {
    name: "chit_chat",
    description: "No financial action or data extractable — greetings, small talk, unclear input.",
    input_schema: {
      type: "object",
      properties: {
        reason: { type: "string" },
      },
      required: [],
    },
  },
] as const;

export type AiToolName = (typeof AI_TOOLS)[number]["name"];

// Used only during onboarding (lib/server/ai/onboardingParser.ts), not part
// of AI_TOOLS/parseIntent's chat pipeline — kept separate since it's always
// force-called with a single tool, never chosen among several.
export const CAPTURE_GOAL_TOOL = {
  name: "capture_goal",
  description:
    "Extract a structured savings goal from the user's own description during onboarding. " +
    "Omit targetAmount or deadline entirely if they weren't stated or can't be confidently inferred — " +
    "do not guess a number just to fill the field. The app will ask a follow-up question for whatever's missing.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Short goal name, e.g. 'Japan Trip'" },
      category: {
        type: "string",
        enum: ["home", "car", "travel", "education", "wedding", "business", "emergency_fund", "other"],
      },
      targetAmount: {
        type: "number",
        description: "Only include if the user stated an amount or gave enough detail to estimate one confidently",
      },
      deadline: {
        type: "string",
        format: "date",
        description: "ISO date, only include if a timeframe was stated or clearly implied (e.g. 'next spring')",
      },
      confidence: {
        type: "string",
        enum: ["high", "medium", "low"],
        description: "Your overall confidence in this extraction as a whole — for display only, not used for branching logic",
      },
      summary: {
        type: "string",
        description: "One short sentence confirming what you understood, in second person, e.g. \"A trip to Japan, roughly ₦2.5m.\"",
      },
    },
    required: ["name", "category", "confidence", "summary"],
  },
} as const;
