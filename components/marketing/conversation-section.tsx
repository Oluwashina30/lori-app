"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ChatComposer } from "@/components/dashboard/chat-composer";
import { SuggestionChips } from "@/components/dashboard/suggestion-chips";
import { SparkleIcon } from "@/components/icons";
import type { ChatSuggestion } from "@/lib/types";

const SUGGESTIONS: ChatSuggestion[] = [
  { id: "1", label: "I got paid today" },
  { id: "2", label: "Help me save faster" },
  { id: "3", label: "Create a new goal" },
  { id: "4", label: "Can I afford a vacation?" },
];

export function ConversationSection() {
  const [composerValue, setComposerValue] = React.useState("Can I afford a vacation?");

  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto w-full max-w-[1240px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg"
        >
          <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground sm:text-[32px]">
            Designed to fit into your day.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted sm:text-[16px]">
            Most budgeting apps expect you to stop what you&apos;re doing and fill out forms. Lori lets you
            record your finances the same way you&apos;d send a message.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-14 flex w-full max-w-2xl flex-col gap-4"
        >
          <div className="flex justify-end">
            <div className="flex items-end gap-2.5">
              <div className="max-w-[85%] rounded-2xl bg-surface-elevated px-4 py-2.5">
                <span className="text-[13.5px] text-foreground">I spent $20 on food</span>
                <span className="ml-2 text-[11px] text-muted-dim">7:45pm</span>
              </div>
              <Avatar initials="O" name="Oluwashina" className="mb-0.5" />
            </div>
          </div>

          <Card highlighted className="flex flex-col gap-4 p-5">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated">
                <SparkleIcon className="h-4 w-4" />
              </span>
              <p className="text-[13.5px] leading-relaxed text-foreground">Got it! I&apos;ve added this expense.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0">
                <SparkleIcon className="h-4 w-4" />
              </span>
              <p className="flex-1 text-[13.5px] leading-relaxed text-foreground">
                I noticed you&apos;ve spent more on eating out this week than usual. Would you like me to
                create a food budget?
              </p>
              <span className="shrink-0 text-[11px] text-muted-dim">7:45pm</span>
            </div>
          </Card>

          <div className="flex w-fit items-center gap-1.5 rounded-2xl bg-surface-elevated px-4 py-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-muted" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-muted [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-muted [animation-delay:300ms]" />
          </div>

          <div className="mt-2 flex flex-col gap-3">
            <ChatComposer
              value={composerValue}
              onChange={setComposerValue}
              onSubmit={() => setComposerValue("")}
              showLabel={false}
              minHeight={104}
            />
            <SuggestionChips suggestions={SUGGESTIONS} onSelect={(s) => setComposerValue(s.label)} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
