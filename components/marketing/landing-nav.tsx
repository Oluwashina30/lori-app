"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/layout/logo";
import { buttonVariants } from "@/components/ui/button";

export function LandingNav() {
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
          <a href="#features" className="text-[14px] font-medium text-muted transition-colors duration-200 hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="text-[14px] font-medium text-muted transition-colors duration-200 hover:text-foreground">
            How it works
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Login
          </Link>
          <Link href="/signup" className={buttonVariants({ variant: "gradient", size: "sm" })}>
            Get started free
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
