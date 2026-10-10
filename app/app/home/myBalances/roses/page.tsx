"use client";

import { useActiveSection } from "@/app/context/ActiveSectionContext";
import { useUserProfileData } from "@/app/context/UserProfileDataContext";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*  RosesStore                                                               */
/*                                                                            */
/*  Backend-driven "buy a pack" screen for Roses.                */
/*                                                                            */
/*  Same rules as ReferAndEarn:                                               */
/*   - fills 100% width / height of its PARENT                                */
/*   - every size is in `cqw` (1% of the parent's width)                      */
/*   - content scrolls vertically, scrollbar hidden                           */
/*   - header (back + title) and purchase bar stay pinned                     */
/*   - no Tailwind / icon library / CSS files needed inside the card          */
/*                                                                            */
/*  Backend mapping (response.data):                                          */
/*    itemType                      -> which store this is                    */
/*    available<Anything>           -> big "available" number                 */
/*    packs[]  (isActive, sortOrder)-> selectable pack cards                  */
/*      title, quantity, pricePerUnit, totalPrice, badge                      */
/*      badge: NONE | MOST_POPULAR | BEST_VALUE                               */
/*    info[]   (isActive, sortOrder)-> "Why it works" rows                    */
/*      title, description, tag (PRIORITY | NEW | null)                       */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */
export type StoreItemType = "COMPLIMENT" | "ROSE";
export type PackBadge = "NONE" | "MOST_POPULAR" | "BEST_VALUE";

export interface StorePack {
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

export interface StoreInfo {
    id: string;
    itemType: string;
    title: string;
    description: string;
    tag: string | null;
    sortOrder: number;
    isActive: boolean;
}

export interface StoreData {
    itemType: string;
    packs: StorePack[];
    info: StoreInfo[];
    /** e.g. availableCompliments / availableRoses */
    [key: string]: unknown;
}

export interface StoreResponse {
    success: boolean;
    message?: string;
    data: StoreData;
}

type IconName =
    | "star" | "trend" | "chat" | "bolt" | "mail" | "sparkles" | "gift"
    | "heart" | "eye" | "check" | "clock" | "quote";

export interface StoreTheme {
    itemType: StoreItemType;
    /** "Compliments" */
    plural: string;
    /** "Compliment" */
    singular: string;

    /** brand colours */
    accent: string;
    accentDeep: string;
    accentSoft: string;
    accentTint: string;
    /** hero overlay gradient (sits above heroImage) */
    heroGradient: string;
    heroImage?: string;

    /* hero copy (not in the API – lives with the theme, overridable by props) */
    eyebrowIcon: IconName;
    eyebrow: string;
    headline: string;
    subline: string;
    perks: { icon: IconName; label: string }[];
    availableLabel: string;
    availableUnit: string;
    availableNote?: string;

    /* sections */
    packsTitle: string;
    infoTitle: string;
    tipTitle: string;
    tipText: string;
    footnote: string;

    /** icon + colours for the info rows, cycled by index */
    infoStyles: { icon: IconName; fg: string; bg: string }[];
}

export interface RosesStoreProps {
    currencySymbol?: string;
    title?: string;
    showHeader?: boolean;
    showBack?: boolean;
    onBack?: () => void;

    /** Overrides for the hero copy that is not part of the API */
    availableNote?: string;
    tipTitle?: string;
    tipText?: string;

    /** Called when the person taps the buy button */
    onPurchase?: (pack: StorePack) => Promise<void> | void;

    fluid?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/* ------------------------------- data hook --------------------------------- */
type Fetcher = (itemType: StoreItemType) => Promise<StoreResponse>;

/**
 * TODO: replace with your real API client / context call.
 * Expected response: { success, message, data: { itemType, packs, info, available... } }
 */
const defaultFetcher: Fetcher = async (itemType) => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "";
    const res = await fetch(`${base}/store?itemType=${itemType}`, { credentials: "include" });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return res.json();
};

export function useStoreData(itemType: StoreItemType, fetcher: Fetcher = defaultFetcher) {
    const [data, setData] = useState<StoreData | null>(null);
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
};

const FONT = "'DM Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const BADGE_LABEL: Record<PackBadge, string> = {
    NONE: "",
    MOST_POPULAR: "Most Popular",
    BEST_VALUE: "Best Value",
};

const TAG_STYLE: Record<string, { fg: string; bg: string } | undefined> = {
    NEW: { fg: "#d98a1a", bg: "#fff3dc" },
};

const money = (symbol: string, v: string | number) => `${symbol}${Number(v).toLocaleString("en-IN")}`;

/** finds availableCompliments / availableRoses / available… in the payload */
const getAvailable = (data?: StoreData | null): number => {
    if (!data) return 0;
    const key = Object.keys(data).find((k) => k.startsWith("available") && typeof data[k] === "number");
    return key ? (data[key] as number) : 0;
};

const svgBase: React.CSSProperties = { width: "1em", height: "1em", display: "block", flexShrink: 0 };
const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

/* ---------------------------------- icons ---------------------------------- */
const ICONS: Record<IconName | "back", React.ReactNode> = {
    back: <path d="M15 5l-7 7 7 7" />,
    star: <path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.2 9.4l6.1-.8L12 3Z" />,
    trend: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
    chat: <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4V6a1 1 0 0 1 1-1Z" />,
    bolt: <path d="M13 2 5 14h6l-1 8 8-12h-6l1-8Z" />,
    mail: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
        </>
    ),
    sparkles: <path d="M10 3l1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.2-1.8L10 3Zm9 10 .9 2.1L22 16l-2.1.9L19 19l-.9-2.1L16 16l2.1-.9L19 13Z" />,
    gift: (
        <>
            <rect x="3" y="9" width="18" height="12" rx="2" />
            <path d="M3 13h18M12 9v12M12 9C9 9 8 6 9.5 5S12 6 12 9Zm0 0c3 0 4-3 2.5-4S12 6 12 9Z" />
        </>
    ),
    heart: <path d="M12 20s-8-4.7-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.300-8 11-8 11Z" />,
    eye: (
        <>
            <path d="M2 12s3.600-7 10-7 10 7 10 7-3.600 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
        </>
    ),
    check: <path d="M5 12.500l4.500 4.500L19 7" />,
    clock: (
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </>
    ),
    quote: <path d="M7 7h4v4c0 3-1.500 5-4 6M15 7h4v4c0 3-1.500 5-4 6" />,
};

const FILLED: IconName[] = ["star", "heart", "quote"];

const Icon = ({ name }: { name: IconName | "back" }) => (
    <svg
        viewBox="0 0 24 24"
        style={svgBase}
        {...stroke}
        strokeWidth={name === "back" ? 2.4 : 2}
        fill={FILLED.includes(name as IconName) ? "currentColor" : "none"}
    >
        {ICONS[name]}
    </svg>
);

const ROSES_THEME: StoreTheme = {
    itemType: "ROSE",
    plural: "Roses",
    singular: "Rose",

    accent: "#e11d2e",
    accentDeep: "#c8101f",
    accentSoft: "#fde4e7",
    accentTint: "#fff0f1",
heroGradient:
    "linear-gradient(to top, rgba(150,25,35,.82) 0%, rgba(120,20,30,.55) 35%, rgba(120,20,30,.12) 80%, rgba(120,20,30,.08) 100%)",    // heroImage: "/images/roses-hero.jpg",

    eyebrowIcon: "star",
    eyebrow: "Stand out",
    headline: "Make the first\nmove count",
    subline: "Roses get 3× more replies. Your profile shows on top with a star.",
    perks: [
        { icon: "star", label: "Stand out instantly" },
        { icon: "trend", label: "They see you first" },
        { icon: "chat", label: "3× more likely to match" },
        { icon: "bolt", label: "Add a note with your like" },
    ],
    availableLabel: "Roses available",
    availableUnit: "roses",
    availableNote: "Each rose puts your profile on top with a star · never expires",

    packsTitle: "Get more roses",
    infoTitle: "Why roses work",
    tipTitle: "Pro tip: Send Roses between 8–10 PM",
    tipText: "That's when match rates are highest — 2× higher than mornings.",
    footnote: "Roses never expire · Used anytime",

    infoStyles: [
        { icon: "star", fg: "#e11d2e", bg: "#fde8ea" },
        { icon: "star", fg: "#e11d2e", bg: "#fde8ea" },
        { icon: "trend", fg: "#22a45d", bg: "#e5f6ec" },
        { icon: "chat", fg: "#e8a23a", bg: "#fff1db" },
        { icon: "heart", fg: "#e83e7a", bg: "#fde6ef" },
    ],
};

/* -------------------------------- component -------------------------------- */
export default function RosesStore({
    currencySymbol = "₹",
    title,
    showHeader = true,
    showBack = true,
    onBack,
    availableNote,
    tipTitle,
    tipText,
    onPurchase,
    fluid = false,
    className,
    style,
}: RosesStoreProps) {
    const theme = ROSES_THEME;
    const { roses: data, rosesLoading: loading, rosesError: error, refetchRoses: onRetry } = useUserProfileData();
    const { setActiveSection } = useActiveSection();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [buying, setBuying] = useState(false);

    /* active + sorted (stable) */
    const packs = useMemo(
        () => (data?.packs ?? []).filter((p) => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
        [data]
    );
    const info = useMemo(
        () => (data?.info ?? []).filter((i) => i.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
        [data]
    );

    /* default pick: the "most popular" pack, else the first one */
    const defaultId = packs.find((p) => p.badge === "MOST_POPULAR")?.id ?? packs[0]?.id ?? null;
    const selected = packs.find((p) => p.id === (selectedId ?? defaultId)) ?? null;

    const available = getAvailable(data);
    const note = availableNote ?? theme.availableNote;
    const pageTitle = title ?? theme.plural;

    const router = useRouter()
    const handleBack = () => {
        router.push("/app/home")
    };
    const handlePurchase = async () => {
        if (!selected || buying) return;
        setBuying(true);
        try {
            await onPurchase?.(selected);
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

    const vars = {
        "--accent": theme.accent,
        "--accent-deep": theme.accentDeep,
    } as React.CSSProperties;

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
                            ...vars,
                            ...style,
                        }}
                    >
                        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .wst-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease; }
        .wst-btn:hover:not(:disabled) { filter: brightness(1.05); }
        .wst-btn:active:not(:disabled) { transform: scale(.98); }
        .wst-btn:disabled { cursor: not-allowed; }
        .wst-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
        .wst-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .wst-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
        @keyframes wst-pulse { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
        .wst-skel { background: #eceef2; animation: wst-pulse 1.2s ease-in-out infinite; }
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
                                    className="wst-btn"
                                    aria-label="Go back"
                                    onClick={handleBack}
                                    style={{
                                        position: "absolute",
                                        left: U(3.1),
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: U(10),
                                        height: U(10),
                                        borderRadius: "50%",
                                        background: C.white,
                                        border: `${HAIR} solid ${C.border}`,
                                        boxShadow: `0 ${U(0.5)} ${U(2)} rgba(0,0,0,.06)`,
                                        color: C.ink,
                                        fontSize: U(4),
                                        display: showBack ? "flex" : "none",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: 0,
                                    }}
                                >
                                    <Icon name="back" />
                                </button>
                                <h1 style={{ margin: 0, fontSize: U(4.3), fontWeight: 600, letterSpacing: "0.02em" }}>
                                    {pageTitle}
                                </h1>
                            </header>
                        )}

                        {/* ------------------------------ scroll ------------------------------ */}
                        <div
                            className="wst-scroll"
                            style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
                        >
                            <div
                                style={{
                                    boxSizing: "border-box",
                                    padding: `${U(1)} ${U(4.2)} ${U(8)}`,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                {/* ============================ PART 1: hero ============================ */}
                                <section
                                    style={{
                                        position: "relative",
                                        padding: `${U(5.4)} ${U(4.6)} ${U(5.2)}`,
                                        borderRadius: U(6),
                                        color: C.white,
                                        background:
                                            `${theme.heroGradient}, url(${`https://ik.imagekit.io/aezmcynwbe/welvors/RosesBg.jpeg`}) center / cover`,                                        boxShadow: `0 ${U(2)} ${U(5)} ${theme.accent}40`,
                                        overflow: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: U(1.8),
                                            fontSize: U(2.6),
                                            fontWeight: 500,
                                            letterSpacing: "0.14em",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        <span style={{ fontSize: U(2.8), display: "flex" }}>
                                            <Icon name={theme.eyebrowIcon} />
                                        </span>
                                        {theme.eyebrow}
                                    </div>

                                    <h2
                                        style={{
                                            margin: `${U(3)} 0 0`,
                                            fontSize: U(6.6),
                                            fontWeight: 600,
                                            lineHeight: 1.1,
                                            letterSpacing: "-0.01em",
                                            whiteSpace: "pre-line",
                                        }}
                                    >
                                        {theme.headline}
                                    </h2>
                                    <p style={{ margin: `${U(3)} 0 0`, fontSize: U(3.4), lineHeight: 1.45, opacity: 0.92 }}>
                                        {theme.subline}
                                    </p>

                                    {/* perks */}
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: `repeat(${theme.perks.length}, minmax(0, 1fr))`,
                                            gap: U(2.2),
                                            marginTop: U(5.4),
                                        }}
                                    >
                                        {theme.perks.map((p, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: U(1.4),
                                                    padding: `${U(3)} ${U(1)}`,
                                                    minHeight: U(14.6),
                                                    boxSizing: "border-box",
                                                    textAlign: "center",
                                                    borderRadius: U(3.6),
                                                    background: "rgba(255,255,255,.14)",
                                                    border: `${HAIR} solid rgba(255,255,255,.3)`,
                                                    fontSize: U(2.4),
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                <span style={{ fontSize: U(3.4), display: "flex" }}>
                                                    <Icon name={p.icon} />
                                                </span>
                                                <span>{p.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* available */}
                                    <div
                                        style={{
                                            marginTop: U(5.2),
                                            fontSize: U(3),
                                            fontWeight: 500,
                                            letterSpacing: "0.1em",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {theme.availableLabel}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "baseline", gap: U(2.4), marginTop: U(1.4) }}>
                                        {loading && !data ? (
                                            <span className="wst-skel" style={{ width: U(14), height: U(10), borderRadius: U(2) }} />
                                        ) : (
                                            <span style={{ fontSize: U(11.5), fontWeight: 500, lineHeight: 1 }}>
                                                {available.toLocaleString("en-IN")}
                                            </span>
                                        )}
                                        <span style={{ fontSize: U(5), fontWeight: 500 }}>{theme.availableUnit}</span>
                                    </div>
                                    {note && (
                                        <p style={{ margin: `${U(3.4)} 0 0`, fontSize: U(2.9), opacity: 0.85 }}>{note}</p>
                                    )}
                                </section>

                                {/* ============================ PART 2: packs ============================ */}
                                <h2 style={{ ...sectionTitle, margin: `${U(8)} 0 ${U(5)} ${U(1)}` }}>{theme.packsTitle}</h2>

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
                                        {onRetry && (
                                            <button
                                                type="button"
                                                className="wst-btn"
                                                onClick={onRetry}
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
                                        )}
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
                                                <div key={i} className="wst-skel" style={{ height: U(36), borderRadius: U(5) }} />
                                            ))
                                            : packs.map((p) => {
                                                const active = p.id === selected?.id;
                                                const badge = BADGE_LABEL[p.badge];
                                                const dark = p.badge === "BEST_VALUE";
                                                return (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={active}
                                                        className="wst-btn"
                                                        onClick={() => setSelectedId(p.id)}
                                                        style={{
                                                            position: "relative",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            padding: `${U(6.4)} ${U(1.4)} ${U(4.4)}`,
                                                            minWidth: 0,
                                                            textAlign: "center",
                                                            borderRadius: U(5),
                                                            background: active ? theme.accentTint : C.white,
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
                                                                    background: dark
                                                                        ? "#1f1f24"
                                                                        : `linear-gradient(135deg, ${theme.accent}, ${theme.accentDeep})`,
                                                                    color: C.white,
                                                                    fontSize: U(2.5),
                                                                    fontWeight: 500,
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
                                                                color: active ? theme.accent : C.ink,
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
                                                        <span style={{ marginTop: U(1.4), fontSize: U(2.4), color: C.greyLight }}>
                                                            {money(currencySymbol, p.totalPrice)} total
                                                        </span>
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
                                    {loading && !info.length
                                        ? [0, 1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="wst-skel"
                                                style={{ height: U(10), borderRadius: U(2), margin: `${U(4)} 0` }}
                                            />
                                        ))
                                        : info.length === 0 ? (
                                            <p style={{ margin: `${U(6)} 0`, textAlign: "center", fontSize: U(3.4), color: "#a9a9a9" }}>
                                                Nothing to show yet
                                            </p>
                                        ) : (
                                            info.map((row, i) => {
                                                const s = theme.infoStyles[i % theme.infoStyles.length];
                                                const tag = row.tag
                                                    ? TAG_STYLE[row.tag] ?? { fg: theme.accentDeep, bg: theme.accentSoft }
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
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    flexWrap: "wrap",
                                                                    gap: U(2),
                                                                }}
                                                            >
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

                                {/* pro tip */}
                                <section
                                    style={{
                                        marginTop: U(5.4),
                                        display: "flex",
                                        alignItems: "center",
                                        gap: U(4),
                                        padding: `${U(4.6)} ${U(4.6)}`,
                                        borderRadius: U(5),
                                        background: "linear-gradient(100deg, #fff4e0 0%, #fde6ec 100%)",
                                    }}
                                >
                                    <span
                                        style={{
                                            width: U(9.2),
                                            height: U(9.2),
                                            borderRadius: U(2.6),
                                            flexShrink: 0,
                                            background: "#f2a73b",
                                            color: C.white,
                                            fontSize: U(4.2),
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Icon name="quote" />
                                    </span>
                                    <div style={{ minWidth: 0 }}>
                                        <h3 style={{ margin: 0, fontSize: U(3.7), fontWeight: 500, lineHeight: 1.25 }}>
                                            {tipTitle ?? theme.tipTitle}
                                        </h3>
                                        <p style={{ margin: `${U(1.2)} 0 0`, fontSize: U(3.1), lineHeight: 1.45, color: C.grey }}>
                                            {tipText ?? theme.tipText}
                                        </p>
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* ------------------------- pinned purchase bar ------------------------- */}
                        <footer
                            style={{
                                flex: "0 0 auto",
                                boxSizing: "border-box",
                                padding: `${U(4)} ${U(5)} ${U(4.4)}`,
                                background: C.page,
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
                                    className="wst-ellipsis"
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
                                        ? `${selected.quantity} ${theme.plural.toUpperCase()}${BADGE_LABEL[selected.badge] ? ` · ${BADGE_LABEL[selected.badge]}` : ""
                                        }`
                                        : "SELECT A PACK"}
                                </span>
                                <span style={{ fontSize: U(4.6), fontWeight: 600, whiteSpace: "nowrap" }}>
                                    {selected ? money(currencySymbol, selected.totalPrice) : ""}
                                </span>
                            </div>

                            <button
                                type="button"
                                className="wst-btn"
                                onClick={handlePurchase}
                                disabled={!selected || buying}
                                style={{
                                    marginTop: U(3.4),
                                    width: "100%",
                                    height: U(13.6),
                                    borderRadius: U(4.2),
                                    background: selected
                                        ? `linear-gradient(135deg, ${theme.accent}, ${theme.accentDeep})`
                                        : "#e6e6ea",
                                    color: selected ? C.white : "#8d8d8d",
                                    fontSize: U(4.1),
                                    fontWeight: 500,
                                    boxShadow: selected ? `0 ${U(1.2)} ${U(3.4)} ${theme.accent}59` : "none",
                                }}
                            >
                                {buying
                                    ? "Processing…"
                                    : selected
                                        ? `Get ${selected.quantity} ${selected.quantity === 1 ? theme.singular : theme.plural
                                        } for ${money(currencySymbol, selected.totalPrice)}`
                                        : "Select a pack"}
                            </button>

                            <p style={{ margin: `${U(3)} 0 0`, textAlign: "center", fontSize: U(2.9), color: C.greyLight }}>
                                {theme.footnote}
                            </p>
                        </footer>
                    </div>
                </div>
            </div>
        </main>
    );
}
