"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectableCard } from "@/components/onboarding/selectable";
import { GOAL_CATEGORIES } from "@/lib/goal-categories";
import type { GoalCategory, GoalDetail } from "@/lib/types";

// Same SSR-safe "are we on the client yet" pattern as the sidebar's
// portal-rendered tooltip and the Settings delete-account dialog.
function useHasMounted(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export interface GoalDialogValues {
  name: string;
  category: GoalCategory;
  targetAmount: number;
  deadline: string | null;
}

export interface GoalDialogProps {
  open: boolean;
  goal: GoalDetail | null; // null = create mode
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (values: GoalDialogValues) => void;
}

export function GoalDialog({ open, goal, loading, error, onCancel, onSubmit }: GoalDialogProps) {
  const mounted = useHasMounted();
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState<GoalCategory>("other");
  const [targetAmount, setTargetAmount] = React.useState("");
  const [deadline, setDeadline] = React.useState("");

  // Re-seed the form fields whenever the dialog opens for a (possibly
  // different) goal, rather than an effect keyed on `open` alone — this runs
  // during render, not after, so there's no stale-then-corrected flash.
  const [seededFor, setSeededFor] = React.useState<string | null>(null);
  const seedKey = open ? (goal?.id ?? "new") : null;
  if (open && seedKey !== seededFor) {
    setSeededFor(seedKey);
    setName(goal?.name ?? "");
    setCategory((goal?.category as GoalCategory) ?? "other");
    setTargetAmount(goal ? String(goal.targetAmount) : "");
    setDeadline(goal?.deadline ? goal.deadline.slice(0, 10) : "");
  }

  if (!mounted) return null;

  const parsedAmount = Number(targetAmount.replace(/[^0-9.]/g, ""));
  const canSubmit = name.trim().length > 0 && parsedAmount > 0;

  function handleSubmit() {
    if (!canSubmit || loading) return;
    onSubmit({
      name: name.trim(),
      category,
      targetAmount: parsedAmount,
      deadline: deadline || null,
    });
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={loading ? undefined : onCancel}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-dialog-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-8"
          >
            <div className="w-full max-w-lg rounded-2xl border border-border-subtle bg-surface p-6 shadow-2xl shadow-black/60">
              <h2 id="goal-dialog-title" className="text-[17px] font-semibold text-foreground">
                {goal ? "Edit goal" : "New goal"}
              </h2>

              <div className="mt-5 flex flex-col gap-4">
                <div>
                  <label htmlFor="goal-name" className="mb-1.5 block text-[13px] font-medium text-muted">
                    Name
                  </label>
                  <Input
                    id="goal-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Trip to Japan"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div>
                  <p className="mb-2.5 text-[13px] font-medium text-muted">Category</p>
                  <div className="grid grid-cols-4 gap-2">
                    {GOAL_CATEGORIES.map((c) => (
                      <SelectableCard
                        key={c.category}
                        icon={c.icon}
                        label={c.label}
                        selected={category === c.category}
                        disabled={loading}
                        onClick={() => setCategory(c.category)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="goal-target" className="mb-1.5 block text-[13px] font-medium text-muted">
                    Target amount
                  </label>
                  <Input
                    id="goal-target"
                    type="text"
                    inputMode="decimal"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="500,000"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label htmlFor="goal-deadline" className="mb-1.5 block text-[13px] font-medium text-muted">
                    Deadline <span className="text-muted-dim">(optional)</span>
                  </label>
                  <Input
                    id="goal-deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <p className="mt-3 text-[13px] text-negative" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={!canSubmit || loading}>
                  {loading ? "Saving…" : goal ? "Save changes" : "Create goal"}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
