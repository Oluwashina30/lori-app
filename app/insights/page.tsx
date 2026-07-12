import { redirect } from "next/navigation";
import { InsightsPageClient } from "@/components/insights/insights-page-client";
import { getUserId } from "@/lib/server/auth";
import { listInsights } from "@/lib/server/services/insightService";
import { prisma } from "@/lib/prisma";
import type { InsightRecord } from "@/lib/types";

export default async function InsightsPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const [user, insights] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, name: true } }),
    listInsights(userId),
  ]);

  const history: InsightRecord[] = insights.map((insight) => ({
    id: insight.id,
    type: insight.type,
    title: insight.title,
    content: insight.content,
    createdAt: insight.createdAt.toISOString(),
    dismissed: insight.dismissed,
  }));

  return (
    <InsightsPageClient
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
      initialHistory={history}
    />
  );
}
