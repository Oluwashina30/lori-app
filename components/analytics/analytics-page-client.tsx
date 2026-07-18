"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/analytics/stat-card";
import { CategoryBreakdownCard } from "@/components/analytics/category-breakdown-card";
import { CashFlowChartCard } from "@/components/analytics/cash-flow-chart-card";
import { GoalsSummaryCard } from "@/components/analytics/goals-summary-card";
import { fetchAnalytics } from "@/lib/api-client";
import { cn, formatCurrency } from "@/lib/utils";
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
  const [rangeMenuOpen, setRangeMenuOpen] = React.useState(false);
  const rangeMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!rangeMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (rangeMenuRef.current && !rangeMenuRef.current.contains(event.target as Node)) {
        setRangeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [rangeMenuOpen]);

  const activeRangeLabel = RANGES.find((r) => r.key === range)?.label ?? "30 days";

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
        className="relative flex flex-col items-center gap-1.5 text-center"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted sm:text-[15px]">See where your money&apos;s going and how you&apos;re pacing.</p>

        <div ref={rangeMenuRef} className="absolute right-0 top-0">
          <button
            type="button"
            disabled={loading}
            onClick={() => setRangeMenuOpen((open) => !open)}
            className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-4 py-2 text-[13.5px] font-medium text-foreground transition-colors duration-200 hover:border-border-strong disabled:pointer-events-none disabled:opacity-50"
          >
            {activeRangeLabel}
            <ChevronDown className={cn("h-4 w-4 text-muted transition-transform duration-200", rangeMenuOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {rangeMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-[calc(100%+8px)] z-10 min-w-[160px] overflow-hidden rounded-xl border border-border-subtle bg-surface-elevated py-1.5 shadow-xl shadow-black/30"
              >
                {RANGES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => {
                      handleRangeChange(r.key);
                      setRangeMenuOpen(false);
                    }}
                    className={cn(
                      "block w-full px-4 py-2 text-left text-[13.5px] font-medium transition-colors duration-150",
                      range === r.key ? "text-accent-solid" : "text-foreground hover:bg-white/5"
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
