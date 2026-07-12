import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/server/auth";
import * as goalService from "@/lib/server/services/goalService";
import type { GoalDetail } from "@/lib/types";

function serialize(goal: Awaited<ReturnType<typeof goalService.contributeToGoal>>): GoalDetail {
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

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const { amount } = await req.json();
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "amount must be a positive number" }, { status: 400 });
  }

  try {
    const goal = await goalService.contributeToGoal(userId, id, amount);
    return NextResponse.json(serialize(goal));
  } catch (err) {
    console.error("contribute to goal error:", err);
    const status = err instanceof Error && err.message === "Goal not found" ? 404 : 500;
    return NextResponse.json({ error: "Something went wrong recording that contribution." }, { status });
  }
}
