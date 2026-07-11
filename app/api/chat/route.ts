import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/server/auth";
import { parseIntent } from "@/lib/server/ai/intentParser";
import { executeIntent } from "@/lib/server/services/actionExecutor";
import * as goalService from "@/lib/server/services/goalService";
import * as transactionService from "@/lib/server/services/transactionService";

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const goals = await goalService.getUserActiveGoals(userId);
    const spend = await transactionService.getRecentSpend(userId, 7);

    const history = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    await prisma.chatMessage.create({ data: { userId, role: "user", content: message } });

    // This is the actual AI call — Claude runs server-side here, inside the
    // route handler. ANTHROPIC_API_KEY lives only in Vercel's server
    // environment and is never sent to the browser.
    const intent = await parseIntent(
      message,
      {
        currency: user.currency,
        activeGoals: goals.map((g) => ({
          name: g.name,
          currentAmount: Number(g.currentAmount),
          targetAmount: Number(g.targetAmount),
        })),
        recentSpendSummary: transactionService.summarizeSpend(spend, user.currency),
      },
      history.reverse().map((h) => ({ role: h.role as "user" | "assistant", content: h.content }))
    );

    const result = await executeIntent(userId, intent, message);

    await prisma.chatMessage.create({
      data: {
        userId,
        role: "assistant",
        content: result.reply,
        parsedAction: { tool: intent.tool, input: intent.input },
      },
    });

    return NextResponse.json({
      reply: result.reply,
      action: result.action,
      data: result.data,
      needsClarification: result.needsClarification ?? false,
    });
  } catch (err) {
    console.error("chat handling error:", err);
    return NextResponse.json({ error: "Something went wrong processing that message." }, { status: 500 });
  }
}
