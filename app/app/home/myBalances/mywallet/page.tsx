"use client";

import { useActiveSection } from "@/app/context/ActiveSectionContext";
import { useUserProfileData } from "@/app/context/UserProfileDataContext";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  MyWallet                                                                  */
/*                                                                            */
/*  Self-contained wallet overview. Same rules as the other screens: fills    */
/*  its PARENT, every size in `cqw`, hidden scrollbar, pinned header.         */
/*                                                                            */
/*  Backend mapping (response.data):                                          */
/*    wallet.formattedBalance   -> big "₹500" (falls back to balance+currency)*/
/*    datePlans.label           -> small "Date plans · 0 left" row            */
/*    filter                    -> echo of the active chip (ALL | IN | OUT)   */
/*    transactions[]                                                          */
/*      direction (IN | OUT)    -> icon, colour and the In / Out chips        */
/*      type                    -> icon (PURCHASE shows a bag)                */
/*      title                   -> row title                                  */
/*      formattedAmount         -> right-hand amount ("+₹500" / "-₹500")      */
/*      balanceAfter            -> "Balance ₹1,000" under the amount          */
/*      status                  -> badge shown only when not SUCCESS          */
/*      createdAt               -> "9 Oct · 1:07 PM"                          */
/*    pagination.hasNextPage    -> "Load more" button                         */
/*                                                                            */
/*  The filter is applied by the backend: fetchWallet receives                */
/*  { filter, page, limit } and should return the same response shape.        */
/*                                                                            */
/*  Usage:                                                                    */
/*    <div style={{ width: 390, height: 800 }}>                               */
/*      <MyWallet fluid onAddMoney={...} onWithdraw={...} />                  */
/*    </div>                                                                  */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */
export type TxFilter = "ALL" | "IN" | "OUT";

export interface WalletTransaction {
    id: string;
    type: string;
    source?: string;
    status: string;
    direction: "IN" | "OUT";
    title: string;
    description?: string;
    amount: number;
    formattedAmount: string;
    balanceBefore?: number;
    balanceAfter?: number;
    referenceId?: string | null;
    createdAt: string;
}

export interface WalletData {
    wallet: { balance: number; currency: string; formattedBalance?: string };
    datePlans?: {
        balance: number;
        totalDatePlan: number;
        purchasedDatePlan: number;
        label: string;
    };
    filter: TxFilter;
    transactions: WalletTransaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface WalletQuery {
    filter: TxFilter;
    page: number;
    limit: number;
}

export interface MyWalletProps {
    title?: string;
    showHeader?: boolean;
    showBack?: boolean;
    onBack?: () => void;

    /** Overrides for copy that is not part of the API */
    cardLabel?: string;
    cardSubtitle?: string;
    referralTitle?: string;
    referralText?: string;
    showReferral?: boolean;
    showDatePlans?: boolean;
    pageSize?: number;

    onAddMoney?: () => void;
    onWithdraw?: () => void;
    onBenefits?: () => void;
    onReferral?: () => void;
    onDatePlans?: () => void;
    onTransactionClick?: (tx: WalletTransaction) => void;

    fluid?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/* --------------------------------- helpers --------------------------------- */
/** 1 unit = 1% of the parent's width */
const U = (n: number) => `${n}cqw`;
const HAIR = "max(1px, 0.3cqw)";

const C = {
    pink: "#d9456b",
    pinkText: "#e0355f",
    pinkSoft: "#fde4ea",
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

const CURRENCY: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
const money = (n: number, cur: string) =>
    `${CURRENCY[cur] ?? ""}${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const when = (iso: string) => {
    const d = new Date(iso);
    const day = `${d.getDate()} ${d.toLocaleString("en-IN", { month: "short" })}`;
    const time = d.toLocaleString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
    return `${day} · ${time}`;
};

const STATUS_COLOR: Record<string, string> = { PENDING: C.amber, PROCESSING: C.amber, FAILED: C.red, REVERSED: C.red };

type IconName = "back" | "coin" | "info" | "plus" | "down" | "up" | "bag" | "gift" | "chevron" | "ticket";

const ICONS: Record<Exclude<IconName, "coin">, React.ReactNode> = {
    back: <path d="M15 5l-7 7 7 7" />,
    info: (
        <>
            <circle cx="12" cy="12" r="9.500" />
            <path d="M12 11v6" />
            <circle cx="12" cy="7.500" r="0.6" fill="currentColor" />
        </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    down: <path d="M12 5v14M6 13l6 6 6-6" />,
    up: <path d="M12 19V5M6 11l6-6 6 6" />,
    bag: (
        <>
            <path d="M5 8h14l-1 12H6L5 8Z" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </>
    ),
    gift: (
        <>
            <rect x="3" y="9" width="18" height="12" rx="2" />
            <path d="M3 13h18M12 9v12M12 9C9 9 8 6 9.500 5S12 6 12 9Zm0 0c3 0 4-3 2.500-4S12 6 12 9Z" />
        </>
    ),
    chevron: <path d="m9 5 7 7-7 7" />,
    ticket: (
        <>
            <path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2h18v-2a2 2 0 0 1 0-4v0a2 2 0 0 0 0-4V6H3v2Z" />
            <path d="M14 6v12" strokeDasharray="2 2" />
        </>
    ),
};

const Icon = ({ name, width = 2 }: { name: Exclude<IconName, "coin">; width?: number }) => (
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

const Coin = () => (
    <svg viewBox="0 0 24 24" style={{ width: "1em", height: "1em", display: "block" }}>
        <circle cx="12" cy="12" r="11" fill="#fff" fillOpacity=".92" />
        <text x="12" y="16.500" textAnchor="middle" fontSize="13" fontWeight="800" fill="#d9456b" fontFamily="Arial">
            $
        </text>
    </svg>
);

const FILTERS: { key: TxFilter; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "IN", label: "In" },
    { key: "OUT", label: "Out" },
];

/* -------------------------------- component -------------------------------- */
export default function MyWallet({
    title = "My Wallet",
    showHeader = true,
    showBack = true,
    onBack,
    cardLabel = "Welvors Wallet",
    cardSubtitle = "Use coins for gifts, roses, boosts & plans",
    referralTitle = "Top up your wallet — refer friends",
    referralText = "Earn ₹100 when a friend joins + ₹500 when they buy a plan, straight to your wallet",
    showReferral = true,
    showDatePlans = true,
    pageSize = 20,
    onBenefits,
    onReferral,
    onDatePlans,
    onTransactionClick,
    fluid = false,
    className,
    style,
}: MyWalletProps) {
    const { setActiveSection } = useActiveSection();
    const { fetchWallet } = useUserProfileData();
    const [filter, setFilter] = useState<TxFilter>("ALL");
    const [data, setData] = useState<WalletData | null>(null);
    const [txs, setTxs] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter()
    const fetchRef = useRef(fetchWallet);
    fetchRef.current = fetchWallet;
    const reqId = useRef(0);
    function onAddMoney() {
      router.push("/app/home/myBalances/mywallet/addMoney")
    }
        function onWithdraw() {
      router.push("/app/home/myBalances/mywallet/withdraw")
    }
    const load = useCallback(
        async (f: TxFilter, page: number) => {
            const id = ++reqId.current;
            page === 1 ? setLoading(true) : setLoadingMore(true);
            setError(null);
            try {
                const res = await fetchRef.current({ filter: f, page, limit: pageSize });
                if (id !== reqId.current) return; // a newer request replaced this one
                setData(res);
                setTxs((prev) => (page === 1 ? res.transactions : [...prev, ...res.transactions]));
            } catch (e) {
                if (id !== reqId.current) return;
                setError(e instanceof Error ? e.message : "Something went wrong");
            } finally {
                if (id === reqId.current) {
                    setLoading(false);
                    setLoadingMore(false);
                }
            }
        },
        [pageSize]
    );

    useEffect(() => {
        load(filter, 1);
    }, [filter, load]);

    const handleBack = () =>{
      router.push("/app/home")
    };
    const currency = data?.wallet.currency ?? "INR";
    const balanceText = data ? data.wallet.formattedBalance ?? money(data.wallet.balance, currency) : "";
    const hasMore = data?.pagination.hasNextPage ?? false;

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
        .wmw-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease; }
        .wmw-btn:hover:not(:disabled) { filter: brightness(1.04); }
        .wmw-btn:active:not(:disabled) { transform: scale(.985); }
        .wmw-btn:disabled { cursor: not-allowed; }
        .wmw-btn:focus-visible { outline: 2px solid ${C.pink}; outline-offset: 2px; }
        .wmw-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .wmw-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
        @keyframes wmw-pulse { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
        .wmw-skel { background: #eceef2; animation: wmw-pulse 1.2s ease-in-out infinite; }
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
                                    className="wmw-btn"
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
                                <h1 style={{ margin: 0, fontSize: U(4.5), fontWeight: 500, letterSpacing: "0.01em" }}>{title}</h1>
                            </header>
                        )}

                        {/* ------------------------------ scroll ------------------------------ */}
                        <div className="wmw-scroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
                            <div
                                style={{
                                    boxSizing: "border-box",
                                    padding: `${U(2)} ${U(5)} ${U(10)}`,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                {/* ========================= wallet card ========================= */}
                                <section
                                    style={{
                                        position: "relative",
                                        padding: `${U(5.4)} ${U(6)} ${U(6)}`,
                                        borderRadius: U(6),
                                        background: "linear-gradient(135deg, #dc4d70 0%, #d2416a 100%)",
                                        color: C.white,
                                        boxShadow: `0 ${U(2)} ${U(5)} rgba(217,69,107,.28)`,
                                        overflow: "hidden",
                                    }}
                                >
                                    {/* decorative circle */}
                                    <span
                                        aria-hidden
                                        style={{
                                            position: "absolute",
                                            top: U(-12),
                                            right: U(-12),
                                            width: U(38),
                                            height: U(38),
                                            borderRadius: "50%",
                                            background: "rgba(255,255,255,.12)",
                                        }}
                                    />

                                    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: U(3.4) }}>
                                            <span style={{ fontSize: U(4.6), display: "flex" }}>
                                                <Coin />
                                            </span>
                                            <span style={{ fontSize: U(3.4), fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                                                {cardLabel}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="wmw-btn"
                                            onClick={onBenefits}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: U(1.8),
                                                height: U(7.6),
                                                padding: `0 ${U(3.6)}`,
                                                borderRadius: U(4),
                                                background: "rgba(255,255,255,.14)",
                                                border: `${HAIR} solid rgba(255,255,255,.45)`,
                                                color: C.white,
                                                fontSize: U(3.1),
                                            }}
                                        >
                                            <span style={{ fontSize: U(3.2), display: "flex" }}>
                                                <Icon name="info" />
                                            </span>
                                            Benefits
                                        </button>
                                    </div>

                                    <div style={{ position: "relative", marginTop: U(5), fontSize: U(9), fontWeight: 500, lineHeight: 1.1 }}>
                                        {loading && !data ? (
                                            <span className="wmw-skel" style={{ display: "inline-block", width: U(30), height: U(8.6), borderRadius: U(2) }} />
                                        ) : (
                                            balanceText
                                        )}
                                    </div>
                                    <p style={{ position: "relative", margin: `${U(2.2)} 0 0`, fontSize: U(3.5), opacity: 0.92 }}>{cardSubtitle}</p>

                                    <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: U(4), marginTop: U(6) }}>
                                        <button
                                            type="button"
                                            className="wmw-btn"
                                            onClick={onAddMoney}
                                            style={{
                                                height: U(11.2),
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: U(2.4),
                                                borderRadius: U(4),
                                                background: C.white,
                                                color: C.pink,
                                                fontSize: U(3.9),
                                                fontWeight: 500,
                                            }}
                                        >
                                            <span style={{ fontSize: U(4.4), display: "flex" }}>
                                                <Icon name="plus" />
                                            </span>
                                            Add Money
                                        </button>
                                        <button
                                            type="button"
                                            className="wmw-btn"
                                            onClick={onWithdraw}
                                            style={{
                                                height: U(11.2),
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: U(2.4),
                                                borderRadius: U(4),
                                                background: "transparent",
                                                border: `${U(0.3)} solid rgba(255,255,255,.6)`,
                                                color: C.white,
                                                fontSize: U(3.9),
                                                fontWeight: 500,
                                            }}
                                        >
                                            <span style={{ fontSize: U(4.4), display: "flex" }}>
                                                <Icon name="down" />
                                            </span>
                                            Withdraw
                                        </button>
                                    </div>
                                </section>

                                {/* ========================= date plans ========================= */}
                                {showDatePlans && data?.datePlans && (
                                    <button
                                        type="button"
                                        className="wmw-btn"
                                        onClick={onDatePlans}
                                        style={{
                                            marginTop: U(4.4),
                                            display: "flex",
                                            alignItems: "center",
                                            gap: U(3.6),
                                            padding: `${U(3.4)} ${U(4.4)}`,
                                            textAlign: "left",
                                            background: C.white,
                                            border: `${HAIR} solid ${C.border}`,
                                            borderRadius: U(4.6),
                                            boxShadow: `0 ${U(0.8)} ${U(3)} rgba(0,0,0,.04)`,
                                            color: C.ink,
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: U(9.4),
                                                height: U(9.4),
                                                borderRadius: U(2.6),
                                                background: "#fdebd6",
                                                color: "#ea7a14",
                                                fontSize: U(4.8),
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Icon name="ticket" />
                                        </span>
                                        <span style={{ flex: 1, minWidth: 0, fontSize: U(3.6), fontWeight: 500 }}>Date plans</span>
                                        <span style={{ fontSize: U(3.3), color: C.grey }}>{data.datePlans.label}</span>
                                        <span style={{ fontSize: U(3.6), color: C.greyLight, display: "flex" }}>
                                            <Icon name="chevron" />
                                        </span>
                                    </button>
                                )}

                                {/* ========================= referral ========================= */}
                                {showReferral && (
                                    <button
                                        type="button"
                                        className="wmw-btn"
                                        onClick={onReferral}
                                        style={{
                                            marginTop: U(4.4),
                                            display: "flex",
                                            alignItems: "center",
                                            gap: U(4.4),
                                            padding: `${U(4.4)} ${U(4.4)}`,
                                            textAlign: "left",
                                            borderRadius: U(5),
                                            background: "linear-gradient(100deg, #eefbf3 0%, #f8fdfa 100%)",
                                            border: `${U(0.3)} solid #bfe9cf`,
                                            color: C.ink,
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: U(11.2),
                                                height: U(11.2),
                                                borderRadius: U(3),
                                                flexShrink: 0,
                                                background: "#2ea866",
                                                color: C.white,
                                                fontSize: U(6),
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow: "0 4px 10px rgba(46,168,102,.3)",
                                            }}
                                        >
                                            <Icon name="gift" />
                                        </span>
                                        <span style={{ flex: 1, minWidth: 0 }}>
                                            <span style={{ display: "block", fontSize: U(3.9), fontWeight: 500, lineHeight: 1.25 }}>{referralTitle}</span>
                                            <span style={{ display: "block", marginTop: U(1.6), fontSize: U(3.2), lineHeight: 1.45, color: C.grey }}>
                                                {referralText}
                                            </span>
                                        </span>
                                        <span style={{ fontSize: U(4.4), color: C.green, display: "flex" }}>
                                            <Icon name="chevron" width={2.6} />
                                        </span>
                                    </button>
                                )}

                                {/* ========================= transactions ========================= */}
                                <div
                                    style={{
                                        marginTop: U(9),
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: U(3),
                                    }}
                                >
                                    <h2
                                        style={{
                                            margin: `0 0 0 ${U(1)}`,
                                            fontSize: U(3.1),
                                            fontWeight: 500,
                                            letterSpacing: "0.12em",
                                            color: C.grey,
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        Transactions
                                    </h2>
                                    <div role="tablist" style={{ display: "flex", gap: U(2.6) }}>
                                        {FILTERS.map(({ key, label }) => {
                                            const on = filter === key;
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={on}
                                                    className="wmw-btn"
                                                    onClick={() => setFilter(key)}
                                                    style={{
                                                        minWidth: U(12.6),
                                                        height: U(7.2),
                                                        padding: `0 ${U(3.6)}`,
                                                        borderRadius: U(3.6),
                                                        background: on ? "#e8365f" : C.white,
                                                        color: on ? C.white : C.ink,
                                                        fontSize: U(3.2),
                                                        fontWeight: 500,
                                                        boxShadow: on ? "none" : `0 ${U(0.6)} ${U(2)} rgba(0,0,0,.06)`,
                                                    }}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <section
                                    style={{
                                        marginTop: U(4),
                                        background: C.white,
                                        borderRadius: U(4.6),
                                        boxShadow: `0 ${U(0.8)} ${U(3)} rgba(0,0,0,.05)`,
                                        overflow: "hidden",
                                    }}
                                >
                                    {error && !txs.length ? (
                                        <div style={{ padding: `${U(8)} ${U(4)}`, textAlign: "center" }}>
                                            <p style={{ margin: 0, fontSize: U(3.4), color: C.grey }}>{error}</p>
                                            <button
                                                type="button"
                                                className="wmw-btn"
                                                onClick={() => load(filter, 1)}
                                                style={{
                                                    marginTop: U(4),
                                                    height: U(10),
                                                    padding: `0 ${U(6)}`,
                                                    borderRadius: U(5),
                                                    background: C.pinkSoft,
                                                    color: C.pinkText,
                                                    fontSize: U(3.5),
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Try again
                                            </button>
                                        </div>
                                    ) : loading && !txs.length ? (
                                        <div style={{ padding: `${U(4)} ${U(4.4)}`, display: "flex", flexDirection: "column", gap: U(4) }}>
                                            {[0, 1, 2].map((i) => (
                                                <div key={i} className="wmw-skel" style={{ height: U(11), borderRadius: U(3) }} />
                                            ))}
                                        </div>
                                    ) : txs.length === 0 ? (
                                        <p
                                            style={{
                                                margin: 0,
                                                padding: `${U(9.4)} ${U(4)}`,
                                                textAlign: "center",
                                                fontSize: U(4),
                                                color: C.grey,
                                            }}
                                        >
                                            No transactions found
                                        </p>
                                    ) : (
                                        <div style={{ opacity: loading ? 0.5 : 1, transition: "opacity .15s ease" }}>
                                            {txs.map((t, i) => {
                                                const incoming = t.direction === "IN";
                                                const tile = incoming
                                                    ? { fg: C.green, bg: "#e5f6ec" }
                                                    : { fg: C.pinkText, bg: C.pinkSoft };
                                                const iconName: Exclude<IconName, "coin"> =
                                                    t.type === "PURCHASE" ? "bag" : incoming ? "down" : "up";
                                                const showStatus = t.status && t.status !== "SUCCESS";
                                                return (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        className="wmw-btn"
                                                        onClick={() => onTransactionClick?.(t)}
                                                        style={{
                                                            width: "100%",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: U(3.6),
                                                            padding: `${U(3.8)} ${U(4.4)}`,
                                                            textAlign: "left",
                                                            background: "transparent",
                                                            borderTop: i === 0 ? "none" : `${HAIR} solid ${C.border}`,
                                                            borderRadius: 0,
                                                            color: C.ink,
                                                            cursor: onTransactionClick ? "pointer" : "default",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                width: U(10.4),
                                                                height: U(10.4),
                                                                borderRadius: U(3),
                                                                flexShrink: 0,
                                                                background: tile.bg,
                                                                color: tile.fg,
                                                                fontSize: U(5),
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                            }}
                                                        >
                                                            <Icon name={iconName} />
                                                        </span>
                                                        <span style={{ flex: 1, minWidth: 0 }}>
                                                            <span
                                                                style={{
                                                                    display: "block",
                                                                    fontSize: U(3.5),
                                                                    fontWeight: 500,
                                                                    lineHeight: 1.3,
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                {t.title}
                                                            </span>
                                                            <span style={{ display: "block", marginTop: U(1.2), fontSize: U(2.9), color: C.grey }}>
                                                                {when(t.createdAt)}
                                                                {showStatus && (
                                                                    <b
                                                                        style={{
                                                                            marginLeft: U(2),
                                                                            fontSize: U(2.5),
                                                                            fontWeight: 600,
                                                                            letterSpacing: "0.06em",
                                                                            color: STATUS_COLOR[t.status] ?? C.grey,
                                                                        }}
                                                                    >
                                                                        {t.status}
                                                                    </b>
                                                                )}
                                                            </span>
                                                        </span>
                                                        <span style={{ textAlign: "right", flexShrink: 0 }}>
                                                            <span
                                                                style={{
                                                                    display: "block",
                                                                    fontSize: U(3.9),
                                                                    fontWeight: 500,
                                                                    color: incoming ? C.green : C.ink,
                                                                }}
                                                            >
                                                                {t.formattedAmount}
                                                            </span>
                                                            {t.balanceAfter !== undefined && (
                                                                <span style={{ display: "block", marginTop: U(1.2), fontSize: U(2.7), color: C.greyLight }}>
                                                                    Balance {money(t.balanceAfter, currency)}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </button>
                                                );
                                            })}

                                            {hasMore && (
                                                <button
                                                    type="button"
                                                    className="wmw-btn"
                                                    onClick={() => load(filter, (data?.pagination.page ?? 1) + 1)}
                                                    disabled={loadingMore}
                                                    style={{
                                                        width: "100%",
                                                        height: U(12),
                                                        background: "transparent",
                                                        borderTop: `${HAIR} solid ${C.border}`,
                                                        color: C.pinkText,
                                                        fontSize: U(3.4),
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {loadingMore ? "Loading…" : "Load more"}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
