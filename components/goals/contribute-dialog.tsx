"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { GoalDetail } from "@/lib/types";

function useHasMounted(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export interface ContributeDialogProps {
  open: boolean;
  goal: GoalDetail | null;
  currency: string;
  loading: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (amount: number) => void;
}

export function ContributeDialog({ open, goal, currency, loading, error, onCancel, onSubmit }: ContributeDialogProps) {
  const mounted = useHasMounted();
  const [amount, setAmount] = React.useState("");
  const [seededFor, setSeededFor] = React.useState<string | null>(null);

  if (open && goal && seededFor !== goal.id) {
    setSeededFor(goal.id);
    setAmount("");
  }

  if (!mounted || !goal) return null;

  const parsedAmount = Number(amount.replace(/[^0-9.]/g, ""));
  const canSubmit = parsedAmount > 0;

  function handleSubmit() {
    if (!canSubmit || loading) return;
    onSubmit(parsedAmount);
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
            aria-labelledby="contribute-dialog-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-surface p-6 shadow-2xl shadow-black/60">
              <h2 id="contribute-dialog-title" className="text-[17px] font-semibold text-foreground">
                Add money to &quot;{goal.name}&quot;
              </h2>
              <p className="mt-1.5 text-[13px] text-muted">
                {formatCurrency(goal.currentAmount, currency)} of {formatCurrency(goal.targetAmount, currency)} so far
              </p>

              <div className="mt-5">
                <label htmlFor="contribute-amount" className="mb-1.5 block text-[13px] font-medium text-muted">
                  Amount
                </label>
                <Input
                  id="contribute-amount"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10,000"
                  disabled={loading}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
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
                  {loading ? "Adding…" : "Add money"}
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
