import { redirect } from "next/navigation";
import { AnalyticsPageClient } from "@/components/analytics/analytics-page-client";
import { getUserId } from "@/lib/server/auth";
import { getAnalyticsData } from "@/lib/server/services/analyticsService";
import { getUserGoals } from "@/lib/server/services/goalService";
import { prisma } from "@/lib/prisma";
import type { GoalDetail } from "@/lib/types";

export default async function AnalyticsPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const [user, data, rawGoals] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, name: true, currency: true } }),
    getAnalyticsData(userId, "30"),
    getUserGoals(userId),
  ]);

  const goals: GoalDetail[] = rawGoals.map((goal) => ({
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
    <AnalyticsPageClient
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
      initialData={data}
      goals={goals}
    />
  );
}
