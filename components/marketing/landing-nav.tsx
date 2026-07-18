"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { id: "features", href: "#features", label: "Features" },
  { id: "how-it-works", href: "#how-it-works", label: "How it works" },
];

/** Tracks which nav-linked section is currently most visible, for the sliding active-link indicator. */
function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/** Simple animated hamburger <-> close glyph, matching the dashboard's mobile top bar. */
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

export function LandingNav() {
  const active = useActiveSection(React.useMemo(() => NAV_LINKS.map((l) => l.id), []));
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 border-b border-border-subtle bg-background/70 backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-4 py-4 sm:px-10">
        <Link href="#top" className="flex items-center gap-2.5" aria-label="Lori home">
          <Logo className="h-7 w-auto" />
          <span className="text-[19px] font-semibold tracking-tight text-foreground">Lori</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={cn(
                "group relative py-1 text-[14px] font-medium transition-colors duration-200 hover:text-foreground",
                active === link.id ? "text-foreground" : "text-muted"
              )}
            >
              {link.label}
              <span className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-foreground transition-transform duration-300 ease-out group-hover:scale-x-100" />
              {active === link.id && (
                <motion.span
                  layoutId="nav-active-indicator"
                  className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-px bg-[linear-gradient(90deg,var(--accent-from),var(--accent-to))]"
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Login
          </Link>
          <Link href="/signup" className={buttonVariants({ variant: "gradient", size: "sm" })}>
            Get started free
          </Link>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60 md:hidden"
        >
          <HamburgerIcon open={mobileOpen} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border-subtle md:hidden"
          >
            <nav aria-label="Primary mobile" className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors duration-200 hover:bg-white/5",
                    active === link.id ? "text-foreground" : "text-muted"
                  )}
                >
                  {link.label}
                </a>
              ))}

              <div className="mt-3 flex flex-col gap-2.5 px-3">
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className={buttonVariants({ variant: "gradient", size: "default", className: "w-full" })}
                >
                  Get started free
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={buttonVariants({ variant: "outline", size: "default", className: "w-full" })}
                >
                  Login
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
