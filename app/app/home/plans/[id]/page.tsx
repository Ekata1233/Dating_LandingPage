"use client";

import {
    useAccountSettings,
    usePlanDetail,
    type PremiumFeature,
    type PremiumPlan,
    type PremiumPrice,
} from "@/app/context/AccountSettingsContext";
import { useParams, useRouter } from "next/navigation";
import React from "react";

import Screen from "@/app/app/shell/Screen";

/* -------------------------------------------------------------------------- */
/*  MembershipPlanDetails                                                     */
/*                                                                            */
/*  Renders one membership plan straight from the context types:              */
/*    GET /api/package/get/:id  →  usePlanDetail(id)  →  PremiumPlan          */
/*    GET /api/package/get/cards →  useAccountSettings().plans → Plan[] (tabs)*/
/*                                                                            */
/*  No intermediate view-model type: prices are `PremiumPrice`, limits are    */
/*  `PremiumFeature`. Small helpers below derive the three things the UI      */
/*  needs (duration cards, weekly stats, grouped features).                   */
/*                                                                            */
/*  Colors follow `plan.slug` ("premium" | "vip" | "vip-elite"); an unknown   */
/*  slug falls back to premium pink.                                          */
/*                                                                            */
/*  Every size is in `cqw` (1% of the parent's width), so it scales with the  */
/*  parent. Usage — app/plans/[id]/page.tsx:                                  */
/*    <div style={{ width: "100%", height: "100vh" }}>                        */
/*      <MembershipPlanDetails fluid onContinue={startCheckout} />            */
/*    </div>                                                                  */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */

/** What the CTA hands back: the API plan and the API price the user picked. */
export interface PlanSelection {
    plan: PremiumPlan;
    price: PremiumPrice;
}

export interface MembershipPlanDetailsProps {
    title?: string;
    showHeader?: boolean;

    /** Optional override for the retry link. Defaults to the hook's refetch. */
    onRetry?: () => void;

    currencySymbol?: string;
    /** Disables the CTA and swaps its label while a checkout is starting */
    submitting?: boolean;

    onBack?: () => void;
    showBack?: boolean;
    /** Builds the URL a plan tab navigates to. Default: relative `<id>` (sibling route). */
    getPlanHref?: (planId: string) => string;
    onPriceChange?: (plan: PremiumPlan, price: PremiumPrice) => void;

    /** Fill the parent edge to edge instead of rendering the 300px desktop frame. */
    fluid?: boolean;

    className?: string;
    style?: React.CSSProperties;
}

/* --------------------------------- helpers --------------------------------- */
/** 1 unit = 1% of the parent's width */
const U = (n: number) => `${n}cqw`;
const HAIR = "max(1px, 0.3cqw)";
/** Horizontal frame padding, in units */
const PAD = 4.3;

const BASE = {
    ink: "#1f1f24",
    grey: "#8a817c",
    greyLight: "#a9a39d",
    border: "#ececec",
    white: "#ffffff",
};

export type PlanSlug = "premium" | "vip" | "vip-elite";

/** "VIP Elite", "vip_elite", "vip-elite" and "elite" all land on "vip-elite". */
export function normalizePlanSlug(slug?: string | null): PlanSlug {
    const s = (slug ?? "").toLowerCase().trim().replace(/[\s_]+/g, "-");
    if (s === "vip-elite" || s === "elite" || s === "vipelite") return "vip-elite";
    if (s === "vip") return "vip";
    return "premium";
}

interface PlanTheme {
    gradient: string;
    accent: string;
    accentText: string;
    check: string;
    soft: string;
    softBorder: string;
    heroPrice: string;
    heroPillBorder: string;
    heroPillColor: string;
    ctaText: string;
    shadow: string;
}

const THEMES: Record<PlanSlug, PlanTheme> = {
    premium: {
        gradient: "linear-gradient(120deg, #d93663 0%, #ec4b6c 100%)",
        accent: "#e0355f",
        accentText: "#d6336a",
        check: "#e0355f",
        soft: "#fde4ea",
        softBorder: "#fbd9e1",
        heroPrice: "#ffffff",
        heroPillBorder: "rgba(255,255,255,.55)",
        heroPillColor: "#ffffff",
        ctaText: "#ffffff",
        shadow: "rgba(226,58,106,.32)",
    },
    vip: {
        gradient: "linear-gradient(135deg, #e3b04b 0%, #b17b1c 100%)",
        accent: "#b8801f",
        accentText: "#a8741a",
        check: "#b8801f",
        soft: "#fbf1da",
        softBorder: "#f6e6c3",
        heroPrice: "#ffffff",
        heroPillBorder: "rgba(255,255,255,.55)",
        heroPillColor: "#ffffff",
        ctaText: "#ffffff",
        shadow: "rgba(177,123,28,.32)",
    },
    "vip-elite": {
        gradient: "linear-gradient(135deg, #202020 0%, #0c0c0c 100%)",
        accent: "#1c1c1c",
        accentText: "#8a6a1f",
        check: "#8a6a1f",
        soft: "#f4efe2",
        softBorder: "#ece3cb",
        heroPrice: "#e6c36a",
        heroPillBorder: "rgba(230,195,106,.55)",
        heroPillColor: "#e6c36a",
        ctaText: "#e6c36a",
        shadow: "rgba(0,0,0,.35)",
    },
};

const FONT =
    "'DM Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const SERIF = "'Playfair Display', 'Georgia', 'Times New Roman', serif";

const svgBase: React.CSSProperties = { width: "1em", height: "1em", display: "block", flexShrink: 0 };
const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

const BackIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke} strokeWidth={2.4}>
        <path d="M15 5l-7 7 7 7" />
    </svg>
);
const ArrowIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke} strokeWidth={2.4}>
        <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
);
const CheckIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke} strokeWidth={3}>
        <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
);

/* --------------------- display meta (icons / titles) --------------------- */

const BADGE_ICONS: Record<PlanSlug, string> = {
    premium: "🔥",
    vip: "👑",
    "vip-elite": "💠",
};

/** Order, title and icon for each API `feature.category`. */
const CATEGORY_META: Record<string, { title: string; icon: string }> = {
    STATUS_BADGES: { title: "Status & badges", icon: "🏅" },
    MATCH_DISCOVERY: { title: "Match discovery", icon: "🔍" },
    TRUST: { title: "Trust & verification", icon: "🛡️" },
    PRIVACY: { title: "Privacy & safety", icon: "🔒" },
    CHAT: { title: "Chat & connect", icon: "💬" },
    REAL_LIFE_EVENTS: { title: "Real-life events", icon: "🎉" },
    PERKS: { title: "Perks & rewards", icon: "🎁" },
    PREMIUM_EXPERIENCES: { title: "Premium experiences", icon: "✨" },
    GLOBAL_EXPERIENCES: { title: "Global experiences", icon: "✈️" },
    NETWORKING_GROWTH: { title: "Networking & growth", icon: "🌱" },
};
const CATEGORY_ORDER = Object.keys(CATEGORY_META);

/** Icons for the "Included every week" cards, keyed by `feature.code`. */
const STAT_ICONS: Record<string, string> = {
    ROSES: "🌹",
    WEEKLY_COMPLIMENTS: "💌",
    WEEKLY_BOOSTS: "🚀",
    WEEKLY_DATE_PLANS: "🗓️",
    WELCOME_COINS: "🪙",
    REWINDS: "↩️"

};

const titleCase = (s: string) =>
    s.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/* ------------------- derivations from the API types -------------------- */

const monthsLabel = (m: number) => `${m} MONTH${m === 1 ? "" : "S"}`;
const termLabel = (m: number) => `/ ${m} month${m === 1 ? "" : "s"}`;
const perMonthOf = (p: PremiumPrice) => Math.round(p.price / p.months);

/** Active prices, shortest term first. */
const getPrices = (plan: PremiumPlan): PremiumPrice[] =>
    (plan.prices ?? []).filter((p) => p.active).sort((a, b) => a.months - b.months);

/** Limits switched on for this plan. */
const getEnabled = (plan: PremiumPlan): PremiumFeature[] =>
    (plan.limits ?? []).filter((l) => l.enabled);

/** "Included every week": enabled limits that reset weekly. */
const getWeekly = (plan: PremiumPlan): PremiumFeature[] =>
    getEnabled(plan).filter((l) => (l.enabled === true && l.limit !== null));

/** Value shown on a stat card: ∞ for unlimited, otherwise the limit. */
const statValue = (l: PremiumFeature) =>
    l.unlimited || l.limit == null ? "∞" : l.limit.toString().toLowerCase();
const resetPeriod = (l: PremiumFeature) => {
    if (l.resetPeriod === "WEEKLY") return "week"
    if (l.resetPeriod === "NONE" && l.limit === 1) return "one time"
    if (l.resetPeriod === "DAILY") return "day"
}
/** "Weekly Boosts" → "Boosts" (the section heading already says "every week"). */
const statLabel = (l: PremiumFeature) => l.feature.title.replace(/^weekly\s+/i, "");

/** Everything that is not weekly, grouped by category in display order. */
const getGroups = (plan: PremiumPlan) => {
    const byCategory = new Map<string, PremiumFeature[]>();
    getEnabled(plan)
        .filter((l) => l.resetPeriod !== "WEEKLY")
        .forEach((l) => {
            const list = byCategory.get(l.feature.category) ?? [];
            list.push(l);
            byCategory.set(l.feature.category, list);
        });

    const rank = (c: string) => {
        const i = CATEGORY_ORDER.indexOf(c);
        return i === -1 ? 99 : i;
    };

    return [...byCategory.entries()]
        .sort(([a], [b]) => rank(a) - rank(b))
        .map(([category, features]) => ({
            category,
            icon: CATEGORY_META[category]?.icon ?? "✨",
            title: CATEGORY_META[category]?.title ?? titleCase(category),
            features,
        }));
};

/** Feature description, plus "(3 per day)" for daily-capped limits. */
const featureDescription = (l: PremiumFeature) => {
    const note =
        !l.unlimited && l.limit != null && l.resetPeriod === "DAILY"
            ? `${l.limit} per day`
            : "";
    if (l.feature.description && note) return `${l.feature.description} (${note})`;
    return l.feature.description || note || undefined;
};

/* -------------------------------- component -------------------------------- */
export function MembershipPlanDetails({
    title = "Choose your plan",
    showHeader = true,
    onRetry,
    currencySymbol = "₹",
    submitting = false,
    onBack,
    showBack = true,
    getPlanHref = (planId) => planId,
    onPriceChange,
    fluid = false,
    className,
    style,
}: MembershipPlanDetailsProps) {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const { plan, loading, error, refetch } = usePlanDetail(id);
    const { plans } = useAccountSettings();

    /* Colors follow plan.slug. While loading there is no slug yet, so the first
       paint uses the premium pink. */
    const THEME = THEMES[normalizePlanSlug(plan?.slug)];

    const prices = React.useMemo(() => (plan ? getPrices(plan) : []), [plan]);
    const weekly = React.useMemo(() => (plan ? getWeekly(plan) : []), [plan]);
    const groups = React.useMemo(() => (plan ? getGroups(plan) : []), [plan]);

    const [priceId, setPriceId] = React.useState<string | undefined>(undefined);
    const selected: PremiumPrice | undefined =
        prices.find((p) => p.id === priceId) ??
        prices.find((p) => p.isHighlighted) ??
        prices[0];
    const pricesRef = React.useRef<HTMLDivElement>(null);

    /* Selected price: the user's pick if it belongs to this plan, otherwise the
       highlighted one, otherwise the first. Switching plan tabs therefore never
       leaves a stale selection behind. */

    const money = (n: number) => `${currencySymbol}${n}`;

    const selectPrice = (p: PremiumPrice) => {
        if (!plan) return;
        setPriceId(p.id);
        onPriceChange?.(plan, p);
    };

    const selectPlan = (planId: string) => {
        if (planId === plan?.id) return;
        router.push(getPlanHref(planId));
    };
    function onContinue(selectedPlan: PlanSelection) {
        router.push(`${window.location.pathname}/checkout/${priceId}`);
    }
    /* Keep the selected price card fully visible in its horizontal row —
       the default one can sit off-screen to the right. */
    React.useEffect(() => {
        if (prices.length === 0) return;
        if (prices.some((p) => p.id === priceId)) return;

        const initial = prices.find((p) => p.isHighlighted) ?? prices[0];
        setPriceId(initial.id);
    }, [prices, priceId]);
    React.useEffect(() => {
        const row = pricesRef.current;
        const el = row?.querySelector<HTMLElement>('[aria-checked="true"]');
        if (!row || !el) return;
        const pad = row.clientWidth * (PAD / 100);
        const left = el.offsetLeft;
        const right = left + el.offsetWidth;
        if (left < row.scrollLeft) {
            row.scrollTo({ left: Math.max(0, left - pad), behavior: "smooth" });
        } else if (right > row.scrollLeft + row.clientWidth) {
            row.scrollTo({ left: right - row.clientWidth + pad, behavior: "smooth" });
        }
    }, [plan?.id, selected?.id]);

    const handleBack = () => (onBack ? onBack() : router.push("/app/home"));

    const ctaDisabled = !plan || !selected || submitting;

    return (
        <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden ">
                <div
                    className={
                        fluid
                            ? "absolute inset-0 overflow-hidden"
                            : "  mt-2 w-[320px] sm:w-[300px] h-[480px] sm:h-[520px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out "
                    }
                >
                    <div
                        className={`plan-root ${className ?? ""}`}
                        style={{
                            width: "100%",
                            height: "100%",
                            containerType: "inline-size",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            background: BASE.white,
                            fontFamily: FONT,
                            color: BASE.ink,
                            ...style,
                        }}
                    >
                        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        .plan-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease, background .2s ease, border-color .2s ease, color .2s ease; }
        .plan-btn:hover:not(:disabled) { filter: brightness(1.04); }
        .plan-btn:active:not(:disabled) { transform: scale(.985); }
        .plan-btn:disabled { cursor: not-allowed; opacity: .7; }
        .plan-btn:focus-visible { outline: 2px solid ${THEME.accent}; outline-offset: 2px; }
        .plan-hide-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .plan-hide-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>

                        {/* ============================ FIXED TOP ============================ */}
                        {showHeader && (
                            <div style={{ flex: "0 0 auto", padding: `${U(4)} ${U(PAD)} ${U(3)}`, background: BASE.white }}>
                                <header
                                    style={{
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minHeight: U(10),
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="plan-btn"
                                        aria-label="Go back"
                                        onClick={handleBack}
                                        style={{
                                            position: "absolute",
                                            left: 0,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            width: U(10),
                                            height: U(10),
                                            borderRadius: "50%",
                                            background: BASE.white,
                                            border: `${HAIR} solid ${BASE.border}`,
                                            boxShadow: `0 ${U(0.5)} ${U(2)} rgba(0,0,0,.06)`,
                                            color: BASE.ink,
                                            fontSize: U(4),
                                            display: showBack ? "flex" : "none",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: 0,
                                        }}
                                    >
                                        <BackIcon />
                                    </button>
                                    <h1 style={{ margin: 0, fontSize: U(4.7), fontWeight: 600, letterSpacing: "0.01em" }}>
                                        {title}
                                    </h1>
                                </header>

                                {/* Plan tabs — one per plan from GET /package/get/cards */}
                                {plans.length > 1 && (
                                    <div
                                        role="tablist"
                                        aria-label="Membership plans"
                                        style={{
                                            display: "flex",
                                            gap: U(1),
                                            marginTop: U(3),
                                            padding: U(1.2),
                                            background: "#efedeb",
                                            borderRadius: U(5.2),
                                        }}
                                    >
                                        {plans.map((p) => {
                                            const active = p.id === plan?.id;
                                            const theme = THEMES[normalizePlanSlug(p.slug)];

                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={active}
                                                    className="plan-btn"
                                                    onClick={() => selectPlan(p.id)}
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                        height: U(11.6),
                                                        borderRadius: U(4.2),
                                                        background: active ? theme.gradient : "transparent",
                                                        color: active ? theme.heroPrice : "#7c7773",
                                                        border: `1px solid ${active ? theme.accent : "transparent"}`,
                                                        fontSize: U(3.7),
                                                        fontWeight: 600,
                                                        boxShadow: active
                                                            ? `0 ${U(1)} ${U(2.6)} ${theme.shadow}`
                                                            : "none",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        padding: `0 ${U(2)}`,
                                                        transition: "all 0.25s ease",
                                                    }}
                                                >
                                                    {p.name.replaceAll("_", " ")}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ============================ SCROLLING ============================ */}
                        <div
                            className="plan-hide-scroll"
                            style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
                        >
                            {loading && !plan ? (
                                <p style={{ margin: `${U(20)} 0`, textAlign: "center", fontSize: U(3.5), color: BASE.grey }}>
                                    Loading plan…
                                </p>
                            ) : error && !plan ? (
                                <div style={{ margin: `${U(20)} ${U(PAD)}`, textAlign: "center" }}>
                                    <p role="alert" style={{ margin: 0, fontSize: U(3.5), color: "#d9352f", fontWeight: 600 }}>
                                        {error}
                                    </p>
                                    <button
                                        type="button"
                                        className="plan-btn"
                                        onClick={() => (onRetry ? onRetry() : void refetch())}
                                        style={{
                                            marginTop: U(3),
                                            background: "transparent",
                                            color: THEME.accentText,
                                            fontSize: U(3.5),
                                            fontWeight: 600,
                                            textDecoration: "underline",
                                        }}
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : !plan ? (
                                <p style={{ margin: `${U(20)} 0`, textAlign: "center", fontSize: U(3.5), color: BASE.grey }}>
                                    This plan isn&rsquo;t available right now.
                                </p>
                            ) : (
                                <div style={{ padding: `${U(1)} ${U(PAD)} ${U(8)}`, boxSizing: "border-box" }}>
                                    {/* ------------------------------ hero ------------------------------ */}
                                    <section
                                        style={{
                                            padding: `${U(5)} ${U(5)} ${U(5)}`,
                                            borderRadius: U(6),
                                            background: THEME.gradient,
                                            color: BASE.white,
                                            boxShadow: `0 ${U(2.4)} ${U(5.4)} ${THEME.shadow}`,
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: U(2) }}>
                                            <span
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: U(1.6),
                                                    padding: `${U(1.9)} ${U(3.6)}`,
                                                    borderRadius: U(6),
                                                    border: `${U(0.3)} solid ${THEME.heroPillBorder}`,
                                                    background: "rgba(255,255,255,.1)",
                                                    color: THEME.heroPillColor,
                                                    fontSize: U(3.1),
                                                    fontWeight: 600,
                                                    letterSpacing: "0.04em",
                                                    textTransform: "uppercase",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <span>{BADGE_ICONS[normalizePlanSlug(plan.slug)]}</span>
                                                {plan.badgeLabel || plan.name.replaceAll("_", " ")}
                                            </span>
                                        </div>

                                        <h2
                                            style={{
                                                margin: `${U(5)} 0 0`,
                                                fontFamily: SERIF,
                                                fontSize: U(8.4),
                                                fontWeight: 700,
                                                lineHeight: 1.1,
                                                letterSpacing: "0.01em",
                                            }}
                                        >
                                            {plan.name.replaceAll("_", " ")}
                                        </h2>

                                        <p style={{ margin: `${U(2.4)} 0 0`, fontSize: U(3.5), lineHeight: 1.45, opacity: 0.92 }}>
                                            {plan.tagline}
                                        </p>

                                        {selected && (
                                            <div style={{ display: "flex", alignItems: "baseline", gap: U(2.4), marginTop: U(4.6) }}>
                                                <span
                                                    style={{
                                                        fontFamily: SERIF,
                                                        fontSize: U(8.4),
                                                        fontWeight: 700,
                                                        lineHeight: 1,
                                                        color: THEME.heroPrice,
                                                    }}
                                                >
                                                    {money(selected.price)}
                                                </span>
                                                <span style={{ fontSize: U(3.8), opacity: 0.8 }}>
                                                    {termLabel(selected.months)}
                                                </span>
                                            </div>
                                        )}

                                        {selected && selected.discountPercent > 0 && (
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: U(3), marginTop: U(3.8) }}>
                                                <span
                                                    style={{
                                                        padding: `${U(1.3)} ${U(3.4)}`,
                                                        borderRadius: U(3),
                                                        background: "rgba(255,255,255,.22)",
                                                        fontSize: U(2.9),
                                                        fontWeight: 700,
                                                        letterSpacing: "0.05em",
                                                    }}
                                                >
                                                    SAVE {selected.discountPercent}%
                                                </span>
                                            </div>
                                        )}
                                    </section>

                                    {/* ---------------------------- prices ---------------------------- */}
                                    {prices.length > 0 && (
                                        <div
                                            ref={pricesRef}
                                            role="radiogroup"
                                            aria-label="Plan duration"
                                            className="plan-hide-scroll"
                                            style={{
                                                position: "relative",
                                                display: "flex",
                                                gap: U(3.3),
                                                marginTop: U(3.6),
                                                marginLeft: U(-PAD),
                                                marginRight: U(-PAD),
                                                padding: `${U(3.6)} ${U(PAD)} ${U(1.6)}`,
                                                overflowX: "auto",
                                                scrollSnapType: "x proximity",
                                            }}
                                        >
                                            {prices.map((p) => {
                                                const isSelected = p.id === selected?.id;
                                                return (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={isSelected}
                                                        className="plan-btn"
                                                        onClick={() => selectPrice(p)}
                                                        style={{
                                                            position: "relative",
                                                            flex: `0 0 ${U(46.7)}`,
                                                            boxSizing: "border-box",
                                                            textAlign: "left",
                                                            padding: `${U(5)} ${U(5)} ${U(4.6)}`,
                                                            borderRadius: U(5),
                                                            background: BASE.white,
                                                            border: `${U(isSelected ? 0.7 : 0.45)} solid ${isSelected ? THEME.accent : "#e8e2d8"}`,
                                                            scrollSnapAlign: "start",
                                                            color: BASE.ink,
                                                        }}
                                                    >
                                                        {p.discountPercent > 0 && (
                                                            <span
                                                                style={{
                                                                    position: "absolute",
                                                                    top: U(-3.2),
                                                                    left: "50%",
                                                                    transform: "translateX(-50%)",
                                                                    padding: `${U(1.2)} ${U(3.4)}`,
                                                                    borderRadius: U(4),
                                                                    background: THEME.accent,
                                                                    color: BASE.white,
                                                                    fontSize: U(2.9),
                                                                    fontWeight: 700,
                                                                    letterSpacing: "0.05em",
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                SAVE {p.discountPercent}%
                                                            </span>
                                                        )}

                                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                            <span
                                                                style={{
                                                                    fontSize: U(3.3),
                                                                    fontWeight: 700,
                                                                    letterSpacing: "0.06em",
                                                                    color: isSelected ? BASE.ink : BASE.grey,
                                                                }}
                                                            >
                                                                {monthsLabel(p.months)}
                                                            </span>
                                                            <span
                                                                aria-hidden
                                                                style={{
                                                                    width: U(7.4),
                                                                    height: U(7.4),
                                                                    borderRadius: "50%",
                                                                    boxSizing: "border-box",
                                                                    border: isSelected ? "none" : `${U(0.6)} solid #d9d3c8`,
                                                                    background: isSelected ? THEME.accent : "transparent",
                                                                    color: BASE.white,
                                                                    fontSize: U(3.8),
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                {isSelected && <CheckIcon />}
                                                            </span>
                                                        </div>

                                                        <div
                                                            style={{
                                                                marginTop: U(3.4),
                                                                fontFamily: SERIF,
                                                                fontSize: U(9),
                                                                fontWeight: 700,
                                                                lineHeight: 1.05,
                                                            }}
                                                        >
                                                            {money(p.price)}
                                                        </div>
                                                        <div style={{ marginTop: U(1.4), fontSize: U(3.3), color: BASE.grey }}>
                                                            {money(perMonthOf(p))}/mo
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                            <span aria-hidden style={{ flex: `0 0 ${U(1.2)}` }} />
                                        </div>
                                    )}

                                    {/* ------------------------------ stats ------------------------------ */}
                                    {weekly.length > 0 && (
                                        <>
                                            <h3
                                                style={{
                                                    margin: `${U(5.4)} 0 ${U(3.4)}`,
                                                    fontSize: U(3.1),
                                                    fontWeight: 700,
                                                    letterSpacing: "0.12em",
                                                    color: BASE.ink,
                                                }}
                                            >
                                                INCLUDED EVERY WEEK
                                            </h3>
                                            <div
                                                className="plan-hide-scroll"
                                                style={{
                                                    display: "flex",
                                                    gap: U(3.3),
                                                    marginLeft: U(-PAD),
                                                    marginRight: U(-PAD),
                                                    padding: `${U(1)} ${U(PAD)} ${U(2)}`,
                                                    overflowX: "auto",
                                                }}
                                            >
                                                {weekly.map((l) => (
                                                    <div
                                                        key={l.id}
                                                        style={{
                                                            flex: `0 0 ${U(21.3)}`,
                                                            minHeight: U(25.2),
                                                            boxSizing: "border-box",
                                                            padding: `${U(3.4)} ${U(1.6)}`,
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            gap: U(1.6),
                                                            textAlign: "center",
                                                            borderRadius: U(4.4),
                                                            background: BASE.white,
                                                            border: `${HAIR} solid ${THEME.softBorder}`,
                                                            boxShadow: `0 ${U(0.6)} ${U(2.4)} rgba(0,0,0,.04)`,
                                                        }}
                                                    >
                                                        <span style={{ fontSize: U(5), lineHeight: 1 }}>
                                                            {STAT_ICONS[l.feature.code] ?? "✨"}
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontFamily: SERIF,
                                                                fontSize: U(4.2),
                                                                fontWeight: 700,
                                                                lineHeight: 1,
                                                                color: THEME.accentText,
                                                            }}
                                                        >
                                                            {statValue(l)}
                                                        </span>
                                                        <span style={{ fontSize: U(2.7), lineHeight: 1.3, color: BASE.grey }}>
                                                            {statLabel(l)} / {resetPeriod(l)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* ------------------------ feature groups ------------------------ */}
                                    {groups.length > 0 && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: U(4.6), marginTop: U(4) }}>
                                            {groups.map((g) => (
                                                <section
                                                    key={g.category}
                                                    style={{
                                                        padding: `${U(5.4)} ${U(5.6)} ${U(5)}`,
                                                        borderRadius: U(5.2),
                                                        background: BASE.white,
                                                        border: `${U(0.4)} solid ${THEME.softBorder}`,
                                                        boxShadow: `0 ${U(0.8)} ${U(3)} rgba(0,0,0,.04)`,
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", gap: U(4) }}>
                                                        <span
                                                            aria-hidden
                                                            style={{
                                                                width: U(9),
                                                                height: U(9),
                                                                borderRadius: U(2.6),
                                                                background: THEME.soft,
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontSize: U(4.6),
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {g.icon}
                                                        </span>
                                                        <h4
                                                            style={{
                                                                margin: 0,
                                                                fontSize: U(3),
                                                                fontWeight: 700,
                                                                letterSpacing: "0.14em",
                                                                textTransform: "uppercase",
                                                                color: THEME.accentText,
                                                            }}
                                                        >
                                                            {g.title}
                                                        </h4>
                                                    </div>

                                                    <ul
                                                        style={{
                                                            listStyle: "none",
                                                            margin: `${U(4.2)} 0 0`,
                                                            padding: 0,
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            gap: U(3),
                                                        }}
                                                    >
                                                        {g.features.map((l) => {
                                                            const description = featureDescription(l);
                                                            return (
                                                                <li key={l.id} style={{ display: "flex", alignItems: "flex-start", gap: U(3.6) }}>
                                                                    <span
                                                                        aria-hidden
                                                                        style={{
                                                                            width: U(5.6),
                                                                            height: U(5.6),
                                                                            marginTop: U(0.4),
                                                                            borderRadius: "50%",
                                                                            background: THEME.soft,
                                                                            color: THEME.check,
                                                                            fontSize: U(2.8),
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            flexShrink: 0,
                                                                        }}
                                                                    >
                                                                        <CheckIcon />
                                                                    </span>
                                                                    <div style={{ minWidth: 0 }}>
                                                                        <div style={{ fontSize: U(3.7), fontWeight: 700, lineHeight: 1.3 }}>
                                                                            {l.feature.title}
                                                                        </div>
                                                                        {description && (
                                                                            <div style={{ marginTop: U(0.6), fontSize: U(3.1), lineHeight: 1.45, color: BASE.grey }}>
                                                                                {description}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </section>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* =========================== FIXED BOTTOM =========================== */}
                        {plan && (
                            <div
                                style={{
                                    flex: "0 0 auto",
                                    padding: `${U(3)} ${U(PAD)} ${U(3.6)}`,
                                    background: BASE.white,
                                    boxShadow: `0 ${U(-3)} ${U(4)} rgba(255,255,255,.95)`,
                                    textAlign: "center",
                                }}
                            >
                                <button
                                    type="button"
                                    className="plan-btn"
                                    disabled={ctaDisabled}
                                    onClick={() => selected && onContinue({ plan, price: selected })}
                                    style={{
                                        width: "100%",
                                        height: U(16),
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: U(2.6),
                                        borderRadius: U(5),
                                        background: THEME.gradient,
                                        color: THEME.ctaText,
                                        fontSize: U(4.4),
                                        fontWeight: 600,
                                        boxShadow: `0 ${U(1.6)} ${U(4)} ${THEME.shadow}`,
                                    }}
                                >
                                    {submitting ? (
                                        "Please wait…"
                                    ) : (
                                        <>
                                            Continue{selected ? ` with ${money(selected.price)}` : ""}
                                            <span style={{ fontSize: U(4.4), display: "flex" }}>
                                                <ArrowIcon />
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

/* The route. Desktop keeps the framed 300px card; mobile renders the same
   component edge to edge so its header, back button and CTA fill the screen. */
export default function Page() {
    return (
        <Screen
            desktop={<MembershipPlanDetails />}
            mobile={<MembershipPlanDetails fluid />}
        />
    );
}
