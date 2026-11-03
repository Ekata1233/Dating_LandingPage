export const PLAN_ORDER = ["premium", "vip", "vip-elite"] as const;
//this is to prevent the plan order change as per the data returns from the api
/** "VIP Elite", "vip_elite", "vip-elite" and "elite" all land on "vip-elite". */
const normalize = (slug?: string | null) => {
    const s = (slug ?? "").toLowerCase().trim().replace(/[\s_]+/g, "-");
    if (s === "vip-elite" || s === "elite" || s === "vipelite") return "vip-elite";
    if (s === "vip") return "vip";
    return "premium";
};

const rank = (slug?: string | null) =>
    PLAN_ORDER.indexOf(normalize(slug) as (typeof PLAN_ORDER)[number]);

/** Returns a new array ordered Premium → VIP → VIP Elite, whatever order the API sends. */
export function sortPlansByTier<T extends { slug?: string | null }>(plans: T[]): T[] {
    return [...plans].sort((a, b) => rank(a.slug) - rank(b.slug));
}
