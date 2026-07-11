import { NextResponse } from "next/server";
import { getUserId } from "@/lib/server/auth";
import { getDashboardData } from "@/lib/server/services/dashboardService";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const data = await getDashboardData(userId);
  return NextResponse.json(data);
}
