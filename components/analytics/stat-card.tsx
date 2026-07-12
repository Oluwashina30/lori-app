"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";

export interface StatCardProps {
  label: string;
  value: number;
  formatter: (value: number) => string;
  valueClassName?: string;
  index: number;
}

export function StatCard({ label, value, formatter, valueClassName, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card>
        <p className="text-[13px] text-muted">{label}</p>
        <AnimatedNumber
          value={value}
          formatter={formatter}
          className={`mt-2 block text-[26px] font-semibold leading-none tracking-tight text-foreground ${valueClassName ?? ""}`}
        />
      </Card>
    </motion.div>
  );
}
