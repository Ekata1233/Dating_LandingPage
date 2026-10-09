"use client";

import { PremiumPrice, usePlanDetail } from "@/app/context/AccountSettingsContext";
import { useParams } from "next/navigation";
import React, { useState } from "react";

import Screen from "@/app/app/shell/Screen";

/* -------------------------------------------------------------------------- */
/*  MembershipCheckout                                                        */
/*                                                                            */
/*  One independent, fully fluid checkout screen, laid out like the plan      */
/*  page (MembershipPlanDetails) and themed by the SAME `plan.slug`:          */
/*      "premium"                           → pink                            */
/*      "vip"                               → gold                            */
/*      "vip elite" / "vip-elite" / "elite" → black + gold                    */
/*  (case-insensitive; spaces and underscores count as hyphens; an unknown    */
/*  slug falls back to the premium pink).                                     */
/*                                                                            */
/*    fixed top     header (back button, title, subtitle)                     */
/*    scrolls       plan summary card, coupon box, price breakdown, payment   */
/*                  note                                                      */
/*    fixed bottom  Pay button + footnote                                     */
/*                                                                            */
/*  DATA. The screen loads its own plan: the route supplies the ids —         */
/*      app/plans/[id]/checkout/[priceId]/page.tsx                            */
/*  — `usePlanDetail(id)` returns the plan, and the price being bought is     */
/*  the entry of `plan.prices` whose `id` equals the `priceId` segment.       */
/*  Everything on screen is mapped from that one price:                       */
/*      plan.name, plan.slug          → card title, theme, icon               */
/*      price.months                  → "3 months membership", renewal note,  */
/*                                      breakdown label                       */
/*      price.price                   → card price, breakdown row, total, Pay */
/*  A `priceId` that matches nothing (or an inactive price) shows an          */
/*  "unavailable" state instead of silently charging for a different one.     */
/*  With no `priceId` in the route it falls back to the highlighted price.    */
/*                                                                            */
/*  MONEY. The price comes from the API; the GST row is informational only —  */
/*  the price already INCLUDES GST, so it is shown (price − price/1.18) and   */
/*  never added to the total. Anything that changes what is owed — a coupon,  */
/*  a tax rule — has to be priced by your server: pass the resulting `lines`  */
/*  and `total` and they replace the defaults.                                */
/*                                                                            */
/*  It fills 100% width and 100% height of its PARENT. Every size inside      */
/*  (fonts, padding, gaps, radii, icons, buttons) is measured in `cqw`, i.e.  */
/*  1% of the parent's width, so everything scales with the parent.           */
/*                                                                            */
/*  Usage:                                                                    */
/*    <div style={{ width: "100%", height: "100vh" }}>                        */
/*      <MembershipCheckout                                                   */
/*        fluid                                                               */
/*        paymentNote="powered by Google Play Billing"                        */
/*        onPay={({ plan, price }) => startPayment(plan.id, price.id)}        */
/*      />                                                                    */
/*    </div>                                                                  */
/*                                                                            */
/*  Back defaults to history.back() — pass `onBack` to route it. The coupon   */
/*  box only renders when you pass `onApplyCoupon`.                           */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */
export interface CheckoutLine {
    label: string;
    /** A number is formatted as money (negative → "−₹200"); a string is shown as-is. */
    value: number | string;
    /** "discount" renders the value in green. */
    tone?: "default" | "discount";
}

export interface CheckoutCoupon {
    code: string;
    /** e.g. "20% off" or "₹100 off" */
    label: string;
}

/** What `onPay` reports: exactly which plan and which price option are being bought. */
export interface CheckoutSelection {
    plan: NonNullable<ReturnType<typeof usePlanDetail>["plan"]>;
    price: PremiumPrice;
    /** The amount shown on the Pay button (the `total` prop, or the price). */
    amount: number;
}

export interface MembershipCheckoutProps {
    title?: string;
    subtitle?: string;
    showHeader?: boolean;

    currencySymbol?: string;
    /** Override the default "₹1,299" formatter (en-IN grouping). */
    formatPrice?: (n: number) => string;

    /** GST % already included in the price, for the informational row. 0 hides it. */
    gstPercent?: number;
    /** Replaces the default breakdown rows (plan price + GST). Pass server-priced rows. */
    lines?: CheckoutLine[];
    totalLabel?: string;
    /** Amount to pay. Falls back to the selected price. Pass it when a coupon applies. */
    total?: number;

    /** Overrides the derived "Auto-renews every N months …" line. `null` hides it. */
    renewalNote?: string | null;

    /** Tappable coupon suggestions under the input. */
    suggestedCoupons?: CheckoutCoupon[];
    /** Coupon currently applied to the order. */
    appliedCoupon?: CheckoutCoupon | null;
    couponError?: string | null;
    applyingCoupon?: boolean;
    onApplyCoupon?: (code: string) => void;
    onRemoveCoupon?: () => void;

    /** e.g. "powered by Google Play Billing". Hidden when omitted. */
    paymentNote?: string;

    ctaLabel?: string;
    footnote?: string;
    paying?: boolean;

    onBack?: () => void;
    showBack?: boolean;
    onPay?: (selection: CheckoutSelection) => void;

    /**
     * Fill the parent edge to edge instead of rendering the 300px desktop
     * frame. The mobile shell sets this and supplies `onBack`.
     */
    fluid?: boolean;

    className?: string;
    style?: React.CSSProperties;
}

/* --------------------------------- helpers --------------------------------- */
/** 1 unit = 1% of the parent's width */
const U = (n: number) => `${n}cqw`;
const HAIR = "max(1px, 0.3cqw)";
/** Horizontal frame padding, in units */
const PAD = 5.3;

const BASE = {
    ink: "#1f1f24",
    grey: "#8a817c",
    greyLight: "#a9a39d",
    border: "#ececec",
    white: "#ffffff",
    danger: "#d9352f",
    success: "#1f9d55",
};

export type PlanSlug = "premium" | "vip" | "vip-elite";

/** "VIP Elite", "vip_elite", "vip-elite" and "elite" all land on "vip-elite". */
export function normalizePlanSlug(slug?: string | null): PlanSlug {
    const s = (slug ?? "").toLowerCase().trim().replace(/[\s_]+/g, "-");
    if (s === "vip-elite" || s === "elite" || s === "vipelite") return "vip-elite";
    if (s === "vip") return "vip";
    return "premium";
}

/** The API sends no icon, so the tile's emoji is chosen by plan, like the plan page's badges. */
const PLAN_ICON: Record<PlanSlug, string> = {
    premium: "🔥",
    vip: "👑",
    "vip-elite": "💠",
};

interface PlanTheme {
    /** CTA background */
    gradient: string;
    /** Apply button, focus ring, applied-coupon accents */
    accent: string;
    /** Section accents on white */
    accentText: string;
    check: string;
    /** Summary card fill + soft chips */
    soft: string;
    /** Breakdown card + input borders */
    softBorder: string;
    heroPrice: string;
    heroPillBorder: string;
    heroPillColor: string;
    /** CTA label color */
    ctaText: string;
    /** Drop-shadow tint for the summary card + CTA */
    shadow: string;
    /** Dark ink for the price and name on the light summary card */
    priceInk: string;
}

/* Same palette as the plan page, plus `priceInk` for text on the light card. */
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
        priceInk: "#6f1233",
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
        priceInk: "#5e3f08",
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
        priceInk: "#1c1c1c",
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
const CardIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
        <path d="M2.5 10h19M6.5 15h4" />
    </svg>
);
const RenewIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <path d="M20 11a8 8 0 0 0-14.3-4.6L4 8M4 4v4h4" />
        <path d="M4 13a8 8 0 0 0 14.3 4.6L20 16M20 20v-4h-4" />
    </svg>
);
const CloseIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke} strokeWidth={2.6}>
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
);
const CheckIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke} strokeWidth={3}>
        <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
);
const DiamondOutline = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <path d="M12 3l8 9-8 9-8-9 8-9Z" />
    </svg>
);

/** Next can hand back string | string[] for a route segment; take the first. */
const segment = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const monthsText = (m: number) => (m === 1 ? "1 month" : `${m} months`);

/* -------------------------------- component -------------------------------- */
export function MembershipCheckout({
    title = "Checkout",
    subtitle = "Review & pay securely",
    showHeader = true,
    currencySymbol = "₹",
    formatPrice,
    gstPercent = 18,
    lines,
    totalLabel = "Total payable",
    renewalNote,
    suggestedCoupons = [],
    appliedCoupon = null,
    couponError = null,
    applyingCoupon = false,
    onApplyCoupon,
    onRemoveCoupon,
    paymentNote,
    ctaLabel = "Pay",
    footnote = "You won't be charged until you confirm",
    paying = false,
    onBack,
    showBack = true,
    onPay,
    fluid = false,
    className,
    style,
}: MembershipCheckoutProps) {
    const params = useParams<{ id: string; priceId?: string }>();
    const id = segment(params?.id);
    const priceId = segment(params?.priceId);
    const [amountDue,setAmountDue] = useState(0)

    const { plan, loading, error, refetch } = usePlanDetail(id as string);

    /* Colors follow plan.slug. While the plan is still loading there is no slug
       yet, so the first paint uses the premium pink. */
    const slug = normalizePlanSlug(plan?.slug);
    const THEME = THEMES[slug];

    /* The price being bought. Derived — never copied into state — so it is
       correct the moment `plan` arrives and can't go stale. */
    const price: PremiumPrice | undefined = React.useMemo(() => {
        const options = (plan?.prices ?? []).filter((p) => p.active);
        if (priceId) return options.find((p) => p.id === priceId);
        return options.find((p) => p.isHighlighted) ?? options[0];
    }, [plan, priceId]);

    const [code, setCode] = React.useState("");

    const money = React.useCallback(
        (n: number) => {
            const abs = Math.abs(n);
            const body = formatPrice ? formatPrice(abs) : `${currencySymbol}${abs.toLocaleString("en-IN")}`;
            return n < 0 ? `−${body}` : body;
        },
        [currencySymbol, formatPrice],
    );

    const errorMessage = error
        ? typeof error === "string"
            ? error
            : ((error as { message?: string }).message ?? "Something went wrong.")
        : null;

    /* Default breakdown: the plan row and the GST that the price already
       contains. GST is informational (price − price/(1+rate)), not added. */
    const breakdown: CheckoutLine[] = React.useMemo(() => {
        if (lines) return lines;
        if (!plan || !price) return [];
        const rows: CheckoutLine[] = [{ label: `${plan.name} · ${monthsText(price.months)}`, value: price.price }];
        if (gstPercent > 0) {
            const gst = Math.round(price.price - price.price / (1 + gstPercent / 100));
            setAmountDue(price.price+gst)
            rows.push({ label: `GST (${gstPercent}%, incl.)`, value: gst });
        }
        return rows;
    }, [lines, plan, price, gstPercent]);

    const canApply = code.trim().length > 0 && !applyingCoupon;
    const ctaDisabled = !plan || !price || amountDue === undefined || paying;

    const renewal =
        renewalNote === undefined
            ? price
                ? `Auto-renews every ${price.months === 1 ? "month" : `${price.months} months`} · cancel anytime from Settings`
                : null
            : renewalNote;

    const handleBack = () => (onBack ? onBack() : window.history.back());

    const handleApply = () => {
        if (!canApply) return;
        onApplyCoupon?.(code.trim());
    };

    const handlePay = () => {
        if (!plan || !price || amountDue === undefined) return;
        onPay?.({ plan, price, amount: amountDue });
    };

    /* A coupon that was just applied successfully no longer needs to sit in the
       input — clear it once the parent reports it as applied. */
    React.useEffect(() => {
        if (appliedCoupon) setCode("");
    }, [appliedCoupon?.code]);

    const visibleSuggestions = suggestedCoupons.filter((c) => c.code !== appliedCoupon?.code);

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
                        className={`co-root ${className ?? ""}`}
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
        .co-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease, background .2s ease, opacity .2s ease; }
        .co-btn:hover:not(:disabled) { filter: brightness(1.04); }
        .co-btn:active:not(:disabled) { transform: scale(.985); }
        .co-btn:disabled { cursor: not-allowed; opacity: .55; }
        .co-btn:focus-visible, .co-input:focus-visible { outline: 2px solid ${THEME.accent}; outline-offset: 2px; }
        .co-input::placeholder { color: ${BASE.greyLight}; }
        .co-hide-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .co-hide-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>

                        {/* ============================ FIXED TOP ============================ */}
                        {showHeader && (
                            <div style={{ flex: "0 0 auto", padding: `${U(3.6)} ${U(PAD)} ${U(3.4)}`, background: BASE.white }}>
                                <header
                                    style={{
                                        position: "relative",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minHeight: U(11),
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="co-btn"
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
                                    {subtitle && (
                                        <p style={{ margin: `${U(0.8)} 0 0`, fontSize: U(3.2), color: BASE.grey }}>{subtitle}</p>
                                    )}
                                </header>
                            </div>
                        )}

                        {/* ============================ SCROLLING ============================ */}
                        <div
                            className="co-hide-scroll"
                            style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
                        >
                            {loading && !plan ? (
                                <p style={{ margin: `${U(20)} 0`, textAlign: "center", fontSize: U(3.5), color: BASE.grey }}>
                                    Loading checkout…
                                </p>
                            ) : errorMessage && !plan ? (
                                <div style={{ margin: `${U(20)} ${U(PAD)}`, textAlign: "center" }}>
                                    <p role="alert" style={{ margin: 0, fontSize: U(3.5), color: BASE.danger, fontWeight: 600 }}>
                                        {errorMessage}
                                    </p>
                                    {refetch && (
                                        <button
                                            type="button"
                                            className="co-btn"
                                            onClick={() => refetch()}
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
                                    )}
                                </div>
                            ) : !plan ? (
                                <p style={{ margin: `${U(20)} 0`, textAlign: "center", fontSize: U(3.5), color: BASE.grey }}>
                                    Nothing to check out right now.
                                </p>
                            ) : !price ? (
                                <div style={{ margin: `${U(20)} ${U(PAD)}`, textAlign: "center" }}>
                                    <p role="alert" style={{ margin: 0, fontSize: U(3.5), color: BASE.danger, fontWeight: 600 }}>
                                        That price option isn&rsquo;t available any more.
                                    </p>
                                    <button
                                        type="button"
                                        className="co-btn"
                                        onClick={handleBack}
                                        style={{
                                            marginTop: U(3),
                                            background: "transparent",
                                            color: THEME.accentText,
                                            fontSize: U(3.5),
                                            fontWeight: 600,
                                            textDecoration: "underline",
                                        }}
                                    >
                                        Choose another
                                    </button>
                                </div>
                            ) : (
                                <div style={{ padding: `${U(1)} ${U(PAD)} ${U(8)}`, boxSizing: "border-box" }}>
                                    {/* ------------------------- plan summary ------------------------- */}
                                    <section
                                        style={{
                                            padding: `${U(5.2)} ${U(5.2)} ${U(4.6)}`,
                                            borderRadius: U(6),
                                            background: `linear-gradient(135deg, ${THEME.soft} 0%, #ffffff 160%)`,
                                            border: `${U(0.5)} solid ${THEME.accent}8c`,
                                            boxShadow: `0 ${U(2)} ${U(5)} ${THEME.shadow}`,
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: U(4.2) }}>
                                            <span
                                                aria-hidden
                                                style={{
                                                    flex: `0 0 ${U(15.6)}`,
                                                    width: U(15.6),
                                                    height: U(15.6),
                                                    borderRadius: U(4),
                                                    background: BASE.white,
                                                    boxShadow: `0 ${U(0.8)} ${U(2.4)} rgba(0,0,0,.06)`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: U(8),
                                                }}
                                            >
                                                {PLAN_ICON[slug]}
                                            </span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h2
                                                    style={{
                                                        margin: 0,
                                                        fontFamily: SERIF,
                                                        fontSize: U(5.6),
                                                        fontWeight: 700,
                                                        lineHeight: 1.1,
                                                        color: THEME.priceInk,
                                                    }}
                                                >
                                                    {plan.name}
                                                </h2>
                                                <p style={{ margin: `${U(1.4)} 0 0`, fontSize: U(3.4), color: BASE.grey }}>
                                                    {monthsText(price.months)} membership
                                                </p>
                                            </div>
                                            <span
                                                style={{
                                                    flexShrink: 0,
                                                    fontFamily: SERIF,
                                                    fontSize: U(6.2),
                                                    fontWeight: 700,
                                                    lineHeight: 1,
                                                    color: THEME.priceInk,
                                                }}
                                            >
                                                {money(price.price)}
                                            </span>
                                        </div>

                                        {renewal && (
                                            <>
                                                <div
                                                    aria-hidden
                                                    style={{
                                                        height: HAIR,
                                                        margin: `${U(4.4)} 0 ${U(3.6)}`,
                                                        background: `${THEME.accent}40`,
                                                    }}
                                                />
                                                <div style={{ display: "flex", alignItems: "center", gap: U(3.4) }}>
                                                    <span style={{ fontSize: U(4.6), display: "flex", color: THEME.accentText }}>
                                                        <RenewIcon />
                                                    </span>
                                                    <p style={{ margin: 0, fontSize: U(3.2), lineHeight: 1.45, color: BASE.grey }}>
                                                        {renewal}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </section>

                                    {/* ---------------------------- coupon ---------------------------- */}
                                    {onApplyCoupon && (
                                        <>
                                            <h3
                                                style={{
                                                    margin: `${U(7.4)} 0 ${U(3)}`,
                                                    fontSize: U(3),
                                                    fontWeight: 700,
                                                    letterSpacing: "0.14em",
                                                    color: BASE.ink,
                                                }}
                                            >
                                                HAVE A COUPON?
                                            </h3>

                                            <div style={{ display: "flex", alignItems: "stretch", gap: U(3.2) }}>
                                                <input
                                                    className="co-input"
                                                    value={code}
                                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                                    onKeyDown={(e) => e.key === "Enter" && handleApply()}
                                                    placeholder="Enter coupon code"
                                                    aria-label="Coupon code"
                                                    aria-invalid={couponError ? true : undefined}
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                        height: U(13.2),
                                                        boxSizing: "border-box",
                                                        padding: `0 ${U(5)}`,
                                                        background: BASE.white,
                                                        border: `${HAIR} solid ${couponError ? BASE.danger : THEME.softBorder}`,
                                                        borderRadius: U(4.4),
                                                        fontFamily: "inherit",
                                                        fontSize: U(3.9),
                                                        fontWeight: 500,
                                                        color: BASE.ink,
                                                        textTransform: "uppercase",
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className="co-btn"
                                                    onClick={handleApply}
                                                    disabled={!canApply}
                                                    style={{
                                                        flex: `0 0 ${U(22.4)}`,
                                                        height: U(13.2),
                                                        borderRadius: U(4.4),
                                                        background: THEME.accent,
                                                        color: THEME.ctaText,
                                                        fontSize: U(3.9),
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {applyingCoupon ? "…" : "Apply"}
                                                </button>
                                            </div>

                                            {couponError && (
                                                <p role="alert" style={{ margin: `${U(2.2)} 0 0`, fontSize: U(3), color: BASE.danger, fontWeight: 500 }}>
                                                    {couponError}
                                                </p>
                                            )}

                                            {(appliedCoupon || visibleSuggestions.length > 0) && (
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: U(2.8), marginTop: U(3.2) }}>
                                                    {appliedCoupon && (
                                                        <span
                                                            style={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: U(2),
                                                                padding: `${U(1.9)} ${U(3.4)}`,
                                                                borderRadius: U(3.4),
                                                                background: THEME.soft,
                                                                border: `${U(0.3)} solid ${THEME.accent}`,
                                                                color: THEME.accentText,
                                                                fontSize: U(2.9),
                                                                fontWeight: 700,
                                                                letterSpacing: "0.03em",
                                                            }}
                                                        >
                                                            <span style={{ fontSize: U(3.2), display: "flex" }}>
                                                                <CheckIcon />
                                                            </span>
                                                            {appliedCoupon.code} · {appliedCoupon.label}
                                                            {onRemoveCoupon && (
                                                                <button
                                                                    type="button"
                                                                    className="co-btn"
                                                                    aria-label={`Remove coupon ${appliedCoupon.code}`}
                                                                    onClick={onRemoveCoupon}
                                                                    style={{
                                                                        background: "transparent",
                                                                        color: "inherit",
                                                                        padding: 0,
                                                                        fontSize: U(3),
                                                                        display: "flex",
                                                                    }}
                                                                >
                                                                    <CloseIcon />
                                                                </button>
                                                            )}
                                                        </span>
                                                    )}
                                                    {visibleSuggestions.map((c) => (
                                                        <button
                                                            key={c.code}
                                                            type="button"
                                                            className="co-btn"
                                                            onClick={() => setCode(c.code)}
                                                            style={{
                                                                padding: `${U(2.2)} ${U(4.2)}`,
                                                                borderRadius: U(3.4),
                                                                background: "#fffaec",
                                                                border: `${U(0.3)} solid #e6cf8f`,
                                                                color: "#7a5b10",
                                                                fontSize: U(2.9),
                                                                fontWeight: 700,
                                                                letterSpacing: "0.03em",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {c.code} · {c.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* ------------------------- breakdown ------------------------- */}
                                    <section
                                        style={{
                                            marginTop: U(8),
                                            padding: `${U(5.2)} ${U(5.4)} ${U(5)}`,
                                            borderRadius: U(5.4),
                                            background: BASE.white,
                                            border: `${HAIR} solid ${THEME.softBorder}`,
                                        }}
                                    >
                                        {breakdown.length > 0 && (
                                            <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: U(3.4) }}>
                                                {breakdown.map((l, i) => (
                                                    <div
                                                        key={`${l.label}-${i}`}
                                                        style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: U(3) }}
                                                    >
                                                        <dt style={{ margin: 0, fontSize: U(3.7), color: BASE.grey }}>{l.label}</dt>
                                                        <dd
                                                            style={{
                                                                margin: 0,
                                                                fontSize: U(3.7),
                                                                fontWeight: 700,
                                                                color: l.tone === "discount" ? BASE.success : BASE.ink,
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {typeof l.value === "number" ? money(l.value) : l.value}
                                                        </dd>
                                                    </div>
                                                ))}
                                            </dl>
                                        )}

                                        {breakdown.length > 0 && (
                                            <div aria-hidden style={{ height: HAIR, margin: `${U(4.4)} 0`, background: "#eee8da" }} />
                                        )}

                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: U(3) }}>
                                            <span style={{ fontSize: U(4.3), fontWeight: 700 }}>{totalLabel}</span>
                                            <span
                                                style={{
                                                    fontFamily: SERIF,
                                                    fontSize: U(5.6),
                                                    fontWeight: 700,
                                                    lineHeight: 1,
                                                    color: BASE.ink,
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {amountDue !== undefined ? money(amountDue) : "—"}
                                            </span>
                                        </div>
                                    </section>

                                    {paymentNote && (
                                        <p
                                            style={{
                                                margin: `${U(6)} 0 0`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: U(2),
                                                fontSize: U(3.2),
                                                color: BASE.grey,
                                            }}
                                        >
                                            <span style={{ fontSize: U(3), display: "flex" }}>
                                                <DiamondOutline />
                                            </span>
                                            {paymentNote}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* =========================== FIXED BOTTOM =========================== */}
                        {plan && price && (
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
                                    className="co-btn"
                                    disabled={ctaDisabled}
                                    onClick={handlePay}
                                    style={{
                                        width: "100%",
                                        height: U(14.2),
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: U(3),
                                        borderRadius: U(5),
                                        background: THEME.gradient,
                                        color: THEME.ctaText,
                                        fontSize: U(4.2),
                                        fontWeight: 600,
                                        boxShadow: `0 ${U(1.6)} ${U(4)} ${THEME.shadow}`,
                                    }}
                                >
                                    {paying ? (
                                        "Processing…"
                                    ) : (
                                        <>
                                            <span style={{ fontSize: U(5.2), display: "flex" }}>
                                                <CardIcon />
                                            </span>
                                            {ctaLabel}
                                            {amountDue !== undefined ? ` ${money(amountDue)}` : ""}
                                        </>
                                    )}
                                </button>
                                {footnote && (
                                    <p style={{ margin: `${U(2.6)} 0 0`, fontSize: U(2.9), color: BASE.greyLight }}>{footnote}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

/* The route. Desktop keeps the framed card; mobile renders the same component
   edge to edge so its header, back button and pay CTA fill the screen. */
export default function Page() {
    return (
        <Screen
            desktop={<MembershipCheckout />}
            mobile={<MembershipCheckout fluid />}
        />
    );
}
