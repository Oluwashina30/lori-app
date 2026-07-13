"use client";

import { motion } from "framer-motion";
import { Card, CardTitle } from "@/components/ui/card";
import { SectionHeader } from "@/components/marketing/section-header";
import { ChatBubbleIcon, GoalsTrophyIcon, AnalyticsGaugeIcon, BrainIcon } from "@/components/icons/sidebar-icons";
import { WandOutlineIcon, CircleDollarSignIcon } from "@/components/icons";

const FEATURES = [
  {
    icon: ChatBubbleIcon,
    title: "Chat, don't type forms",
    description:
      "Tell Lori “I got paid” or “spent 5k on transport” and it logs the transactions, updates the right goal, and replies in plain language.",
  },
  {
    icon: GoalsTrophyIcon,
    title: "Goals that track themselves",
    description:
      "Create, pause, or contribute to a goal from chat or the goals page. Every goal shows real progress and recommended weekly contributions.",
  },
  {
    icon: AnalyticsGaugeIcon,
    title: "Real analytics, not vibes",
    description:
      "A spending-by-category breakdown and a cash-flow chart over 7, 30, or 90 days built from your actual transactions, not a rounded-up estimate.",
  },
  {
    icon: BrainIcon,
    title: "Ask, and get a real answer",
    description:
      "“How am I doing on my travel goal” gets grounded in your actual numbers. Every answer is saved to a searchable history.",
  },
  {
    icon: WandOutlineIcon,
    title: "A plan built around you",
    description:
      "Onboarding turns one conversation into a target amount, timeline, and weekly contribution sized to what you told Lori you earn, not a one-size-fits-all number.",
  },
  {
    icon: CircleDollarSignIcon,
    title: "Speaks your currency",
    description:
      "Lori defaults to your local currency automatically and supports NGN, USD, EUR, CAD, GHS, KES, ZAR and more. Switch anytime from settings.",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export function FeaturesSection() {
  return (
    <section className="px-4 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto w-full max-w-[1240px]">
        <SectionHeader
          heading="Everything Lori can do."
          paragraph="From recording everyday transactions to uncovering meaningful financial insights, Lori helps you stay organised, informed, and in control."
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto mt-14 grid max-w-[1080px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="h-full p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-elevated">
                  <feature.icon className="h-[18px] w-[18px] text-muted" />
                </span>
                <CardTitle className="mt-3.5 text-[15px]">{feature.title}</CardTitle>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
