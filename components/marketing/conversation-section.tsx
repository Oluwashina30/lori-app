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

type TurnPhase = "sent" | "typing" | "done";

interface Turn {
  id: number;
  userText: string;
  userTime: string;
  phase: TurnPhase;
  aiLines: string[];
  aiTime: string;
}

const TYPING_DELAY_MS = 900;
const THINKING_DELAY_MS = 1100;
const MAX_VISIBLE_TURNS = 3;

function nowTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase().replace(" ", "");
}

// Simple keyword matching against a small canned-reply pool — entirely
// front-end, no AI/backend involved, but varied enough to feel responsive
// to what was actually typed.
function getCannedReply(text: string): string[] {
  const t = text.toLowerCase();
  if (/(vacation|trip|travel|afford)/.test(t)) {
    return ["Based on your current pace, you could afford this in about 3 months if you set aside ₦25,000/week."];
  }
  if (/(paid|income|salary)/.test(t)) {
    return ["Nice! I've logged this as income and moved 20% straight into your top goal."];
  }
  if (/(save|faster|saving)/.test(t)) {
    return ["Cutting discretionary spending by ₦5,000/week would get you there about 3 weeks sooner."];
  }
  if (/(new goal|create a goal|goal)/.test(t)) {
    return ["Tell me the amount and a rough deadline, and I'll build the plan around it."];
  }
  return ["Got it — I've noted that down and updated your overview."];
}

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export function ConversationSection() {
  const [composerValue, setComposerValue] = React.useState("");
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [showComposer, setShowComposer] = React.useState(false);
  const started = React.useRef(false);
  const nextId = React.useRef(0);
  const cancelled = React.useRef(false);
  const reduceMotion = useReducedMotion();

  React.useEffect(
    () => () => {
      cancelled.current = true;
    },
    []
  );

  function playTurn(userText: string, aiLines: string[]) {
    const id = nextId.current++;
    const turn: Turn = { id, userText, userTime: nowTime(), phase: "sent", aiLines: [], aiTime: nowTime() };

    if (reduceMotion) {
      setTurns((prev) => [...prev.slice(-(MAX_VISIBLE_TURNS - 1)), { ...turn, phase: "done", aiLines }]);
      setShowComposer(true);
      return;
    }

    setTurns((prev) => [...prev.slice(-(MAX_VISIBLE_TURNS - 1)), turn]);

    setTimeout(() => {
      if (cancelled.current) return;
      setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, phase: "typing" } : t)));

      setTimeout(() => {
        if (cancelled.current) return;
        setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, phase: "done", aiLines } : t)));
        setShowComposer(true);
      }, THINKING_DELAY_MS);
    }, TYPING_DELAY_MS);
  }

  function startSequence() {
    if (started.current) return;
    started.current = true;
    playTurn("I spent $20 on food", [
      "Got it! I've added this expense.",
      "I noticed you've spent more on eating out this week than usual. Would you like me to create a food budget?",
    ]);
  }

  const busy = turns.length > 0 && turns[turns.length - 1].phase !== "done";

  function handleSubmit(value: string) {
    if (!value.trim() || busy) return;
    setComposerValue("");
    playTurn(value.trim(), getCannedReply(value.trim()));
  }

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
          <AnimatePresence initial={false}>
            {turns.map((turn) => (
              <motion.div
                key={turn.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-4"
              >
                <div className="flex justify-end">
                  <div className="flex items-end gap-2.5">
                    <div className="max-w-[85%] rounded-2xl bg-surface-elevated px-4 py-2.5">
                      <span className="text-[13.5px] text-foreground">{turn.userText}</span>
                      <span className="ml-2 text-[11px] text-muted-dim">{turn.userTime}</span>
                    </div>
                    <Avatar initials="O" name="Oluwashina" className="mb-0.5" />
                  </div>
                </div>

                {turn.phase === "typing" && (
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    className="flex w-fit items-center gap-1.5 rounded-2xl bg-surface-elevated px-4 py-3"
                  >
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-muted [animation-delay:300ms]" />
                  </motion.div>
                )}

                {turn.phase === "done" && (
                  <motion.div variants={fadeUp} initial="hidden" animate="show">
                    <Card highlighted className="flex flex-col gap-4 p-5">
                      {turn.aiLines.map((line, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span
                            className={
                              i === 0
                                ? "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated"
                                : "mt-0.5 shrink-0"
                            }
                          >
                            <SparkleIcon className="h-4 w-4" />
                          </span>
                          <p className="flex-1 text-[13.5px] leading-relaxed text-foreground">{line}</p>
                          {i === turn.aiLines.length - 1 && (
                            <span className="shrink-0 text-[11px] text-muted-dim">{turn.aiTime}</span>
                          )}
                        </div>
                      ))}
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            ))}

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
                  onSubmit={handleSubmit}
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
