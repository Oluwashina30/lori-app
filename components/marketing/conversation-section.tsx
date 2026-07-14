"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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

// Playback beats for the scripted "Lori is replying" demo — pure front-end
// choreography, no backend involved. Each stage reveals the next element;
// once `response` lands the typing dots are swapped out for it.
type Stage = "idle" | "message" | "typing" | "response" | "composer";
const STAGE_ORDER: Stage[] = ["message", "typing", "response", "composer"];
const STAGE_DELAYS_MS = [400, 900, 1100, 500]; // gap *before* each stage in STAGE_ORDER

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export function ConversationSection() {
  const [composerValue, setComposerValue] = React.useState("Can I afford a vacation?");
  const [stage, setStage] = React.useState<Stage>("idle");
  const started = React.useRef(false);
  const reduceMotion = useReducedMotion();

  function startSequence() {
    if (started.current) return;
    started.current = true;

    if (reduceMotion) {
      setStage("composer");
      return;
    }

    let elapsed = 0;
    STAGE_ORDER.forEach((s, i) => {
      elapsed += STAGE_DELAYS_MS[i];
      setTimeout(() => setStage(s), elapsed);
    });
  }

  const stageIndex = STAGE_ORDER.indexOf(stage);
  const showMessage = stageIndex >= STAGE_ORDER.indexOf("message");
  const showTyping = stage === "typing";
  const showResponse = stageIndex >= STAGE_ORDER.indexOf("response");
  const showComposer = stageIndex >= STAGE_ORDER.indexOf("composer");

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
          onViewportEnter={startSequence}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-14 flex min-h-[420px] w-full max-w-2xl flex-col gap-4"
        >
          <AnimatePresence>
            {showMessage && (
              <motion.div key="message" variants={fadeUp} initial="hidden" animate="show" exit="hidden" className="flex justify-end">
                <div className="flex items-end gap-2.5">
                  <div className="max-w-[85%] rounded-2xl bg-surface-elevated px-4 py-2.5">
                    <span className="text-[13.5px] text-foreground">I spent $20 on food</span>
                    <span className="ml-2 text-[11px] text-muted-dim">7:45pm</span>
                  </div>
                  <Avatar initials="O" name="Oluwashina" className="mb-0.5" />
                </div>
              </motion.div>
            )}

            {showTyping && (
              <motion.div
                key="typing"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="flex w-fit items-center gap-1.5 rounded-2xl bg-surface-elevated px-4 py-3"
              >
                <span className="h-2 w-2 animate-pulse rounded-full bg-muted" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-muted [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-pulse rounded-full bg-muted [animation-delay:300ms]" />
              </motion.div>
            )}

            {showResponse && (
              <motion.div key="response" variants={fadeUp} initial="hidden" animate="show" exit="hidden">
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
              </motion.div>
            )}

            {showComposer && (
              <motion.div
                key="composer"
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="mt-2 flex flex-col gap-3"
              >
                <ChatComposer
                  value={composerValue}
                  onChange={setComposerValue}
                  onSubmit={() => setComposerValue("")}
                  showLabel={false}
                  minHeight={104}
                />
                <SuggestionChips suggestions={SUGGESTIONS} onSelect={(s) => setComposerValue(s.label)} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
