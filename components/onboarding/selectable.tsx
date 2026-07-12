"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Shared "premium selected state" treatment for onboarding option tiles/pills:
 * an animated gradient border (via the same padding-box/border-box trick as
 * `.focus-gradient-ring` / `.ai-glow-border`), a soft elevation lift, and a
 * matching glow — all on a 250ms ease-out transition so hover, select, and
 * deselect all animate through the same path with no layout shift.
 *
 * Every onboarding "pick one" screen (goal, income, timeline, emergency
 * buffer) advances immediately on click, so there's no separate confirm
 * step — the caller sets local `selected` state synchronously in the click
 * handler (before the network round trip resolves) purely so this treatment
 * is visible during that brief transition, and disables its siblings so the
 * choice reads as final rather than reversible.
 */
const selectedGradientStyle = {
  "--gradient-border-fill": "var(--surface-elevated)",
  "--gradient-border-image": "linear-gradient(135deg, var(--accent-from), var(--accent-via), var(--accent-to))",
} as React.CSSProperties;

export interface SelectableCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  delay?: number;
}

export function SelectableCard({ icon: Icon, label, selected, disabled, onClick, delay = 0 }: SelectableCardProps) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, scale: selected ? 1.015 : 1 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={!selected && !disabled ? { y: -2 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      style={selected ? selectedGradientStyle : undefined}
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border px-4 py-7 text-foreground transition-[border-color,box-shadow,background-color,opacity] duration-[250ms] ease-out disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60",
        selected
          ? "gradient-border-static border-transparent shadow-[0_10px_32px_-10px_rgba(234,7,7,0.45)]"
          : "border-border-subtle bg-surface hover:border-border-strong",
        disabled && !selected && "opacity-40"
      )}
    >
      <Icon className="h-6 w-6" />
      <span className="text-[13.5px] font-medium">{label}</span>
    </motion.button>
  );
}

export interface SelectableChipProps {
  children: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function SelectableChip({ children, selected, disabled, onClick }: SelectableChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={!selected && !disabled ? { y: -1 } : undefined}
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      style={selected ? selectedGradientStyle : undefined}
      className={cn(
        "rounded-xl border px-6 py-3.5 text-[14.5px] font-medium text-foreground transition-[border-color,box-shadow,background-color,opacity] duration-[250ms] ease-out disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60",
        selected
          ? "gradient-border-static border-transparent shadow-[0_8px_24px_-10px_rgba(234,7,7,0.45)]"
          : "border-border-subtle bg-surface hover:border-border-strong",
        disabled && !selected && "opacity-40"
      )}
    >
      {children}
    </motion.button>
  );
}
