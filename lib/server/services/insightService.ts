import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "../../prisma";
import * as goalService from "./goalService";
import * as transactionService from "./transactionService";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * On-demand insight — called when the user asks a question in chat
 * (request_insight tool). Pulls relevant data and asks Claude to reason
 * over it in natural language, scoped to what was asked.
 */
export async function generateInsight(userId: string, focus: string, goalNameHint?: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const goals = await goalService.getUserActiveGoals(userId);
  const spend = await transactionService.getRecentSpend(userId, 30);

  let goalContext = "";
  if (goalNameHint) {
    const goal = await goalService.findGoalByHint(userId, goalNameHint);
    if (goal) {
      goalContext = `Focused goal: "${goal.name}" — ${goal.currentAmount}/${goal.targetAmount}${
        goal.deadline ? `, deadline ${goal.deadline.toISOString().slice(0, 10)}` : ""
      }.`;
    }
  }

  const prompt = `User asked about: ${focus}.
${goalContext}
All active goals: ${goals.map((g: (typeof goals)[number]) => `${g.name} (${g.currentAmount}/${g.targetAmount})`).join("; ") || "none"}
Last 30 days spending by category: ${JSON.stringify(spend)}
Currency: ${user.currency}

Give a short (2-4 sentence), specific, encouraging-but-honest answer. Include a concrete number or percentage where possible. No generic advice — ground it in the numbers above.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content.find((b) => b.type === "text") as Anthropic.TextBlock | undefined;
  const content = text?.text ?? "I don't have enough data yet to answer that.";

  return prisma.insight.create({
    data: {
      userId,
      type: "SUGGESTION",
      title: `Insight: ${focus}`,
      content,
    },
  });
}

/**
 * All insights for a user, newest first — backs the AI Insights history
 * page (both on-demand SUGGESTION rows from generateInsight and proactive
 * rows from runAutoSaveAnalysis live in the same table).
 */
export function listInsights(userId: string) {
  return prisma.insight.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

/**
 * Background job (run nightly, or after N transactions) — this is the
 * "AI auto-save" brain. It looks at spending trends and recommends (or,
 * if the user has opted into full auto-save, executes) a save amount.
 */
export async function runAutoSaveAnalysis(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const spend30 = await transactionService.getRecentSpend(userId, 30);
  const spend7 = await transactionService.getRecentSpend(userId, 7);
  const goals = await goalService.getUserActiveGoals(userId);

  const totalSpend30 = Object.values(spend30).reduce((a, b) => a + b, 0);
  const totalSpend7 = Object.values(spend7).reduce((a, b) => a + b, 0);
  const avgWeekly = totalSpend30 / (30 / 7);

  // Simple anomaly signal: this week's spend vs the 30-day weekly average
  const anomalyRatio = avgWeekly > 0 ? totalSpend7 / avgWeekly : 1;

  const prompt = `You are the auto-save recommendation engine for a savings app.

User's risk tolerance: ${user.riskTolerance}
Monthly income: ${user.monthlyIncome ?? "unknown"}
Average weekly spend (30-day basis): ${avgWeekly.toFixed(2)}
This week's spend: ${totalSpend7.toFixed(2)}
Active goals: ${goals.map((g: (typeof goals)[number]) => `${g.name} (${g.currentAmount}/${g.targetAmount}, deadline ${g.deadline ?? "none"})`).join("; ") || "none"}
Currency: ${user.currency}

Recommend ONE specific auto-save amount for this week and which goal it should go to (pick the goal with the nearest deadline or lowest completion %, unless none exist). If spending this week is unusually high (ratio ${anomalyRatio.toFixed(2)}x normal), factor that into a lower, safer number and mention it. Respond in 2-3 sentences, end with a line in the exact format: "RECOMMENDED_AMOUNT: <number>" and "TARGET_GOAL: <goal name or NONE>".`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const text = (response.content.find((b) => b.type === "text") as Anthropic.TextBlock | undefined)?.text ?? "";
  const amountMatch = text.match(/RECOMMENDED_AMOUNT:\s*([\d.]+)/);
  const goalMatch = text.match(/TARGET_GOAL:\s*(.+)/);
  const recommendedAmount = amountMatch ? parseFloat(amountMatch[1]) : null;
  const targetGoalName = goalMatch ? goalMatch[1].trim() : null;

  const insight = await prisma.insight.create({
    data: {
      userId,
      type: anomalyRatio > 1.4 ? "ANOMALY" : "AUTO_SAVE_RECOMMENDATION",
      title: anomalyRatio > 1.4 ? "Unusual spending detected" : "Auto-save recommendation",
      content: text.split("RECOMMENDED_AMOUNT:")[0].trim(),
      data: { recommendedAmount, targetGoalName, anomalyRatio },
    },
  });

  return insight;
}
