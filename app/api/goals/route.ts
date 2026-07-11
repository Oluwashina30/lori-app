import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/server/auth";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const goals = await prisma.goal.findMany({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(goals);
}
