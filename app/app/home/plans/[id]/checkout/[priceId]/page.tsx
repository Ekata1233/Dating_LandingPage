"use client";

import { PremiumPrice, usePlanDetail } from "@/app/context/AccountSettingsContext";
import { usePayment, type TopUpStage } from "@/app/context/PaymentContext";
import { useMyProfile } from "@/app/app/shared/useMyProfile";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

import Screen from "@/app/app/shell/Screen";

/* -------------------------------------------------------------------------- */
/*  MembershipCheckout                                                        */
/*                                                                            */
/*  Themed by `plan.slug`: premium → pink, vip → gold, vip elite → black+gold */
/*  (case-insensitive; unknown slug falls back to premium pink).              */
/*                                                                            */
/*  DATA. Route: app/plans/[id]/checkout/[priceId]/page.tsx                   */
/*  `usePlanDetail(id)` returns the plan; the price being bought is the       */
/*  entry of `plan.prices` whose `id` equals `priceId`. With no `priceId`     */
/*  it falls back to the highlighted price.                                   */
/*                                                                            */
/*  MONEY (UPDATED). `price.price` is treated as the BASE price, EXCLUDING    */
/*  tax. GST (`gstPercent`, default 18%) is calculated on top and ADDED:      */
/*        gst   = round(price × gstPercent / 100)                             */
/*        total = price + gst                                                 */
/*  The breakdown shows base price, GST and the total, and the Pay button     */
/*  shows the total. Pass `lines` / `total` to override with server-priced    */
/*  values (coupons, other tax rules).                                        */
/*                                                                            */
/*  IMPORTANT: the amount the user sees must equal what Razorpay charges.     */
/*  The create-order endpoint for PACKAGE must charge price + GST.            */
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

/** What `onPaid` reports: exactly which plan and which price option were bought. */
export interface CheckoutSelection {
    plan: NonNullable<ReturnType<typeof usePlanDetail>["plan"]>;
    price: PremiumPrice;
    /** Base price before tax. */
    subtotal: number;
    /** GST added on top of the base price. */
    gst: number;
    /** The amount shown on the Pay button (base price + GST, or the `total` prop). */
    amount: number;
}

export interface MembershipCheckoutProps {
    title?: string;
    subtitle?: string;
    showHeader?: boolean;

    currencySymbol?: string;
    /** Override the default "₹1,299" formatter (en-IN grouping). */
    formatPrice?: (n: number) => string;

    /** GST % added on top of the base price. 0 disables tax. */
    gstPercent?: number;
    /** Replaces the default breakdown rows (price + GST). Pass server-priced rows. */
    lines?: CheckoutLine[];
    totalLabel?: string;
    /** Amount to pay. Falls back to base price + GST. Pass it when a coupon applies. */
    total?: number;

    /** Overrides the derived "Valid for N months …" line. `null` hides it. */
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
    /** Runs after a successful, verified payment. Default: go to /app/home. */
    onPaid?: (selection: CheckoutSelection) => void;

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

const PLAN_ICON: Record<PlanSlug, string> = {
    premium: "🔥",
    vip: "👑",
    "vip-elite": "💠",
};

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
    priceInk: string;
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
    total,
    renewalNote,
    suggestedCoupons = [],
    appliedCoupon = null,
    couponError = null,
    applyingCoupon = false,
    onApplyCoupon,
    onRemoveCoupon,
    paymentNote = "Secured by Razorpay · UPI, cards & net banking",
    ctaLabel = "Pay",
    footnote = "You won't be charged until you confirm",
    paying = false,
    onBack,
    showBack = true,
    onPaid,
    fluid = false,
    className,
    style,
}: MembershipCheckoutProps) {
    const params = useParams<{ id: string; priceId?: string }>();
    const id = segment(params?.id);
    const priceId = segment(params?.priceId);
    const router = useRouter();

    const { plan, loading, error, refetch } = usePlanDetail(id as string);

    const slug = normalizePlanSlug(plan?.slug);
    const THEME = THEMES[slug];

    const price: PremiumPrice | undefined = React.useMemo(() => {
        const options = (plan?.prices ?? []).filter((p) => p.active);
        if (priceId) return options.find((p) => p.id === priceId);
        return options.find((p) => p.isHighlighted) ?? options[0];
    }, [plan, priceId]);

    /* TAX. `price.price` is the base (pre-tax) amount; GST is added on top. */
    const gstAmount: number = React.useMemo(() => {
        if (!price || gstPercent <= 0) return 0;
        return Math.round((price.price * gstPercent) / 100);
    }, [price, gstPercent]);

    const computedTotal: number | undefined = price ? price.price + gstAmount : undefined;

    /* What is charged: base price + GST (or the server-priced `total` prop). */
    const amountDue: number | undefined = total ?? computedTotal;

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

    /* Default breakdown: base price, then GST added on top. */
    const breakdown: CheckoutLine[] = React.useMemo(() => {
        if (lines) return lines;
        if (!plan || !price) return [];
        const rows: CheckoutLine[] = [
            { label: `${plan.name} · ${monthsText(price.months)}`, value: price.price },
        ];
        if (gstPercent > 0) {
            rows.push({ label: `GST (${gstPercent}%)`, value: gstAmount });
        }
        return rows;
    }, [lines, plan, price, gstPercent, gstAmount]);

    /* ---- PAYMENT ---- */
    const { purchasePackage, loadRazorpay } = usePayment();
    const { profile } = useMyProfile();
    const [stage, setStage] = React.useState<TopUpStage | "idle">("idle");
    const [payError, setPayError] = React.useState<string | null>(null);
    const busy = paying || stage !== "idle";

    React.useEffect(() => {
        loadRazorpay();
    }, [loadRazorpay]);

    const canApply = code.trim().length > 0 && !applyingCoupon;
    const ctaDisabled = !plan || !price || amountDue === undefined || busy;

    const renewal =
        renewalNote === undefined
            ? price
                ? `Valid for ${monthsText(price.months)} · one-time payment, doesn't auto-renew`
                : null
            : renewalNote;

    const handleBack = () => {
        if (busy) return;
        onBack ? onBack() : window.history.back();
    };

    const handleApply = () => {
        if (!canApply) return;
        onApplyCoupon?.(code.trim());
    };

    const handlePay = async () => {
        if (!plan || !price || amountDue === undefined || busy) return;
        setPayError(null);

        const p = (profile ?? {}) as Record<string, any>;
        const selection: CheckoutSelection = {
            plan,
            price,
            subtotal: price.price,
            gst: gstAmount,
            amount: amountDue,
        };

        const res = await purchasePackage(price.id, {
            description: `${plan.name} · ${monthsText(price.months)}`,
            prefill: {
                name: p.name ?? p.fullName ?? p.firstName ?? undefined,
                email: p.email ?? undefined,
                contact: p.phone ?? p.mobile ?? p.phoneNumber ?? undefined,
            },
            onStage: setStage,
        });
        setStage("idle");

        if (res.ok) {
            toast.success(`${plan.name} activated for ${monthsText(price.months)} 🎉`);
            refetch?.();
            if (onPaid) onPaid(selection);
            else router.push("/app/home");
            return;
        }
        if (res.cancelled) return;

        setPayError(res.message);
        if (!res.paymentCaptured) toast.error(res.message);
    };

    const payLabel =
        stage === "creating"
            ? "Preparing payment…"
            : stage === "awaiting"
              ? "Complete payment in the window…"
              : stage === "verifying"
                ? "Activating your membership…"
                : null;

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
                            : "  h-full aspect-[300/520] max-w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out "
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
                                            <div style={{ flexShrink: 0, textAlign: "right" }}>
                                                <span
                                                    style={{
                                                        display: "block",
                                                        fontFamily: SERIF,
                                                        fontSize: U(6.2),
                                                        fontWeight: 700,
                                                        lineHeight: 1,
                                                        color: THEME.priceInk,
                                                    }}
                                                >
                                                    {money(price.price)}
                                                </span>
                                                {gstPercent > 0 && (
                                                    <span
                                                        style={{
                                                            display: "block",
                                                            marginTop: U(1.2),
                                                            fontSize: U(2.7),
                                                            fontWeight: 600,
                                                            color: BASE.grey,
                                                        }}
                                                    >
                                                        + {gstPercent}% GST
                                                    </span>
                                                )}
                                            </div>
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
                                {payError && (
                                    <p role="alert" style={{ margin: `0 0 ${U(3)}`, fontSize: U(3.1), lineHeight: 1.45, color: BASE.danger, fontWeight: 500 }}>
                                        {payError}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    className="co-btn"
                                    disabled={ctaDisabled}
                                    aria-busy={busy}
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
                                    {payLabel ? (
                                        payLabel
                                    ) : paying ? (
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

/* The route. Desktop keeps the framed card; mobile renders edge to edge. */
export default function Page() {
    return (
        <Screen
            desktop={<MembershipCheckout />}
            mobile={<MembershipCheckout fluid />}
        />
    );
}
