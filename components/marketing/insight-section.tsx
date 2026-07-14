"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SparkleIcon } from "@/components/icons";

const PARTICLES = [
  { top: "18%", left: "12%", size: 4, duration: 7, delay: 0 },
  { top: "68%", left: "22%", size: 3, duration: 8.5, delay: 1.2 },
  { top: "32%", left: "88%", size: 3, duration: 6.5, delay: 0.6 },
  { top: "78%", left: "80%", size: 4, duration: 9, delay: 2 },
];

// Realistic, varied-length insights Lori might surface — pure front-end
// playback on a loop, no backend behind any of it.
const INSIGHTS = [
  "You've consistently saved more on Fridays.",
  "Dining expenses increased by 14% this month.",
  "You're on track to reach your travel goal two weeks early.",
  "Reducing subscriptions by ₦3,000 would help you reach your goal faster.",
];

const THINKING_MS = 1300;
const HOLD_MS = 3200;
const LAYOUT_TRANSITION = { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const };

export function InsightSection() {
  const [thinking, setThinking] = React.useState(true);
  const [index, setIndex] = React.useState(0);
  const started = React.useRef(false);
  const cancelled = React.useRef(false);
  const reduceMotion = useReducedMotion();

  React.useEffect(
    () => () => {
      cancelled.current = true;
    },
    []
  );

  function startCycle() {
    if (started.current) return;
    started.current = true;

    if (reduceMotion) {
      setThinking(false);
      return;
    }

    function showInsight(i: number) {
      if (cancelled.current) return;
      setIndex(i);
      setThinking(false);
      setTimeout(() => {
        if (cancelled.current) return;
        setThinking(true);
        setTimeout(() => showInsight((i + 1) % INSIGHTS.length), THINKING_MS);
      }, HOLD_MS);
    }

    setTimeout(() => showInsight(0), THINKING_MS);
  }

  return (
    <section className="px-4 py-20 sm:px-10 sm:py-28">
      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-[26px] font-semibold leading-tight tracking-tight text-foreground sm:text-[32px]">
            Lori&apos;s insight
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted sm:text-[16px]">
            Lori is your personal financial companion, designed to help you understand your money with less
            effort. From everyday spending to long-term savings, Lori keeps everything organized, highlights
            meaningful patterns, and helps you make confident financial decisions, one conversation at a time.
          </p>
        </motion.div>

        <motion.div
          layout
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          onViewportEnter={startCycle}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1], layout: LAYOUT_TRANSITION }}
          className="ai-glow-border relative flex min-h-[200px] flex-col rounded-2xl border border-transparent bg-surface p-6 [background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(165deg,#FD5B2E_0%,#EA3B1F_100%)_border-box]"
        >
          {!reduceMotion && (
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              {PARTICLES.map((p, i) => (
                <span
                  key={i}
                  className="absolute rounded-full bg-accent-solid"
                  style={{
                    top: p.top,
                    left: p.left,
                    width: p.size,
                    height: p.size,
                    animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-semibold text-foreground">Lori&apos;s Insight</h3>
            <SparkleIcon className="h-5 w-5" />
          </div>

          <motion.div layout transition={{ layout: LAYOUT_TRANSITION }} className="mt-6 rounded-2xl bg-surface-elevated p-5">
            <p className="text-[13px] text-muted">Insight</p>

            <AnimatePresence mode="wait">
              {thinking ? (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  className="mt-3 flex items-center gap-1.5"
                >
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted [animation-delay:300ms]" />
                </motion.div>
              ) : (
                <motion.p
                  key={`insight-${index}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-3 text-[15px] leading-relaxed text-foreground"
                >
                  {INSIGHTS[index]}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
