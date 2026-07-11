/**
 * Domain types for the Flexi Finance dashboard.
 *
 * These interfaces intentionally mirror a realistic backend contract so the
 * mock data layer (lib/mock-data.ts) can later be swapped for real API /
 * Supabase queries without touching any UI component.
 */

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
}

/** Status of an individual savings goal / plan line item. */
export type GoalStatus = "in-progress" | "complete" | "not-started";

/** Supported icon keys for savings plan rows. Mapped to lucide icons in the UI layer. */
export type SavingsPlanIcon = "car" | "home" | "plane" | "heart-pulse";

export interface SavingsPlanItem {
  id: string;
  label: string;
  icon: SavingsPlanIcon;
  currentAmount: number;
  targetAmount: number;
  status: GoalStatus;
}

export interface CashFlowSummary {
  savings: number;
  expenses: number;
  /** Pre-computed savings ratio, 0-100. */
  percentage: number;
}

export type ActivityType = "income" | "expense";
export type ActivityIcon = "youtube" | "spotify" | "salary";

export interface ActivityItem {
  id: string;
  name: string;
  date: string;
  amount: number;
  type: ActivityType;
  icon: ActivityIcon;
}

export interface AIInsight {
  title: string;
  message: string;
}

export interface ChatSuggestion {
  id: string;
  label: string;
}

/** A single content block within an assistant chat reply — e.g. a
 *  transaction confirmation followed by a proactive insight/question. */
export interface AssistantBlock {
  kind: "confirmation" | "insight";
  text: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  timestamp: string;
  /** Present for user messages (plain text). */
  text?: string;
  /** Present for assistant messages (one or more structured blocks). */
  blocks?: AssistantBlock[];
}

export interface SavingsSummary {
  total: number;
  changeAmount: number;
  changePercentage: number;
  goalCurrent: number;
  goalTarget: number;
  goalPercentComplete: number;
  goalLabel: string;
  insightMessage: string;
}

export interface RecommendationBanner {
  message: string;
}

export interface DashboardData {
  user: UserProfile;
  greetingSubtitle: string;
  recommendation: RecommendationBanner;
  chatSuggestions: ChatSuggestion[];
  savingsSummary: SavingsSummary;
  savingsPlan: SavingsPlanItem[];
  cashFlow: CashFlowSummary;
  activities: ActivityItem[];
  aiInsight: AIInsight;
}

/** Currency used across all monetary formatting. Centralised so it can be made a user preference later. */
export const DEFAULT_CURRENCY = "USD";
