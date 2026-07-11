"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const DOT_COUNT = 3;

/** Brief "AI is responding" state — the same glowing card treatment as an actual reply, with three softly bouncing dots in place of text. */
export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card highlighted className="inline-flex w-auto items-center gap-1.5 py-4">
        {Array.from({ length: DOT_COUNT }).map((_, i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-muted"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </Card>
    </motion.div>
  );
}
