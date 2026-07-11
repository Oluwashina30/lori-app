"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { heatColorAt, cn } from "@/lib/utils";
import { useContainerWidth } from "@/lib/use-container-width";

export interface SegmentedProgressBarProps {
  /** 0-100 */
  percentage: number;
  className?: string;
  /** Target width of each segment tick, in pixels. */
  segmentWidth?: number;
  /** Target gap between segment ticks, in pixels. */
  gap?: number;
  /** Height of each segment tick, in pixels. */
  segmentHeight?: number;
}

const INACTIVE_COLOR = "rgba(255,255,255,0.06)";

/** Segment density used for the very first render (server + pre-measurement
 *  client pass) before the container has been measured. Purely a layout
 *  placeholder — it's replaced the instant ResizeObserver reports a real
 *  width, so it never needs to match the eventual on-screen count exactly. */
const INITIAL_SEGMENT_ESTIMATE = 40;

/**
 * A responsive, tick-style progress indicator (matching the source design's
 * "barcode" bar). Unlike a fixed-segment-count bar, this component:
 *
 * - Measures its own container width via ResizeObserver.
 * - Derives how many segments fit at the target `segmentWidth` + `gap`.
 * - Stretches that many segments (via flexbox `flex: 1`) so the row always
 *   spans the full container width exactly, with no leftover space.
 * - Colors exactly `round(percentage / 100 * segmentCount)` segments along
 *   the shared brand heat-gradient (violet -> pink -> orange -> yellow ->
 *   green); the rest stay dim/inactive.
 *
 * Segment count is therefore always derived, never hardcoded, and adapts
 * live if the container is resized while keeping the same visual density.
 */
export function SegmentedProgressBar({
  percentage,
  className,
  segmentWidth = 4,
  gap = 2,
  segmentHeight = 18,
}: SegmentedProgressBarProps) {
  const [containerRef, measuredWidth] = useContainerWidth<HTMLDivElement>();

  const segmentCount = React.useMemo(() => {
    if (measuredWidth == null) return INITIAL_SEGMENT_ESTIMATE;
    const pitch = segmentWidth + gap;
    const count = Math.floor((measuredWidth + gap) / pitch);
    return Math.max(1, count);
  }, [measuredWidth, segmentWidth, gap]);

  const clamped = Math.min(100, Math.max(0, percentage));
  const filledCount = Math.round((clamped / 100) * segmentCount);

  return (
    <div
      ref={containerRef}
      className={cn("flex w-full items-center", className)}
      style={{ gap: `${gap}px` }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {Array.from({ length: segmentCount }).map((_, i) => {
        const isActive = i < filledCount;
        const t = segmentCount <= 1 ? 0 : i / (segmentCount - 1);
        return (
          <motion.span
            key={i}
            className="grow basis-0 rounded-full"
            style={{ height: segmentHeight }}
            initial={false}
            animate={{ backgroundColor: isActive ? heatColorAt(t) : INACTIVE_COLOR }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.006 }}
          />
        );
      })}
    </div>
  );
}
