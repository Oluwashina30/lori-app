import type { ComponentType } from "react";
import { GraduationCap, Heart, Briefcase, Plus } from "lucide-react";
import { CarIcon, HouseIcon, PlaneIcon, HeartPulseIcon } from "@/components/icons";
import type { GoalCategory, SavingsPlanIcon } from "@/lib/types";

export interface GoalCategoryMeta {
  category: GoalCategory;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** Matches dashboardService.ts's GOAL_ICON_MAP output, for SavingsPlanCard/GoalCard parity. */
  planIcon: SavingsPlanIcon;
}

/**
 * Single source of truth for the 8 onboarding goal categories — label,
 * picker icon, and dashboard-card icon key all in one place, so the
 * onboarding goal-capture screen and the Goals page's create/edit form
 * render category options identically instead of maintaining two lists
 * that could drift apart.
 */
export const GOAL_CATEGORIES: GoalCategoryMeta[] = [
  { category: "home", label: "Buy a Home", icon: HouseIcon, planIcon: "home" },
  { category: "car", label: "Buy a Car", icon: CarIcon, planIcon: "car" },
  { category: "travel", label: "Travel", icon: PlaneIcon, planIcon: "plane" },
  { category: "education", label: "Education", icon: GraduationCap, planIcon: "graduation-cap" },
  { category: "wedding", label: "Wedding", icon: Heart, planIcon: "heart" },
  { category: "business", label: "Start/Grow a Business", icon: Briefcase, planIcon: "briefcase" },
  { category: "emergency_fund", label: "Emergency", icon: HeartPulseIcon, planIcon: "heart-pulse" },
  { category: "other", label: "Something Else", icon: Plus, planIcon: "sparkles" },
];

// Goal.category is free text written by two different sources: onboarding's
// capture_goal tool (the 8 values above) and chat's create_goal tool
// (housing/vehicle/gadget/event — see actionExecutor.ts). Both land in the
// same column, so resolve the chat vocabulary to its closest onboarding
// category here rather than showing a generic fallback icon for every
// chat-created goal.
const ALIASES: Record<string, GoalCategory> = {
  vehicle: "car",
  housing: "home",
  gadget: "other",
  event: "other",
};

export function goalCategoryMeta(category: string | null | undefined): GoalCategoryMeta {
  const resolved = category ? (ALIASES[category] ?? category) : category;
  return GOAL_CATEGORIES.find((c) => c.category === resolved) ?? GOAL_CATEGORIES[GOAL_CATEGORIES.length - 1];
}
