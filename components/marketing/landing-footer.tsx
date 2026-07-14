"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/layout/logo";

export function LandingFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="border-t border-border-subtle px-4 py-10 sm:px-10"
    >
      <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center justify-between gap-6 sm:flex-row">
        <Link href="#top" className="flex items-center gap-2" aria-label="Lori home">
          <Logo className="h-6 w-auto" />
          <span className="text-[15px] font-medium text-foreground">Lori</span>
        </Link>
        <div className="flex items-center gap-6 text-[13px] text-muted">
          <a href="#how-it-works" className="transition-colors duration-200 hover:text-foreground">
            How it works
          </a>
          <a href="#features" className="transition-colors duration-200 hover:text-foreground">
            Features
          </a>
          <Link href="/terms" className="transition-colors duration-200 hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors duration-200 hover:text-foreground">
            Privacy Policy
          </Link>
        </div>
        <p className="text-[13px] text-muted-dim">© {new Date().getFullYear()} Lori.</p>
      </div>
    </motion.footer>
  );
}
