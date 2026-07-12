"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ProgressIndicator, type OnboardingPhase } from "@/components/onboarding/progress-indicator";
import { GoalCaptureScreen } from "@/components/onboarding/goal-capture-screen";
import { AmountFollowUp, TimelineFollowUp } from "@/components/onboarding/follow-up-screen";
import { EmergencyFundScreen } from "@/components/onboarding/emergency-fund-screen";
import { IncomeScreen } from "@/components/onboarding/income-screen";
import { SynthesisScreen } from "@/components/onboarding/synthesis-screen";
import { PlanRevealScreen } from "@/components/onboarding/plan-reveal-screen";
import type { GoalCategory, OnboardingPlan, OnboardingState } from "@/lib/types";

const STEP_PHASE: Record<OnboardingState["step"], OnboardingPhase> = {
  goal_capture: "Goal",
  follow_up_amount: "Details",
  follow_up_timeline: "Details",
  emergency_fund: "Details",
  income: "Income",
  ready_to_complete: "Plan",
};

async function postOnboarding(body: unknown): Promise<OnboardingState> {
  const res = await fetch("/api/onboarding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Onboarding submit failed: ${res.status}`);
  return res.json();
}

export interface OnboardingFlowProps {
  initialState: OnboardingState;
  userName: string;
}

export function OnboardingFlow({ initialState, userName }: OnboardingFlowProps) {
  const router = useRouter();
  const [state, setState] = React.useState(initialState);
  const [history, setHistory] = React.useState<OnboardingState[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [plan, setPlan] = React.useState<OnboardingPlan | null>(null);
  // Gates re-entry into the complete-fetch effect below — a ref rather than
  // state because it's not something a render should ever react to itself,
  // only something the effect uses to avoid double-firing.
  const completeRequested = React.useRef(false);
  // Derived, not stored — "completing" is fully determined by state.step,
  // so there's nothing to keep in sync by calling setState from an effect.
  const completing = state.step === "ready_to_complete";

  async function advance(body: unknown) {
    setLoading(true);
    try {
      const next = await postOnboarding(body);
      setHistory((h) => [...h, state]);
      setState(next);
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setState(prev);
      return h.slice(0, -1);
    });
  }

  React.useEffect(() => {
    if (!completing || completeRequested.current) return;
    completeRequested.current = true;
    fetch("/api/onboarding/complete", { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error(`Complete failed: ${res.status}`);
        return res.json();
      })
      .then((data: OnboardingPlan) => setPlan(data))
      .catch(() => {
        completeRequested.current = false; // stays on the synthesis screen; user can retry via refresh
      });
  }, [completing]);

  const phase = STEP_PHASE[state.step];
  const showBack = history.length > 0 && !completing;

  return (
    <div className="flex w-full flex-col items-center">
      {!completing && <ProgressIndicator phase={phase} onBack={showBack ? handleBack : undefined} />}

      <AnimatePresence mode="wait">
        <motion.div
          key={completing ? "completing" : state.step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full flex-col items-center"
        >
          {completing ? (
            plan ? (
              <PlanRevealScreen plan={plan} onContinue={() => router.push("/")} />
            ) : (
              <SynthesisScreen />
            )
          ) : state.step === "goal_capture" ? (
            <GoalCaptureScreen
              userName={userName}
              loading={loading}
              onSelectCard={(category: GoalCategory) => advance({ kind: "card", category })}
              onSubmitMessage={(message) => advance({ kind: "message", message })}
            />
          ) : state.step === "follow_up_amount" ? (
            <AmountFollowUp loading={loading} onSubmit={(value) => advance({ kind: "amount", value })} />
          ) : state.step === "follow_up_timeline" ? (
            <TimelineFollowUp loading={loading} onSubmit={(value) => advance({ kind: "timeline", value })} />
          ) : state.step === "emergency_fund" ? (
            <EmergencyFundScreen
              loading={loading}
              onSubmit={({ monthlyExpenses, currentSavings, bufferMonths }) =>
                advance({ kind: "emergency_fund", monthlyExpenses, currentSavings, bufferMonths })
              }
            />
          ) : state.step === "income" ? (
            <IncomeScreen loading={loading} onSelect={(bracket) => advance({ kind: "income", bracket })} />
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
