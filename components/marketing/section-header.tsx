"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  heading: React.ReactNode;
  paragraph: React.ReactNode;
  className?: string;
}

/**
 * The two-column section intro shared by several landing sections: a
 * heading on the left, a supporting paragraph on the right, top-aligned.
 * Matches the reference's "Everything a savings app should do", "Every
 * goal starts with a decision", and "Everything Lori can do" headers.
 */
export function SectionHeader({ heading, paragraph, className }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-16", className)}
    >
      <h2 className="max-w-sm text-[26px] font-semibold leading-tight tracking-tight text-foreground sm:text-[32px]">
        {heading}
      </h2>
      <p className="max-w-md text-[15px] leading-relaxed text-muted sm:text-[16px]">{paragraph}</p>
    </motion.div>
  );
}
