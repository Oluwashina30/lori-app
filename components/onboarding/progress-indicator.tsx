"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PHASES = ["Goal", "Details", "Income", "Plan"] as const;
export type OnboardingPhase = (typeof PHASES)[number];

export interface ProgressIndicatorProps {
  phase: OnboardingPhase;
  onBack?: () => void;
  className?: string;
}

/**
 * Coarse 4-phase indicator rather than an exact step count — the flow is
 * adaptive (different users see a different number of screens), so a
 * precise fraction would be misleading. Dots communicate "roughly how far
 * along," which is honest about what's actually knowable up front.
 */
export function ProgressIndicator({ phase, onBack, className }: ProgressIndicatorProps) {
  const currentIndex = PHASES.indexOf(phase);

  return (
    <div className={cn("mb-10 flex w-full max-w-2xl items-center gap-4", className)}>
      {onBack ? (
        <Button type="button" variant="ghost" size="sm" onClick={onBack} aria-label="Back" className="gap-1.5 px-2">
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15.5L7 10l5.5-5.5" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Button>
      ) : (
        <div className="w-[52px]" aria-hidden />
      )}
      <div className="flex flex-1 items-center gap-2">
        {PHASES.map((p, i) => (
          <motion.div
            key={p}
            className="h-1 flex-1 rounded-full bg-white/[0.08]"
            animate={{
              background:
                i <= currentIndex
                  ? "linear-gradient(90deg, var(--progress-from), var(--progress-via), var(--progress-to))"
                  : "rgba(255,255,255,0.08)",
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </div>
    </div>
  );
}
