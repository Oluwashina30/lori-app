import type { DashboardData } from "./types";
import { fetchDashboardDataFromApi } from "./api-client";

/**
 * Fetches dashboard data from the real backend. Shape is guaranteed to
 * match DashboardData because src/services/dashboardService.ts on the
 * backend is written to return this exact structure — no mapping needed
 * here. If that ever drifts, adapt the response in this one function.
 */
export async function fetchDashboardData(): Promise<DashboardData> {
  return fetchDashboardDataFromApi<DashboardData>();
}

/**
 * Static fixture retained for local UI work without a running backend
 * (Storybook, quick visual tweaks, etc). Not used by any page by default.
 */
export const mockDashboardData: DashboardData = {
  user: {
    id: "user_1",
    name: "Oluwashina",
    initials: "OS",
  },
  currency: "NGN",
  greetingSubtitle: "Your finances are looking healthy this month",
  recommendation: {
    message:
      "You could reach your savings goal 12 days earlier by reducing food expenses by \u20a62,000/week.",
  },
  chatSuggestions: [
    { id: "s1", label: "I got paid today" },
    { id: "s2", label: "Help me save faster" },
    { id: "s3", label: "Create a new goal" },
    { id: "s4", label: "Can I afford a vacation?" },
  ],
  savingsSummary: {
    total: 20000,
    changeAmount: 2230,
    changePercentage: 13.3,
    goalCurrent: 8000,
    goalTarget: 12000,
    goalPercentComplete: 20,
    goalLabel: "Monthly savings goal",
    insightMessage: "Based on your current pace, you'll reach your Car Goal 18 days early.",
  },
  savingsPlan: [
    { id: "car", label: "Car", icon: "car", currentAmount: 2000, targetAmount: 12000, status: "in-progress" },
    { id: "rent", label: "Rent", icon: "home", currentAmount: 3000, targetAmount: 3000, status: "complete" },
    { id: "travel", label: "Travel", icon: "plane", currentAmount: 2000, targetAmount: 12000, status: "in-progress" },
    { id: "emergency", label: "Emergency", icon: "heart-pulse", currentAmount: 0, targetAmount: 5000, status: "not-started" },
  ],
  cashFlow: {
    savings: 220000,
    expenses: 220000,
    percentage: 25,
  },
  activities: [
    { id: "a1", name: "Youtube", date: "1 Dec", amount: 20, type: "expense", icon: "youtube" },
    { id: "a2", name: "Spotify", date: "1 Dec", amount: 10, type: "expense", icon: "spotify" },
    { id: "a3", name: "June Salary", date: "1 Dec", amount: 2000, type: "income", icon: "salary" },
  ],
  aiInsight: {
    title: "Insight",
    message:
      "You're ahead of schedule. Increasing your weekly savings by \u20a62,000 would let you reach your goal 18 days earlier.",
  },
};
