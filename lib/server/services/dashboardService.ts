import { prisma } from "../../prisma";
import { humanizeInsightTitle } from "@/lib/utils";

// Maps a goal's free-text category (see prisma/schema.prisma Goal.category)
// to one of the icon keys the frontend's SavingsPlanIcon type supports.
// Extend both sides together as the icon set grows. Covers two category
// vocabularies that both write to this same free-text column: the chat
// create_goal tool (lib/server/ai/tools.ts — housing/vehicle/gadget/event)
// and onboarding's capture_goal tool (lib/server/ai/tools.ts — home/car/
// wedding/business, matching the onboarding card labels).
const GOAL_ICON_MAP: Record<string, string> = {
  vehicle: "car",
  car: "car",
  housing: "home",
  home: "home",
  travel: "plane",
  emergency_fund: "heart-pulse",
  education: "graduation-cap",
  wedding: "heart",
  business: "briefcase",
  gadget: "sparkles",
  event: "sparkles",
  other: "sparkles",
};

const TXN_ICON_MAP: Record<string, string> = {
  subscriptions: "spotify", // placeholder default for subscription-type spend
  entertainment: "youtube",
};

function goalStatus(current: number, target: number): "in-progress" | "complete" | "not-started" {
  if (current <= 0) return "not-started";
  if (current >= target) return "complete";
  return "in-progress";
}

// The greeting subtitle is a short narrative status line, not an insight
// category label — keep it separate from the AI insight feed entirely.
function getGreetingSubtitle(monthContributions: number, monthExpenses: number): string {
  if (monthContributions === 0 && monthExpenses === 0) {
    return "Here's where your money stands today";
  }
  if (monthContributions >= monthExpenses) {
    return "Your finances are looking healthy this month";
  }
  return "Let's keep an eye on spending this month";
}

/**
 * Builds the full dashboard payload for a user in one call. This is what
 * the frontend's fetchDashboardData() hits — every field here maps 1:1 to
 * lib/types.ts's DashboardData interface on the frontend.
 */
export async function getDashboardData(userId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // All six reads are independent — fire them in parallel instead of
  // waiting on each round trip in sequence.
  const [user, goals, monthTxns, recentTxns, latestRecommendation, recentInsights] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.goal.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    }),
    prisma.transaction.findMany({
      where: { userId, createdAt: { gte: startOfMonth } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.insight.findFirst({
      where: { userId, type: "AUTO_SAVE_RECOMMENDATION", dismissed: false },
      orderBy: { createdAt: "desc" },
    }),
    // Several recent insights, not just the latest — the dashboard card
    // stacks as many as fit within its max height, so shorter insights
    // let more of them show while longer ones naturally push others out.
    prisma.insight.findMany({
      where: { userId, dismissed: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);
  const latestInsight = recentInsights[0];

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0);

  const monthContributions = monthTxns
    .filter((t) => t.type === "CONTRIBUTION")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const monthExpenses = monthTxns
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const cashFlowTotal = monthContributions + monthExpenses;

  return {
    user: {
      id: user.id,
      name: user.name,
      initials: user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
    },
    currency: user.currency,
    greetingSubtitle: getGreetingSubtitle(monthContributions, monthExpenses),
    recommendation: {
      // NOTE: recommendation.message expects a single actionable line — this
      // pulls the latest AI auto-save recommendation insight if one exists.
      message:
        latestRecommendation?.content ??
        "Tell me what you spent or earned today and I'll start finding patterns.",
    },
    chatSuggestions: [
      { id: "s1", label: "I got paid today" },
      { id: "s2", label: "Help me save faster" },
      { id: "s3", label: "Create a new goal" },
      { id: "s4", label: "How am I doing this month?" },
    ],
    savingsSummary: {
      total: totalSaved,
      // TODO: changeAmount/changePercentage need a period-over-period
      // snapshot (e.g. a nightly balance-history table) to compute honestly.
      // Wiring zeros for now rather than fabricating a trend.
      changeAmount: 0,
      changePercentage: 0,
      goalCurrent: totalSaved,
      goalTarget: totalTarget,
      goalPercentComplete: totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0,
      goalLabel: goals.length > 0 ? "Combined savings goal" : "No active goal yet",
      insightMessage: latestInsight?.content ?? "Start a goal from the chat box to see progress here.",
    },
    savingsPlan: goals.map((g) => ({
      id: g.id,
      label: g.name,
      icon: GOAL_ICON_MAP[g.category ?? ""] ?? "sparkles",
      currentAmount: Number(g.currentAmount),
      targetAmount: Number(g.targetAmount),
      status: goalStatus(Number(g.currentAmount), Number(g.targetAmount)),
    })),
    cashFlow: {
      savings: monthContributions,
      expenses: monthExpenses,
      percentage: cashFlowTotal > 0 ? Math.round((monthContributions / cashFlowTotal) * 100) : 0,
    },
    activities: recentTxns.map((t) => ({
      id: t.id,
      name: t.description || t.category || (t.type === "CONTRIBUTION" ? "Savings contribution" : "Expense"),
      date: t.createdAt.toISOString().slice(0, 10),
      amount: Number(t.amount),
      type: t.type === "EXPENSE" ? "expense" : "income",
      icon: TXN_ICON_MAP[t.category ?? ""] ?? "salary",
    })),
    aiInsights:
      recentInsights.length > 0
        ? recentInsights.map((insight) => ({
            id: insight.id,
            title: humanizeInsightTitle(insight.title),
            message: insight.content,
          }))
        : [
            {
              id: "placeholder",
              title: "Insight",
              message: "Log a few transactions and I'll start surfacing insights here.",
            },
          ],
  };
}
