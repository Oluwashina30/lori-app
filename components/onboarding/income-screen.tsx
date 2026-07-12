"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { SelectableChip } from "@/components/onboarding/selectable";
import { getIncomeBrackets } from "@/lib/income-brackets";

export interface IncomeScreenProps {
  onSelect: (bracket: string) => void;
  loading: boolean;
  /** Drives the bracket amounts/symbol shown — the user's own currency, not a hardcoded "$". */
  currency: string;
}

export function IncomeScreen({ onSelect, loading, currency }: IncomeScreenProps) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const brackets = React.useMemo(() => getIncomeBrackets(currency), [currency]);

  function handleSelect(key: string) {
    if (loading || selected) return;
    setSelected(key);
    onSelect(key);
  }

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
        {brackets.map((b) => (
          <SelectableChip
            key={b.key}
            selected={selected === b.key}
            disabled={loading || (selected !== null && selected !== b.key)}
            onClick={() => handleSelect(b.key)}
          >
            {b.label}
          </SelectableChip>
        ))}
      </motion.div>
    </div>
  );
}
