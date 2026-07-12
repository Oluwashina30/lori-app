"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { SendButtonIcon } from "@/components/icons";

const BUFFER_OPTIONS = [
  { label: "1 month", months: 1 },
  { label: "3 months", months: 3 },
  { label: "6 months", months: 6 },
];

export interface EmergencyFundScreenProps {
  onSubmit: (params: { monthlyExpenses: number; currentSavings: number; bufferMonths: number }) => void;
  loading: boolean;
}

/**
 * The one genuinely bespoke category path (per the onboarding brief's own
 * example) — target amount is derived from monthly expenses x buffer
 * months, not asked as a raw number the way every other category is.
 */
export function EmergencyFundScreen({ onSubmit, loading }: EmergencyFundScreenProps) {
  const [step, setStep] = React.useState<0 | 1 | 2>(0);
  const [monthlyExpenses, setMonthlyExpenses] = React.useState("");
  const [currentSavings, setCurrentSavings] = React.useState("");

  function submitExpenses() {
    const val = Number(monthlyExpenses.replace(/[^0-9.]/g, ""));
    if (!val) return;
    setStep(1);
  }

  function submitSavings() {
    setStep(2); // 0 is a valid answer here, so no truthiness gate
  }

  function submitBuffer(months: number) {
    if (loading) return;
    onSubmit({
      monthlyExpenses: Number(monthlyExpenses.replace(/[^0-9.]/g, "")),
      currentSavings: Number(currentSavings.replace(/[^0-9.]/g, "")) || 0,
      bufferMonths: months,
    });
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center text-center">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="expenses"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full flex-col items-center"
          >
            <h1 className="text-[26px] font-semibold tracking-tight text-foreground sm:text-[30px]">
              What are your monthly expenses?
            </h1>
            <p className="mt-2 text-[15px] text-muted">This sets a realistic baseline for your safety buffer.</p>
            <div className="mt-8 flex w-full items-center gap-2">
              <Input
                type="text"
                inputMode="decimal"
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitExpenses()}
                placeholder="150,000"
                autoFocus
                className="h-14 text-[17px]"
              />
              <SubmitArrow onClick={submitExpenses} disabled={!monthlyExpenses.trim()} />
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="savings"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full flex-col items-center"
          >
            <h1 className="text-[26px] font-semibold tracking-tight text-foreground sm:text-[30px]">
              How much do you already have saved?
            </h1>
            <p className="mt-2 text-[15px] text-muted">Enter 0 if you&apos;re starting fresh — that&apos;s a fine place to start.</p>
            <div className="mt-8 flex w-full items-center gap-2">
              <Input
                type="text"
                inputMode="decimal"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitSavings()}
                placeholder="0"
                autoFocus
                className="h-14 text-[17px]"
              />
              <SubmitArrow onClick={submitSavings} disabled={false} />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="buffer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full flex-col items-center"
          >
            <h1 className="text-[26px] font-semibold tracking-tight text-foreground sm:text-[30px]">
              How many months of buffer do you want?
            </h1>
            <p className="mt-2 text-[15px] text-muted">Most people aim for 3 — you can always adjust later.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {BUFFER_OPTIONS.map((opt) => (
                <button
                  key={opt.months}
                  type="button"
                  disabled={loading}
                  onClick={() => submitBuffer(opt.months)}
                  className="rounded-xl border border-border-subtle bg-surface px-7 py-3.5 text-[14.5px] font-medium text-foreground transition-colors duration-200 hover:border-border-strong disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SubmitArrow({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      aria-label="Continue"
      onClick={onClick}
      disabled={disabled}
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60"
    >
      <SendButtonIcon className="h-14 w-14" />
    </button>
  );
}
