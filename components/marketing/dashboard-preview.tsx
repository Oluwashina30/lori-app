"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/layout/logo";
import { TopHeader } from "@/components/layout/top-header";
import { GreetingSection } from "@/components/dashboard/greeting-section";
import { TotalSavingsCard } from "@/components/dashboard/total-savings-card";
import { AIRecommendationBanner } from "@/components/dashboard/ai-recommendation-banner";
import { ChatComposer } from "@/components/dashboard/chat-composer";
import {
  DashboardGridIcon,
  ChatBubbleIcon,
  GoalsTrophyIcon,
  AnalyticsGaugeIcon,
  BrainIcon,
} from "@/components/icons/sidebar-icons";
import { cn } from "@/lib/utils";
import type { SavingsSummary, UserProfile } from "@/lib/types";

const MOCK_USER: UserProfile = { id: "demo", name: "Oluwashina", initials: "O" };

const MOCK_SUMMARY: SavingsSummary = {
  total: 20000,
  changeAmount: 2230,
  changePercentage: 13.3,
  goalCurrent: 8000,
  goalTarget: 12000,
  goalPercentComplete: 20,
  goalLabel: "Monthly savings goal",
  insightMessage: "Based on your current pace, you'll reach your Car Goal 18 days early.",
};

const RAIL_ICONS = [ChatBubbleIcon, GoalsTrophyIcon, AnalyticsGaugeIcon, BrainIcon];

// A repeating fractal-noise tile (SVG feTurbulence), used to give the hero
// glow a grainy, photographic texture instead of a flat CSS gradient —
// matching the reference's sun-like halo.
const NOISE_TILE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>";

/** A single warm, grainy glow blob — positioned and dimmed by the caller, breathing slowly in place. */
function GlowBlob({
  className,
  opacity,
  duration = 8,
  delay = 0,
}: {
  className: string;
  opacity: number;
  duration?: number;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute -z-10", className)}
      initial={{ opacity, scale: 1 }}
      animate={
        reduceMotion
          ? { opacity, scale: 1 }
          : { opacity: [opacity * 0.7, opacity, opacity * 0.7], scale: [1, 1.08, 1] }
      }
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div
        className="absolute inset-0 rounded-full blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, #ffffff 0%, #ffe4d6 6%, #ffb199 16%, #ff8a63 26%, #f0562f 38%, #c22a12 48%, transparent 62%)",
        }}
      />
      <div
        className="absolute inset-0 rounded-full opacity-15 mix-blend-overlay"
        style={{
          backgroundImage: `url("${NOISE_TILE}")`,
          backgroundSize: "160px 160px",
          WebkitMaskImage: "radial-gradient(circle, black 0%, black 25%, transparent 52%)",
          maskImage: "radial-gradient(circle, black 0%, black 25%, transparent 52%)",
        }}
      />
    </motion.div>
  );
}

/** The warm, grainy "sunrise" glow sitting behind/above and to either side of the dashboard frame. */
function HeroGlow() {
  return (
    <>
      <GlowBlob className="left-1/2 top-[-140px] h-[420px] w-[760px] -translate-x-1/2" opacity={0.25} duration={9} />
      <GlowBlob
        className="left-[-200px] top-1/2 h-[520px] w-[520px] -translate-y-1/2"
        opacity={0.12}
        duration={10}
        delay={0.6}
      />
      <GlowBlob
        className="right-[-200px] top-1/2 h-[520px] w-[520px] -translate-y-1/2"
        opacity={0.12}
        duration={10}
        delay={1.2}
      />
    </>
  );
}

/**
 * A static, non-interactive replica of the real dashboard, built from the
 * exact same production components (TotalSavingsCard, ChatComposer) so the
 * hero preview honestly represents the product instead of a stand-in
 * illustration.
 */
export function DashboardPreview() {
  const [composerValue, setComposerValue] = React.useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative isolate mx-auto w-full max-w-[1160px]"
    >
      <HeroGlow />

      <div className="flex overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-2xl shadow-black/60">
        <aside className="hidden w-[88px] shrink-0 flex-col items-center gap-3 border-r border-border-subtle py-7 sm:flex">
          <Logo className="h-7 w-auto" />
          <span className="mt-12 flex h-11 w-11 items-center justify-center rounded-xl bg-[linear-gradient(160deg,var(--accent-from)_0%,var(--accent-via)_55%,var(--accent-to)_100%)]">
            <DashboardGridIcon className="h-5 w-5 text-white" />
          </span>
          {RAIL_ICONS.map((Icon, i) => (
            <span key={i} className="flex h-11 w-11 items-center justify-center rounded-xl">
              <Icon className="h-5 w-5 text-muted-dim" />
            </span>
          ))}
        </aside>

        <div className="min-w-0 flex-1 p-5 sm:p-8">
          <div className="flex flex-col gap-8">
            <TopHeader user={MOCK_USER} />

            <div className="flex flex-col gap-8">
              <GreetingSection name={MOCK_USER.name} subtitle="Your finances are looking healthy this month" />

              <TotalSavingsCard summary={MOCK_SUMMARY} currency="USD" />

              <AIRecommendationBanner message="You could reach your savings goal 12 days earlier by reducing food expenses by ₦2,000/week." />

              <ChatComposer value={composerValue} onChange={setComposerValue} onSubmit={() => setComposerValue("")} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
