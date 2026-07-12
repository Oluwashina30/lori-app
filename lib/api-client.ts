/**
 * Thin fetch wrapper around this app's own /api routes (Next.js Route
 * Handlers under app/api/*). Same-origin, so no CORS config needed. Auth
 * is a Supabase session cookie (see middleware.ts + lib/server/auth.ts) —
 * same-origin fetch sends it automatically, no header wiring needed here.
 */

import type { AnalyticsData, AnalyticsRange, GoalDetail, InsightRecord, UserSettings } from "./types";

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${path} failed: ${res.status} ${body}`);
  }

  return res.json();
}

export interface ChatApiResponse {
  reply: string;
  action:
    | "create_goal"
    | "add_contribution"
    | "log_expense"
    | "request_insight"
    | "chit_chat";
  data?: unknown;
  needsClarification: boolean;
}

export function sendChatMessage(message: string): Promise<ChatApiResponse> {
  return apiFetch<ChatApiResponse>("/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

// Raw shape matches DashboardData from lib/types.ts — the backend's
// dashboardService.ts is written to return exactly this shape.
export function fetchDashboardDataFromApi<T>(): Promise<T> {
  return apiFetch<T>("/dashboard");
}

/** Full AI insight history for the current user, newest first. */
export function fetchInsightHistory(): Promise<{ insights: InsightRecord[] }> {
  return apiFetch<{ insights: InsightRecord[] }>("/insights");
}

/** Asks Lori a free-form question and returns the newly generated insight. */
export function askInsight(query: string): Promise<InsightRecord> {
  return apiFetch<InsightRecord>("/insights", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export function dismissInsight(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/insights/${id}/dismiss`, { method: "POST" });
}

export function fetchUserSettings(): Promise<UserSettings> {
  return apiFetch<UserSettings>("/settings");
}

export function updateUserSettings(
  data: Partial<Pick<UserSettings, "name" | "currency" | "riskTolerance" | "monthlyIncome">>
): Promise<UserSettings> {
  return apiFetch<UserSettings>("/settings", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteAccount(): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("/settings/delete-account", { method: "POST" });
}

/** Every goal for the current user, regardless of status. */
export function fetchGoals(): Promise<GoalDetail[]> {
  return apiFetch<GoalDetail[]>("/goals");
}

export function createGoalApi(data: {
  name: string;
  targetAmount: number;
  category?: string;
  deadline?: string | null;
}): Promise<GoalDetail> {
  return apiFetch<GoalDetail>("/goals", { method: "POST", body: JSON.stringify(data) });
}

export function updateGoalApi(
  id: string,
  data: Partial<{ name: string; targetAmount: number; category: string; deadline: string | null }>
): Promise<GoalDetail> {
  return apiFetch<GoalDetail>(`/goals/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function setGoalStatusApi(id: string, status: GoalDetail["status"]): Promise<GoalDetail> {
  return apiFetch<GoalDetail>(`/goals/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
}

export function deleteGoalApi(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/goals/${id}`, { method: "DELETE" });
}

export function contributeToGoalApi(id: string, amount: number): Promise<GoalDetail> {
  return apiFetch<GoalDetail>(`/goals/${id}/contribute`, { method: "POST", body: JSON.stringify({ amount }) });
}

export function fetchAnalytics(range: AnalyticsRange): Promise<AnalyticsData> {
  return apiFetch<AnalyticsData>(`/analytics?range=${range}`);
}
