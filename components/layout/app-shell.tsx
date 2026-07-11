"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sidebar, MobileTopBar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { useSidebarExpanded } from "@/lib/use-sidebar-expanded";
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from "@/lib/sidebar-constants";
import type { UserProfile } from "@/lib/types";

export interface AppShellProps {
  user: UserProfile;
  children: React.ReactNode;
  /** Constrains the inner content width, e.g. narrower for a chat page. Defaults to the dashboard's 1240px. */
  maxWidthClassName?: string;
  /** Extra classes for the inner content wrapper (e.g. to make a chat thread fill height). */
  contentClassName?: string;
}

/**
 * Shared page scaffold: fixed desktop sidebar (collapsible) + floating
 * toggle, fixed mobile top bar + drawer, and the animated spacer that keeps
 * main content offset in sync with the sidebar's width. Every route (the
 * dashboard, the AI chat page, etc.) renders through this so the
 * navigation chrome — and its animations, persisted expand state, and
 * routing — stays identical everywhere.
 */
export function AppShell({
  user,
  children,
  maxWidthClassName = "max-w-[1240px]",
  contentClassName,
}: AppShellProps) {
  const [expanded, setExpanded] = useSidebarExpanded();

  return (
    <div className="flex min-h-screen bg-background">
      <MobileTopBar user={user} />
      <Sidebar expanded={expanded} onToggleExpanded={setExpanded} />

      {/* Non-fixed spacer that mirrors the sidebar's own animated width so
          main content shifts over smoothly. display:none below md (matching
          the sidebar itself being hidden there) means it never affects the
          mobile layout. */}
      <motion.div
        aria-hidden
        className="hidden w-[88px] shrink-0 md:block"
        initial={false}
        animate={{ width: expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
        transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
      />

      <main className="flex min-w-0 flex-1 flex-col px-4 pb-6 pt-24 sm:px-10 sm:pb-8 md:pt-8 lg:px-12">
        <div className={`mx-auto flex w-full flex-1 flex-col gap-8 ${maxWidthClassName}`}>
          <TopHeader user={user} />
          <div className={contentClassName ?? "flex flex-col gap-8"}>{children}</div>
        </div>
      </main>
    </div>
  );
}
