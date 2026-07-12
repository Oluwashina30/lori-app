"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { SendButtonIcon } from "@/components/icons";

const TIMELINE_OPTIONS = [
  { label: "In 1 month", months: 1 },
  { label: "In 6 months", months: 6 },
  { label: "In 1 year", months: 12 },
  { label: "In 2 years", months: 24 },
  { label: "More than 3 years", months: 42 },
];

function monthsFromNowISO(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export interface AmountFollowUpProps {
  onSubmit: (amount: number) => void;
  loading: boolean;
}

export function AmountFollowUp({ onSubmit, loading }: AmountFollowUpProps) {
  const [value, setValue] = React.useState("");

  function handleSubmit() {
    const amount = Number(value.replace(/[^0-9.]/g, ""));
    if (!amount || loading) return;
    onSubmit(amount);
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center text-center">
      <Heading title="How much will you need?" subtitle="A rough estimate is perfectly fine" />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex w-full items-center gap-2"
      >
        <Input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="500,000"
          aria-label="Estimated amount needed"
          autoFocus
          className="h-14 text-[17px]"
        />
        <button
          type="button"
          aria-label="Submit"
          onClick={handleSubmit}
          disabled={loading || !value.trim()}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60"
        >
          <SendButtonIcon className="h-14 w-14" />
        </button>
      </motion.div>
    </div>
  );
}

export interface TimelineFollowUpProps {
  onSubmit: (isoDate: string) => void;
  loading: boolean;
}

export function TimelineFollowUp({ onSubmit, loading }: TimelineFollowUpProps) {
  const [showCustom, setShowCustom] = React.useState(false);
  const [customDate, setCustomDate] = React.useState("");

  return (
    <div className="flex w-full max-w-2xl flex-col items-center text-center">
      <Heading title="When would you like to achieve this goal" subtitle="Choose a timeline that feels right for you." />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex flex-wrap justify-center gap-3"
      >
        {TIMELINE_OPTIONS.map((opt) => (
          <ChipButton key={opt.label} disabled={loading} onClick={() => onSubmit(monthsFromNowISO(opt.months))}>
            {opt.label}
          </ChipButton>
        ))}
        <ChipButton active={showCustom} disabled={loading} onClick={() => setShowCustom(true)}>
          Custom Date
        </ChipButton>
      </motion.div>

      {showCustom && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 flex w-full max-w-xs items-center gap-2"
        >
          <Input
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            aria-label="Custom target date"
            autoFocus
          />
          <button
            type="button"
            aria-label="Submit date"
            onClick={() => customDate && onSubmit(customDate)}
            disabled={loading || !customDate}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60"
          >
            <SendButtonIcon className="h-11 w-11" />
          </button>
        </motion.div>
      )}
    </div>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-[26px] font-semibold tracking-tight text-foreground sm:text-[30px]"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="mt-2 text-[15px] text-muted"
      >
        {subtitle}
      </motion.p>
    </>
  );
}

function ChipButton({
  children,
  onClick,
  disabled,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        "rounded-xl border px-6 py-3.5 text-[14.5px] font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60 " +
        (active
          ? "border-accent-solid bg-surface text-foreground"
          : "border-border-subtle bg-surface text-foreground hover:border-border-strong")
      }
    >
      {children}
    </button>
  );
}
