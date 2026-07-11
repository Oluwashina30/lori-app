import { ParsedIntent } from "../ai/intentParser";
import * as goalService from "./goalService";
import * as transactionService from "./transactionService";
import { generateInsight } from "./insightService";

export interface ExecutionResult {
  reply: string;
  action: string;
  data?: any;
  needsClarification?: boolean;
}

export async function executeIntent(userId: string, intent: ParsedIntent, rawMessage: string): Promise<ExecutionResult> {
  switch (intent.tool) {
    case "create_goal": {
      const goal = await goalService.createGoal(userId, {
        name: intent.input.name,
        targetAmount: intent.input.targetAmount,
        deadline: intent.input.deadline,
        category: intent.input.category,
      });

      // If the user also mentioned putting money in immediately, record that too
      if (intent.input.initialContribution) {
        await goalService.addToGoal(goal.id, intent.input.initialContribution);
        await transactionService.recordTransaction({
          userId,
          goalId: goal.id,
          type: "CONTRIBUTION",
          amount: intent.input.initialContribution,
          rawInput: rawMessage,
        });
      }

      return { reply: intent.assistantReply, action: "create_goal", data: goal };
    }

    case "add_contribution": {
      const goal = await goalService.findGoalByHint(userId, intent.input.goalNameHint);
      if (!goal) {
        return {
          reply: `I couldn't find a goal matching "${intent.input.goalNameHint}" — which goal should I add ${intent.input.amount} to?`,
          action: "add_contribution",
          needsClarification: true,
        };
      }
      const updated = await goalService.addToGoal(goal.id, intent.input.amount);
      await transactionService.recordTransaction({
        userId,
        goalId: goal.id,
        type: "CONTRIBUTION",
        amount: intent.input.amount,
        rawInput: rawMessage,
      });
      const pct = ((Number(updated.currentAmount) / Number(updated.targetAmount)) * 100).toFixed(0);
      return {
        reply: `Added to "${updated.name}" — now at ${updated.currentAmount}/${updated.targetAmount} (${pct}%).`,
        action: "add_contribution",
        data: updated,
      };
    }

    case "log_expense": {
      const txn = await transactionService.recordTransaction({
        userId,
        type: "EXPENSE",
        amount: intent.input.amount,
        category: intent.input.category,
        description: intent.input.description,
        rawInput: rawMessage,
      });
      return { reply: intent.assistantReply, action: "log_expense", data: txn };
    }

    case "request_insight": {
      const insight = await generateInsight(userId, intent.input.focus, intent.input.goalNameHint);
      return { reply: insight.content, action: "request_insight", data: insight };
    }

    case "chit_chat":
    default:
      return { reply: intent.assistantReply, action: "chit_chat" };
  }
}
