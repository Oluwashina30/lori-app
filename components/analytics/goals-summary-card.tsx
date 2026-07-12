"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardTitle } from "@/components/ui/card";
import { SegmentedProgressBar } from "@/components/ui/segmented-progress-bar";
import { goalCategoryMeta } from "@/lib/goal-categories";
import { formatCurrency } from "@/lib/utils";
import type { GoalDetail } from "@/lib/types";

export interface GoalsSummaryCardProps {
  goals: GoalDetail[];
  currency: string;
  className?: string;
}

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
              const Icon = meta.icon;
              const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
              return (
                <li key={goal.id}>
                  <div className="flex items-center justify-between text-[14px]">
                    <span className="flex items-center gap-2.5 text-foreground">
                      <Icon className="h-[18px] w-[18px] text-foreground" />
                      {goal.name}
                    </span>
                    <span className="text-muted">
                      {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}
                    </span>
                  </div>
                  <SegmentedProgressBar percentage={percentage} className="mt-3" />
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </motion.div>
  );
}
