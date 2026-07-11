"use client";

import * as React from "react";

/**
 * Tracks the content-box width of an element via ResizeObserver.
 *
 * Returns `null` until the first measurement is available (i.e. before
 * mount / layout), so callers can fall back to a sensible default for the
 * server-rendered and first client-rendered pass, then switch to the
 * measured value once mounted — avoiding hydration mismatches.
 */
export function useContainerWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number | null] {
  const ref = React.useRef<T>(null);
  const [width, setWidth] = React.useState<number | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    setWidth(el.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
