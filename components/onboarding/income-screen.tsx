"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const BRACKETS = [
  { key: "less_than_500", label: "Less than $500" },
  { key: "500_2000", label: "$500 - $2,000" },
  { key: "2000_5000", label: "$2,000 - $5,000" },
  { key: "5000_10000", label: "$5,000 - $10,000" },
  { key: "more_than_10000", label: "More than $10,000" },
];

export interface IncomeScreenProps {
  onSelect: (bracket: string) => void;
  loading: boolean;
}

export function IncomeScreen({ onSelect, loading }: IncomeScreenProps) {
  return (
    <div className="flex w-full max-w-2xl flex-col items-center text-center">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-[26px] font-semibold tracking-tight text-foreground sm:text-[30px]"
      >
        About how much do you earn each month?
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="mt-2 text-[15px] text-muted"
      >
        This helps Lori recommend a savings plan you can actually stick to — and stays private.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 flex flex-wrap justify-center gap-3"
      >
        {BRACKETS.map((b) => (
          <button
            key={b.key}
            type="button"
            disabled={loading}
            onClick={() => onSelect(b.key)}
            className="rounded-xl border border-border-subtle bg-surface px-6 py-3.5 text-[14.5px] font-medium text-foreground transition-colors duration-200 hover:border-border-strong disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60"
          >
            {b.label}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={() => onSelect("skip")}
          className="mt-6"
        >
          I&apos;d rather not say
        </Button>
      </motion.div>
    </div>
  );
}
