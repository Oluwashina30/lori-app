"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles, ShieldCheck } from "lucide-react";
import { LandingNav } from "@/components/marketing/landing-nav";
import { LandingFooter } from "@/components/marketing/landing-footer";
import { SectionHeader } from "@/components/marketing/section-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

const VALUES = [
  {
    icon: Heart,
    title: "Money, without the anxiety",
    description:
      "Personal finance apps are usually built to sell you something. Lori is built to help you understand your own money — nothing more.",
  },
  {
    icon: Sparkles,
    title: "As easy as texting a friend",
    description:
      "You shouldn't need a spreadsheet to save consistently. Tell Lori what happened today, in your own words, and it takes care of the rest.",
  },
  {
    icon: ShieldCheck,
    title: "Your data stays yours",
    description:
      "No selling your spending habits to advertisers. Lori exists to serve you, not a data broker.",
  },
];

export function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNav />

      <main className="flex-1">
        <section className="px-4 pb-16 pt-16 sm:px-10 sm:pb-20 sm:pt-24">
          <div className="mx-auto flex w-full max-w-[820px] flex-col items-center text-center">
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[36px] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-[52px]"
            >
              We built Lori so saving money feels like a conversation, not a chore.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted sm:text-[17px]"
            >
              Most budgeting tools ask you to change how you think about money. Lori meets you where you
              already are — texting, talking, thinking out loud — and turns that into real progress toward
              what you're saving for.
            </motion.p>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto w-full max-w-[1240px]">
            <SectionHeader
              heading="Why we're building this"
              paragraph="Lori started from a simple frustration: every savings app on the market wants you to become an accountant. We wanted something that just listens."
            />

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3"
            >
              {VALUES.map((value) => (
                <Card key={value.title} className="flex flex-col gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-elevated">
                    <value.icon className="h-5 w-5 text-muted" />
                  </span>
                  <div>
                    <p className="text-[15px] font-medium text-foreground">{value.title}</p>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted">{value.description}</p>
                  </div>
                </Card>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-10 sm:py-20">
          <div className="mx-auto w-full max-w-[820px]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="flex flex-col gap-6 p-8 sm:flex-row sm:items-start sm:p-10">
                <Avatar
                  initials="OO"
                  name="Oluwashina Oyeleye"
                  className="h-16 w-16 shrink-0 text-[20px]"
                />
                <div>
                  <p className="text-[13px] font-medium uppercase tracking-wide text-muted">Founder</p>
                  <p className="mt-1 text-[20px] font-semibold text-foreground">Oluwashina Oyeleye</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted">
                    I started Lori because I kept abandoning every budgeting app I tried — they all wanted
                    me to categorize, reconcile, and review. What I actually wanted was to just say what
                    happened and have it handled. Lori is that idea, built out.
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
