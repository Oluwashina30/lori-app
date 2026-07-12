import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/server/auth";
import { submitAnswer } from "@/lib/server/services/onboardingService";

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = await req.json();
  if (!payload?.kind) {
    return NextResponse.json({ error: "Missing 'kind' in request body" }, { status: 400 });
  }

  try {
    const state = await submitAnswer(userId, payload);
    return NextResponse.json(state);
  } catch (err) {
    console.error("onboarding submit error:", err);
    return NextResponse.json({ error: "Something went wrong processing that." }, { status: 500 });
  }
}
