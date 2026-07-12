"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Card, CardTitle } from "@/components/ui/card";
import { WandIcon } from "@/components/icons";
import type { AIInsight } from "@/lib/types";

export interface AIInsightCardProps {
  insight: AIInsight;
  className?: string;
}

export function AIInsightCard({ insight, className }: AIInsightCardProps) {
  const reduceMotion = useReducedMotion();

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
          className="mt-5 rounded-xl bg-surface-elevated p-4"
        >
          <p className="text-[13px] font-medium text-foreground">{insight.title}</p>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">{insight.message}</p>
        </motion.div>
      </Card>
    </motion.div>
  );
}
