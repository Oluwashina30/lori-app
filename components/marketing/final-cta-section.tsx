"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="px-4 py-28 sm:px-10 sm:py-40">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex w-full max-w-[1240px] flex-col items-start justify-between gap-8 sm:flex-row sm:items-center"
      >
        <h2 className="max-w-lg text-[26px] font-semibold leading-tight tracking-tight text-foreground sm:text-[34px]">
          See what your money has been trying to tell you.
        </h2>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className={buttonVariants({ variant: "gradient", size: "lg", className: "group font-semibold" })}
          >
            Get started free
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <a href="#how-it-works" className={buttonVariants({ variant: "outline", size: "lg" })}>
            See how it works
          </a>
        </div>
      </motion.div>
    </section>
  );
}
