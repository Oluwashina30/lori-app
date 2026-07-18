"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { ChatComposer } from "@/components/dashboard/chat-composer";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { InsightHistoryCard } from "@/components/insights/insight-history-card";
import { askInsight, dismissInsight } from "@/lib/api-client";
import type { InsightRecord, UserProfile } from "@/lib/types";

export interface InsightsPageClientProps {
  user: UserProfile;
  initialHistory: InsightRecord[];
}

/**
 * "AI Insights" — an ask box (reusing the dashboard's ChatComposer) backed
 * directly by insightService.generateInsight rather than the general
 * intent parser, since every question here is unambiguously a
 * request_insight; and a history feed of every past insight (on-demand
 * questions and proactive auto-save/anomaly rows alike), all reading from
 * the same Insight table that already powers the dashboard's latest-insight
 * card.
 */
export function InsightsPageClient({ user, initialHistory }: InsightsPageClientProps) {
  const [history, setHistory] = React.useState(initialHistory);
  const [query, setQuery] = React.useState("");
  const [asking, setAsking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleAsk(value: string) {
    setAsking(true);
    setError(null);
    try {
      const insight = await askInsight(value);
      setHistory((prev) => [insight, ...prev]);
      setQuery("");
    } catch (err) {
      console.error("ask insight failed:", err);
      setError("Something went wrong reaching the server — try again in a moment.");
    } finally {
      setAsking(false);
    }
  }

  // Optimistic: hides the dismiss control immediately, and quietly retries
  // nothing on failure — this mirrors the dashboard's own dismiss affordance,
  // where losing a dismiss on a flaky request isn't worth extra UI state.
  async function handleDismiss(id: string) {
    setHistory((prev) => prev.map((i) => (i.id === id ? { ...i, dismissed: true } : i)));
    try {
      await dismissInsight(id);
    } catch (err) {
      console.error("dismiss insight failed:", err);
    }
  }

  return (
    <AppShell user={user} contentClassName="flex flex-1 flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-1.5 text-center"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">AI Insights</h1>
        <p className="text-sm text-muted sm:text-[15px]">
          Ask anything about your money, or revisit what Lori&apos;s already told you.
        </p>
      </motion.div>

      <ChatComposer
        value={query}
        onChange={setQuery}
        onSubmit={handleAsk}
        label="Ask Lori anything"
        placeholder="How am I doing on my travel goal?"
      />

      {error && (
        <p className="text-[13px] text-negative" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-4">
        <AnimatePresence initial={false}>{asking && <TypingIndicator key="typing" />}</AnimatePresence>

        {history.length === 0 && !asking ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-[14px] text-muted-dim"
          >
            No insights yet — ask a question above to get your first one.
          </motion.p>
        ) : (
          history.map((insight, i) => (
            <InsightHistoryCard key={insight.id} insight={insight} index={i} onDismiss={handleDismiss} />
          ))
        )}
      </div>
    </AppShell>
  );
}
