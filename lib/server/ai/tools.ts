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
