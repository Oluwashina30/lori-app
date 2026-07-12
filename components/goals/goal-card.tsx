"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SegmentedProgressBar } from "@/components/ui/segmented-progress-bar";
import { goalCategoryMeta } from "@/lib/goal-categories";
import { formatCurrency, formatDeadline } from "@/lib/utils";
import type { GoalDetail } from "@/lib/types";

const STATUS_LABEL: Record<GoalDetail["status"], string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  COMPLETED: "Completed",
  ABANDONED: "Abandoned",
};

const STATUS_COLOR: Record<GoalDetail["status"], string> = {
  ACTIVE: "text-positive",
  PAUSED: "text-accent-solid",
  COMPLETED: "text-positive",
  ABANDONED: "text-muted-dim",
};

export interface GoalCardProps {
  goal: GoalDetail;
  currency: string;
  index: number;
  onAddMoney: (goal: GoalDetail) => void;
  onEdit: (goal: GoalDetail) => void;
  onSetStatus: (goal: GoalDetail, status: GoalDetail["status"]) => void;
  onDelete: (goal: GoalDetail) => void;
}

export function GoalCard({ goal, currency, index, onAddMoney, onEdit, onSetStatus, onDelete }: GoalCardProps) {
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const meta = goalCategoryMeta(goal.category);
  const Icon = meta.icon;
  const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const isActive = goal.status === "ACTIVE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="flex h-full flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-elevated">
              <Icon className="h-5 w-5 text-foreground" />
            </span>
            <div>
              <p className="text-[15px] font-medium text-foreground">{goal.name}</p>
              <p className="text-[13px] text-muted-dim">{meta.label}</p>
            </div>
          </div>
          {!isActive && (
            <span className={`shrink-0 text-[12px] font-medium ${STATUS_COLOR[goal.status]}`}>
              {STATUS_LABEL[goal.status]}
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-muted">{Math.round(percentage)}% complete</span>
            <span className="text-muted">
              {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}
            </span>
          </div>
          <SegmentedProgressBar percentage={percentage} className="mt-3" />
        </div>

        {goal.deadline && <p className="text-[13px] text-muted-dim">{formatDeadline(goal.deadline)}</p>}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {confirmingDelete ? (
            <>
              <span className="text-[13px] text-muted">Delete this goal?</span>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-[13px] font-medium text-muted transition-colors duration-200 hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onDelete(goal)}
                className="text-[13px] font-medium text-negative transition-colors duration-200 hover:brightness-125"
              >
                Confirm delete
              </button>
            </>
          ) : isActive ? (
            <>
              <Button type="button" size="sm" onClick={() => onAddMoney(goal)}>
                Add money
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(goal)}>
                Edit
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onSetStatus(goal, "PAUSED")}>
                Pause
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingDelete(true)}
                className="text-negative hover:text-negative"
              >
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" size="sm" onClick={() => onSetStatus(goal, "ACTIVE")}>
                Reactivate
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(goal)}>
                Edit
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingDelete(true)}
                className="text-negative hover:text-negative"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
