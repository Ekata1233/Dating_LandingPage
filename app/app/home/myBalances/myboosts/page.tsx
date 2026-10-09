"use client";

import { useActiveSection } from "@/app/context/ActiveSectionContext";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*  BoostStore                                                                */
/*                                                                            */
/*  One self-contained, backend-driven screen with two tabs:                  */
/*    Boost (itemType BOOST)  |  Super Boost (itemType SUPER_BOOST)           */
/*                                                                            */
/*  Same rules as ReferAndEarn / RosesStore / ComplimentsStore:               */
/*   - fills 100% width / height of its PARENT                                */
/*   - every size is in `cqw` (1% of the parent's width)                      */
/*   - content scrolls vertically, scrollbar hidden                           */
/*   - header, tab switch and purchase bar stay pinned                        */
/*                                                                            */
/*  Backend mapping (response.data, one request per tab):                     */
/*    packs[]  (isActive, sortOrder)                                          */
/*      title, quantity, pricePerUnit, totalPrice, badge                      */
/*      badge: NONE | MOST_POPULAR | BEST_VALUE                               */
/*      Discount is derived: quantity * pricePerUnit vs totalPrice            */
/*        e.g. 10 * ₹18 = ₹180 struck through, ₹140.4 shown, "-22%"           */
/*    info[]   (isActive, sortOrder)  -> "Why … works" rows                   */
/*      title, description, tag                                               */
/*    comparison[] (optional)         -> "What's the difference?" table       */
/*      feature, boost, superBoost    (aliases: boostValue / superBoostValue) */
/*    durationMinutes (optional)      -> overrides "30 MIN EACH" footer text  */
/*                                                                            */
/*  Usage:                                                                    */
/*    <div style={{ width: 390, height: 800 }}>                               */
/*      <BoostStore fluid onPurchase={(pack, type) => checkout(pack.id)} />   */
/*    </div>                                                                  */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */
export type BoostItemType = "BOOST" | "SUPER_BOOST";
export type PackBadge = "NONE" | "MOST_POPULAR" | "BEST_VALUE";

export interface BoostPack {
    id: string;
    itemType: string;
    title: string;
    quantity: number;
    pricePerUnit: string;
    totalPrice: string;
    badge: PackBadge;
    sortOrder: number;
    isActive: boolean;
}

export interface BoostInfo {
    id: string;
    itemType: string;
    title: string;
    description: string;
    tag: string | null;
    sortOrder: number;
    isActive: boolean;
}

export interface ComparisonRow {
    id?: string;
    feature: string;
    boost?: string | null;
    boostValue?: string | null;
    superBoost?: string | null;
    superBoostValue?: string | null;
    sortOrder?: number;
    isActive?: boolean;
}

export interface BoostData {
    itemType: string;
    packs: BoostPack[];
    info: BoostInfo[];
    comparison?: ComparisonRow[];
    durationMinutes?: number;
    [key: string]: unknown;
}

export interface BoostResponse {
    success: boolean;
    message?: string;
    data: BoostData;
}

type IconName = "back" | "wallet" | "bolt" | "star" | "trend" | "heart" | "arrow" | "medal" | "spark";

interface TabTheme {
    itemType: BoostItemType;
    tabLabel: string;
    tabIcon: IconName;
    /** "Boosts" */
    plural: string;
    singular: string;
    accent: string;
    accentSoft: string;
    selectedBg: string;
    /** pill colours for POPULAR / BEST VALUE */
    popularBg: string;
    bestBg: string;
    heroGradient: string;
    heroImage?: string;
    chipIcon: IconName;
    chip: string;
    headline: string;
    subline: string;
    stats: { value: string; label: string }[];
    /** "30 MIN" – used in "10 BOOSTS · 30 MIN EACH" */
    each: string;
    packsTitle: string;
    infoTitle: string;
    infoStyles: { icon: IconName; fg: string; bg: string }[];
    /** tag text -> colours (falls back to accent) */
    tagStyles: Record<string, { fg: string; bg: string }>;
    ctaBg: string;
    ctaShadow: string;
}

export interface BoostStoreProps {
    defaultTab?: BoostItemType;
    currencySymbol?: string;
    title?: string;
    showHeader?: boolean;
    showBack?: boolean;
    onBack?: () => void;
    /** Wallet button (top right). Hidden if omitted and showWallet is false */
    showWallet?: boolean;
    walletHasAlert?: boolean;
    onWallet?: () => void;

    premiumTitle?: string;
    premiumText?: string;
    showPremium?: boolean;
    onViewPremium?: () => void;

    footnote?: string;
    ctaLabel?: string;

    /** Called when the person taps Continue */
    onPurchase?: (pack: BoostPack, type: BoostItemType) => Promise<void> | void;

    fluid?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/* ------------------------------- data hook --------------------------------- */
type Fetcher = (itemType: BoostItemType) => Promise<BoostResponse>;

/**
 * TODO: replace with your real API client / context call.
 * Expected response: { success, message, data: { itemType, packs, info, comparison? } }
 */
const defaultFetcher: Fetcher = async (itemType) => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "";
    const res = await fetch(`${base}/store?itemType=${itemType}`, { credentials: "include" });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return res.json();
};

export function useBoostData(itemType: BoostItemType, fetcher: Fetcher = defaultFetcher) {
    const [data, setData] = useState<BoostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetcherRef.current(itemType);
            if (!res?.success) throw new Error(res?.message || "Could not load the store");
            setData(res.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not load the store");
        } finally {
            setLoading(false);
        }
    }, [itemType]);

    useEffect(() => {
        load();
    }, [load]);

    return { data, loading, error, reload: load };
}

/* --------------------------------- helpers --------------------------------- */
/** 1 unit = 1% of the parent's width */
const U = (n: number) => `${n}cqw`;
const HAIR = "max(1px, 0.3cqw)";

const C = {
    ink: "#1f1f24",
    grey: "#8a8a93",
    greyLight: "#b3b3b8",
    border: "#ececf0",
    white: "#ffffff",
    page: "#f8f9fb",
    amber: "#e8a23a",
};

const FONT = "'DM Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const BADGE_LABEL: Record<PackBadge, string> = {
    NONE: "",
    MOST_POPULAR: "Popular",
    BEST_VALUE: "Best value",
};

const money = (symbol: string, v: string | number) =>
    `${symbol}${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

/** derived discount: quantity * pricePerUnit (list price) vs totalPrice */
const priceInfo = (p: BoostPack) => {
    const list = p.quantity * Number(p.pricePerUnit);
    const total = Number(p.totalPrice);
    const discounted = list > 0 && total < list - 0.005;
    return {
        list,
        total,
        discounted,
        percent: discounted ? Math.round((1 - total / list) * 100) : 0,
    };
};

const svgBase: React.CSSProperties = { width: "1em", height: "1em", display: "block", flexShrink: 0 };

/* ---------------------------------- icons ---------------------------------- */
const FILLED: IconName[] = ["bolt", "star", "heart", "spark"];

const ICONS: Record<IconName, React.ReactNode> = {
    back: <path d="M15 5l-7 7 7 7" />,
    wallet: (
        <>
            <rect x="3" y="5" width="18" height="15" rx="3" />
            <path d="M3 9h18M15 14.500h2" />
        </>
    ),
    bolt: <path d="M13 2 5 14h6l-1 8 8-12h-6l1-8Z" />,
    star: <path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.2 9.4l6.1-.8L12 3Z" />,
    trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
    heart: <path d="M12 20s-8-4.700-8-11a4.500 4.500 0 0 1 8-2.800A4.500 4.500 0 0 1 20 9c0 6.300-8 11-8 11Z" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    medal: (
        <>
            <circle cx="12" cy="10" r="6" />
            <path d="M8.500 15 7 21l5-2.500L17 21l-1.500-6M12 7.500l.8 1.700 1.800.2-1.300 1.200.4 1.800-1.700-1-1.700 1 .4-1.800-1.300-1.200 1.800-.2.800-1.700Z" />
        </>
    ),
    spark: <path d="M12 3l1.800 6.200L20 11l-6.200 1.800L12 19l-1.800-6.200L4 11l6.200-1.800L12 3Z" />,
};

const Icon = ({ name }: { name: IconName }) => (
    <svg
        viewBox="0 0 24 24"
        style={svgBase}
        fill={FILLED.includes(name) ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={name === "back" ? 2.4 : 2}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {ICONS[name]}
    </svg>
);

/* --------------------------------- themes ---------------------------------- */
const BOOST_THEME: TabTheme = {
    itemType: "BOOST",
    tabLabel: "Boost",
    tabIcon: "bolt",
    plural: "Boosts",
    singular: "Boost",
    accent: "#e23a6a",
    accentSoft: "#fde4ea",
    selectedBg: "#fff0f4",
    popularBg: "#2a2a2e",
    bestBg: "linear-gradient(135deg, #f0518f, #e23a6a)",
    heroGradient: "linear-gradient(160deg, rgba(70,10,30,.35) 0%, rgba(150,25,70,.85) 100%)",
    // heroImage: "/images/boost-hero.jpg",
    chipIcon: "bolt",
    chip: "30 min • Nearby",
    headline: "Boost Package",
    subline: "Increase your profile visibility",
    stats: [
        { value: "5×", label: "More views" },
        { value: "3×", label: "More matches" },
        { value: "30min", label: "Duration" },
    ],
    each: "30 MIN",
    packsTitle: "Choose your pack",
    infoTitle: "Why Boost works",
    infoStyles: [
        { icon: "bolt", fg: "#e23a6a", bg: "#fde8ee" },
        { icon: "trend", fg: "#22a45d", bg: "#e5f6ec" },
        { icon: "heart", fg: "#f4a93a", bg: "#fff1db" },
    ],
    tagStyles: {},
    ctaBg: "#e23a6a",
    ctaShadow: "rgba(226,58,106,.35)",
};

const SUPER_THEME: TabTheme = {
    itemType: "SUPER_BOOST",
    tabLabel: "Super Boost",
    tabIcon: "star",
    plural: "Super Boosts",
    singular: "Super Boost",
    accent: "#111111",
    accentSoft: "#ececec",
    selectedBg: "#fffaf0",
    popularBg: "linear-gradient(135deg, #f0518f, #e23a6a)",
    bestBg: "#111111",
    heroGradient: "linear-gradient(160deg, rgba(10,10,12,.78) 0%, rgba(20,16,14,.92) 100%)",
    // heroImage: "/images/super-boost-hero.jpg",
    chipIcon: "spark",
    chip: "3 hours • Citywide",
    headline: "Super Boost Package",
    subline: "Be the top profile\nin your city",
    stats: [
        { value: "10×", label: "More views" },
        { value: "5×", label: "More matches" },
        { value: "3hr", label: "Duration" },
    ],
    each: "3 HOURS",
    packsTitle: "Choose your pack",
    infoTitle: "Why Super Boost works",
    infoStyles: [
        { icon: "bolt", fg: "#f4b400", bg: "#fff6cf" },
        { icon: "trend", fg: "#e23a6a", bg: "#fde8ee" },
        { icon: "heart", fg: "#22a45d", bg: "#e5f6ec" },
    ],
    tagStyles: { POWERFUL: { fg: "#d98a1a", bg: "#fff3dc" } },
    ctaBg: "#000000",
    ctaShadow: "rgba(0,0,0,.3)",
};

const THEMES: Record<BoostItemType, TabTheme> = { BOOST: BOOST_THEME, SUPER_BOOST: SUPER_THEME };
const TAB_ORDER: BoostItemType[] = ["BOOST", "SUPER_BOOST"];

/* -------------------------------- component -------------------------------- */
export default function BoostStore({
    defaultTab = "BOOST",
    currencySymbol = "₹",
    title = "Boost",
    showHeader = true,
    showBack = true,
    onBack,
    showWallet = true,
    walletHasAlert = true,
    onWallet,
    premiumTitle = "Go Premium+",
    premiumText = "1 free boost every month · Unlimited likes · Verified badge",
    showPremium = true,
    onViewPremium,
    footnote = "Boosts never expire · Use anytime",
    ctaLabel = "Continue",
    onPurchase,
    fluid = false,
    className,
    style,
}: BoostStoreProps) {
    const { setActiveSection } = useActiveSection();
    const [tab, setTab] = useState<BoostItemType>(defaultTab);
    const [picked, setPicked] = useState<Partial<Record<BoostItemType, string>>>({});
    const [buying, setBuying] = useState(false);

    /* both tabs are fetched up-front so switching is instant */
    const boost = useBoostData("BOOST");
    const superBoost = useBoostData("SUPER_BOOST");
    const current = tab === "BOOST" ? boost : superBoost;
    const { data, loading, error, reload } = current;
    const theme = THEMES[tab];

    const packs = useMemo(
        () => (data?.packs ?? []).filter((p) => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
        [data]
    );
    const info = useMemo(
        () => (data?.info ?? []).filter((i) => i.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
        [data]
    );
    /* the comparison table is the same for both tabs: take whichever response has it */
    const comparison = useMemo(() => {
        const rows = data?.comparison ?? boost.data?.comparison ?? superBoost.data?.comparison ?? [];
        return rows
            .filter((r) => r.isActive !== false)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((r) => ({
                feature: r.feature,
                boost: r.boost ?? r.boostValue ?? "—",
                superBoost: r.superBoost ?? r.superBoostValue ?? "—",
            }));
    }, [data, boost.data, superBoost.data]);

    const defaultId = packs.find((p) => p.badge === "MOST_POPULAR")?.id ?? packs[0]?.id ?? null;
    const selected = packs.find((p) => p.id === (picked[tab] ?? defaultId)) ?? null;

    const eachLabel = data?.durationMinutes
        ? data.durationMinutes >= 60
            ? `${data.durationMinutes / 60} ${data.durationMinutes === 60 ? "HOUR" : "HOURS"}`
            : `${data.durationMinutes} MIN`
        : theme.each;

    const router = useRouter()
    const handleBack = ()=>{
      router.push("/app/home")
    };
    const handlePurchase = async () => {
        if (!selected || buying) return;
        setBuying(true);
        try {
            await onPurchase?.(selected, tab);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Purchase failed. Please try again.");
        } finally {
            setBuying(false);
        }
    };

    const sectionTitle: React.CSSProperties = {
        margin: 0,
        fontSize: U(3.1),
        fontWeight: 500,
        letterSpacing: "0.12em",
        color: C.grey,
        textTransform: "uppercase",
    };

    const circleBtn: React.CSSProperties = {
        width: U(10),
        height: U(10),
        borderRadius: "50%",
        background: C.white,
        border: `${HAIR} solid ${C.border}`,
        boxShadow: `0 ${U(0.5)} ${U(2)} rgba(0,0,0,.06)`,
        color: C.ink,
        fontSize: U(4.2),
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
    };

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
                    {/* container-query root: everything inside is sized in cqw */}
                    <div
                        className={className}
                        style={{
                            width: "100%",
                            height: "100%",
                            containerType: "inline-size",
                            display: "flex",
                            flexDirection: "column",
                            background: C.page,
                            fontFamily: FONT,
                            color: C.ink,
                            ...style,
                        }}
                    >
                        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .wbs-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease, background .2s ease, color .2s ease; }
        .wbs-btn:hover:not(:disabled) { filter: brightness(1.05); }
        .wbs-btn:active:not(:disabled) { transform: scale(.98); }
        .wbs-btn:disabled { cursor: not-allowed; }
        .wbs-btn:focus-visible { outline: 2px solid ${theme.accent}; outline-offset: 2px; }
        .wbs-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .wbs-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
        @keyframes wbs-pulse { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
        .wbs-skel { background: #eceef2; animation: wbs-pulse 1.2s ease-in-out infinite; }
      `}</style>

                        {/* ------------------------------ header ------------------------------ */}
                        {showHeader && (
                            <header
                                style={{
                                    position: "relative",
                                    flex: "0 0 auto",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minHeight: U(10),
                                    padding: `${U(4)} ${U(5)} ${U(3)}`,
                                    boxSizing: "content-box",
                                    background: C.page,
                                }}
                            >
                                <button
                                    type="button"
                                    className="wbs-btn"
                                    aria-label="Go back"
                                    onClick={handleBack}
                                    style={{
                                        ...circleBtn,
                                        position: "absolute",
                                        left: U(3.1),
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        display: showBack ? "flex" : "none",
                                    }}
                                >
                                    <Icon name="back" />
                                </button>
                                <h1 style={{ margin: 0, fontSize: U(4.3), fontWeight: 600, letterSpacing: "0.02em" }}>
                                    {title}
                                </h1>
                                <button
                                    type="button"
                                    className="wbs-btn"
                                    aria-label="Open wallet"
                                    onClick={onWallet}
                                    style={{
                                        ...circleBtn,
                                        position: "absolute",
                                        right: U(3.1),
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        display: showWallet ? "flex" : "none",
                                    }}
                                >
                                    <Icon name="wallet" />
                                    {walletHasAlert && (
                                        <span
                                            aria-hidden
                                            style={{
                                                position: "absolute",
                                                top: U(1.6),
                                                right: U(1.8),
                                                width: U(1.9),
                                                height: U(1.9),
                                                borderRadius: "50%",
                                                background: "#f0392b",
                                                border: `${U(0.4)} solid ${C.white}`,
                                            }}
                                        />
                                    )}
                                </button>
                            </header>
                        )}

                        {/* ---------------------------- tab switch ---------------------------- */}
                        <div style={{ flex: "0 0 auto", padding: `0 ${U(5)} ${U(2.4)}`, background: C.page }}>
                            <div
                                role="tablist"
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: U(0.6),
                                    padding: U(1),
                                    borderRadius: U(5),
                                    background: "#ebebed",
                                    boxShadow: `inset 0 0 ${U(1.6)} rgba(0,0,0,.05)`,
                                }}
                            >
                                {TAB_ORDER.map((key) => {
                                    const t = THEMES[key];
                                    const active = tab === key;
                                    return (
                                        <button
                                            key={key}
                                            role="tab"
                                            aria-selected={active}
                                            type="button"
                                            className="wbs-btn"
                                            onClick={() => setTab(key)}
                                            style={{
                                                height: U(10),
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: U(2.2),
                                                borderRadius: U(4.2),
                                                background: active ? C.white : "transparent",
                                                boxShadow: active ? `0 ${U(0.6)} ${U(2)} rgba(0,0,0,.1)` : "none",
                                                color: active ? (key === "BOOST" ? t.accent : "#111") : "#8d8d92",
                                                fontSize: U(3.7),
                                                fontWeight: active ? 600 : 500,
                                            }}
                                        >
                                            <span style={{ fontSize: U(4), display: "flex" }}>
                                                <Icon name={t.tabIcon} />
                                            </span>
                                            {t.tabLabel}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ------------------------------ scroll ------------------------------ */}
                        <div
                            key={tab}
                            className="wbs-scroll"
                            style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
                        >
                            <div
                                style={{
                                    boxSizing: "border-box",
                                    padding: `${U(2)} ${U(4.2)} ${U(8)}`,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                {/* ============================ PART 1: hero ============================ */}
                                <section
                                    style={{
                                        position: "relative",
                                        padding: `${U(4.4)} ${U(4.6)} ${U(4.4)}`,
                                        borderRadius: U(6),
                                        color: C.white,
                                        background: theme.heroImage
                                            ? `${theme.heroGradient}, url(${theme.heroImage}) center / cover`
                                            : theme.heroGradient,
                                        boxShadow: `0 ${U(2)} ${U(5)} rgba(0,0,0,.18)`,
                                        overflow: "hidden",
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: U(1.8),
                                            padding: `${U(1.6)} ${U(3.2)}`,
                                            borderRadius: U(3.6),
                                            background: "rgba(255,255,255,.16)",
                                            fontSize: U(2.8),
                                            fontWeight: 500,
                                            letterSpacing: "0.1em",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        <span style={{ fontSize: U(3.2), display: "flex", color: "#ffd24a" }}>
                                            <Icon name={theme.chipIcon} />
                                        </span>
                                        {theme.chip}
                                    </span>

                                    <h2
                                        style={{
                                            margin: `${U(3.2)} 0 0`,
                                            fontSize: U(6.6),
                                            fontWeight: 600,
                                            lineHeight: 1.1,
                                            letterSpacing: "-0.01em",
                                        }}
                                    >
                                        {theme.headline}
                                    </h2>
                                    <p
                                        style={{
                                            margin: `${U(2.6)} 0 0`,
                                            paddingBottom: U(3.6),
                                            fontSize: U(3.2),
                                            lineHeight: 1.4,
                                            opacity: 0.92,
                                            whiteSpace: "pre-line",
                                            borderBottom: `${HAIR} solid rgba(255,255,255,.25)`,
                                        }}
                                    >
                                        {theme.subline}
                                    </p>

                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: `repeat(${theme.stats.length}, minmax(0, 1fr))`,
                                            gap: U(2.6),
                                            marginTop: U(3.6),
                                        }}
                                    >
                                        {theme.stats.map((s, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: U(1),
                                                    minHeight: U(13.6),
                                                    padding: `${U(2)} ${U(1)}`,
                                                    boxSizing: "border-box",
                                                    borderRadius: U(3.4),
                                                    background: "rgba(255,255,255,.14)",
                                                    border: `${HAIR} solid rgba(255,255,255,.3)`,
                                                    textAlign: "center",
                                                }}
                                            >
                                                <span style={{ fontSize: U(5), fontWeight: 500, lineHeight: 1 }}>{s.value}</span>
                                                <span
                                                    style={{
                                                        fontSize: U(2.2),
                                                        letterSpacing: "0.12em",
                                                        textTransform: "uppercase",
                                                        lineHeight: 1.2,
                                                        opacity: 0.9,
                                                    }}
                                                >
                                                    {s.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* ============================ PART 2: packs ============================ */}
                                <h2 style={{ ...sectionTitle, margin: `${U(7)} 0 ${U(4)} ${U(1)}` }}>{theme.packsTitle}</h2>

                                {error && !packs.length ? (
                                    <section
                                        style={{
                                            padding: `${U(6)} ${U(4)}`,
                                            textAlign: "center",
                                            background: C.white,
                                            border: `${HAIR} solid ${C.border}`,
                                            borderRadius: U(5),
                                        }}
                                    >
                                        <p style={{ margin: 0, fontSize: U(3.4), color: C.grey }}>{error}</p>
                                        <button
                                            type="button"
                                            className="wbs-btn"
                                            onClick={reload}
                                            style={{
                                                marginTop: U(4),
                                                height: U(10),
                                                padding: `0 ${U(6)}`,
                                                borderRadius: U(5),
                                                background: theme.accentSoft,
                                                color: theme.accent,
                                                fontSize: U(3.5),
                                                fontWeight: 600,
                                            }}
                                        >
                                            Try again
                                        </button>
                                    </section>
                                ) : (
                                    <div
                                        role="radiogroup"
                                        aria-label={`${theme.plural} packs`}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                                            gap: U(3.1),
                                            paddingTop: U(2.4),
                                        }}
                                    >
                                        {loading && !packs.length
                                            ? [0, 1, 2].map((i) => (
                                                  <div key={i} className="wbs-skel" style={{ height: U(36), borderRadius: U(5) }} />
                                              ))
                                            : packs.map((p) => {
                                                  const active = p.id === selected?.id;
                                                  const badge = BADGE_LABEL[p.badge];
                                                  const badgeBg = p.badge === "BEST_VALUE" ? theme.bestBg : theme.popularBg;
                                                  const price = priceInfo(p);
                                                  return (
                                                      <button
                                                          key={p.id}
                                                          type="button"
                                                          role="radio"
                                                          aria-checked={active}
                                                          className="wbs-btn"
                                                          onClick={() => setPicked((m) => ({ ...m, [tab]: p.id }))}
                                                          style={{
                                                              position: "relative",
                                                              display: "flex",
                                                              flexDirection: "column",
                                                              alignItems: "center",
                                                              padding: `${U(6.4)} ${U(1)} ${U(4.4)}`,
                                                              minWidth: 0,
                                                              textAlign: "center",
                                                              borderRadius: U(5),
                                                              background: active ? theme.selectedBg : C.white,
                                                              border: `${U(0.5)} solid ${active ? theme.accent : "transparent"}`,
                                                              boxShadow: `0 ${U(0.8)} ${U(3)} rgba(0,0,0,.06)`,
                                                              color: C.ink,
                                                          }}
                                                      >
                                                          {badge && (
                                                              <span
                                                                  style={{
                                                                      position: "absolute",
                                                                      top: U(-2.4),
                                                                      left: "50%",
                                                                      transform: "translateX(-50%)",
                                                                      padding: `${U(1.2)} ${U(3.2)}`,
                                                                      borderRadius: U(3),
                                                                      background: badgeBg,
                                                                      color: C.white,
                                                                      fontSize: U(2.5),
                                                                      fontWeight: 500,
                                                                      letterSpacing: "0.04em",
                                                                      textTransform: "uppercase",
                                                                      whiteSpace: "nowrap",
                                                                      boxShadow: `0 ${U(0.6)} ${U(1.8)} rgba(0,0,0,.18)`,
                                                                  }}
                                                              >
                                                                  {badge}
                                                              </span>
                                                          )}
                                                          <span
                                                              style={{
                                                                  fontSize: U(6.4),
                                                                  fontWeight: 500,
                                                                  lineHeight: 1,
                                                                  color: active && tab === "BOOST" ? theme.accent : C.ink,
                                                              }}
                                                          >
                                                              {p.quantity}
                                                          </span>
                                                          <span style={{ marginTop: U(2.2), fontSize: U(2.6), color: C.grey }}>
                                                              {theme.plural}
                                                          </span>
                                                          <span style={{ marginTop: U(2.6), fontSize: U(3.1), fontWeight: 600 }}>
                                                              {money(currencySymbol, p.pricePerUnit)}/each
                                                          </span>

                                                          {price.discounted ? (
                                                              <span
                                                                  style={{
                                                                      marginTop: U(1.4),
                                                                      display: "flex",
                                                                      flexWrap: "wrap",
                                                                      justifyContent: "center",
                                                                      alignItems: "baseline",
                                                                      gap: `0 ${U(1)}`,
                                                                      fontSize: U(2.4),
                                                                  }}
                                                              >
                                                                  <s style={{ color: C.greyLight }}>
                                                                      {money(currencySymbol, price.list)}
                                                                  </s>
                                                                  <b style={{ fontSize: U(3), fontWeight: 600, color: C.ink }}>
                                                                      {money(currencySymbol, price.total)}
                                                                  </b>
                                                                  <b style={{ fontWeight: 600, color: "#e23a6a" }}>-{price.percent}%</b>
                                                              </span>
                                                          ) : (
                                                              <span style={{ marginTop: U(1.4), fontSize: U(2.4), color: C.greyLight }}>
                                                                  {money(currencySymbol, p.totalPrice)}
                                                              </span>
                                                          )}

                                                          <span
                                                              aria-hidden
                                                              style={{
                                                                  marginTop: U(3.4),
                                                                  width: U(5.2),
                                                                  height: U(5.2),
                                                                  borderRadius: "50%",
                                                                  boxSizing: "border-box",
                                                                  border: `${U(0.4)} solid ${active ? theme.accent : "#dcdce0"}`,
                                                                  display: "flex",
                                                                  alignItems: "center",
                                                                  justifyContent: "center",
                                                              }}
                                                          >
                                                              {active && (
                                                                  <span
                                                                      style={{
                                                                          width: U(2.8),
                                                                          height: U(2.8),
                                                                          borderRadius: "50%",
                                                                          background: theme.accent,
                                                                      }}
                                                                  />
                                                              )}
                                                          </span>
                                                      </button>
                                                  );
                                              })}
                                    </div>
                                )}

                                {/* ============================ PART 3: info ============================ */}
                                <h2 style={{ ...sectionTitle, margin: `${U(8)} 0 ${U(4)} ${U(1)}` }}>{theme.infoTitle}</h2>

                                <section
                                    style={{
                                        padding: `${U(1.4)} ${U(4.4)}`,
                                        background: C.white,
                                        borderRadius: U(5),
                                        boxShadow: `0 ${U(0.8)} ${U(3)} rgba(0,0,0,.05)`,
                                    }}
                                >
                                    {loading && !info.length ? (
                                        [0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="wbs-skel"
                                                style={{ height: U(10), borderRadius: U(2), margin: `${U(4)} 0` }}
                                            />
                                        ))
                                    ) : info.length === 0 ? (
                                        <p style={{ margin: `${U(6)} 0`, textAlign: "center", fontSize: U(3.4), color: "#a9a9a9" }}>
                                            Nothing to show yet
                                        </p>
                                    ) : (
                                        info.map((row, i) => {
                                            const s = theme.infoStyles[i % theme.infoStyles.length];
                                            const tag = row.tag
                                                ? theme.tagStyles[row.tag] ?? { fg: "#e23a6a", bg: "#fde8ee" }
                                                : null;
                                            return (
                                                <div
                                                    key={row.id}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "flex-start",
                                                        gap: U(4),
                                                        padding: `${U(3.6)} 0`,
                                                        borderTop: i === 0 ? "none" : `${HAIR} solid ${C.border}`,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            width: U(9.2),
                                                            height: U(9.2),
                                                            borderRadius: "50%",
                                                            flexShrink: 0,
                                                            background: s.bg,
                                                            color: s.fg,
                                                            fontSize: U(4),
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        <Icon name={s.icon} />
                                                    </span>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: U(2) }}>
                                                            <h3 style={{ margin: 0, fontSize: U(3.7), fontWeight: 500, lineHeight: 1.25 }}>
                                                                {row.title}
                                                            </h3>
                                                            {tag && row.tag && (
                                                                <span
                                                                    style={{
                                                                        padding: `${U(0.6)} ${U(2)}`,
                                                                        borderRadius: U(1.2),
                                                                        background: tag.bg,
                                                                        color: tag.fg,
                                                                        fontSize: U(2.4),
                                                                        fontWeight: 500,
                                                                        letterSpacing: "0.04em",
                                                                        textTransform: "uppercase",
                                                                    }}
                                                                >
                                                                    {row.tag}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p style={{ margin: `${U(1.2)} 0 0`, fontSize: U(3.1), lineHeight: 1.45, color: C.grey }}>
                                                            {row.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </section>

                                {/* ===================== PART 4: Boost vs Super Boost ===================== */}
                                {comparison.length > 0 && (
                                    <>
                                        <h2 style={{ ...sectionTitle, margin: `${U(8)} 0 ${U(4)} ${U(1)}` }}>
                                            Boost vs Super Boost
                                        </h2>
                                        <section
                                            style={{
                                                background: C.white,
                                                border: `${HAIR} solid ${C.border}`,
                                                borderRadius: U(5),
                                                overflow: "hidden",
                                            }}
                                        >
                                            <h3 style={{ margin: 0, padding: `${U(5)} ${U(5)} ${U(4)}`, fontSize: U(4.3), fontWeight: 500 }}>
                                                What&apos;s the difference?
                                            </h3>
                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "1.5fr 1fr 1fr",
                                                    alignItems: "center",
                                                    padding: `${U(3)} ${U(5)}`,
                                                    background: "#f6f6f8",
                                                    fontSize: U(2.9),
                                                    letterSpacing: "0.1em",
                                                    color: C.grey,
                                                    textTransform: "uppercase",
                                                }}
                                            >
                                                <span>Feature</span>
                                                <span style={{ textAlign: "center" }}>Boost</span>
                                                <span style={{ textAlign: "center" }}>Super</span>
                                            </div>
                                            <div style={{ padding: `0 ${U(5)}` }}>
                                                {comparison.map((r, i) => (
                                                    <div
                                                        key={i}
                                                        style={{
                                                            display: "grid",
                                                            gridTemplateColumns: "1.5fr 1fr 1fr",
                                                            alignItems: "center",
                                                            gap: U(1),
                                                            minHeight: U(11.6),
                                                            borderTop: i === 0 ? "none" : `${HAIR} solid ${C.border}`,
                                                            fontSize: U(3.4),
                                                        }}
                                                    >
                                                        <span style={{ minWidth: 0 }}>{r.feature}</span>
                                                        <span style={{ textAlign: "center", fontWeight: 500, color: BOOST_THEME.accent }}>
                                                            {r.boost}
                                                        </span>
                                                        <span style={{ textAlign: "center", fontWeight: 500, color: C.amber }}>
                                                            {r.superBoost}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </>
                                )}

                                {/* ========================== PART 5: premium ========================== */}
                                {showPremium && (
                                    <>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: U(4),
                                                margin: `${U(8)} ${U(-4.2)} 0`,
                                                fontSize: U(3),
                                                letterSpacing: "0.12em",
                                                color: C.grey,
                                                textTransform: "uppercase",
                                            }}
                                        >
                                            <span style={{ flex: 1, height: HAIR, background: C.border }} />
                                            Or get Premium
                                            <span style={{ flex: 1, height: HAIR, background: C.border }} />
                                        </div>
                                        <section
                                            style={{
                                                marginTop: U(5),
                                                display: "flex",
                                                alignItems: "center",
                                                gap: U(4),
                                                padding: `${U(4.4)} ${U(4.6)}`,
                                                borderRadius: U(5),
                                                background: "linear-gradient(100deg, #fff4e0 0%, #fde6ec 100%)",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: U(10.2),
                                                    height: U(10.2),
                                                    borderRadius: U(2.6),
                                                    flexShrink: 0,
                                                    background: "#fbe38a",
                                                    color: C.white,
                                                    fontSize: U(6),
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <Icon name="medal" />
                                            </span>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h3 style={{ margin: 0, fontSize: U(4.1), fontWeight: 500, lineHeight: 1.25 }}>
                                                    {premiumTitle}
                                                </h3>
                                                <p style={{ margin: `${U(1)} 0 0`, fontSize: U(2.9), lineHeight: 1.4, color: C.grey }}>
                                                    {premiumText}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                className="wbs-btn"
                                                onClick={onViewPremium}
                                                style={{
                                                    flexShrink: 0,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: U(1.8),
                                                    height: U(8),
                                                    padding: `0 ${U(4)}`,
                                                    borderRadius: U(4),
                                                    background: "#1f1f24",
                                                    color: C.white,
                                                    fontSize: U(3.2),
                                                    fontWeight: 500,
                                                }}
                                            >
                                                View
                                                <span style={{ fontSize: U(3.2), display: "flex" }}>
                                                    <Icon name="arrow" />
                                                </span>
                                            </button>
                                        </section>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ------------------------- pinned purchase bar ------------------------- */}
                        <footer
                            style={{
                                flex: "0 0 auto",
                                boxSizing: "border-box",
                                padding: `${U(4)} ${U(5)} ${U(4.4)}`,
                                background: C.white,
                                borderTop: `${HAIR} solid ${C.border}`,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    justifyContent: "space-between",
                                    gap: U(3),
                                    padding: `0 ${U(0.4)}`,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: U(3.1),
                                        fontWeight: 500,
                                        letterSpacing: "0.1em",
                                        color: C.grey,
                                        minWidth: 0,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {selected
                                        ? `${selected.quantity} ${theme.plural.toUpperCase()} · ${eachLabel} EACH`
                                        : "SELECT A PACK"}
                                </span>
                                <span style={{ fontSize: U(4.6), fontWeight: 600, whiteSpace: "nowrap" }}>
                                    {selected ? money(currencySymbol, selected.totalPrice) : ""}
                                </span>
                            </div>

                            <button
                                type="button"
                                className="wbs-btn"
                                onClick={handlePurchase}
                                disabled={!selected || buying}
                                style={{
                                    marginTop: U(3.4),
                                    width: "100%",
                                    height: U(13.6),
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: U(2.8),
                                    borderRadius: U(4.2),
                                    background: selected ? theme.ctaBg : "#e6e6ea",
                                    color: selected ? C.white : "#8d8d8d",
                                    fontSize: U(4.1),
                                    fontWeight: 500,
                                    boxShadow: selected ? `0 ${U(1.2)} ${U(3.4)} ${theme.ctaShadow}` : "none",
                                }}
                            >
                                <span style={{ fontSize: U(4.4), display: "flex" }}>
                                    <Icon name={theme.tabIcon} />
                                </span>
                                {buying ? "Processing…" : ctaLabel}
                            </button>

                            <p style={{ margin: `${U(3)} 0 0`, textAlign: "center", fontSize: U(2.9), color: C.greyLight }}>
                                {footnote}
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </main>
    );
}
