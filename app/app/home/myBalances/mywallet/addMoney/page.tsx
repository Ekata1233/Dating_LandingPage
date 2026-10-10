"use client";

import { useActiveSection } from "@/app/context/ActiveSectionContext";
import { useUserProfileData } from "@/app/context/UserProfileDataContext";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*  AddMoney                                                                  */
/*                                                                            */
/*  Self-contained wallet top-up screen with two tabs: "Add money" | "History"*/
/*  Same rules as the other screens: fills its PARENT, every size in `cqw`,   */
/*  hidden scrollbar, pinned header / tabs / action bar.                      */
/*                                                                            */
/*  NO API RESPONSE WAS PROVIDED FOR THIS SCREEN – the shapes below are an    */
/*  assumption. Adjust the two normalise* functions if yours differ.          */
/*                                                                            */
/*  GET config  -> data: {                                                    */
/*      presets: [{ id, amount, bonus, isActive, sortOrder }],                */
/*      paymentMethods: [{ id, key: "UPI"|"CARD"|"NETBANKING", title,         */
/*                         isActive, sortOrder }],                            */
/*      minAmount?, maxAmount?                                                */
/*  }                                                                         */
/*  GET history -> data: {                                                    */
/*      totalAdded,                                                           */
/*      items: [{ id, reference, method, status: "SUCCESS"|"FAILED"|"PENDING",*/
/*                amountPaid, bonus, credited, detail, createdAt }]           */
/*  }                                                                         */
/*  "detail" is the grey text after the date, e.g. "tanishka@oksbi",          */
/*  "HDFC •••• 4821" or "UPI timed out · not charged".                        */
/*                                                                            */
/*  Usage:                                                                    */
/*    <div style={{ width: 390, height: 800 }}>                               */
/*      <AddMoney fluid onAddMoney={({ amount, method }) => pay(amount)} />   */
/*    </div>                                                                  */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */
export type PaymentMethodKey = "UPI" | "CARD" | "NETBANKING";
export type TopUpStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface TopUpPreset {
    id: string;
    amount: number;
    bonus?: number;
    isActive?: boolean;
    sortOrder?: number;
}

export interface PaymentMethod {
    id: string;
    key: PaymentMethodKey;
    title: string;
    isActive?: boolean;
    sortOrder?: number;
}

export interface TopUpConfig {
    presets: TopUpPreset[];
    paymentMethods: PaymentMethod[];
    minAmount?: number;
    maxAmount?: number;
}

export interface TopUpItem {
    id: string;
    reference: string;
    method: PaymentMethodKey;
    status: TopUpStatus;
    amountPaid: number;
    bonus?: number;
    credited?: number;
    detail?: string;
    createdAt: string;
}

export interface TopUpHistory {
    totalAdded: number;
    items: TopUpItem[];
}

export interface AddMoneyProps {
    title?: string;
    subtitle?: string;
    showHeader?: boolean;
    showBack?: boolean;
    onBack?: () => void;
    currencySymbol?: string;
    defaultAmount?: number;
    defaultTab?: "add" | "history";

    fetchConfig?: () => Promise<TopUpConfig>;
    fetchHistory?: () => Promise<TopUpHistory>;

    /** Start the payment. Throw to show an error toast. */
    onAddMoney?: (payload: { amount: number; method: PaymentMethod }) => Promise<void> | void;

    fluid?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/* ------------------------------- data layer -------------------------------- */
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function getData<T>(path: string): Promise<T> {
    const res = await fetch(`${BASE}${path}`, { credentials: "include" });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const json = await res.json();
    if (!json?.success) throw new Error(json?.message || "Something went wrong");
    return json.data as T;
}

/** TODO: point these at your real endpoints */
const defaultFetchConfig = () => getData<TopUpConfig>("/wallet/topup/config");
const defaultFetchHistory = () => getData<TopUpHistory>("/wallet/topup/history");

function useRemote<T>(loader: () => Promise<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const loaderRef = useRef(loader);


    loaderRef.current = loader;

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setData(await loaderRef.current());
        } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, []);

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
    accent: "#e5567a",
    accentSoft: "#fde4ea",
    ink: "#1f1f24",
    grey: "#8a8a93",
    greyLight: "#b3b3b8",
    border: "#ececf0",
    white: "#ffffff",
    page: "#fafafa",
    green: "#1f9d55",
    red: "#e03d4f",
    amber: "#e8a23a",
};

const FONT = "'DM Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const fmt = (n: number | string) => Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const dayLabel = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()} ${d.toLocaleString("en-IN", { month: "short" })}`;
};

const monthLabel = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) return "This month";
    return d.toLocaleString("en-IN", { month: "long", year: "numeric" });
};

const STATUS: Record<TopUpStatus, { label: string; color: string }> = {
    SUCCESS: { label: "SUCCESS", color: C.green },
    FAILED: { label: "FAILED", color: C.red },
    PENDING: { label: "PENDING", color: C.amber },
};

type IconName = "back" | "phone" | "card" | "bank" | "down" | "chevUp" | "chevDown" | "wallet";

const ICONS: Record<IconName, React.ReactNode> = {
    back: <path d="M15 5l-7 7 7 7" />,
    phone: (
        <>
            <rect x="7" y="2.500" width="10" height="19" rx="2" />
            <path d="M11 18.500h2" />
        </>
    ),
    card: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 10h18M7 15h4" />
        </>
    ),
    bank: <path d="M3 10 12 4l9 6M5 10v8M9.500 10v8M14.500 10v8M19 10v8M3 20h18" />,
    down: <path d="M12 5v14M6 13l6 6 6-6" />,
    chevUp: <path d="m6 15 6-6 6 6" />,
    chevDown: <path d="m6 9 6 6 6-6" />,
    wallet: (
        <>
            <rect x="3" y="6" width="18" height="14" rx="3" />
            <circle cx="15.500" cy="13" r="1.500" />
        </>
    ),
};

const Icon = ({ name, width = 2 }: { name: IconName; width?: number }) => (
    <svg
        viewBox="0 0 24 24"
        style={{ width: "1em", height: "1em", display: "block", flexShrink: 0 }}
        fill="none"
        stroke="currentColor"
        strokeWidth={name === "back" ? 2.4 : width}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {ICONS[name]}
    </svg>
);

const METHOD_ICON: Record<PaymentMethodKey, IconName> = { UPI: "phone", CARD: "card", NETBANKING: "bank" };
const METHOD_TILE: Record<PaymentMethodKey, { fg: string; bg: string }> = {
    UPI: { fg: "#2eae6b", bg: "#e5f6ec" },
    CARD: { fg: "#f0a21a", bg: "#fff1db" },
    NETBANKING: { fg: "#3b6fd6", bg: "#e6eefb" },
};

const Coin = () => (
    <svg viewBox="0 0 24 24" style={{ width: "1em", height: "1em", display: "block" }}>
        <circle cx="12" cy="12" r="11" fill="#f5a300" />
        <text x="12" y="16.500" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="Arial">
            $
        </text>
    </svg>
);

/* -------------------------------- component -------------------------------- */
type Filter = "ALL" | TopUpStatus;

export default function AddMoney({
    title = "Add money",
    subtitle = "Top up your Welvors wallet — instant, secure.",
    showHeader = true,
    showBack = true,
    onBack,
    currencySymbol = "₹",
    defaultAmount = 500,
    defaultTab = "add",
    fetchConfig = defaultFetchConfig,
    fetchHistory = defaultFetchHistory,
    onAddMoney: onAddMoneyProp,
    fluid = false,
    className,
    style,
}: AddMoneyProps) {
    const { setActiveSection } = useActiveSection();
    const { addMoney } = useUserProfileData();
    const [tab, setTab] = useState<"add" | "history">(defaultTab);
    const [amountText, setAmountText] = useState(String(defaultAmount));
    const [methodId, setMethodId] = useState<string | null>(null);
    const [filter, setFilter] = useState<Filter>("ALL");
    const [paying, setPaying] = useState(false);
    const router = useRouter()
    const cfg = useRemote(fetchConfig);
    const hist = useRemote(fetchHistory);

    const presets = useMemo(
        () => (cfg.data?.presets ?? []).filter((p) => p.isActive !== false).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        [cfg.data]
    );
    const methods = useMemo(
        () =>
            (cfg.data?.paymentMethods ?? [])
                .filter((m) => m.isActive !== false)
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
        [cfg.data]
    );
    const method = methods.find((m) => m.id === methodId) ?? methods[0] ?? null;

    const amount = Number(amountText) || 0;
    const minAmount = cfg.data?.minAmount ?? 1;
    const maxAmount = cfg.data?.maxAmount ?? Infinity;
    const matchedPreset = presets.find((p) => p.amount === amount);
    const bonus = matchedPreset?.bonus ?? 0;
    const canPay = !!method && amount >= minAmount && amount <= maxAmount && !paying;

    /* history */
    const items = useMemo(
        () => [...(hist.data?.items ?? [])].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
        [hist.data]
    );
    const counts: Record<Filter, number> = {
        ALL: items.length,
        SUCCESS: items.filter((i) => i.status === "SUCCESS").length,
        FAILED: items.filter((i) => i.status === "FAILED").length,
        PENDING: items.filter((i) => i.status === "PENDING").length,
    };
    const shown = items.filter((i) => filter === "ALL" || i.status === filter);
    const groups = useMemo(() => {
        const out: { label: string; rows: TopUpItem[] }[] = [];
        shown.forEach((i) => {
            const label = monthLabel(i.createdAt);
            const g = out.find((x) => x.label === label);
            if (g) g.rows.push(i);
            else out.push({ label, rows: [i] });
        });
        return out;
    }, [shown]);

    const handleBack = () => {
        router.push("/app/home/myBalances/mywallet")
    }; const step = (d: number) => setAmountText(String(Math.max(0, amount + d)));

    const handlePay = async () => {
        if (!canPay || !method) return;
        setPaying(true);
        try {
            if (onAddMoneyProp) {
                await onAddMoneyProp({ amount, method });
            } else {
                const res = await addMoney({ amount, method: method.key });
                if (res && !res.success) {
                    throw new Error(res.message || "Payment failed. Please try again.");
                }
            }
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Payment failed. Please try again.");
        } finally {
            setPaying(false);
        }
    };

    const label: React.CSSProperties = {
        margin: `${U(8)} 0 ${U(3.4)} ${U(1)}`,
        fontSize: U(2.9),
        fontWeight: 500,
        letterSpacing: "0.12em",
        color: C.greyLight,
        textTransform: "uppercase",
    };

    const card: React.CSSProperties = {
        background: C.white,
        borderRadius: U(4.6),
        boxShadow: `0 ${U(0.8)} ${U(3)} rgba(0,0,0,.05)`,
    };

    const radio = (on: boolean) => (
        <span
            aria-hidden
            style={{
                width: U(5.6),
                height: U(5.6),
                borderRadius: "50%",
                boxSizing: "border-box",
                flexShrink: 0,
                border: `${U(0.4)} solid ${on ? C.accent : "#dcdce0"}`,
                background: on ? C.accent : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {on && <span style={{ width: U(2), height: U(2), borderRadius: "50%", background: C.white }} />}
        </span>
    );

    const tabs: { key: "add" | "history"; text: string; count?: number }[] = [
        { key: "add", text: "Add money" },
        { key: "history", text: "History", count: counts.ALL },
    ];

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
        .wam-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease; }
        .wam-btn:hover:not(:disabled) { filter: brightness(1.04); }
        .wam-btn:active:not(:disabled) { transform: scale(.985); }
        .wam-btn:disabled { cursor: not-allowed; }
        .wam-btn:focus-visible, .wam-input:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; }
        .wam-scroll, .wam-chips { scrollbar-width: none; -ms-overflow-style: none; }
        .wam-scroll::-webkit-scrollbar, .wam-chips::-webkit-scrollbar { display: none; width: 0; height: 0; }
        @keyframes wam-pulse { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
        .wam-skel { background: #eceef2; animation: wam-pulse 1.2s ease-in-out infinite; }
      `}</style>

                        {/* ------------------------------ header ------------------------------ */}
                        {showHeader && (
                            <header
                                style={{
                                    flex: "0 0 auto",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: U(5),
                                    padding: `${U(4)} ${U(5)} ${U(3)}`,
                                }}
                            >
                                <button
                                    type="button"
                                    className="wam-btn"
                                    aria-label="Go back"
                                    onClick={handleBack}
                                    style={{
                                        width: U(10),
                                        height: U(10),
                                        borderRadius: "50%",
                                        background: C.white,
                                        border: `${HAIR} solid ${C.border}`,
                                        boxShadow: `0 ${U(0.5)} ${U(2)} rgba(0,0,0,.06)`,
                                        color: C.ink,
                                        fontSize: U(4.2),
                                        display: showBack ? "flex" : "none",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: 0,
                                        flexShrink: 0,
                                    }}
                                >
                                    <Icon name="back" />
                                </button>
                                <h1 style={{ margin: 0, fontSize: U(4.5), fontWeight: 500 }}>{title}</h1>
                            </header>
                        )}

                        {/* ------------------------------- tabs ------------------------------- */}
                        <div
                            role="tablist"
                            style={{
                                flex: "0 0 auto",
                                margin: `0 ${U(4.2)}`,
                                display: "flex",
                                gap: U(8),
                                padding: `0 ${U(1.6)}`,
                                borderBottom: `${HAIR} solid ${C.border}`,
                            }}
                        >
                            {tabs.map((t) => {
                                const active = tab === t.key;
                                return (
                                    <button
                                        key={t.key}
                                        role="tab"
                                        aria-selected={active}
                                        type="button"
                                        className="wam-btn"
                                        onClick={() => setTab(t.key)}
                                        style={{
                                            background: "transparent",
                                            padding: `${U(3.6)} 0 ${U(2.6)}`,
                                            marginBottom: `calc(${HAIR} * -1)`,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: U(2.2),
                                            fontSize: U(3.9),
                                            fontWeight: active ? 500 : 400,
                                            color: active ? C.ink : C.greyLight,
                                            borderBottom: `${U(0.8)} solid ${active ? C.accent : "transparent"}`,
                                            borderRadius: 0,
                                        }}
                                    >
                                        {t.text}
                                        {t.count !== undefined && (
                                            <span
                                                style={{
                                                    minWidth: U(5.4),
                                                    height: U(5.4),
                                                    padding: `0 ${U(1.2)}`,
                                                    boxSizing: "border-box",
                                                    borderRadius: U(2.7),
                                                    background: active ? C.accentSoft : "#ececf0",
                                                    color: active ? C.accent : C.grey,
                                                    fontSize: U(2.8),
                                                    fontWeight: 500,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {t.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* ------------------------------ scroll ------------------------------ */}
                        <div className="wam-scroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
                            <div style={{ boxSizing: "border-box", padding: `${U(6)} ${U(4.2)} ${U(8)}` }}>
                                {/* ===================== ADD MONEY TAB ===================== */}
                                {tab === "add" && (
                                    <>
                                        <h2 style={{ margin: `0 0 0 ${U(1.6)}`, fontSize: U(5.8), fontWeight: 500 }}>{title}</h2>
                                        <p style={{ margin: `${U(3)} 0 0 ${U(1.6)}`, fontSize: U(3.4), color: C.grey }}>{subtitle}</p>

                                        {cfg.error && !presets.length ? (
                                            <div style={{ ...card, marginTop: U(6), padding: `${U(6)} ${U(4)}`, textAlign: "center" }}>
                                                <p style={{ margin: 0, fontSize: U(3.4), color: C.grey }}>{cfg.error}</p>
                                                <button
                                                    type="button"
                                                    className="wam-btn"
                                                    onClick={cfg.reload}
                                                    style={{
                                                        marginTop: U(4),
                                                        height: U(10),
                                                        padding: `0 ${U(6)}`,
                                                        borderRadius: U(5),
                                                        background: C.accentSoft,
                                                        color: C.accent,
                                                        fontSize: U(3.5),
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Try again
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {/* presets */}
                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                                                        gap: U(3),
                                                        marginTop: U(6.4),
                                                    }}
                                                >
                                                    {cfg.loading && !presets.length
                                                        ? [0, 1, 2, 3, 4, 5].map((i) => (
                                                            <div key={i} className="wam-skel" style={{ height: U(12), borderRadius: U(3.4) }} />
                                                        ))
                                                        : presets.map((p) => {
                                                            const on = p.amount === amount;
                                                            return (
                                                                <button
                                                                    key={p.id}
                                                                    type="button"
                                                                    className="wam-btn"
                                                                    aria-pressed={on}
                                                                    onClick={() => setAmountText(String(p.amount))}
                                                                    style={{
                                                                        minHeight: U(12),
                                                                        padding: `${U(2.4)} ${U(1)}`,
                                                                        display: "flex",
                                                                        flexDirection: "column",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        gap: U(1),
                                                                        borderRadius: U(3.4),
                                                                        background: on ? "#fbe3e9" : C.white,
                                                                        border: `${U(0.4)} solid ${on ? C.accent : "transparent"}`,
                                                                        boxShadow: on ? "none" : `0 ${U(0.8)} ${U(3)} rgba(0,0,0,.05)`,
                                                                        color: on ? C.accent : C.ink,
                                                                        fontSize: U(4.2),
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    {currencySymbol}
                                                                    {p.amount}
                                                                    {!!p.bonus && (
                                                                        <span style={{ fontSize: U(2.6), fontWeight: 400, color: C.green }}>
                                                                            +{p.bonus} bonus
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                </div>

                                                {/* custom amount */}
                                                <div
                                                    style={{
                                                        ...card,
                                                        marginTop: U(4),
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: U(2.4),
                                                        height: U(14.4),
                                                        padding: `0 ${U(5)}`,
                                                        borderRadius: U(3.6),
                                                    }}
                                                >
                                                    <span style={{ fontSize: U(5.4), fontWeight: 500 }}>{currencySymbol}</span>
                                                    <input
                                                        className="wam-input"
                                                        inputMode="numeric"
                                                        aria-label="Amount"
                                                        value={amountText}
                                                        onChange={(e) => setAmountText(e.target.value.replace(/\D/g, "").slice(0, 7))}
                                                        style={{
                                                            flex: 1,
                                                            minWidth: 0,
                                                            border: 0,
                                                            outline: "none",
                                                            background: "transparent",
                                                            fontFamily: "inherit",
                                                            fontSize: U(5.4),
                                                            fontWeight: 500,
                                                            color: C.ink,
                                                        }}
                                                    />
                                                    <span style={{ display: "flex", flexDirection: "column", color: C.grey, fontSize: U(3.4) }}>
                                                        <button
                                                            type="button"
                                                            className="wam-btn"
                                                            aria-label="Increase amount"
                                                            onClick={() => step(100)}
                                                            style={{ background: "transparent", color: "inherit", padding: 0, display: "flex" }}
                                                        >
                                                            <Icon name="chevUp" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="wam-btn"
                                                            aria-label="Decrease amount"
                                                            onClick={() => step(-100)}
                                                            style={{ background: "transparent", color: "inherit", padding: 0, display: "flex" }}
                                                        >
                                                            <Icon name="chevDown" />
                                                        </button>
                                                    </span>
                                                </div>
                                                {bonus > 0 ? (
                                                    <p style={{ margin: `${U(2.4)} 0 0 ${U(2)}`, fontSize: U(3), color: C.green }}>
                                                        You&apos;ll get +{currencySymbol}
                                                        {fmt(bonus)} bonus coins
                                                    </p>
                                                ) : amount > 0 && amount < minAmount ? (
                                                    <p style={{ margin: `${U(2.4)} 0 0 ${U(2)}`, fontSize: U(3), color: C.red }}>
                                                        Minimum amount is {currencySymbol}
                                                        {fmt(minAmount)}
                                                    </p>
                                                ) : null}

                                                {/* methods */}
                                                <h3 style={label}>Pay using</h3>
                                                <div role="radiogroup" aria-label="Payment method" style={{ display: "flex", flexDirection: "column", gap: U(3.2) }}>
                                                    {cfg.loading && !methods.length
                                                        ? [0, 1, 2].map((i) => (
                                                            <div key={i} className="wam-skel" style={{ height: U(14.4), borderRadius: U(3.6) }} />
                                                        ))
                                                        : methods.map((m) => {
                                                            const on = m.id === method?.id;
                                                            const tile = METHOD_TILE[m.key];
                                                            return (
                                                                <button
                                                                    key={m.id}
                                                                    type="button"
                                                                    role="radio"
                                                                    aria-checked={on}
                                                                    className="wam-btn"
                                                                    onClick={() => setMethodId(m.id)}
                                                                    style={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        gap: U(4),
                                                                        height: U(14.4),
                                                                        padding: `0 ${U(4.4)}`,
                                                                        textAlign: "left",
                                                                        borderRadius: U(3.6),
                                                                        background: on ? "#fbe3e9" : C.white,
                                                                        border: `${U(0.4)} solid ${on ? C.accent : C.border}`,
                                                                        color: C.ink,
                                                                        fontSize: U(3.7),
                                                                    }}
                                                                >
                                                                    <span
                                                                        style={{
                                                                            width: U(8.2),
                                                                            height: U(8.2),
                                                                            borderRadius: U(2.2),
                                                                            background: C.white,
                                                                            color: tile.fg,
                                                                            fontSize: U(4.6),
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            boxShadow: `0 0 0 ${HAIR} ${C.border}`,
                                                                        }}
                                                                    >
                                                                        <Icon name={METHOD_ICON[m.key]} />
                                                                    </span>
                                                                    <span style={{ flex: 1, minWidth: 0 }}>{m.title}</span>
                                                                    {radio(on)}
                                                                </button>
                                                            );
                                                        })}
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* ======================= HISTORY TAB ======================= */}
                                {tab === "history" && (
                                    <>
                                        {/* total added */}
                                        <section
                                            style={{
                                                position: "relative",
                                                padding: `${U(5.4)} ${U(5.4)} ${U(5.6)}`,
                                                borderRadius: U(5.6),
                                                background: "linear-gradient(135deg, #eafcf0, #d4f6e0)",
                                                border: `${U(0.4)} solid #a9e8c0`,
                                                boxShadow: "0 8px 22px rgba(60,190,120,.18)",
                                                overflow: "hidden",
                                                color: "#14532d",
                                            }}
                                        >
                                            <span
                                                aria-hidden
                                                style={{
                                                    position: "absolute",
                                                    right: U(4),
                                                    top: U(4),
                                                    fontSize: U(21),
                                                    color: "#bfeccf",
                                                    display: "flex",
                                                }}
                                            >
                                                <Icon name="wallet" width={1.6} />
                                            </span>
                                            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: U(3.4) }}>
                                                <span
                                                    style={{
                                                        width: U(8.6),
                                                        height: U(8.6),
                                                        borderRadius: U(2.4),
                                                        background: C.white,
                                                        color: "#1f8a4c",
                                                        fontSize: U(4.2),
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Icon name="down" />
                                                </span>
                                                <span style={{ fontSize: U(3.4), fontWeight: 500, letterSpacing: "0.16em" }}>TOTAL ADDED</span>
                                            </div>
                                            <div style={{ position: "relative", marginTop: U(6), fontSize: U(8.4), fontWeight: 500, lineHeight: 1 }}>
                                                {hist.loading && !hist.data ? (
                                                    <span className="wam-skel" style={{ display: "inline-block", width: U(34), height: U(8), borderRadius: U(2) }} />
                                                ) : (
                                                    <>
                                                        {currencySymbol}
                                                        {fmt(hist.data?.totalAdded ?? 0)}
                                                    </>
                                                )}
                                            </div>
                                            <div style={{ position: "relative", marginTop: U(4), fontSize: U(3.5), color: "#3f9b66" }}>
                                                Lifetime wallet top-ups
                                            </div>
                                        </section>

                                        {/* filters */}
                                        <div
                                            className="wam-chips"
                                            role="tablist"
                                            style={{ display: "flex", gap: U(3), marginTop: U(5.4), overflowX: "auto", paddingBottom: U(1) }}
                                        >
                                            {(
                                                [
                                                    ["ALL", "All"],
                                                    ["SUCCESS", "Success"],
                                                    ["FAILED", "Failed"],
                                                ] as [Filter, string][]
                                            ).map(([key, text]) => {
                                                const on = filter === key;
                                                return (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        role="tab"
                                                        aria-selected={on}
                                                        className="wam-btn"
                                                        onClick={() => setFilter(key)}
                                                        style={{
                                                            flexShrink: 0,
                                                            height: U(9.6),
                                                            padding: `0 ${U(4.4)}`,
                                                            borderRadius: U(5),
                                                            background: on ? C.accentSoft : C.white,
                                                            border: `${U(0.4)} solid ${on ? C.accent : C.border}`,
                                                            color: on ? C.accent : C.ink,
                                                            fontSize: U(3.5),
                                                            fontWeight: 500,
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {text} {counts[key]}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* list */}
                                        {hist.error && !items.length ? (
                                            <div style={{ ...card, marginTop: U(6), padding: `${U(6)} ${U(4)}`, textAlign: "center" }}>
                                                <p style={{ margin: 0, fontSize: U(3.4), color: C.grey }}>{hist.error}</p>
                                                <button
                                                    type="button"
                                                    className="wam-btn"
                                                    onClick={hist.reload}
                                                    style={{
                                                        marginTop: U(4),
                                                        height: U(10),
                                                        padding: `0 ${U(6)}`,
                                                        borderRadius: U(5),
                                                        background: C.accentSoft,
                                                        color: C.accent,
                                                        fontSize: U(3.5),
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Try again
                                                </button>
                                            </div>
                                        ) : hist.loading && !items.length ? (
                                            <div className="wam-skel" style={{ height: U(40), borderRadius: U(5), marginTop: U(6) }} />
                                        ) : groups.length === 0 ? (
                                            <p style={{ margin: `${U(10)} 0`, textAlign: "center", fontSize: U(3.4), color: "#a9a9a9" }}>
                                                No transactions yet
                                            </p>
                                        ) : (
                                            groups.map((g) => (
                                                <div key={g.label}>
                                                    <h3 style={{ ...label, margin: `${U(7)} 0 ${U(3.4)} ${U(1)}` }}>{g.label}</h3>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: U(4) }}>
                                                        {g.rows.map((r) => {
                                                            const st = STATUS[r.status];
                                                            const tile =
                                                                r.status === "FAILED"
                                                                    ? { fg: C.red, bg: "#fde6e8" }
                                                                    : METHOD_TILE[r.method];
                                                            const name =
                                                                r.status === "FAILED"
                                                                    ? "Add money failed"
                                                                    : `Added via ${r.method === "UPI" ? "UPI" : r.method === "CARD" ? "Card" : "Net Banking"}`;
                                                            const detailed = r.status === "SUCCESS" && (r.bonus || r.credited);
                                                            return (
                                                                <article key={r.id} style={{ ...card, padding: `${U(4.4)} ${U(4.4)} ${U(4)}`, borderRadius: U(5) }}>
                                                                    <div style={{ display: "flex", alignItems: "center", gap: U(3.6) }}>
                                                                        <span
                                                                            style={{
                                                                                width: U(11),
                                                                                height: U(11),
                                                                                borderRadius: U(3),
                                                                                flexShrink: 0,
                                                                                background: tile.bg,
                                                                                color: tile.fg,
                                                                                fontSize: U(5.4),
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                                justifyContent: "center",
                                                                            }}
                                                                        >
                                                                            <Icon name={METHOD_ICON[r.method]} />
                                                                        </span>
                                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                                            <div style={{ fontSize: U(3.9), fontWeight: 500 }}>{name}</div>
                                                                            <div
                                                                                style={{
                                                                                    marginTop: U(1.2),
                                                                                    fontSize: U(3.1),
                                                                                    color: C.grey,
                                                                                    overflow: "hidden",
                                                                                    textOverflow: "ellipsis",
                                                                                    whiteSpace: "nowrap",
                                                                                }}
                                                                            >
                                                                                {dayLabel(r.createdAt)}
                                                                                {r.detail ? ` · ${r.detail}` : ""}
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                                                                            <div style={{ fontSize: U(4), fontWeight: 500, color: st.color }}>
                                                                                +{currencySymbol}
                                                                                {fmt(r.amountPaid)}
                                                                            </div>
                                                                            <div style={{ marginTop: U(1.2), fontSize: U(2.7), fontWeight: 500, letterSpacing: "0.08em", color: st.color }}>
                                                                                {st.label}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {detailed && (
                                                                        <div
                                                                            style={{
                                                                                marginTop: U(4),
                                                                                paddingTop: U(3.6),
                                                                                borderTop: `${U(0.4)} dashed ${C.border}`,
                                                                                display: "flex",
                                                                                flexDirection: "column",
                                                                                gap: U(2.4),
                                                                                fontSize: U(3.3),
                                                                            }}
                                                                        >
                                                                            <div style={{ display: "flex", justifyContent: "space-between", color: C.grey }}>
                                                                                <span>Amount paid</span>
                                                                                <span style={{ color: C.ink, fontWeight: 500 }}>
                                                                                    {currencySymbol}
                                                                                    {fmt(r.amountPaid)}
                                                                                </span>
                                                                            </div>
                                                                            {!!r.bonus && (
                                                                                <div style={{ display: "flex", justifyContent: "space-between", color: C.grey }}>
                                                                                    <span>Bonus coins</span>
                                                                                    <span style={{ color: C.green, fontWeight: 500 }}>
                                                                                        +{currencySymbol}
                                                                                        {fmt(r.bonus)}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            <div style={{ display: "flex", justifyContent: "space-between", color: C.grey }}>
                                                                                <span>Credited to wallet</span>
                                                                                <span style={{ color: C.ink, fontWeight: 500, display: "flex", alignItems: "center", gap: U(1.6) }}>
                                                                                    <span style={{ fontSize: U(4.2), display: "flex" }}>
                                                                                        <Coin />
                                                                                    </span>
                                                                                    {fmt(r.credited ?? r.amountPaid + (r.bonus ?? 0))}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div style={{ marginTop: U(3.6), fontSize: U(2.9), letterSpacing: "0.04em", color: C.grey }}>
                                                                        {r.reference}
                                                                    </div>
                                                                </article>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* ------------------------- pinned action bar ------------------------- */}
                        {tab === "add" && (
                            <footer style={{ flex: "0 0 auto", padding: `${U(3.4)} ${U(4.2)} ${U(5)}`, background: C.page }}>
                                <button
                                    type="button"
                                    className="wam-btn"
                                    onClick={handlePay}
                                    disabled={!canPay}
                                    style={{
                                        width: "100%",
                                        height: U(13.9),
                                        borderRadius: U(3.6),
                                        background: canPay ? C.accent : "#e6e6ea",
                                        color: canPay ? C.white : "#8d8d8d",
                                        fontSize: U(4.1),
                                        fontWeight: 500,
                                    }}
                                >
                                    {paying ? "Processing…" : `Add ${currencySymbol}${amount ? fmt(amount) : ""}`}
                                </button>
                            </footer>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
