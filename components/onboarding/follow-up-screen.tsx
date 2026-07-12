"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { SelectableChip } from "@/components/onboarding/selectable";
import { SubmitInputRow } from "@/components/onboarding/submit-input-row";

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
        className="mt-8 w-full"
      >
        <SubmitInputRow
          type="text"
          inputMode="decimal"
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder="500,000"
          ariaLabel="Estimated amount needed"
          autoFocus
          disabled={loading}
        />
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
  const [selected, setSelected] = React.useState<string | null>(null);

  function handleSelect(label: string, isoDate: string) {
    if (loading || selected) return;
    setSelected(label);
    onSubmit(isoDate);
  }

  function handleCustomSubmit() {
    if (!customDate || loading || selected) return;
    setSelected("Custom Date");
    onSubmit(customDate);
  }

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
          <SelectableChip
            key={opt.label}
            selected={selected === opt.label}
            disabled={loading || (selected !== null && selected !== opt.label)}
            onClick={() => handleSelect(opt.label, monthsFromNowISO(opt.months))}
          >
            {opt.label}
          </SelectableChip>
        ))}
        <SelectableChip
          selected={showCustom || selected === "Custom Date"}
          disabled={loading || (selected !== null && selected !== "Custom Date")}
          onClick={() => setShowCustom(true)}
        >
          Custom Date
        </SelectableChip>
      </motion.div>

      {showCustom && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 w-full max-w-xs"
        >
          <SubmitInputRow
            type="date"
            value={customDate}
            onChange={setCustomDate}
            onSubmit={handleCustomSubmit}
            ariaLabel="Custom target date"
            min={new Date().toISOString().slice(0, 10)}
            autoFocus
            disabled={loading}
          />
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
