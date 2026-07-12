import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/server/auth";
import * as goalService from "@/lib/server/services/goalService";
import type { GoalDetail } from "@/lib/types";

const STATUSES = new Set(["ACTIVE", "COMPLETED", "PAUSED", "ABANDONED"]);

function serialize(goal: Awaited<ReturnType<typeof goalService.updateGoal>>): GoalDetail {
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    if (body.status !== undefined) {
      if (typeof body.status !== "string" || !STATUSES.has(body.status)) {
        return NextResponse.json({ error: "status must be one of ACTIVE, COMPLETED, PAUSED, ABANDONED" }, { status: 400 });
      }
      const goal = await goalService.setGoalStatus(userId, id, body.status);
      return NextResponse.json(serialize(goal));
    }

    if (body.targetAmount !== undefined && (typeof body.targetAmount !== "number" || body.targetAmount <= 0)) {
      return NextResponse.json({ error: "targetAmount must be a positive number" }, { status: 400 });
    }
    if (body.name !== undefined && (typeof body.name !== "string" || !body.name.trim())) {
      return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 });
    }

    const goal = await goalService.updateGoal(userId, id, {
      name: body.name?.trim(),
      targetAmount: body.targetAmount,
      category: body.category,
      deadline: body.deadline,
    });
    return NextResponse.json(serialize(goal));
  } catch (err) {
    console.error("update goal error:", err);
    const status = err instanceof Error && err.message === "Goal not found" ? 404 : 500;
    return NextResponse.json({ error: "Something went wrong updating that goal." }, { status });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await goalService.deleteGoal(userId, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("delete goal error:", err);
    const status = err instanceof Error && err.message === "Goal not found" ? 404 : 500;
    return NextResponse.json({ error: "Something went wrong deleting that goal." }, { status });
  }
}
