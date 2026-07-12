import { NextResponse } from "next/server";
import { getUserId } from "@/lib/server/auth";
import { completeOnboarding } from "@/lib/server/services/onboardingService";

export async function POST() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const plan = await completeOnboarding(userId);
    return NextResponse.json(plan);
  } catch (err) {
    console.error("onboarding complete error:", err);
    return NextResponse.json({ error: "Something went wrong finalizing your plan." }, { status: 500 });
  }
}
