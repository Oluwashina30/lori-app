"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { CashFlowPoint } from "@/lib/types";

export interface CashFlowChartCardProps {
  series: CashFlowPoint[];
  currency: string;
  className?: string;
}

function formatBucketLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CustomTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number }[];
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-[13px] shadow-lg">
      <p className="font-medium text-foreground">{label ? formatBucketLabel(label) : ""}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className={p.dataKey === "contributions" ? "text-positive" : "text-negative"}>
          {p.dataKey === "contributions" ? "Saved" : "Spent"}: {formatCurrency(p.value, currency)}
        </p>
      ))}
    </div>
  );
}

export function CashFlowChartCard({ series, currency, className }: CashFlowChartCardProps) {
  const hasData = series.some((p) => p.contributions > 0 || p.expenses > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <Card className="flex h-full flex-col">
        <div className="flex items-center justify-between">
          <CardTitle>Cash Flow</CardTitle>
          <div className="flex items-center gap-4 text-[12px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent-solid" aria-hidden />
              Saved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-negative" aria-hidden />
              Spent
            </span>
          </div>
        </div>

        {!hasData ? (
          <p className="mt-6 text-[14px] text-muted-dim">No activity logged in this period yet.</p>
        ) : (
          <div className="mt-4 h-[220px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatBucketLabel}
                  tick={{ fill: "var(--muted-dim)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => formatCurrency(v, currency)}
                  tick={{ fill: "var(--muted-dim)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={64}
                />
                <Tooltip
                  content={<CustomTooltip currency={currency} />}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Bar dataKey="contributions" fill="var(--accent-solid)" radius={[3, 3, 0, 0]} maxBarSize={28} />
                <Bar dataKey="expenses" fill="var(--negative)" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
