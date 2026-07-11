"use client";

import { motion } from "framer-motion";
import type { ChatSuggestion } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface SuggestionChipsProps {
  suggestions: ChatSuggestion[];
  onSelect: (suggestion: ChatSuggestion) => void;
  label?: string;
  className?: string;
}

export function SuggestionChips({
  suggestions,
  onSelect,
  label = "Suggestions :",
  className,
}: SuggestionChipsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "scrollbar-thin flex items-center gap-2 overflow-x-auto pb-1 text-[13px]",
        className
      )}
    >
      <span className="shrink-0 text-muted">{label}</span>
      {suggestions.map((s, i) => (
        <motion.button
          key={s.id}
          type="button"
          onClick={() => onSelect(s)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="shrink-0 rounded-full border border-border-subtle bg-surface px-4 py-1.5 text-muted transition-colors duration-200 hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60"
        >
          {s.label}
        </motion.button>
      ))}
    </motion.div>
  );
}
