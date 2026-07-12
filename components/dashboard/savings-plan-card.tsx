"use client";

import { motion } from "framer-motion";
import { GraduationCap, Heart, Briefcase, Sparkles } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { SegmentedProgressBar } from "@/components/ui/segmented-progress-bar";
import { CarIcon, HouseIcon, PlaneIcon, HeartPulseIcon } from "@/components/icons";
import { formatCurrency } from "@/lib/utils";
import type { SavingsPlanItem } from "@/lib/types";

export interface SavingsPlanCardProps {
  items: SavingsPlanItem[];
  currency: string;
  className?: string;
}

// car/home/plane/heart-pulse are custom SVGs sourced from the design's
// Figma export (see components/icons); the 4 added for onboarding's extra
// goal categories have no exported asset, so they use lucide-react —
// already a dependency, already used the same way for TotalSavingsCard's bulb.
const ICONS = {
  car: CarIcon,
  home: HouseIcon,
  plane: PlaneIcon,
  "heart-pulse": HeartPulseIcon,
  "graduation-cap": GraduationCap,
  heart: Heart,
  briefcase: Briefcase,
  sparkles: Sparkles,
} as const;

function statusLabel(item: SavingsPlanItem, currency: string): string {
  if (item.status === "complete") {
    return `Complete (${formatCurrency(item.targetAmount, currency)})`;
  }
  if (item.status === "not-started") {
    return "Not Started";
  }
  return `${formatCurrency(item.currentAmount, currency)}/${formatCurrency(item.targetAmount, currency)} target`;
}

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export function SavingsPlanCard({ items, currency, className }: SavingsPlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <Card className="h-full">
        <CardTitle>Savings Plan</CardTitle>

        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="mt-6 flex flex-col gap-7"
        >
          {items.map((item) => {
            const Icon = ICONS[item.icon];
            const percentage =
              item.status === "complete"
                ? 100
                : item.status === "not-started"
                ? 0
                : (item.currentAmount / item.targetAmount) * 100;

            return (
              <motion.li variants={itemVariants} key={item.id}>
                <div className="flex items-center justify-between text-[14px]">
                  <span className="flex items-center gap-2.5 text-foreground">
                    <Icon className="h-[18px] w-[18px] text-foreground" />
                    {item.label}
                  </span>
                  <span
                    className={
                      item.status === "not-started" ? "text-muted-dim" : "text-muted"
                    }
                  >
                    {statusLabel(item, currency)}
                  </span>
                </div>
                <SegmentedProgressBar percentage={percentage} className="mt-3" />
              </motion.li>
            );
          })}
        </motion.ul>
      </Card>
    </motion.div>
  );
}
