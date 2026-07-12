import { Goal, GoalStatus } from "@prisma/client";
import { prisma } from "../../prisma";

async function assertOwnedGoal(userId: string, goalId: string): Promise<Goal> {
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) throw new Error("Goal not found");
  return goal;
}

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

/** Every goal regardless of status — backs the full Goals page (vs. the dashboard's ACTIVE-only list). */
export async function getUserGoals(userId: string) {
  return prisma.goal.findMany({ where: { userId }, orderBy: [{ status: "asc" }, { createdAt: "desc" }] });
}

export async function updateGoal(
  userId: string,
  goalId: string,
  data: { name?: string; targetAmount?: number; deadline?: string | null; category?: string }
) {
  await assertOwnedGoal(userId, goalId);
  return prisma.goal.update({
    where: { id: goalId },
    data: {
      name: data.name,
      targetAmount: data.targetAmount,
      category: data.category,
      deadline: data.deadline === undefined ? undefined : data.deadline ? new Date(data.deadline) : null,
    },
  });
}

export async function setGoalStatus(userId: string, goalId: string, status: GoalStatus) {
  await assertOwnedGoal(userId, goalId);
  return prisma.goal.update({ where: { id: goalId }, data: { status } });
}

export async function deleteGoal(userId: string, goalId: string) {
  await assertOwnedGoal(userId, goalId);
  // Transaction/Insight rows reference goalId optionally — null it out first
  // rather than leaving a dangling foreign key (there's no ON DELETE CASCADE
  // on either relation, so a direct delete would fail once either exists).
  await prisma.$transaction([
    prisma.transaction.updateMany({ where: { goalId }, data: { goalId: null } }),
    prisma.insight.updateMany({ where: { goalId }, data: { goalId: null } }),
    prisma.goal.delete({ where: { id: goalId } }),
  ]);
}

/** Adds a contribution and records the Transaction atomically, for goal-page-driven (not chat-driven) contributions. */
export async function contributeToGoal(userId: string, goalId: string, amount: number) {
  await assertOwnedGoal(userId, goalId);
  const [goal] = await prisma.$transaction([
    prisma.goal.update({ where: { id: goalId }, data: { currentAmount: { increment: amount } } }),
    prisma.transaction.create({
      data: { userId, goalId, type: "CONTRIBUTION", amount, source: "MANUAL" },
    }),
  ]);
  return goal;
}
