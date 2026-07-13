import { LandingNav } from "@/components/marketing/landing-nav";
import { HeroSection } from "@/components/marketing/hero-section";
import { SavingsCategoriesSection } from "@/components/marketing/savings-categories-section";
import { ConversationSection } from "@/components/marketing/conversation-section";
import { GoalsProgressSection } from "@/components/marketing/goals-progress-section";
import { InsightSection } from "@/components/marketing/insight-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { FinalCtaSection } from "@/components/marketing/final-cta-section";
import { LandingFooter } from "@/components/marketing/landing-footer";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <SavingsCategoriesSection />
        <ConversationSection />
        <GoalsProgressSection />
        <InsightSection />
        <FeaturesSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
