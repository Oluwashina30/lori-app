"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { OnboardingPlan } from "@/lib/types";

const CATEGORY_LABEL: Record<string, string> = {
  home: "Buy a Home",
  car: "Buy a Car",
  travel: "Travel",
  education: "Education",
  wedding: "Wedding",
  business: "Start/Grow a Business",
  emergency_fund: "Emergency Fund",
  other: "Something Else",
};

const CONFIDENCE_COLOR: Record<OnboardingPlan["confidenceLabel"], string> = {
  High: "text-positive",
  Medium: "text-accent-solid",
  Low: "text-negative",
};

function formatTimeline(deadline: string | null): string {
  if (!deadline) return "Ongoing";
  const months = Math.max(
    1,
    Math.round((new Date(deadline).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000))
  );
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"}`;
}

export interface PlanRevealScreenProps {
  plan: OnboardingPlan;
  onContinue: () => void;
}

export function PlanRevealScreen({ plan, onContinue }: PlanRevealScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full max-w-lg flex-col items-center text-center"
    >
      <h1 className="text-[26px] font-semibold tracking-tight text-foreground sm:text-[30px]">
        Your personalized savings strategy is ready
      </h1>

      <Card
        className="gradient-border-static mt-8 w-full text-left"
        style={{ "--gradient-border-image": "linear-gradient(90deg, var(--progress-from), var(--progress-via), var(--progress-to))" } as React.CSSProperties}
      >
        <dl className="flex flex-col gap-4">
          <Row label="Goal" value={plan.goal.name} />
          <Row label="Category" value={CATEGORY_LABEL[plan.goal.category] ?? plan.goal.category} />
          <Row label="Target" value={formatCurrency(plan.goal.targetAmount, plan.currency)} />
          <Row label="Timeline" value={formatTimeline(plan.goal.deadline)} />
          <Row label="Weekly Contribution" value={formatCurrency(plan.goal.recommendedContribution, plan.currency)} />
          <Row
            label="Confidence"
            value={plan.confidenceLabel}
            valueClassName={CONFIDENCE_COLOR[plan.confidenceLabel]}
          />
        </dl>

        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface-elevated px-5 py-4">
          <Lightbulb className="h-[18px] w-[18px] shrink-0 text-accent-solid" strokeWidth={2} />
          <p className="text-[14px] text-foreground/90">{plan.challengeText}</p>
        </div>
      </Card>

      <p className="mt-5 text-[13px] text-muted">
        We&apos;ll automatically adjust your recommendations whenever your situation changes.
      </p>

      <Button type="button" size="lg" onClick={onContinue} className="mt-6 w-full max-w-xs">
        Continue to Dashboard
      </Button>
    </motion.div>
  );
}

function Row({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[13.5px] text-muted">{label}</dt>
      <dd className={`text-[14.5px] font-medium text-foreground ${valueClassName ?? ""}`}>{value}</dd>
    </div>
  );
}
