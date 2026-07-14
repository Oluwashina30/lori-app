"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

export interface AIRecommendationBannerProps {
  message: string;
}

export function AIRecommendationBanner({ message }: AIRecommendationBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface px-5 py-4 transition-colors duration-200 hover:border-border-strong"
    >
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: [0.5, 1.2, 1] }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <Lightbulb className="h-[18px] w-[18px] shrink-0 text-accent-solid" strokeWidth={2} />
      </motion.span>
      <p className="text-[14px] text-foreground/90">{message}</p>
    </motion.div>
  );
}
