import { Goal } from "@prisma/client";
import { prisma } from "../../prisma";

export async function createGoal(userId: string, data: {
  name: string;
  targetAmount: number;
  deadline?: string;
  category?: string;
  createdByAI?: boolean;
}) {
  return prisma.goal.create({
    data: {
      userId,
      name: data.name,
      targetAmount: data.targetAmount,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      category: data.category,
      createdByAI: data.createdByAI ?? false,
    },
  });
}

/**
 * Fuzzy-match a name hint (e.g. "phone fund") against a user's active goals
 * (e.g. "New iPhone"). Simple normalized token-overlap scoring — swap for a
 * proper library (fuse.js) if goal counts grow large.
 */
export async function findGoalByHint(userId: string, hint: string): Promise<Goal | null> {
  const goals = await prisma.goal.findMany({
    where: { userId, status: "ACTIVE" },
  });
  if (goals.length === 0) return null;

  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(" ").filter(Boolean);

  const hintTokens = new Set(normalize(hint));

  let best: { goal: Goal; score: number } | null = null;
  for (const goal of goals) {
    const goalTokens = normalize(goal.name);
    const overlap = goalTokens.filter((t) => hintTokens.has(t)).length;
    const score = overlap / Math.max(goalTokens.length, hintTokens.size, 1);
    if (!best || score > best.score) best = { goal, score };
  }

  // Require some minimal confidence — otherwise return null so the caller
  // can ask the user to clarify instead of silently picking the wrong goal.
  return best && best.score > 0.2 ? best.goal : null;
}

export async function addToGoal(goalId: string, amount: number) {
  return prisma.goal.update({
    where: { id: goalId },
    data: { currentAmount: { increment: amount } },
  });
}

export async function getUserActiveGoals(userId: string) {
  return prisma.goal.findMany({ where: { userId, status: "ACTIVE" } });
}
