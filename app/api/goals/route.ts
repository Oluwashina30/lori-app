import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/server/auth";
import * as goalService from "@/lib/server/services/goalService";
import type { GoalDetail } from "@/lib/types";

function serialize(goal: Awaited<ReturnType<typeof goalService.getUserGoals>>[number]): GoalDetail {
  return {
    id: goal.id,
    name: goal.name,
    category: goal.category,
    targetAmount: Number(goal.targetAmount),
    currentAmount: Number(goal.currentAmount),
    deadline: goal.deadline ? goal.deadline.toISOString() : null,
    status: goal.status,
    recommendedContribution: goal.recommendedContribution ? Number(goal.recommendedContribution) : null,
    createdByAI: goal.createdByAI,
    createdAt: goal.createdAt.toISOString(),
  };
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const goals = await goalService.getUserGoals(userId);
  return NextResponse.json(goals.map(serialize));
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (typeof body.targetAmount !== "number" || body.targetAmount <= 0) {
    return NextResponse.json({ error: "targetAmount must be a positive number" }, { status: 400 });
  }

  try {
    const goal = await goalService.createGoal(userId, {
      name: body.name.trim(),
      targetAmount: body.targetAmount,
      deadline: body.deadline ?? undefined,
      category: body.category ?? undefined,
    });
    return NextResponse.json(serialize(goal));
  } catch (err) {
    console.error("create goal error:", err);
    return NextResponse.json({ error: "Something went wrong creating that goal." }, { status: 500 });
  }
}
