"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { FormattedText } from "@/components/ui/formatted-text";
import { WandIcon } from "@/components/icons";
import type { AIInsight } from "@/lib/types";

export interface AIInsightCardProps {
  insights: AIInsight[];
  className?: string;
}

const MAX_INSIGHT_HEIGHT = 240;

export function AIInsightCard({ insights, className }: AIInsightCardProps) {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const stackRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    const el = stackRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > MAX_INSIGHT_HEIGHT);
  }, [insights]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <Card highlighted className="flex h-full flex-col">
        <div className="flex items-center justify-between">
          <CardTitle>Lori&apos;s Insight</CardTitle>
          <motion.div
            animate={
              reduceMotion
                ? undefined
                : { rotate: [0, -10, 8, 0], scale: [1, 1.08, 1.08, 1] }
            }
            transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
          >
            <WandIcon className="h-[18px] w-[18px]" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-5 rounded-xl bg-surface-elevated p-4"
        >
          <div
            className="relative overflow-hidden"
            style={{ maxHeight: MAX_INSIGHT_HEIGHT }}
          >
            <div ref={stackRef} className="flex flex-col gap-4">
              {insights.map((insight) => (
                <div key={insight.id}>
                  <p className="text-[13px] font-medium text-foreground">{insight.title}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">
                    <FormattedText text={insight.message} />
                  </p>
                </div>
              ))}
            </div>
            {isOverflowing && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface-elevated to-transparent" />
            )}
          </div>

          {isOverflowing && (
            <button
              type="button"
              onClick={() => router.push("/insights")}
              className="mt-3 flex items-center gap-1 text-[13px] font-medium text-accent-solid transition-opacity hover:opacity-80"
            >
              View more
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </motion.div>
      </Card>
    </motion.div>
  );
}
