"use client";

import { useActiveSection } from "@/app/context/ActiveSectionContext";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*  WithdrawMoney                                                             */
/*                                                                            */
/*  Self-contained wallet withdrawal screen: "Withdraw" | "History" tabs.     */
/*  Same rules as the other screens: fills its PARENT, every size in `cqw`,   */
/*  hidden scrollbar, pinned header / tabs / action bar.                      */
/*                                                                            */
/*  NO API RESPONSE WAS PROVIDED FOR THIS SCREEN – the shapes below are an    */
/*  assumption. Adjust them in one place (the types + fetch functions).       */
/*                                                                            */
/*  GET config  -> data: {                                                    */
/*      availableBalance,                 -> "Available balance: ₹500"        */
/*      serviceChargePercent,             -> 25  (drives the whole preview)   */
/*      minAmount?,                                                           */
/*      accounts: [{ id, type: "BANK"|"UPI", label, isActive? }]              */
/*                  label e.g. "HDFC •••• 1234" or "tanishka@oksbi"           */
/*  }                                                                         */
/*  GET history -> data: {                                                    */
/*      totalReceived,                    -> "TOTAL RECEIVED IN BANK"         */
/*      items: [{ id, reference, status: "PROCESSING"|"PROCESSED"|"REVERSED", */
/*                destinationType: "BANK"|"UPI", destinationLabel,            */
/*                amount, serviceCharge, netAmount, createdAt }]              */
/*  }                                                                         */
/*                                                                            */
/*  Usage:                                                                    */
/*    <div style={{ width: 390, height: 800 }}>                               */
/*      <WithdrawMoney fluid onWithdraw={({ amount, account }) => go()} />    */
/*    </div>                                                                  */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */
export type PayoutType = "BANK" | "UPI";
export type WithdrawStatus = "PROCESSING" | "PROCESSED" | "REVERSED";

export interface PayoutAccount {
    id: string;
    type: PayoutType;
    label: string;
    isActive?: boolean;
}

export interface WithdrawConfig {
    availableBalance: number;
    serviceChargePercent: number;
    minAmount?: number;
    accounts: PayoutAccount[];
}

export interface WithdrawItem {
    id: string;
    reference: string;
    status: WithdrawStatus;
    destinationType: PayoutType;
    destinationLabel: string;
    amount: number;
    serviceCharge: number;
    netAmount: number;
    createdAt: string;
}

export interface WithdrawHistory {
    totalReceived: number;
    items: WithdrawItem[];
}

export interface WithdrawMoneyProps {
    title?: string;
    heading?: string;
    subtitle?: string;
    showHeader?: boolean;
    showBack?: boolean;
    onBack?: () => void;
    /** "Cancel" button. Defaults to the same as back */
    onCancel?: () => void;
    currencySymbol?: string;
    defaultTab?: "withdraw" | "history";

    fetchConfig?: () => Promise<WithdrawConfig>;
    fetchHistory?: () => Promise<WithdrawHistory>;

    /** Start the withdrawal. Throw to show an error toast. */
    onWithdraw?: (payload: {
        amount: number;
        serviceCharge: number;
        netAmount: number;
        account: PayoutAccount;
    }) => Promise<void> | void;

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
const defaultFetchConfig = () => getData<WithdrawConfig>("/wallet/withdraw/config");
const defaultFetchHistory = () => getData<WithdrawHistory>("/wallet/withdraw/history");

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
    accentText: "#d9466b",
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
const round2 = (n: number) => Math.round(n * 100) / 100;

const dayLabel = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()} ${d.toLocaleString("en-IN", { month: "short" })}`;
};

const monthLabel = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) return "This month";
    return d.toLocaleString("en-IN", { month: "long", year: "numeric" }).toUpperCase();
};

const STATUS: Record<WithdrawStatus, { label: string; color: string; netLabel: string; text: string }> = {
    PROCESSING: { label: "PROCESSING", color: C.amber, netLabel: "You will receive", text: "Processing" },
    PROCESSED: { label: "PROCESSED", color: C.green, netLabel: "Received in bank", text: "Processed" },
    REVERSED: { label: "REVERSED", color: C.red, netLabel: "Refunded to wallet", text: "Reversed" },
};

type IconName = "back" | "phone" | "bank" | "up" | "warn";

const ICONS: Record<IconName, React.ReactNode> = {
    back: <path d="M15 5l-7 7 7 7" />,
    phone: (
        <>
            <rect x="7" y="2.500" width="10" height="19" rx="2" />
            <path d="M11 18.500h2" />
        </>
    ),
    bank: <path d="M3 10 12 4l9 6M5 10v8M9.500 10v8M14.500 10v8M19 10v8M3 20h18" />,
    up: <path d="M12 19V5M6 11l6-6 6 6" />,
    warn: (
        <>
            <path d="M12 3 2 20h20L12 3Z" />
            <path d="M12 10v4M12 17h.01" />
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

const TYPE_ICON: Record<PayoutType, IconName> = { BANK: "bank", UPI: "phone" };
const TYPE_TILE: Record<PayoutType, { fg: string; bg: string }> = {
    BANK: { fg: "#f0a21a", bg: "#fff1db" },
    UPI: { fg: "#2eae6b", bg: "#e5f6ec" },
};

/* -------------------------------- component -------------------------------- */
type Filter = "ALL" | WithdrawStatus;

export default function WithdrawMoney({
    title = "Withdraw",
    heading = "Withdraw to bank",
    subtitle = "Move wallet balance to your bank or UPI.",
    showHeader = true,
    showBack = true,
    onBack,
    onCancel,
    currencySymbol = "₹",
    defaultTab = "withdraw",
    fetchConfig = defaultFetchConfig,
    fetchHistory = defaultFetchHistory,
    onWithdraw,
    fluid = false,
    className,
    style,
}: WithdrawMoneyProps) {
    const { setActiveSection } = useActiveSection();
    const [tab, setTab] = useState<"withdraw" | "history">(defaultTab);
    const [amountText, setAmountText] = useState<string | null>(null); // null = not touched -> full balance
    const [accountId, setAccountId] = useState<string | null>(null);
    const [filter, setFilter] = useState<Filter>("ALL");
    const [busy, setBusy] = useState(false);
    const router = useRouter()

    const cfg = useRemote(fetchConfig);
    const hist = useRemote(fetchHistory);

    const balance = cfg.data?.availableBalance ?? 0;
    const pct = cfg.data?.serviceChargePercent ?? 0;
    const minAmount = cfg.data?.minAmount ?? 1;
    const accounts = useMemo(() => (cfg.data?.accounts ?? []).filter((a) => a.isActive !== false), [cfg.data]);
    const account = accounts.find((a) => a.id === accountId) ?? accounts[0] ?? null;

    const amount = amountText === null ? balance : Number(amountText) || 0;
    const charge = round2((amount * pct) / 100);
    const net = round2(amount - charge);
    const tooMuch = amount > balance;
    const tooLittle = amount > 0 && amount < minAmount;
    const canGo = !!account && amount >= minAmount && !tooMuch && !busy;

    /* history */
    const items = useMemo(
        () => [...(hist.data?.items ?? [])].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
        [hist.data]
    );
    const counts: Record<Filter, number> = {
        ALL: items.length,
        PROCESSED: items.filter((i) => i.status === "PROCESSED").length,
        PROCESSING: items.filter((i) => i.status === "PROCESSING").length,
        REVERSED: items.filter((i) => i.status === "REVERSED").length,
    };
    const shown = items.filter((i) => filter === "ALL" || i.status === filter);
    const groups = useMemo(() => {
        const out: { label: string; rows: WithdrawItem[] }[] = [];
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
    };
    const handleWithdraw = async () => {
        if (!canGo || !account) return;
        setBusy(true);
        try {
            await onWithdraw?.({ amount, serviceCharge: charge, netAmount: net, account });
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Withdrawal failed. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    const label: React.CSSProperties = {
        margin: `${U(7)} 0 ${U(3.4)} ${U(1)}`,
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

    const retry = (msg: string, fn: () => void) => (
        <div style={{ ...card, marginTop: U(6), padding: `${U(6)} ${U(4)}`, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: U(3.4), color: C.grey }}>{msg}</p>
            <button
                type="button"
                className="wwd-btn"
                onClick={fn}
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
    );

    const tabs: { key: "withdraw" | "history"; text: string; count?: number }[] = [
        { key: "withdraw", text: "Withdraw" },
        { key: "history", text: "History", count: counts.ALL },
    ];

    const filters: [Filter, string][] = [
        ["ALL", "All"],
        ["PROCESSED", "Processed"],
        ["PROCESSING", "Processing"],
        ["REVERSED", "Reversed"],
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
        .wwd-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease; }
        .wwd-btn:hover:not(:disabled) { filter: brightness(1.04); }
        .wwd-btn:active:not(:disabled) { transform: scale(.985); }
        .wwd-btn:disabled { cursor: not-allowed; }
        .wwd-btn:focus-visible, .wwd-input:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; }
        .wwd-scroll, .wwd-chips { scrollbar-width: none; -ms-overflow-style: none; }
        .wwd-scroll::-webkit-scrollbar, .wwd-chips::-webkit-scrollbar { display: none; width: 0; height: 0; }
        @keyframes wwd-pulse { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
        .wwd-skel { background: #eceef2; animation: wwd-pulse 1.2s ease-in-out infinite; }
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
                                    className="wwd-btn"
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
                                        className="wwd-btn"
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
                        <div className="wwd-scroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
                            <div style={{ boxSizing: "border-box", padding: `${U(6)} ${U(4.2)} ${U(8)}` }}>
                                {/* ===================== WITHDRAW TAB ===================== */}
                                {tab === "withdraw" && (
                                    <>
                                        <h2 style={{ margin: `0 0 0 ${U(1.6)}`, fontSize: U(5.8), fontWeight: 500 }}>{heading}</h2>
                                        <p style={{ margin: `${U(3)} 0 0 ${U(1.6)}`, fontSize: U(3.4), color: C.grey }}>{subtitle}</p>
                                        <p style={{ margin: `${U(2.4)} 0 0 ${U(1.6)}`, fontSize: U(3.8), fontWeight: 500, color: C.green }}>
                                            Available balance: {currencySymbol}
                                            {fmt(balance)}
                                        </p>

                                        {cfg.error && !cfg.data ? (
                                            retry(cfg.error, cfg.reload)
                                        ) : (
                                            <>
                                                {/* amount */}
                                                <div
                                                    style={{
                                                        ...card,
                                                        marginTop: U(6),
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: U(2.4),
                                                        height: U(14.4),
                                                        padding: `0 ${U(5)}`,
                                                        borderRadius: U(3.6),
                                                        outline: tooMuch || tooLittle ? `${U(0.4)} solid ${C.red}` : "none",
                                                    }}
                                                >
                                                    <span style={{ fontSize: U(5.4), fontWeight: 500 }}>{currencySymbol}</span>
                                                    <input
                                                        className="wwd-input"
                                                        inputMode="numeric"
                                                        aria-label="Withdrawal amount"
                                                        value={amountText ?? (balance ? String(balance) : "")}
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
                                                </div>
                                                {(tooMuch || tooLittle) && (
                                                    <p style={{ margin: `${U(2.2)} 0 0 ${U(2)}`, fontSize: U(3), color: C.red }}>
                                                        {tooMuch
                                                            ? `You can withdraw up to ${currencySymbol}${fmt(balance)}`
                                                            : `Minimum withdrawal is ${currencySymbol}${fmt(minAmount)}`}
                                                    </p>
                                                )}

                                                {/* service charge notice */}
                                                {pct > 0 && (
                                                    <div
                                                        style={{
                                                            marginTop: U(4.4),
                                                            display: "flex",
                                                            gap: U(3.4),
                                                            padding: `${U(4.2)} ${U(4.4)}`,
                                                            borderRadius: U(3.6),
                                                            background: "#fff3df",
                                                        }}
                                                    >
                                                        <span style={{ fontSize: U(5), color: "#f0a21a", display: "flex", paddingTop: U(0.4) }}>
                                                            <Icon name="warn" />
                                                        </span>
                                                        <p style={{ margin: 0, fontSize: U(3.2), lineHeight: 1.45, color: "#8a6a2f" }}>
                                                            <b style={{ fontSize: U(3.5), fontWeight: 600, color: "#7a4f0b" }}>
                                                                A {pct}% service charge
                                                            </b>
                                                            <br />
                                                            applies to all withdrawals. Tip: use your balance for gifts, boosts &amp; plans to get full value.
                                                        </p>
                                                    </div>
                                                )}

                                                {/* breakdown */}
                                                <section
                                                    style={{
                                                        marginTop: U(5.6),
                                                        padding: `${U(4.4)} ${U(4.6)}`,
                                                        borderRadius: U(4.4),
                                                        background: "#efebe5",
                                                        fontSize: U(3.6),
                                                        color: C.grey,
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: U(3.4),
                                                    }}
                                                >
                                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                        <span>Withdrawal amount</span>
                                                        <span style={{ color: C.ink, fontWeight: 500 }}>
                                                            {currencySymbol}
                                                            {fmt(amount)}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                        <span>Service charge ({pct}%)</span>
                                                        <span style={{ color: C.accentText, fontWeight: 500 }}>
                                                            -{currencySymbol}
                                                            {fmt(charge)}
                                                        </span>
                                                    </div>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            justifyContent: "space-between",
                                                            paddingTop: U(3.4),
                                                            borderTop: `${U(0.4)} solid #d9d4cc`,
                                                        }}
                                                    >
                                                        <span>You receive</span>
                                                        <span style={{ color: C.green, fontWeight: 500 }}>
                                                            {currencySymbol}
                                                            {fmt(net)}
                                                        </span>
                                                    </div>
                                                </section>

                                                {/* accounts */}
                                                <h3 style={{ ...label, margin: `${U(7)} 0 ${U(3.4)} ${U(1)}` }}>Send to</h3>
                                                <div role="radiogroup" aria-label="Payout account" style={{ display: "flex", flexDirection: "column", gap: U(3.2) }}>
                                                    {cfg.loading && !accounts.length ? (
                                                        [0, 1].map((i) => (
                                                            <div key={i} className="wwd-skel" style={{ height: U(14.4), borderRadius: U(3.6) }} />
                                                        ))
                                                    ) : accounts.length === 0 ? (
                                                        <p style={{ margin: `${U(4)} 0`, textAlign: "center", fontSize: U(3.4), color: "#a9a9a9" }}>
                                                            No payout accounts added yet
                                                        </p>
                                                    ) : (
                                                        accounts.map((a) => {
                                                            const on = a.id === account?.id;
                                                            return (
                                                                <button
                                                                    key={a.id}
                                                                    type="button"
                                                                    role="radio"
                                                                    aria-checked={on}
                                                                    className="wwd-btn"
                                                                    onClick={() => setAccountId(a.id)}
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
                                                                            color: TYPE_TILE[a.type].fg,
                                                                            fontSize: U(4.6),
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            justifyContent: "center",
                                                                            boxShadow: `0 0 0 ${HAIR} ${C.border}`,
                                                                        }}
                                                                    >
                                                                        <Icon name={TYPE_ICON[a.type]} />
                                                                    </span>
                                                                    <span style={{ flex: 1, minWidth: 0 }}>{a.label}</span>
                                                                    {radio(on)}
                                                                </button>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {/* ======================= HISTORY TAB ======================= */}
                                {tab === "history" && (
                                    <>
                                        <section
                                            style={{
                                                position: "relative",
                                                padding: `${U(5.4)} ${U(5.4)} ${U(5.6)}`,
                                                borderRadius: U(5.6),
                                                background: C.white,
                                                border: `${U(0.4)} solid #fadde4`,
                                                boxShadow: "0 8px 22px rgba(229,86,122,.10)",
                                                overflow: "hidden",
                                                color: C.accentText,
                                            }}
                                        >
                                            <span
                                                aria-hidden
                                                style={{
                                                    position: "absolute",
                                                    right: U(4),
                                                    top: U(4),
                                                    fontSize: U(21),
                                                    color: "#fdeef1",
                                                    display: "flex",
                                                }}
                                            >
                                                <Icon name="bank" width={1.6} />
                                            </span>
                                            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: U(3.4) }}>
                                                <span
                                                    style={{
                                                        width: U(8.6),
                                                        height: U(8.6),
                                                        borderRadius: U(2.4),
                                                        background: C.accentSoft,
                                                        color: C.accentText,
                                                        fontSize: U(4.2),
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Icon name="up" />
                                                </span>
                                                <span style={{ fontSize: U(3.4), fontWeight: 500, letterSpacing: "0.16em" }}>
                                                    TOTAL RECEIVED IN BANK
                                                </span>
                                            </div>
                                            <div style={{ position: "relative", marginTop: U(6), fontSize: U(8.4), fontWeight: 500, lineHeight: 1 }}>
                                                {hist.loading && !hist.data ? (
                                                    <span className="wwd-skel" style={{ display: "inline-block", width: U(34), height: U(8), borderRadius: U(2) }} />
                                                ) : (
                                                    <>
                                                        {currencySymbol}
                                                        {fmt(hist.data?.totalReceived ?? 0)}
                                                    </>
                                                )}
                                            </div>
                                            <div style={{ position: "relative", marginTop: U(4), fontSize: U(3.5), color: "#e57a96" }}>
                                                Lifetime successfully processed
                                            </div>
                                        </section>

                                        {/* filters (scroll sideways if they don't fit) */}
                                        <div
                                            className="wwd-chips"
                                            role="tablist"
                                            style={{ display: "flex", gap: U(3), marginTop: U(5.4), overflowX: "auto", paddingBottom: U(1) }}
                                        >
                                            {filters.map(([key, text]) => {
                                                const on = filter === key;
                                                return (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        role="tab"
                                                        aria-selected={on}
                                                        className="wwd-btn"
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

                                        {hist.error && !items.length ? (
                                            retry(hist.error, hist.reload)
                                        ) : hist.loading && !items.length ? (
                                            <div className="wwd-skel" style={{ height: U(40), borderRadius: U(5), marginTop: U(6) }} />
                                        ) : groups.length === 0 ? (
                                            <p style={{ margin: `${U(10)} 0`, textAlign: "center", fontSize: U(3.4), color: "#a9a9a9" }}>
                                                No withdrawals yet
                                            </p>
                                        ) : (
                                            groups.map((g) => (
                                                <div key={g.label}>
                                                    <h3 style={{ ...label, margin: `${U(7)} 0 ${U(3.4)} ${U(1)}` }}>{g.label}</h3>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: U(4) }}>
                                                        {g.rows.map((r) => {
                                                            const st = STATUS[r.status];
                                                            const tile = TYPE_TILE[r.destinationType];
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
                                                                            <Icon name={TYPE_ICON[r.destinationType]} />
                                                                        </span>
                                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                                            <div style={{ fontSize: U(3.9), fontWeight: 500 }}>
                                                                                Withdrawn to {r.destinationType === "BANK" ? "bank" : "UPI"}
                                                                            </div>
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
                                                                                {dayLabel(r.createdAt)} · {r.destinationLabel}
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                                                                            <div style={{ fontSize: U(4), fontWeight: 500, color: C.red }}>
                                                                                -{currencySymbol}
                                                                                {fmt(r.amount)}
                                                                            </div>
                                                                            <div style={{ marginTop: U(1.2), fontSize: U(2.7), fontWeight: 500, letterSpacing: "0.08em", color: st.color }}>
                                                                                {st.label}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            marginTop: U(4),
                                                                            paddingTop: U(3.6),
                                                                            borderTop: `${U(0.4)} dashed ${C.border}`,
                                                                            display: "flex",
                                                                            flexDirection: "column",
                                                                            gap: U(2.4),
                                                                            fontSize: U(3.3),
                                                                            color: C.grey,
                                                                        }}
                                                                    >
                                                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                            <span>Withdrawal amount</span>
                                                                            <span style={{ color: C.ink, fontWeight: 500 }}>
                                                                                {currencySymbol}
                                                                                {fmt(r.amount)}
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                            <span>Service charge ({pct || Math.round((r.serviceCharge / (r.amount || 1)) * 100)}%)</span>
                                                                            <span style={{ color: C.red, fontWeight: 500 }}>
                                                                                -{currencySymbol}
                                                                                {fmt(r.serviceCharge)}
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                            <span>{st.netLabel}</span>
                                                                            <span style={{ color: C.green, fontWeight: 500 }}>
                                                                                {currencySymbol}
                                                                                {fmt(r.netAmount)}
                                                                            </span>
                                                                        </div>
                                                                    </div>

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
                        {tab === "withdraw" && (
                            <footer
                                style={{
                                    flex: "0 0 auto",
                                    padding: `${U(3.4)} ${U(4.2)} ${U(5)}`,
                                    background: C.page,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: U(3.4),
                                }}
                            >
                                <button
                                    type="button"
                                    className="wwd-btn"
                                    onClick={handleWithdraw}
                                    disabled={!canGo}
                                    style={{
                                        width: "100%",
                                        height: U(13.9),
                                        borderRadius: U(3.6),
                                        background: canGo ? C.accent : "#e6e6ea",
                                        color: canGo ? C.white : "#8d8d8d",
                                        fontSize: U(4.1),
                                        fontWeight: 500,
                                    }}
                                >
                                    {busy ? "Processing…" : `Withdraw ${currencySymbol}${amount > 0 ? fmt(net) : ""}`}
                                </button>
                                <button
                                    type="button"
                                    className="wwd-btn"
                                    onClick={onCancel ?? handleBack}
                                    style={{
                                        width: "100%",
                                        height: U(13.9),
                                        borderRadius: U(3.6),
                                        background: C.white,
                                        border: `${HAIR} solid #dcdce0`,
                                        color: C.ink,
                                        fontSize: U(4.1),
                                        fontWeight: 500,
                                    }}
                                >
                                    Cancel
                                </button>
                            </footer>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
