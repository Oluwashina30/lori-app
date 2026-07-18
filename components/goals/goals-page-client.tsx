"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalDialog, type GoalDialogValues } from "@/components/goals/goal-dialog";
import { ContributeDialog } from "@/components/goals/contribute-dialog";
import { cn } from "@/lib/utils";
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
  const [filterMenuOpen, setFilterMenuOpen] = React.useState(false);
  const filterMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!filterMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setFilterMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterMenuOpen]);

  const activeFilterLabel = FILTERS.find((f) => f.key === filter)?.label ?? "All";

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
        className="relative flex flex-col items-center gap-1.5 text-center"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Goals</h1>
        <p className="text-sm text-muted sm:text-[15px]">Track every savings goal in one place.</p>

        <div ref={filterMenuRef} className="absolute right-0 top-0">
          <button
            type="button"
            onClick={() => setFilterMenuOpen((open) => !open)}
            className="flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-4 py-2 text-[13.5px] font-medium text-foreground transition-colors duration-200 hover:border-border-strong"
          >
            {activeFilterLabel}
            <ChevronDown className={cn("h-4 w-4 text-muted transition-transform duration-200", filterMenuOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {filterMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 top-[calc(100%+8px)] z-10 min-w-[160px] overflow-hidden rounded-xl border border-border-subtle bg-surface-elevated py-1.5 shadow-xl shadow-black/30"
              >
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => {
                      setFilter(f.key);
                      setFilterMenuOpen(false);
                    }}
                    className={cn(
                      "block w-full px-4 py-2 text-left text-[13.5px] font-medium transition-colors duration-150",
                      filter === f.key ? "text-accent-solid" : "text-foreground hover:bg-white/5"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {filteredGoals.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-center text-[14px] text-muted-dim"
        >
          {goals.length === 0
            ? "No goals yet — add one to start tracking progress."
            : "No goals match this filter."}
        </motion.p>
      ) : (
        <div className="flex flex-col">
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

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-end"
      >
        <Button type="button" onClick={openCreateDialog}>
          Add new goal
        </Button>
      </motion.div>

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
