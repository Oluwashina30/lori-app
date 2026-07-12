"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHASES = [
  "Understanding your goal",
  "Estimating affordability",
  "Building your strategy",
  "Personalizing your dashboard",
];

/**
 * Cycles through status text on a fixed cadence purely for perceived
 * progress — the real work (lib/server/services/onboardingService.ts's
 * completeOnboarding) is already running in the background via the fetch
 * OnboardingFlow kicked off before rendering this screen.
 */
export function SynthesisScreen() {
  const [phaseIndex, setPhaseIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((i) => Math.min(i + 1, PHASES.length - 1));
    }, 1100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="ai-glow-border-sm flex w-full items-center justify-center gap-3 rounded-full border border-transparent bg-surface px-8 py-5 text-center [background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(120deg,var(--accent-from),var(--accent-to))_border-box]"
      >
        <span className="text-xl" aria-hidden>
          💡
        </span>
        <div className="text-center">
          <p className="text-[17px] font-semibold text-foreground">Building your personalized plan</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={phaseIndex}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="mt-0.5 text-[14px] text-muted"
            >
              {PHASES[phaseIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
