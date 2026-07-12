import { prisma } from "../../prisma";

export type AnalyticsRange = "7" | "30" | "90" | "all";

function rangeToDays(range: AnalyticsRange): number | null {
  if (range === "all") return null;
  return Number(range);
}

function bucketGranularity(days: number | null): "day" | "week" | "month" {
  if (days === null || days > 90) return "month";
  if (days > 30) return "week";
  return "day";
}

function bucketStart(date: Date, granularity: "day" | "week" | "month"): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (granularity === "month") {
    d.setDate(1);
    return d;
  }
  if (granularity === "week") {
    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diffToMonday);
    return d;
  }
  return d;
}

function nextBucket(date: Date, granularity: "day" | "week" | "month"): Date {
  const d = new Date(date);
  if (granularity === "month") d.setMonth(d.getMonth() + 1);
  else if (granularity === "week") d.setDate(d.getDate() + 7);
  else d.setDate(d.getDate() + 1);
  return d;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface CashFlowPoint {
  date: string; // bucket start, ISO date (yyyy-mm-dd)
  contributions: number;
  expenses: number;
}

export interface AnalyticsData {
  rangeDays: number | null;
  totalContributions: number;
  totalExpenses: number;
  totalWithdrawals: number;
  net: number;
  /** Contributions as a share of contributions+expenses, 0-100. */
  savingsRate: number;
  categoryBreakdown: CategoryBreakdownItem[];
  cashFlowSeries: CashFlowPoint[];
}

export async function getAnalyticsData(userId: string, range: AnalyticsRange): Promise<AnalyticsData> {
  const days = rangeToDays(range);
  const since = days === null ? undefined : new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  if (since) since.setHours(0, 0, 0, 0);

  const [transactions, earliest] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, ...(since ? { createdAt: { gte: since } } : {}) },
      orderBy: { createdAt: "asc" },
    }),
    since ? Promise.resolve(null) : prisma.transaction.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } }),
  ]);

  let totalContributions = 0;
  let totalExpenses = 0;
  let totalWithdrawals = 0;
  const byCategory = new Map<string, number>();

  const granularity = bucketGranularity(days);
  const seriesStart = since ?? bucketStart(earliest?.createdAt ?? new Date(), granularity);
  const buckets = new Map<string, { contributions: number; expenses: number }>();
  for (let cursor = bucketStart(seriesStart, granularity); cursor <= new Date(); cursor = nextBucket(cursor, granularity)) {
    buckets.set(cursor.toISOString().slice(0, 10), { contributions: 0, expenses: 0 });
  }

  for (const t of transactions) {
    const amount = Number(t.amount);
    if (t.type === "CONTRIBUTION") totalContributions += amount;
    else if (t.type === "EXPENSE") totalExpenses += amount;
    else if (t.type === "WITHDRAWAL") totalWithdrawals += amount;

    if (t.type === "EXPENSE") {
      const category = t.category ?? "other";
      byCategory.set(category, (byCategory.get(category) ?? 0) + amount);
    }

    if (t.type === "CONTRIBUTION" || t.type === "EXPENSE") {
      const key = bucketStart(t.createdAt, granularity).toISOString().slice(0, 10);
      const bucket = buckets.get(key) ?? { contributions: 0, expenses: 0 };
      if (t.type === "CONTRIBUTION") bucket.contributions += amount;
      else bucket.expenses += amount;
      buckets.set(key, bucket);
    }
  }

  const categoryBreakdown: CategoryBreakdownItem[] = [...byCategory.entries()]
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const cashFlowSeries: CashFlowPoint[] = [...buckets.entries()]
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const flowTotal = totalContributions + totalExpenses;

  return {
    rangeDays: days,
    totalContributions,
    totalExpenses,
    totalWithdrawals,
    net: totalContributions - totalExpenses - totalWithdrawals,
    savingsRate: flowTotal > 0 ? Math.round((totalContributions / flowTotal) * 100) : 0,
    categoryBreakdown,
    cashFlowSeries,
  };
}
