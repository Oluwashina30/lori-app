"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { SectionHeader } from "@/components/marketing/section-header";
import { GOAL_CATEGORIES } from "@/lib/goal-categories";
import { formatCurrency } from "@/lib/utils";
import type { GoalCategory } from "@/lib/types";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
};

// Purely illustrative per-category numbers so clicking a goal feels like it
// changes something real — no backend, just a believable static preset per
// category. Amounts are round, plausible Naira figures for each goal type.
const GOAL_DETAILS: Record<
  GoalCategory,
  { amount: number; progress: number; recommendation: string; color: string }
> = {
  home: {
    amount: 45000000,
    progress: 28,
    recommendation: "Save ₦625,000/month to reach this in 5 years.",
    color: "#fb7d3f",
  },
  car: {
    amount: 12000000,
    progress: 42,
    recommendation: "You're on pace — ₦500,000/month keeps you on track.",
    color: "#60a5fa",
  },
  travel: {
    amount: 2000000,
    progress: 62,
    recommendation: "Just ₦76,000/month left to fund this trip.",
    color: "#f472b6",
  },
  education: {
    amount: 5000000,
    progress: 15,
    recommendation: "Starting early — ₦208,000/month gets you there in 2 years.",
    color: "#a78bfa",
  },
  wedding: {
    amount: 8000000,
    progress: 34,
    recommendation: "₦333,000/month keeps this on schedule for next spring.",
    color: "#fb7185",
  },
  business: {
    amount: 10000000,
    progress: 8,
    recommendation: "Set aside ₦417,000/month to launch within 2 years.",
    color: "#4ade80",
  },
  emergency_fund: {
    amount: 3000000,
    progress: 71,
    recommendation: "Almost there — 3 more months at this pace.",
    color: "#fbbf24",
  },
  other: {
    amount: 1500000,
    progress: 50,
    recommendation: "Halfway there. Keep the momentum going.",
    color: "#94a3b8",
  },
};

/**
 * "Everything a savings app should do" — the 8 onboarding goal categories,
 * reusing the same GOAL_CATEGORIES source of truth as onboarding's goal
 * picker. Clicking a category swaps a preview panel below (icon, color,
 * example amount, progress, and a Lori-style recommendation) — a purely
 * front-end simulation, no backend involved.
 */
export function SavingsCategoriesSection() {
  const [selected, setSelected] = React.useState<GoalCategory>(GOAL_CATEGORIES[0].category);
  const selectedMeta = GOAL_CATEGORIES.find((c) => c.category === selected) ?? GOAL_CATEGORIES[0];
  const details = GOAL_DETAILS[selected];
  // All icon components in GOAL_CATEGORIES (custom SVGs + lucide-react) accept
  // `style` in practice; the shared metadata type just doesn't declare it.
  const SelectedIcon = selectedMeta.icon as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

  return (
    <section id="features" className="px-4 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto w-full max-w-[1240px]">
        <SectionHeader
          heading="Everything a savings app should do"
          paragraph="Whatever you're saving for, Lori gives it a clear plan and tracks your progress automatically — no spreadsheets required."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto mt-24 grid max-w-[980px] grid-cols-2 gap-5 sm:mt-28 sm:grid-cols-4 sm:gap-10"
        >
          {GOAL_CATEGORIES.map((category) => (
            <motion.div key={category.category} variants={itemVariants}>
              <button type="button" onClick={() => setSelected(category.category)} className="block w-full text-left">
                <Card
                  highlighted={selected === category.category}
                  className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 p-3.5 text-center hover:-translate-y-0.5"
                >
                  <category.icon className="h-5 w-5 text-foreground" />
                  <span className="text-[13px] font-medium text-foreground">{category.label}</span>
                </Card>
              </button>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-10 max-w-[600px]"
        >
          <Card className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    key={`icon-${selected}`}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${details.color}22` }}
                  >
                    <SelectedIcon className="h-5 w-5" style={{ color: details.color }} />
                  </motion.span>
                  <div className="min-w-0">
                    <p className="text-[13px] text-muted">Example goal</p>
                    <p className="truncate text-[15px] font-medium text-foreground">{selectedMeta.label}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-[13px] text-muted">Target</p>
                    <AnimatedNumber
                      value={details.amount}
                      formatter={(v) => formatCurrency(v, "NGN")}
                      className="text-[15px] font-semibold text-foreground"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-[13px]">
                  <span className="text-muted">Progress</span>
                  <span className="font-medium text-foreground">{details.progress}%</span>
                </div>
                <ProgressBar percentage={details.progress} className="mt-2" />

                <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-border-subtle bg-surface-elevated px-4 py-3.5">
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: details.color }} />
                  <p className="text-[13.5px] leading-relaxed text-foreground/90">{details.recommendation}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
