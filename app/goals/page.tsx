import { redirect } from "next/navigation";
import { GoalsPageClient } from "@/components/goals/goals-page-client";
import { getUserId } from "@/lib/server/auth";
import { getUserGoals } from "@/lib/server/services/goalService";
import { prisma } from "@/lib/prisma";
import type { GoalDetail } from "@/lib/types";

export default async function GoalsPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const [user, goals] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, name: true, currency: true } }),
    getUserGoals(userId),
  ]);

  const initialGoals: GoalDetail[] = goals.map((goal) => ({
    id: goal.id,
    name: goal.name,
    category: goal.category,
    targetAmount: Number(goal.targetAmount),
    currentAmount: Number(goal.currentAmount),
    deadline: goal.deadline ? goal.deadline.toISOString() : null,
    status: goal.status,
    recommendedContribution: goal.recommendedContribution ? Number(goal.recommendedContribution) : null,
    createdByAI: goal.createdByAI,
    createdAt: goal.createdAt.toISOString(),
  }));

  return (
    <GoalsPageClient
      user={{
        id: user.id,
        name: user.name,
        initials: user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      }}
      currency={user.currency}
      initialGoals={initialGoals}
    />
  );
}
