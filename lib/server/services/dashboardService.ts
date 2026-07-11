import { prisma } from "../../prisma";

// Maps a goal's free-text category (see prisma/schema.prisma Goal.category)
// to one of the icon keys the frontend's SavingsPlanIcon type supports.
// Extend both sides together as the icon set grows.
const GOAL_ICON_MAP: Record<string, string> = {
  vehicle: "car",
  housing: "home",
  travel: "plane",
  emergency_fund: "heart-pulse",
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
  const [user, goals, monthTxns, recentTxns, latestRecommendation, latestInsight] = await Promise.all([
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
    prisma.insight.findFirst({
      where: { userId, dismissed: false },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
  const primaryGoal = goals[0]; // simplest "which goal to headline" rule — swap for nearest-deadline once you have >1 goal reliably

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
    greetingSubtitle: latestInsight?.title ?? "Here's where your money stands today",
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
      goalCurrent: primaryGoal ? Number(primaryGoal.currentAmount) : 0,
      goalTarget: primaryGoal ? Number(primaryGoal.targetAmount) : 0,
      goalPercentComplete: primaryGoal
        ? Math.min(100, Math.round((Number(primaryGoal.currentAmount) / Number(primaryGoal.targetAmount)) * 100))
        : 0,
      goalLabel: primaryGoal ? "Monthly savings goal" : "No active goal yet",
      insightMessage: latestInsight?.content ?? "Start a goal from the chat box to see progress here.",
    },
    savingsPlan: goals.map((g) => ({
      id: g.id,
      label: g.name,
      icon: GOAL_ICON_MAP[g.category ?? ""] ?? "heart-pulse",
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
    aiInsight: {
      title: "Insight",
      message: latestInsight?.content ?? "Log a few transactions and I'll start surfacing insights here.",
    },
  };
}
