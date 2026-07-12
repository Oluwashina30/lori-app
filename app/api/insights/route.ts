import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/server/auth";
import * as insightService from "@/lib/server/services/insightService";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const insights = await insightService.listInsights(userId);
  return NextResponse.json({ insights });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  try {
    const insight = await insightService.generateInsight(userId, query);
    return NextResponse.json(insight);
  } catch (err) {
    console.error("insight generation error:", err);
    return NextResponse.json({ error: "Something went wrong generating that insight." }, { status: 500 });
  }
}
