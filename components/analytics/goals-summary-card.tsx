"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { goalCategoryMeta } from "@/lib/goal-categories";
import { formatCurrency, formatDeadline } from "@/lib/utils";
import type { GoalCategory } from "@/lib/types";
import type { GoalDetail } from "@/lib/types";

export interface GoalsSummaryCardProps {
  goals: GoalDetail[];
  currency: string;
  className?: string;
}

/** Per-category accent used for the icon tile and progress bar dot — matches the landing page's savings-categories-section palette so the two read as the same design language. */
const CATEGORY_COLOR: Record<GoalCategory, string> = {
  home: "#fb7d3f",
  car: "#60a5fa",
  travel: "#f472b6",
  education: "#a78bfa",
  wedding: "#fb7185",
  business: "#4ade80",
  emergency_fund: "#fbbf24",
  other: "#94a3b8",
};

export function GoalsSummaryCard({ goals, currency, className }: GoalsSummaryCardProps) {
  const activeGoals = goals.filter((g) => g.status === "ACTIVE");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <Card>
        <div className="flex items-center justify-between">
          <CardTitle>Goals Progress</CardTitle>
          <Link href="/goals" className="text-[13px] font-medium text-muted transition-colors hover:text-foreground">
            View all
          </Link>
        </div>

        {activeGoals.length === 0 ? (
          <p className="mt-6 text-[14px] text-muted-dim">No active goals — add one from the Goals page.</p>
        ) : (
          <ul className="mt-5 flex flex-col gap-6">
            {activeGoals.map((goal) => {
              const meta = goalCategoryMeta(goal.category);
              const Icon = meta.icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
              const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const color = CATEGORY_COLOR[meta.category];

              const recommendation = goal.recommendedContribution
                ? `Save ${formatCurrency(goal.recommendedContribution, currency)}/month${
                    goal.deadline ? ` — ${formatDeadline(goal.deadline)}.` : " to stay on track."
                  }`
                : null;

              return (
                <li key={goal.id} className="rounded-2xl border border-border-subtle bg-surface-elevated p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${color}22` }}
                    >
                      <Icon className="h-5 w-5" style={{ color }} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] text-muted">{meta.label}</p>
                      <p className="truncate text-[15px] font-medium text-foreground">{goal.name}</p>
                    </div>
                    <div className="ml-auto shrink-0 text-right">
                      <p className="text-[13px] text-muted">Target</p>
                      <p className="text-[15px] font-semibold text-foreground">
                        {formatCurrency(goal.targetAmount, currency)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between text-[13px]">
                    <span className="text-muted">Progress</span>
                    <span className="font-medium text-foreground">{percentage}%</span>
                  </div>
                  <ProgressBar percentage={percentage} className="mt-2" />

                  {recommendation && (
                    <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-border-subtle bg-surface px-4 py-3.5">
                      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                      <p className="text-[13.5px] leading-relaxed text-foreground/90">{recommendation}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </motion.div>
  );
}
