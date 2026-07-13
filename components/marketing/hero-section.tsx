"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { DashboardPreview } from "@/components/marketing/dashboard-preview";

export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-10 sm:pb-28 sm:pt-24">

      <div className="mx-auto flex w-full max-w-[820px] flex-col items-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-[36px] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-[52px]"
        >
          Ask Lori where your money should go next.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted sm:text-[17px]"
        >
          Record your spending as naturally as sending a message. Lori organizes your finances, uncovers
          spending patterns, and gives timely insights that help you save with confidence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Link href="/signup" className={buttonVariants({ variant: "gradient", size: "lg", className: "font-semibold" })}>
            Get started free
          </Link>
          <a href="#how-it-works" className={buttonVariants({ variant: "outline", size: "lg" })}>
            See how it works
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="mt-5 text-[13px] text-muted-dim"
        >
          Your financial data stays yours.
        </motion.p>
      </div>

      <div className="mt-16 sm:mt-20">
        <DashboardPreview />
      </div>
    </section>
  );
}
