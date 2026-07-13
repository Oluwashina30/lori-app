"use client";

import { motion } from "framer-motion";
import { SparkleIcon } from "@/components/icons";

export function InsightSection() {
  return (
    <section className="px-4 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground sm:text-[32px]">
            Lori&apos;s insight
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted sm:text-[16px]">
            Lori is your personal financial companion, designed to help you understand your money with less
            effort. From everyday spending to long-term savings, Lori keeps everything organized, highlights
            meaningful patterns, and helps you make confident financial decisions, one conversation at a time.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="ai-glow-border flex min-h-[320px] flex-col rounded-2xl border border-transparent bg-surface p-6 [background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(165deg,#FD5B2E_0%,#EA3B1F_100%)_border-box]"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-semibold text-foreground">Lori&apos;s Insight</h3>
            <SparkleIcon className="h-5 w-5" />
          </div>

          <div className="mt-6 rounded-2xl bg-surface-elevated p-5">
            <p className="text-[13px] text-muted">Insight</p>
            <p className="mt-3 text-[15px] leading-relaxed text-foreground">
              You&apos;re ahead of schedule. Increasing your weekly savings by ₦2,000 would let you reach your
              goal 18 days earlier.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
