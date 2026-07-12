"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { SelectableChip } from "@/components/onboarding/selectable";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalDialog, type GoalDialogValues } from "@/components/goals/goal-dialog";
import { ContributeDialog } from "@/components/goals/contribute-dialog";
import { GoalsTrophyIcon } from "@/components/icons/sidebar-icons";
import {
  createGoalApi,
  updateGoalApi,
  setGoalStatusApi,
  deleteGoalApi,
  contributeToGoalApi,
} from "@/lib/api-client";
import type { GoalDetail, UserProfile } from "@/lib/types";

const FILTERS: { key: "ALL" | GoalDetail["status"]; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "PAUSED", label: "Paused" },
  { key: "COMPLETED", label: "Completed" },
  { key: "ABANDONED", label: "Abandoned" },
];

export interface GoalsPageClientProps {
  user: UserProfile;
  currency: string;
  initialGoals: GoalDetail[];
}

export function GoalsPageClient({ user, currency, initialGoals }: GoalsPageClientProps) {
  const [goals, setGoals] = React.useState(initialGoals);
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]["key"]>("ALL");

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<GoalDetail | null>(null);
  const [dialogLoading, setDialogLoading] = React.useState(false);
  const [dialogError, setDialogError] = React.useState<string | null>(null);

  const [contributeGoal, setContributeGoal] = React.useState<GoalDetail | null>(null);
  const [contributeLoading, setContributeLoading] = React.useState(false);
  const [contributeError, setContributeError] = React.useState<string | null>(null);

  const filteredGoals = filter === "ALL" ? goals : goals.filter((g) => g.status === filter);

  function openCreateDialog() {
    setEditingGoal(null);
    setDialogError(null);
    setDialogOpen(true);
  }

  function openEditDialog(goal: GoalDetail) {
    setEditingGoal(goal);
    setDialogError(null);
    setDialogOpen(true);
  }

  async function handleDialogSubmit(values: GoalDialogValues) {
    setDialogLoading(true);
    setDialogError(null);
    try {
      if (editingGoal) {
        const updated = await updateGoalApi(editingGoal.id, values);
        setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      } else {
        const created = await createGoalApi(values);
        setGoals((prev) => [created, ...prev]);
      }
      setDialogOpen(false);
    } catch (err) {
      console.error("save goal failed:", err);
      setDialogError("Something went wrong saving that goal — try again in a moment.");
    } finally {
      setDialogLoading(false);
    }
  }

  async function handleSetStatus(goal: GoalDetail, status: GoalDetail["status"]) {
    const previous = goals;
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? { ...g, status } : g)));
    try {
      await setGoalStatusApi(goal.id, status);
    } catch (err) {
      console.error("set goal status failed:", err);
      setGoals(previous);
    }
  }

  async function handleDelete(goal: GoalDetail) {
    const previous = goals;
    setGoals((prev) => prev.filter((g) => g.id !== goal.id));
    try {
      await deleteGoalApi(goal.id);
    } catch (err) {
      console.error("delete goal failed:", err);
      setGoals(previous);
    }
  }

  async function handleContributeSubmit(amount: number) {
    if (!contributeGoal) return;
    setContributeLoading(true);
    setContributeError(null);
    try {
      const updated = await contributeToGoalApi(contributeGoal.id, amount);
      setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      setContributeGoal(null);
    } catch (err) {
      console.error("contribute to goal failed:", err);
      setContributeError("Something went wrong adding that — try again in a moment.");
    } finally {
      setContributeLoading(false);
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
            <GoalsTrophyIcon className="h-5 w-5 text-accent-solid" />
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-[26px]">Goals</h1>
          </div>
          <p className="mt-1.5 text-sm text-muted sm:text-[15px]">Track every savings goal in one place.</p>
        </div>
        <Button type="button" onClick={openCreateDialog}>
          Add goal
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap gap-2.5"
      >
        {FILTERS.map((f) => (
          <SelectableChip key={f.key} selected={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </SelectableChip>
        ))}
      </motion.div>

      {filteredGoals.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-[14px] text-muted-dim"
        >
          {goals.length === 0
            ? "No goals yet — add one to start tracking progress."
            : "No goals match this filter."}
        </motion.p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.map((goal, i) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              currency={currency}
              index={i}
              onAddMoney={setContributeGoal}
              onEdit={openEditDialog}
              onSetStatus={handleSetStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <GoalDialog
        open={dialogOpen}
        goal={editingGoal}
        loading={dialogLoading}
        error={dialogError}
        onCancel={() => setDialogOpen(false)}
        onSubmit={handleDialogSubmit}
      />

      <ContributeDialog
        open={contributeGoal !== null}
        goal={contributeGoal}
        currency={currency}
        loading={contributeLoading}
        error={contributeError}
        onCancel={() => setContributeGoal(null)}
        onSubmit={handleContributeSubmit}
      />
    </AppShell>
  );
}
