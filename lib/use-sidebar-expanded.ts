"use client";

import * as React from "react";

const STORAGE_KEY = "flexi:sidebar-expanded";

function readStoredValue(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/** Server/first-paint snapshot — always collapsed, per spec, and avoids hydration mismatches. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Tracks whether the desktop sidebar is expanded, persisted to
 * localStorage via `useSyncExternalStore` (the correct primitive for
 * reading an external, possibly-changing data source — avoids the
 * effect-plus-setState anti-pattern for what's really a subscription).
 *
 * Always starts collapsed for the server-rendered and first client pass
 * (matching the "loads collapsed by default" requirement), then reflects
 * the stored preference as soon as it's read.
 */
export function useSidebarExpanded(): [boolean, (value: boolean) => void] {
  const expanded = React.useSyncExternalStore(subscribe, readStoredValue, getServerSnapshot);

  const setExpanded = React.useCallback((value: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value));
      // The native `storage` event only fires in *other* tabs/windows, not
      // the one that made the change, so dispatch a synthetic one here to
      // notify this tab's subscribers (i.e. re-run readStoredValue).
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    } catch {
      // Ignore write failures; preference just won't persist this session.
    }
  }, []);

  return [expanded, setExpanded];
}
