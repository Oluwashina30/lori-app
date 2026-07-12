import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { getUserId } from "@/lib/server/auth";
import { getOrCreateSession } from "@/lib/server/services/onboardingService";
import { prisma } from "@/lib/prisma";

export default async function OnboardingPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const [state, user] = await Promise.all([
    getOrCreateSession(userId),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } }),
  ]);

  return <OnboardingFlow initialState={state} userName={user.name} />;
}
