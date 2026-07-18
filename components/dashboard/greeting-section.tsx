"use client";

import { motion } from "framer-motion";
import { getGreeting } from "@/lib/utils";

export interface GreetingSectionProps {
  name: string;
  subtitle: string;
}

export function GreetingSection({ name, subtitle }: GreetingSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-[26px]">
        {getGreeting()}, {name}
      </h1>
      <p className="mt-1.5 text-sm text-muted sm:text-[15px]">{subtitle}</p>
    </motion.div>
  );
}
