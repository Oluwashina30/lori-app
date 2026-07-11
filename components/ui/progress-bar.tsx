"use client";

import { motion } from "framer-motion";
import { HEAT_GRADIENT_CSS } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  /** 0-100 */
  percentage: number;
  className?: string;
  trackClassName?: string;
}

/**
 * A smooth, continuous gradient progress bar. The gradient always spans the
 * full brand spectrum (violet -> pink -> orange -> green); only the filled
 * width reveals it, so a low percentage naturally reads as violet/pink while
 * a near-complete bar reads as orange/green.
 */
export function ProgressBar({ percentage, className, trackClassName }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage));

  return (
    <div
      className={cn("relative h-[7px] w-full overflow-hidden rounded-full bg-white/[0.06]", trackClassName, className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: HEAT_GRADIENT_CSS, backgroundSize: `${10000 / clamped}% 100%` }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      />
    </div>
  );
}
