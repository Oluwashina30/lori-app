"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

export interface AnimatedNumberProps {
  value: number;
  formatter?: (value: number) => string;
  duration?: number;
  className?: string;
}

/** Animates from 0 to `value` on mount, formatting the live number with `formatter`. */
export function AnimatedNumber({
  value,
  formatter = (v) => Math.round(v).toLocaleString("en-US"),
  duration = 1.2,
  className,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => formatter(latest));
  const [display, setDisplay] = React.useState(formatter(0));

  React.useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <motion.span className={className}>{display}</motion.span>;
}
