"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { GreetingSection } from "@/components/dashboard/greeting-section";
import { AIRecommendationBanner } from "@/components/dashboard/ai-recommendation-banner";
import { ChatComposer } from "@/components/dashboard/chat-composer";
import { SuggestionChips } from "@/components/dashboard/suggestion-chips";
import { TotalSavingsCard } from "@/components/dashboard/total-savings-card";
import { SavingsPlanCard } from "@/components/dashboard/savings-plan-card";
import { CashFlowCard } from "@/components/dashboard/cash-flow-card";
import { RecentActivitiesCard } from "@/components/dashboard/recent-activities-card";
import { AIInsightCard } from "@/components/dashboard/ai-insight-card";
import type { DashboardData, ChatSuggestion } from "@/lib/types";

export interface DashboardShellProps {
  data: DashboardData;
}

export function DashboardShell({ data }: DashboardShellProps) {
  const router = useRouter();
  const [composerValue, setComposerValue] = React.useState("");

  function handleSuggestionSelect(suggestion: ChatSuggestion) {
    setComposerValue(suggestion.label);
  }

  function handleSubmit(value: string) {
    // The dashboard composer is an entry point, not a full chat surface —
    // hand the message off to /chat, which owns the real conversation and
    // the actual backend call. sessionStorage survives the client navigation
    // without polluting the URL with the raw message text.
    sessionStorage.setItem("lori:pending-message", value);
    setComposerValue("");
    router.push("/chat");
  }

  return (
    <AppShell user={data.user}>
      <GreetingSection name={data.user.name} subtitle={data.greetingSubtitle} />

      <TotalSavingsCard summary={data.savingsSummary} />

      <AIRecommendationBanner message={data.recommendation.message} />

      <div className="flex flex-col gap-4">
        <ChatComposer value={composerValue} onChange={setComposerValue} onSubmit={handleSubmit} />
        <SuggestionChips suggestions={data.chatSuggestions} onSelect={handleSuggestionSelect} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SavingsPlanCard items={data.savingsPlan} className="md:col-span-1" />

        <div className="flex flex-col gap-6 md:col-span-1">
          <CashFlowCard data={data.cashFlow} />
          <RecentActivitiesCard activities={data.activities} />
        </div>

        <AIInsightCard insight={data.aiInsight} className="md:col-span-2 lg:col-span-1" />
      </div>
    </AppShell>
  );
}
