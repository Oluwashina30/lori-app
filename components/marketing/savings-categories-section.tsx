"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/marketing/section-header";
import { GOAL_CATEGORIES } from "@/lib/goal-categories";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
};

/**
 * "Everything a savings app should do" — the 8 onboarding goal categories
 * as a static showcase grid, reusing the same GOAL_CATEGORIES source of
 * truth as onboarding's goal picker and the Goals page's create/edit form.
 */
export function SavingsCategoriesSection() {
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
          {GOAL_CATEGORIES.map((category, i) => (
            <motion.div key={category.category} variants={itemVariants}>
              <Card
                highlighted={i === 0}
                className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 p-3.5 text-center hover:-translate-y-0.5"
              >
                <category.icon className="h-5 w-5 text-foreground" />
                <span className="text-[13px] font-medium text-foreground">{category.label}</span>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
