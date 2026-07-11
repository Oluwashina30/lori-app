"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { SparkleIcon } from "@/components/icons";
import {
  DashboardGridIcon,
  ChatBubbleIcon,
  GoalsTrophyIcon,
  AnalyticsGaugeIcon,
  BrainIcon,
  SettingsGearIcon,
  LogOutIcon,
  ChevronToggleIcon,
} from "@/components/icons/sidebar-icons";
import { cn } from "@/lib/utils";
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from "@/lib/sidebar-constants";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Real route for items that have a page. Items without one stay as
   *  visual-only demo buttons (no page exists for them yet). */
  href?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: DashboardGridIcon, href: "/" },
  { id: "messages", label: "Chat", icon: ChatBubbleIcon, href: "/chat" },
  { id: "achievements", label: "Goals", icon: GoalsTrophyIcon },
  { id: "analytics", label: "Analytics", icon: AnalyticsGaugeIcon },
  { id: "ai", label: "AI Insights", icon: BrainIcon },
];

const SETTINGS_ITEM: NavItem = { id: "settings", label: "Settings", icon: SettingsGearIcon };
const LOGOUT_ITEM: NavItem = { id: "logout", label: "Log out", icon: LogOutIcon };

/** Signs out of Supabase and sends the user to /login (middleware.ts would redirect there anyway). */
function useLogout() {
  const router = useRouter();
  return React.useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [router]);
}

/**
 * Active-state resolution for nav items: items with a real `href` are
 * active based on the actual current route (so it's correct after a full
 * navigation, back/forward, or a hard refresh); items without one (no page
 * exists for them yet) fall back to a locally-tracked "demo active" id so
 * clicking them still shows something happening.
 */
function useActiveNavId() {
  const pathname = usePathname();
  const [demoActive, setDemoActive] = React.useState<string | null>(null);

  const isActive = React.useCallback(
    (item: NavItem) => (item.href ? pathname === item.href : demoActive === item.id),
    [pathname, demoActive]
  );

  function handleSelect(item: NavItem) {
    if (!item.href) setDemoActive(item.id);
  }

  return { isActive, handleSelect };
}

const activeBg =
  "linear-gradient(160deg, var(--accent-from) 0%, var(--accent-via) 55%, var(--accent-to) 100%)";

/**
 * Tooltip for collapsed nav items. Rendered through a portal straight into
 * `document.body` (positioned via the trigger's own `getBoundingClientRect`)
 * so it can NEVER be clipped by an ancestor's overflow/stacking context —
 * this is the fix for the old "hover tooltips get cut off" bug. The sidebar
 * itself never needs `overflow: hidden` for this to work.
 */
/** SSR-safe "are we on the client yet" flag, via useSyncExternalStore (the
 *  endorsed pattern for this — avoids the effect+setState anti-pattern the
 *  old `useEffect(() => setMounted(true), [])` trick relied on). */
function useHasMounted(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function CollapsedTooltip({
  label,
  anchorRef,
  visible,
}: {
  label: string;
  anchorRef: React.RefObject<HTMLElement | null>;
  visible: boolean;
}) {
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(null);
  const mounted = useHasMounted();

  React.useLayoutEffect(() => {
    if (!visible || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setCoords({ top: rect.top + rect.height / 2, left: rect.right + 12 });
  }, [visible, anchorRef]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {visible && coords && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          role="tooltip"
          style={{ position: "fixed", top: coords.top, left: coords.left, transform: "translateY(-50%)" }}
          className="pointer-events-none z-[9999] whitespace-nowrap rounded-lg border border-border-subtle bg-surface-elevated px-3 py-1.5 text-sm text-foreground shadow-lg"
        >
          {label}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/**
 * A single nav button.
 *
 * - `mode="mobile"`: always shows icon + label (drawer), no tooltip.
 * - `mode="expanded"`: desktop rail, expanded — icon + label inline, active
 *   background is a rounded rectangle (rounded-xl, matching collapsed), no
 *   tooltip.
 * - `mode="collapsed"`: desktop rail, collapsed — icon only, active
 *   background is a rounded square, shows a portal-rendered tooltip beside
 *   it (never over it, never clipped) on hover/focus.
 */
function NavButton({
  item,
  isActive,
  onClick,
  mode,
  layoutId,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  mode: "collapsed" | "expanded" | "mobile";
  layoutId: string;
}) {
  const Icon = item.icon;
  const showLabel = mode !== "collapsed";
  const [hovered, setHovered] = React.useState(false);
  const buttonRef = React.useRef<HTMLElement>(null);

  const sharedClassName = cn(
    "relative flex h-11 items-center gap-3 overflow-hidden rounded-xl transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60",
    showLabel ? "w-full px-3.5" : "w-11 justify-center"
  );

  const content = (
    <>
      {isActive && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-xl"
          style={{ background: activeBg }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      )}
      <Icon className={cn("relative h-5 w-5 shrink-0", isActive ? "text-white" : "text-muted-dim")} />
      <AnimatePresence initial={false}>
        {showLabel && (
          <motion.span
            key="label"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn("relative truncate text-sm font-medium", isActive ? "text-white" : "text-muted")}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );

  const sharedProps = {
    "aria-label": item.label,
    "aria-current": isActive ? ("page" as const) : undefined,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
    className: sharedClassName,
  };

  return (
    <div className="w-full">
      {item.href ? (
        <Link
          href={item.href}
          ref={buttonRef as React.Ref<HTMLAnchorElement>}
          onClick={onClick}
          {...sharedProps}
        >
          {content}
        </Link>
      ) : (
        <button
          ref={buttonRef as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          {...sharedProps}
        >
          {content}
        </button>
      )}

      {mode === "collapsed" && (
        <CollapsedTooltip label={item.label} anchorRef={buttonRef} visible={hovered} />
      )}
    </div>
  );
}

/**
 * Floating expand/collapse toggle. Deliberately lives OUTSIDE the sidebar's
 * own DOM subtree (a sibling, not a child) and is itself `position: fixed`,
 * with its `left` animated in lockstep with the sidebar's `width` — so it
 * always straddles the sidebar/content seam, matching the Linear/Notion/Arc
 * "floating collapse handle" pattern. (It can't be `absolute` against a
 * wrapper here: the sidebar is `fixed` and therefore contributes no size to
 * a normal-flow parent, so that wrapper would collapse to zero width.)
 */
function SidebarToggle({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <motion.button
      type="button"
      aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      aria-expanded={expanded}
      onClick={onToggle}
      initial={false}
      animate={{ left: (expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH) - 16 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-16 z-40 hidden h-8 w-8 items-center justify-center rounded-lg border border-border-subtle bg-surface-elevated text-muted-dim shadow-lg shadow-black/40 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60 md:flex"
    >
      <motion.span
        className="flex items-center justify-center"
        animate={{ rotate: expanded ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <ChevronToggleIcon className="h-4 w-4" />
      </motion.span>
    </motion.button>
  );
}

export interface SidebarProps {
  expanded: boolean;
  onToggleExpanded: (value: boolean) => void;
  className?: string;
  onNavigate?: (id: string) => void;
}

/**
 * Desktop/tablet vertical rail. Fixed to the viewport (`position: fixed`,
 * full `100vh` height) so it never scrolls with the page — only the main
 * content area scrolls. Hidden below the `md` breakpoint in favor of
 * `MobileTopBar`. Collapses to icon-only by default; the floating
 * `SidebarToggle` sibling (see above) expands it to show labels too,
 * animated with Framer Motion and remembered in localStorage.
 */
export function Sidebar({ expanded, onToggleExpanded, className, onNavigate }: SidebarProps) {
  const { isActive, handleSelect } = useActiveNavId();
  const logout = useLogout();
  const mode: "collapsed" | "expanded" = expanded ? "expanded" : "collapsed";

  function select(item: NavItem) {
    handleSelect(item);
    onNavigate?.(item.id);
  }

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden h-screen w-[88px] shrink-0 flex-col border-r border-border-subtle bg-surface py-7 md:flex",
          className
        )}
      >
        <div
          className={cn(
            "flex items-center px-3.5",
            expanded ? "justify-start" : "justify-center"
          )}
        >
          <span className="text-base font-bold tracking-tight text-foreground">Logo</span>
        </div>

        <nav aria-label="Primary" className="mt-8 flex flex-col items-center gap-3 px-3.5">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              mode={mode}
              layoutId="sidebar-active-bg"
              isActive={isActive(item)}
              onClick={() => select(item)}
            />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 px-3.5">
          <NavButton
            item={SETTINGS_ITEM}
            mode={mode}
            layoutId="sidebar-active-bg"
            isActive={isActive(SETTINGS_ITEM)}
            onClick={() => select(SETTINGS_ITEM)}
          />
          <NavButton
            item={LOGOUT_ITEM}
            mode={mode}
            layoutId="sidebar-active-bg"
            isActive={false}
            onClick={logout}
          />
        </div>
      </motion.aside>

      <SidebarToggle expanded={expanded} onToggle={() => onToggleExpanded(!expanded)} />
    </>
  );
}

export interface MobileTopBarProps {
  user: UserProfile;
  onNavigate?: (id: string) => void;
}

/**
 * Fixed top navigation shown below the `md` breakpoint, replacing the
 * desktop sidebar entirely. Hosts the hamburger menu (which opens a
 * slide-in drawer with the same nav items as the desktop rail), plus the
 * "Ask AI" button and avatar relocated here from the page header.
 */
export function MobileTopBar({ user, onNavigate }: MobileTopBarProps) {
  const [open, setOpen] = React.useState(false);
  const allItems = React.useMemo(() => [...NAV_ITEMS, SETTINGS_ITEM], []);
  const { isActive, handleSelect } = useActiveNavId();
  const logout = useLogout();

  return (
    <div className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border-subtle bg-surface px-4 md:hidden">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60"
        >
          <HamburgerIcon open={open} />
        </button>
        <span className="text-base font-bold tracking-tight text-foreground">Logo</span>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/chat" className={buttonVariants({ variant: "outline", size: "sm" })} aria-label="Ask AI">
          <SparkleIcon className="h-4 w-4" />
          Ask AI
        </Link>
        <Avatar initials={user.initials} name={user.name} />
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.nav
              aria-label="Primary"
              variants={{
                hidden: {
                  x: "-100%",
                  transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                },
                visible: {
                  x: 0,
                  transition: { type: "spring", bounce: 0.15, duration: 0.4 },
                },
              }}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-2 border-r border-border-subtle bg-surface p-4"
            >
              {allItems.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  mode="mobile"
                  layoutId="sidebar-active-bg-mobile"
                  isActive={isActive(item)}
                  onClick={() => {
                    handleSelect(item);
                    onNavigate?.(item.id);
                    setOpen(false);
                  }}
                />
              ))}
              <NavButton
                item={LOGOUT_ITEM}
                mode="mobile"
                layoutId="sidebar-active-bg-mobile"
                isActive={false}
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
              />
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Simple animated hamburger <-> close glyph (kept local; not a Lucide icon). */
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
      <motion.path
        d="M3 5H17"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        animate={open ? { d: "M4 4L16 16" } : { d: "M3 5H17" }}
        transition={{ duration: 0.2 }}
      />
      <motion.path
        d="M3 10H17"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.path
        d="M3 15H17"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        animate={open ? { d: "M4 16L16 4" } : { d: "M3 15H17" }}
        transition={{ duration: 0.2 }}
      />
    </svg>
  );
}
