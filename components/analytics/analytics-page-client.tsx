"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { SelectableChip } from "@/components/onboarding/selectable";
import { StatCard } from "@/components/analytics/stat-card";
import { CategoryBreakdownCard } from "@/components/analytics/category-breakdown-card";
import { CashFlowChartCard } from "@/components/analytics/cash-flow-chart-card";
import { GoalsSummaryCard } from "@/components/analytics/goals-summary-card";
import { AnalyticsGaugeIcon } from "@/components/icons/sidebar-icons";
import { fetchAnalytics } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type { AnalyticsData, AnalyticsRange, GoalDetail, UserProfile } from "@/lib/types";

const RANGES: { key: AnalyticsRange; label: string }[] = [
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
  { key: "all", label: "All time" },
];

export interface AnalyticsPageClientProps {
  user: UserProfile;
  currency: string;
  initialData: AnalyticsData;
  goals: GoalDetail[];
}

export function AnalyticsPageClient({ user, currency, initialData, goals }: AnalyticsPageClientProps) {
  const [range, setRange] = React.useState<AnalyticsRange>("30");
  const [data, setData] = React.useState(initialData);
  const [loading, setLoading] = React.useState(false);

  async function handleRangeChange(next: AnalyticsRange) {
    if (next === range) return;
    setRange(next);
    setLoading(true);
    try {
      const result = await fetchAnalytics(next);
      setData(result);
    } catch (err) {
      console.error("fetch analytics failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell user={user} contentClassName="flex flex-1 flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <AnalyticsGaugeIcon className="h-5 w-5 text-accent-solid" />
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-[26px]">Analytics</h1>
          </div>
          <p className="mt-1.5 text-sm text-muted sm:text-[15px]">
            See where your money&apos;s going and how you&apos;re pacing.
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap gap-2.5"
      >
        {RANGES.map((r) => (
          <SelectableChip key={r.key} selected={range === r.key} disabled={loading} onClick={() => handleRangeChange(r.key)}>
            {r.label}
          </SelectableChip>
        ))}
      </motion.div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total saved" value={data.totalContributions} formatter={(v) => formatCurrency(v, currency)} valueClassName="text-positive" index={0} />
        <StatCard label="Total spent" value={data.totalExpenses} formatter={(v) => formatCurrency(v, currency)} valueClassName="text-negative" index={1} />
        <StatCard label="Net" value={data.net} formatter={(v) => formatCurrency(v, currency)} index={2} />
        <StatCard label="Savings rate" value={data.savingsRate} formatter={(v) => `${Math.round(v)}%`} index={3} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CashFlowChartCard series={data.cashFlowSeries} currency={currency} />
        <CategoryBreakdownCard items={data.categoryBreakdown} currency={currency} />
      </div>

      <GoalsSummaryCard goals={goals} currency={currency} />
    </AppShell>
  );
}
