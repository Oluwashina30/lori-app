import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/server/auth";
import * as userService from "@/lib/server/services/userService";
import type { UserSettings } from "@/lib/types";

function serialize(user: Awaited<ReturnType<typeof userService.getUserSettings>>): UserSettings {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    currency: user.currency,
    riskTolerance: (user.riskTolerance as UserSettings["riskTolerance"]) ?? "moderate",
    monthlyIncome: user.monthlyIncome ? Number(user.monthlyIncome) : null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await userService.getUserSettings(userId);
  return NextResponse.json(serialize(user));
}

const RISK_TOLERANCES = new Set(["conservative", "moderate", "aggressive"]);

export async function PATCH(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const data: Parameters<typeof userService.updateUserSettings>[1] = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 });
    }
    data.name = body.name.trim();
  }

  if (body.currency !== undefined) {
    if (typeof body.currency !== "string" || !/^[A-Z]{3}$/.test(body.currency)) {
      return NextResponse.json({ error: "currency must be a 3-letter ISO code" }, { status: 400 });
    }
    data.currency = body.currency;
  }

  if (body.riskTolerance !== undefined) {
    if (typeof body.riskTolerance !== "string" || !RISK_TOLERANCES.has(body.riskTolerance)) {
      return NextResponse.json({ error: "riskTolerance must be conservative, moderate, or aggressive" }, { status: 400 });
    }
    data.riskTolerance = body.riskTolerance;
  }

  if (body.monthlyIncome !== undefined) {
    if (body.monthlyIncome !== null && (typeof body.monthlyIncome !== "number" || body.monthlyIncome < 0)) {
      return NextResponse.json({ error: "monthlyIncome must be a non-negative number or null" }, { status: 400 });
    }
    data.monthlyIncome = body.monthlyIncome;
  }

  try {
    const user = await userService.updateUserSettings(userId, data);
    return NextResponse.json(serialize(user));
  } catch (err) {
    console.error("settings update error:", err);
    return NextResponse.json({ error: "Something went wrong saving your settings." }, { status: 500 });
  }
}
