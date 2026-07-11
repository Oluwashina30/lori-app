"use client";

import * as React from "react";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { motion } from "framer-motion";

export interface CircularProgressProps {
  /** 0-100 */
  percentage: number;
  size?: number;
  thickness?: number;
  label?: string;
}

/** Donut-style radial chart with an orange gradient arc, matching the Cash Flow card. */
export function CircularProgress({
  percentage,
  size = 120,
  thickness = 10,
  label,
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  const data = [{ name: "progress", value: clamped, fill: "url(#cashflow-gradient)" }];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <RadialBarChart
        width={size}
        height={size}
        cx="50%"
        cy="50%"
        innerRadius={size / 2 - thickness}
        outerRadius={size / 2}
        barSize={thickness}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <defs>
          <linearGradient id="cashflow-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent-from)" />
            <stop offset="55%" stopColor="var(--accent-via)" />
            <stop offset="100%" stopColor="var(--accent-to)" />
          </linearGradient>
        </defs>
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar
          background={{ fill: "rgba(255,255,255,0.05)" }}
          dataKey="value"
          cornerRadius={thickness / 2}
          isAnimationActive
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </RadialBarChart>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-2xl font-semibold text-foreground"
        >
          {label ?? `${Math.round(clamped)}%`}
        </motion.span>
      </div>
    </div>
  );
}
