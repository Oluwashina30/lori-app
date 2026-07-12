"use client";

import { motion } from "framer-motion";
import { Card, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { formatCurrency } from "@/lib/utils";
import type { CashFlowSummary } from "@/lib/types";

export interface CashFlowCardProps {
  data: CashFlowSummary;
  currency: string;
  className?: string;
}

export function CashFlowCard({ data, currency, className }: CashFlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <Card>
        <CardTitle>Cash Flow</CardTitle>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-5">
            <div>
              <span className="flex items-center gap-2 text-[13px] text-muted">
                <span className="h-2 w-2 rounded-full bg-accent-solid" aria-hidden />
                Savings
              </span>
              <AnimatedNumber
                value={data.savings}
                formatter={(v) => formatCurrency(v, currency)}
                duration={1}
                className="mt-1 block text-[20px] font-semibold text-foreground"
              />
            </div>
            <div>
              <span className="flex items-center gap-2 text-[13px] text-muted">
                <span className="h-2 w-2 rounded-full bg-white/20" aria-hidden />
                Expenses
              </span>
              <AnimatedNumber
                value={data.expenses}
                formatter={(v) => formatCurrency(v, currency)}
                duration={1}
                className="mt-1 block text-[20px] font-semibold text-foreground"
              />
            </div>
          </div>

          <CircularProgress percentage={data.percentage} size={120} thickness={11} />
        </div>
      </Card>
    </motion.div>
  );
}
