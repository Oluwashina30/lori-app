"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/marketing/section-header";
import { SegmentedProgressBar } from "@/components/ui/segmented-progress-bar";
import { HouseIcon, CarIcon } from "@/components/icons";

interface GoalRow {
  id: string;
  label: string;
  icon: typeof HouseIcon;
  statusLabel: string;
  percentage: number;
  timeLeft: string;
}

const GOALS: GoalRow[] = [
  { id: "rent", label: "Rent", icon: HouseIcon, statusLabel: "Complete ($3,000)", percentage: 100, timeLeft: "6 months left" },
  { id: "car", label: "Car", icon: CarIcon, statusLabel: "$3,000 / $15,000", percentage: 20, timeLeft: "6 months left" },
];

const ACTIONS = ["Add Money", "Edit", "Pause", "Delete"];

/** A single goal row — holds its own "has this scrolled into view yet" flag so its progress bar fills from 0% the first time it's seen, not on mount. */
function GoalRow({ goal, delay }: { goal: GoalRow; delay: number }) {
  const [revealed, setRevealed] = React.useState(false);

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

      <SegmentedProgressBar percentage={revealed ? goal.percentage : 0} className="mt-3" segmentHeight={18} />

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
