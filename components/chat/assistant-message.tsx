"use client";

import { motion } from "framer-motion";
import { Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FormattedText } from "@/components/ui/formatted-text";
import { SparkleIcon } from "@/components/icons";
import type { AssistantBlock, ChatMessage } from "@/lib/types";

export interface AssistantMessageProps {
  message: ChatMessage;
}

function BlockIcon({ kind }: { kind: AssistantBlock["kind"] }) {
  if (kind === "confirmation") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated">
        <Receipt className="h-4 w-4 text-foreground" strokeWidth={1.75} aria-hidden />
      </span>
    );
  }
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center">
      <SparkleIcon className="h-5 w-5" aria-hidden />
    </span>
  );
}

/**
 * The assistant's reply — reuses the same glowing gradient border as the
 * dashboard's AI Insight card (`highlighted` Card + `ai-glow-border`) so
 * "the AI is responding" reads consistently across the whole app. Each
 * reply can carry multiple stacked blocks (e.g. a transaction confirmation
 * followed by a proactive insight), with one timestamp for the whole reply.
 */
export function AssistantMessage({ message }: AssistantMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card highlighted className="max-w-2xl">
        <div className="flex flex-col gap-4">
          {message.blocks?.map((block, i) => (
            <div key={i} className="flex items-center gap-3">
              <BlockIcon kind={block.kind} />
              <p className="text-[15px] text-foreground">
                <FormattedText text={block.text} />
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-end">
          <span className="text-[13px] text-muted-dim">{message.timestamp}</span>
        </div>
      </Card>
    </motion.div>
  );
}
