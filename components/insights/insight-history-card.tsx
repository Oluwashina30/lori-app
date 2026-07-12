"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { WandIcon } from "@/components/icons";
import { formatRelativeTime } from "@/lib/utils";
import type { InsightRecord } from "@/lib/types";

const TYPE_LABEL: Record<InsightRecord["type"], string> = {
  SUGGESTION: "Asked",
  SPENDING_PATTERN: "Spending pattern",
  FORECAST: "Forecast",
  ANOMALY: "Anomaly",
  AUTO_SAVE_RECOMMENDATION: "Auto-save",
};

// generateInsight() (insightService.ts) always titles on-demand rows
// "Insight: <question>" — stripping that prefix here shows the question
// itself as the card's title, purely a display concern.
function displayTitle(insight: InsightRecord): string {
  return insight.type === "SUGGESTION" ? insight.title.replace(/^Insight:\s*/, "") : insight.title;
}

export interface InsightHistoryCardProps {
  insight: InsightRecord;
  index: number;
  onDismiss?: (id: string) => void;
}

/**
 * One row in the AI Insights history feed — reuses the same glowing-panel
 * language as the dashboard's AIInsightCard (WandIcon + surface-elevated
 * panel) but as a compact, read-only list item rather than a hero card.
 */
export function InsightHistoryCard({ insight, index, onDismiss }: InsightHistoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-elevated">
              <WandIcon className="h-4 w-4" />
            </span>
            <span className="text-[13px] font-medium text-muted">{TYPE_LABEL[insight.type]}</span>
          </div>
          <span className="text-[13px] text-muted-dim">{formatRelativeTime(insight.createdAt)}</span>
        </div>

        <div className="rounded-xl bg-surface-elevated p-4">
          <p className="text-[14px] font-medium text-foreground">{displayTitle(insight)}</p>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">{insight.content}</p>
        </div>

        {onDismiss && !insight.dismissed && (
          <button
            type="button"
            onClick={() => onDismiss(insight.id)}
            className="self-end text-[13px] text-muted-dim transition-colors duration-200 hover:text-foreground"
          >
            Dismiss
          </button>
        )}
      </Card>
    </motion.div>
  );
}
