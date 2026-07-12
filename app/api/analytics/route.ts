import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/server/auth";
import { getAnalyticsData, type AnalyticsRange } from "@/lib/server/services/analyticsService";

const VALID_RANGES: AnalyticsRange[] = ["7", "30", "90", "all"];

export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const rangeParam = req.nextUrl.searchParams.get("range") ?? "30";
  const range = (VALID_RANGES as string[]).includes(rangeParam) ? (rangeParam as AnalyticsRange) : "30";

  const data = await getAnalyticsData(userId, range);
  return NextResponse.json(data);
}
