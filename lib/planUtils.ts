import type { Plan, PlanFeature } from "@/app/context/AccountSettingsContext";

const PERIOD_LABEL: Record<string, string> = {
  DAILY: "day",
  WEEKLY: "week",
  MONTHLY: "month",
};

/** The plan's features in API order — each card shows the first `count`. */
export function pickTopFeatures(plan: Plan, count = 5): PlanFeature[] {
  return plan.features.slice(0, count);
}

/** "Roses" + limit 5 weekly -> "Roses · 5/week". */
export function featureLabel(f: PlanFeature): string {
  const period = PERIOD_LABEL[f.resetPeriod];
  return f.limit && period ? `${f.title} · ${f.limit}/${period}` : f.title;
}

/** "VIP_ELITE" -> "VIP Elite", "PREMIUM" -> "Premium". */
export function formatPlanName(name: string): string {
  if (name.toUpperCase() === "VIP") return "VIP";
  return name
    .split("_")
    .map((w) =>
      w.toUpperCase() === "VIP" ? "VIP" : w.charAt(0) + w.slice(1).toLowerCase()
    )
    .join(" ");
}

/** 6999 -> "₹6,999". */
export const formatPrice = (n: number) => `₹${n.toLocaleString("en-IN")}`;