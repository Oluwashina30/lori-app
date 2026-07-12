// Matches lib/server/ai/tools.ts's log_expense tool enum exactly — the only
// place Transaction.category values actually get written for expenses.
export const EXPENSE_CATEGORIES = [
  "food",
  "transport",
  "subscriptions",
  "shopping",
  "bills",
  "entertainment",
  "health",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

const LABELS: Record<string, string> = {
  food: "Food",
  transport: "Transport",
  subscriptions: "Subscriptions",
  shopping: "Shopping",
  bills: "Bills",
  entertainment: "Entertainment",
  health: "Health",
  other: "Other",
};

export function expenseCategoryLabel(category: string): string {
  return LABELS[category] ?? category.charAt(0).toUpperCase() + category.slice(1);
}
