"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/marketing/section-header";
import { SegmentedProgressBar } from "@/components/ui/segmented-progress-bar";
import { HouseIcon, CarIcon } from "@/components/icons";
import { formatCurrency } from "@/lib/utils";

interface GoalRowData {
  id: string;
  label: string;
  icon: typeof HouseIcon;
  statusLabel: string;
  percentage: number;
  timeLeft: string;
  current: number;
  target: number;
  completionDate: string;
  monthlyContribution: string;
}

const GOALS: GoalRowData[] = [
  {
    id: "rent",
    label: "Rent",
    icon: HouseIcon,
    statusLabel: "Complete ($3,000)",
    percentage: 100,
    timeLeft: "6 months left",
    current: 3000,
    target: 3000,
    completionDate: "Completed",
    monthlyContribution: "—",
  },
  {
    id: "car",
    label: "Car",
    icon: CarIcon,
    statusLabel: "$3,000 / $15,000",
    percentage: 20,
    timeLeft: "6 months left",
    current: 3000,
    target: 15000,
    completionDate: "January 2027",
    monthlyContribution: "$500/month",
  },
];

const ACTIONS = ["Add Money", "Edit", "Pause", "Delete"];

/** A single goal row — holds its own "has this scrolled into view yet" flag so its progress bar fills from 0% the first time it's seen, not on mount, plus a hover-revealed detail panel. */
function GoalRow({ goal, delay }: { goal: GoalRowData; delay: number }) {
  const [revealed, setRevealed] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      onViewportEnter={() => setRevealed(true)}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between text-[14px]">
        <span className="flex items-center gap-2.5 text-foreground">
          <goal.icon className="h-[18px] w-[18px] text-foreground" />
          {goal.label}
        </span>
        <span className="text-muted">{goal.statusLabel}</span>
      </div>

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="cursor-default py-1"
      >
        <SegmentedProgressBar percentage={revealed ? goal.percentage : 0} className="mt-2" segmentHeight={18} />
      </div>

      <AnimatePresence initial={false}>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border-subtle bg-surface-elevated p-4 sm:grid-cols-4">
              <div>
                <p className="text-[11px] text-muted">Current savings</p>
                <p className="mt-1 text-[13.5px] font-medium text-foreground">{formatCurrency(goal.current, "USD")}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted">Target</p>
                <p className="mt-1 text-[13.5px] font-medium text-foreground">{formatCurrency(goal.target, "USD")}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted">Est. completion</p>
                <p className="mt-1 text-[13.5px] font-medium text-foreground">{goal.completionDate}</p>
              </div>
              <div>
                <p className="text-[11px] text-muted">Monthly contribution</p>
                <p className="mt-1 text-[13.5px] font-medium text-foreground">{goal.monthlyContribution}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-5">
          {ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              className={
                action === "Delete"
                  ? "text-negative transition-colors duration-200 hover:text-negative/80"
                  : "text-muted transition-colors duration-200 hover:text-foreground"
              }
            >
              {action}
            </button>
          ))}
        </div>
        <span className="text-muted-dim">{goal.timeLeft}</span>
      </div>
    </motion.div>
  );
}

export function GoalsProgressSection() {
  return (
    <section className="px-4 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto w-full max-w-[1240px]">
        <SectionHeader
          heading="Every goal starts with a decision."
          paragraph="Lori helps you stay on track by showing your progress, highlighting opportunities to save more, and letting you know when you're getting closer."
        />

        <div className="mx-auto mt-24 flex max-w-[980px] flex-col gap-10 sm:mt-28">
          {GOALS.map((goal, i) => (
            <GoalRow key={goal.id} goal={goal} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>
  );
}
