"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressBar } from "@/components/ui/progress-bar";
import { goalCategoryMeta } from "@/lib/goal-categories";
import { formatCurrency, formatDeadline } from "@/lib/utils";
import type { GoalCategory, GoalDetail } from "@/lib/types";

/** "Est. completion" label, e.g. "January 2027" — distinct from formatDeadline's relative "N months left" phrasing used elsewhere in this row. */
function formatCompletionMonth(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Per-category accent for the icon tile and progress bar dot — matches the landing page's savings-categories-section and the Analytics Goals Progress card, so all three read as one design language. */
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

type PaceStatus = "on-track" | "behind";

const PACE_LABEL: Record<PaceStatus, string> = {
  "on-track": "On track",
  behind: "Behind",
};

const PACE_COLOR: Record<PaceStatus, string> = {
  "on-track": "#4ade80",
  behind: "#f87171",
};

/**
 * Compares progress-so-far against time-elapsed-so-far (both as fractions
 * of the goal's total window) rather than just checking whether the
 * deadline has passed — a goal can be past-due-feeling but still ahead of
 * pace, or nowhere near due yet but already falling behind. Only makes
 * sense for active goals with both a deadline and unmet progress.
 */
function getPaceStatus(goal: GoalDetail, now: Date = new Date()): PaceStatus | null {
  if (goal.status !== "ACTIVE" || !goal.deadline || goal.targetAmount <= 0) return null;
  const actualFraction = goal.currentAmount / goal.targetAmount;
  if (actualFraction >= 1) return null;

  const deadline = new Date(goal.deadline).getTime();
  // Deadline already passed and still not complete — behind no matter what
  // createdAt says (handles goals whose deadline predates their createdAt).
  if (deadline <= now.getTime()) return "behind";

  const created = new Date(goal.createdAt).getTime();
  if (deadline <= created) return "behind";

  const expectedFraction = Math.min(1, Math.max(0, (now.getTime() - created) / (deadline - created)));
  // Small tolerance so a goal right on pace doesn't flicker to "Behind".
  return actualFraction + 0.05 >= expectedFraction ? "on-track" : "behind";
}

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
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const meta = goalCategoryMeta(goal.category);
  const Icon = meta.icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const isActive = goal.status === "ACTIVE";
  const isCompleted = goal.status === "COMPLETED";
  const color = CATEGORY_COLOR[meta.category];
  const paceStatus = getPaceStatus(goal);

  const recommendation = goal.recommendedContribution
    ? `Save ${formatCurrency(goal.recommendedContribution, currency)}/month${
        goal.deadline ? ` — ${formatDeadline(goal.deadline)}.` : " to stay on track."
      }`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => setDetailsOpen((open) => !open)}
      role="button"
      tabIndex={0}
      aria-expanded={detailsOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setDetailsOpen((open) => !open);
        }
      }}
      className="cursor-pointer rounded-2xl border border-border-subtle bg-surface-elevated p-4"
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}22` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[13px] text-muted">
            {meta.label}
            {!isActive && !isCompleted && (
              <span className={`text-[12px] font-medium ${STATUS_COLOR[goal.status]}`}>
                {STATUS_LABEL[goal.status]}
              </span>
            )}
          </p>
          <p className="flex items-center gap-2 text-[15px] font-medium text-foreground">
            <span className="truncate">{goal.name}</span>
            {paceStatus && (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{ backgroundColor: `${PACE_COLOR[paceStatus]}22`, color: PACE_COLOR[paceStatus] }}
              >
                {PACE_LABEL[paceStatus]}
              </span>
            )}
          </p>
        </div>
        <div className="ml-auto shrink-0 text-right">
          <p className="text-[13px] text-muted">{isCompleted ? "Complete" : "Target"}</p>
          <p className="text-[15px] font-semibold text-foreground">
            {isCompleted
              ? formatCurrency(goal.currentAmount, currency)
              : formatCurrency(goal.targetAmount, currency)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-muted">Progress</span>
          <span className="font-medium text-foreground">{percentage}%</span>
        </div>
        <ProgressBar percentage={percentage} className="mt-2" />
      </div>

      <AnimatePresence initial={false}>
        {detailsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border-subtle bg-surface p-4 sm:grid-cols-4">
              <div>
                <p className="text-[11px] text-muted">Current savings</p>
                <p className="mt-1 text-[13.5px] font-medium text-foreground">
                  {formatCurrency(goal.currentAmount, currency)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted">Target</p>
                <p className="mt-1 text-[13.5px] font-medium text-foreground">
                  {formatCurrency(goal.targetAmount, currency)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted">Est. completion</p>
                <p className="mt-1 text-[13.5px] font-medium text-foreground">
                  {isCompleted ? "Completed" : goal.deadline ? formatCompletionMonth(goal.deadline) : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted">Monthly contribution</p>
                <p className="mt-1 text-[13.5px] font-medium text-foreground">
                  {goal.recommendedContribution
                    ? `${formatCurrency(goal.recommendedContribution, currency)}/month`
                    : "—"}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {recommendation && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-border-subtle bg-surface px-4 py-3.5">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <p className="text-[13.5px] leading-relaxed text-foreground/90">{recommendation}</p>
        </div>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="mt-4 flex flex-wrap items-center justify-between gap-3 pl-2"
      >
        <div className="flex flex-wrap items-center gap-5 text-[13px] font-medium">
          {confirmingDelete ? (
            <>
              <span className="text-muted">Delete this goal?</span>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="text-muted transition-colors duration-200 hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onDelete(goal)}
                className="text-negative transition-colors duration-200 hover:brightness-125"
              >
                Confirm delete
              </button>
            </>
          ) : isActive ? (
            <>
              <button
                type="button"
                onClick={() => onAddMoney(goal)}
                className="text-foreground transition-colors duration-200 hover:text-accent-solid"
              >
                Add Money
              </button>
              <button
                type="button"
                onClick={() => onEdit(goal)}
                className="text-muted transition-colors duration-200 hover:text-foreground"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onSetStatus(goal, "PAUSED")}
                className="text-muted transition-colors duration-200 hover:text-foreground"
              >
                Pause
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="text-negative transition-colors duration-200 hover:brightness-125"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onSetStatus(goal, "ACTIVE")}
                className="text-foreground transition-colors duration-200 hover:text-accent-solid"
              >
                Reactivate
              </button>
              <button
                type="button"
                onClick={() => onEdit(goal)}
                className="text-muted transition-colors duration-200 hover:text-foreground"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="text-negative transition-colors duration-200 hover:brightness-125"
              >
                Delete
              </button>
            </>
          )}
        </div>
        {goal.deadline && <span className="text-[13px] text-muted-dim">{formatDeadline(goal.deadline)}</span>}
      </div>
    </motion.div>
  );
}
