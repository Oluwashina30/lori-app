import { TransactionType, TransactionSource } from "@prisma/client";
import { prisma } from "../../prisma";

export async function recordTransaction(params: {
  userId: string;
  goalId?: string;
  type: TransactionType;
  amount: number;
  category?: string;
  description?: string;
  rawInput?: string;
  source?: TransactionSource;
}) {
  return prisma.transaction.create({
    data: {
      userId: params.userId,
      goalId: params.goalId,
      type: params.type,
      amount: params.amount,
      category: params.category,
      description: params.description,
      rawInput: params.rawInput,
      source: params.source ?? "CHAT",
    },
  });
}

export async function getRecentSpend(userId: string, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const expenses = await prisma.transaction.findMany({
    where: { userId, type: "EXPENSE", createdAt: { gte: since } },
  });

  const byCategory: Record<string, number> = {};
  for (const e of expenses) {
    const cat = e.category ?? "other";
    byCategory[cat] = (byCategory[cat] ?? 0) + Number(e.amount);
  }
  return byCategory;
}

export function summarizeSpend(byCategory: Record<string, number>, currency: string): string {
  const entries = Object.entries(byCategory);
  if (entries.length === 0) return "";
  return entries.map(([cat, amt]) => `${cat} ${currency}${amt.toLocaleString()}`).join(", ");
}
