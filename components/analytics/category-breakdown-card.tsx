"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardTitle } from "@/components/ui/card";
import { expenseCategoryLabel } from "@/lib/expense-categories";
import { formatCurrency, heatColorAt } from "@/lib/utils";
import type { CategoryBreakdownItem } from "@/lib/types";

export interface CategoryBreakdownCardProps {
  items: CategoryBreakdownItem[];
  currency: string;
  className?: string;
}

function CustomTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: { payload: CategoryBreakdownItem }[];
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-[13px] shadow-lg">
      <p className="font-medium text-foreground">{expenseCategoryLabel(item.category)}</p>
      <p className="text-muted">
        {formatCurrency(item.amount, currency)} · {item.percentage}%
      </p>
    </div>
  );
}

export function CategoryBreakdownCard({ items, currency, className }: CategoryBreakdownCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <Card className="flex h-full flex-col">
        <CardTitle>Spending by Category</CardTitle>

        {items.length === 0 ? (
          <p className="mt-6 text-[14px] text-muted-dim">No expenses logged in this period yet.</p>
        ) : (
          <div className="mt-4 flex flex-1 flex-col items-center gap-6 sm:flex-row">
            <div className="h-[180px] w-[180px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={items}
                    dataKey="amount"
                    nameKey="category"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={items.length > 1 ? 2 : 0}
                    cornerRadius={4}
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  >
                    {items.map((item, i) => (
                      <Cell
                        key={item.category}
                        fill={heatColorAt(items.length > 1 ? i / (items.length - 1) : 0)}
                        stroke="var(--surface)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="flex w-full flex-1 flex-col gap-2.5">
              {items.map((item, i) => (
                <li key={item.category} className="flex items-center justify-between gap-3 text-[13.5px]">
                  <span className="flex items-center gap-2 text-foreground">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: heatColorAt(items.length > 1 ? i / (items.length - 1) : 0) }}
                      aria-hidden
                    />
                    {expenseCategoryLabel(item.category)}
                  </span>
                  <span className="shrink-0 text-muted">
                    {formatCurrency(item.amount, currency)} <span className="text-muted-dim">({item.percentage}%)</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
