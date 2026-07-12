import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { captureGoal } from "@/lib/server/ai/onboardingParser";
import * as goalService from "@/lib/server/services/goalService";
import type {
  OnboardingAnswers,
  OnboardingGoalDraft,
  OnboardingPlan,
  OnboardingState,
  OnboardingStep,
} from "@/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Midpoint estimate per bracket, in the user's currency — used only to size
// a realistic weekly contribution and a confidence score, never shown back
// to the user as a fabricated precise number.
const INCOME_BRACKET_MIDPOINT: Record<string, number> = {
  less_than_500: 375,
  "500_2000": 1250,
  "2000_5000": 3500,
  "5000_10000": 7500,
  more_than_10000: 12500,
};

const DEFAULT_PLANNING_WEEKS = 12; // used when a goal has no deadline (e.g. emergency fund)

function toState(session: { step: string; goalDraft: unknown; answers: unknown }): OnboardingState {
  return {
    step: session.step as OnboardingStep,
    goalDraft: (session.goalDraft as OnboardingGoalDraft) ?? {},
    answers: (session.answers as OnboardingAnswers) ?? {},
  };
}

/**
 * Which screen comes next given what's been collected so far. This is the
 * actual adaptive-branching logic — a field already present (from AI
 * extraction or a prior answer) is never re-asked.
 */
function determineNextStep(goalDraft: OnboardingGoalDraft, answers: OnboardingAnswers): OnboardingStep {
  if (!goalDraft.category) return "goal_capture";

  if (goalDraft.category === "emergency_fund") {
    if (answers.emergencyMonthlyExpenses === undefined) return "emergency_fund";
  } else {
    if (goalDraft.targetAmount === undefined) return "follow_up_amount";
    if (goalDraft.deadline === undefined) return "follow_up_timeline";
  }

  if (answers.incomeBracket === undefined) return "income";

  return "ready_to_complete";
}

export async function getOrCreateSession(userId: string): Promise<OnboardingState> {
  const session = await prisma.onboardingSession.upsert({
    where: { userId },
    update: {},
    create: { userId, step: "goal_capture" },
  });
  return toState(session);
}

type SubmitPayload =
  | { kind: "message"; message: string }
  | { kind: "card"; category: string }
  | { kind: "amount"; value: number }
  | { kind: "timeline"; value: string }
  | { kind: "emergency_fund"; monthlyExpenses: number; currentSavings: number; bufferMonths: number }
  | { kind: "income"; bracket: string | "skip" };

export async function submitAnswer(userId: string, payload: SubmitPayload): Promise<OnboardingState> {
  const existing = await prisma.onboardingSession.upsert({
    where: { userId },
    update: {},
    create: { userId, step: "goal_capture" },
  });
  const goalDraft: OnboardingGoalDraft = (existing.goalDraft as OnboardingGoalDraft) ?? {};
  const answers: OnboardingAnswers = (existing.answers as OnboardingAnswers) ?? {};

  let nextGoalDraft = goalDraft;
  let nextAnswers = answers;

  switch (payload.kind) {
    case "message": {
      const captured = await captureGoal(payload.message, goalDraft.category);
      nextGoalDraft = { ...goalDraft, ...captured };
      break;
    }
    case "card": {
      const captured = await captureGoal("", payload.category);
      nextGoalDraft = { ...goalDraft, ...captured };
      break;
    }
    case "amount":
      nextGoalDraft = { ...goalDraft, targetAmount: payload.value };
      break;
    case "timeline":
      nextGoalDraft = { ...goalDraft, deadline: payload.value };
      break;
    case "emergency_fund": {
      const targetAmount = payload.monthlyExpenses * payload.bufferMonths;
      nextGoalDraft = { ...goalDraft, targetAmount };
      nextAnswers = {
        ...answers,
        emergencyMonthlyExpenses: payload.monthlyExpenses,
        emergencyCurrentSavings: payload.currentSavings,
        emergencyBufferMonths: payload.bufferMonths,
      };
      break;
    }
    case "income":
      nextAnswers = { ...answers, incomeBracket: payload.bracket };
      break;
  }

  const nextStep = determineNextStep(nextGoalDraft, nextAnswers);

  const updated = await prisma.onboardingSession.update({
    where: { userId },
    data: { step: nextStep, goalDraft: nextGoalDraft as object, answers: nextAnswers as object },
  });

  return toState(updated);
}

function computeConfidence(recommendedContribution: number, incomeBracket: string | undefined) {
  if (!incomeBracket || incomeBracket === "skip") {
    return { score: 0.5, label: "Medium" as const };
  }
  const monthlyIncome = INCOME_BRACKET_MIDPOINT[incomeBracket];
  if (!monthlyIncome) return { score: 0.5, label: "Medium" as const };

  const weeklyIncome = monthlyIncome / 4.33;
  const ratio = recommendedContribution / weeklyIncome;

  if (ratio <= 0.15) return { score: 0.9, label: "High" as const };
  if (ratio <= 0.3) return { score: 0.7, label: "High" as const };
  if (ratio <= 0.5) return { score: 0.5, label: "Medium" as const };
  return { score: 0.25, label: "Low" as const };
}

export async function completeOnboarding(userId: string): Promise<OnboardingPlan> {
  const session = await prisma.onboardingSession.findUniqueOrThrow({ where: { userId } });
  const goalDraft = session.goalDraft as OnboardingGoalDraft;
  const answers = (session.answers as OnboardingAnswers) ?? {};

  if (!goalDraft?.name || !goalDraft.category || goalDraft.targetAmount === undefined) {
    throw new Error("Onboarding goal draft is incomplete — cannot finalize yet.");
  }

  const goal = await goalService.createGoal(userId, {
    name: goalDraft.name,
    targetAmount: goalDraft.targetAmount,
    deadline: goalDraft.deadline,
    category: goalDraft.category,
    createdByAI: true,
  });

  const weeksRemaining = goalDraft.deadline
    ? Math.max(1, (new Date(goalDraft.deadline).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))
    : DEFAULT_PLANNING_WEEKS;
  const recommendedContribution = goalDraft.targetAmount / weeksRemaining;
  const { score: confidenceScore, label: confidenceLabel } = computeConfidence(
    recommendedContribution,
    answers.incomeBracket
  );

  await prisma.goal.update({
    where: { id: goal.id },
    data: { recommendedContribution, confidenceScore },
  });

  const narrativePrompt = `A new user just set up this savings goal: "${goalDraft.name}" (${goalDraft.category}), target ${goalDraft.targetAmount}${
    goalDraft.deadline ? `, by ${goalDraft.deadline}` : ""
  }. Recommended weekly contribution: ${recommendedContribution.toFixed(2)}. Affordability confidence: ${confidenceLabel}.

Write exactly one short sentence (max ~20 words) for a plan-reveal screen: if confidence is Low, name the specific realistic challenge (be concrete, not generic); if Medium or High, a brief encouraging affirmation. No preamble, just the sentence.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 100,
    messages: [{ role: "user", content: narrativePrompt }],
  });
  const challengeText =
    (response.content.find((b) => b.type === "text") as Anthropic.TextBlock | undefined)?.text.trim() ??
    "We'll automatically adjust your recommendations whenever your situation changes.";

  await prisma.insight.create({
    data: {
      userId,
      goalId: goal.id,
      type: "SUGGESTION",
      title: "Your personalized savings strategy",
      content: challengeText,
      data: {
        recommendedContribution,
        confidenceScore,
        confidenceLabel,
        targetAmount: goalDraft.targetAmount,
        deadline: goalDraft.deadline ?? null,
      },
    },
  });

  const monthlyIncome =
    answers.incomeBracket && answers.incomeBracket !== "skip" ? INCOME_BRACKET_MIDPOINT[answers.incomeBracket] : undefined;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      onboardingCompletedAt: new Date(),
      incomeBracket: answers.incomeBracket && answers.incomeBracket !== "skip" ? answers.incomeBracket : undefined,
      monthlyIncome,
    },
  });

  const supabase = await createClient();
  await supabase.auth.updateUser({ data: { onboarding_completed: true } });

  await prisma.onboardingSession.update({
    where: { userId },
    data: { completedAt: new Date() },
  });

  return {
    currency: updatedUser.currency,
    goal: {
      name: goalDraft.name,
      category: goalDraft.category,
      targetAmount: goalDraft.targetAmount,
      deadline: goalDraft.deadline ?? null,
      recommendedContribution,
      confidenceScore,
    },
    confidenceLabel,
    challengeText,
  };
}
