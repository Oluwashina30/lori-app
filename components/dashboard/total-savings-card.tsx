"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { FormattedText } from "@/components/ui/formatted-text";
import { TrendingUpIcon } from "@/components/icons";
import { formatCurrency } from "@/lib/utils";
import type { SavingsSummary } from "@/lib/types";

export interface TotalSavingsCardProps {
  summary: SavingsSummary;
  currency: string;
}

const MAX_INSIGHT_HEIGHT = 63;

export function TotalSavingsCard({ summary, currency }: TotalSavingsCardProps) {
  const {
    total,
    changeAmount,
    changePercentage,
    goalCurrent,
    goalTarget,
    goalPercentComplete,
    goalLabel,
    insightMessage,
  } = summary;

  const router = useRouter();
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > MAX_INSIGHT_HEIGHT);
  }, [insightMessage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="p-5 sm:p-7">
        <p className="text-[15px] text-muted">Total Savings</p>

        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <AnimatedNumber
            value={total}
            formatter={(v) => formatCurrency(v, currency)}
            className="text-[32px] font-semibold leading-none tracking-tight text-foreground sm:text-[40px]"
          />
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-1 text-[15px] font-medium text-positive"
          >
            <TrendingUpIcon className="h-4 w-4" />
            {formatCurrency(changeAmount, currency)} ({changePercentage}%)
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.05 }}
            className="text-[14px] text-muted"
          >
            Vs last month
          </motion.span>
        </div>

        <div className="mt-8 flex items-center justify-between text-[13px]">
          <span className="text-muted">
            {goalPercentComplete}% complete &middot; {goalLabel}
          </span>
          <span className="text-muted">
            {formatCurrency(goalCurrent, currency)} / {formatCurrency(goalTarget, currency)}
          </span>
        </div>

        <ProgressBar percentage={goalPercentComplete} className="mt-3" />

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 flex items-start gap-3"
        >
          <Lightbulb className="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent-solid" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <div className="relative overflow-hidden" style={{ maxHeight: MAX_INSIGHT_HEIGHT }}>
              <p ref={textRef} className="text-[14px] leading-[1.5] text-foreground/90">
                <FormattedText text={insightMessage} />
              </p>
              {isOverflowing && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-surface to-transparent" />
              )}
            </div>
            {isOverflowing && (
              <button
                type="button"
                onClick={() => router.push("/insights")}
                className="mt-1.5 flex items-center gap-1 text-[13px] font-medium text-accent-solid transition-opacity hover:opacity-80"
              >
                View more
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}
