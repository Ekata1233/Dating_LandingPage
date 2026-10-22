"use client";

import { usePayment, type TopUpStage, type WalletTx } from "@/app/context/PaymentContext";
import { useMyProfile } from "@/app/app/shared/useMyProfile";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useUserProfileData } from "@/app/context/UserProfileDataContext";

/* -------------------------------------------------------------------------- */
/*  AddMoney                                                                  */
/*                                                                            */
/*  Add money tab -> PaymentContext.topUpWallet()                             */
/*     create-order { purpose: "WALLET", amount } -> Razorpay -> verify       */
/*     Wallet is credited by the BACKEND only after verify. No direct credit. */
/*                                                                            */
/*  History tab  -> PaymentContext.getWalletTopUps()                         */
/*     GET /api/user/my-wallet?filter=ALL&page=1&limit=50&source=WALLET_TOPUP */
/*  Fills its PARENT, every size in `cqw`.                                    */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */
type PaymentMethodKey = "UPI" | "CARD" | "NETBANKING";
type TopUpStatus = "SUCCESS" | "FAILED" | "PENDING";
type Filter = "ALL" | TopUpStatus;

interface TopUpItem {
    id: string;
    reference: string;
    title: string;
    status: TopUpStatus;
    amountPaid: number;
    detail?: string;
    date: string;
    month: string;
}

/* --------------------------------- config ---------------------------------- */
const CURRENCY = "₹";
const MIN_AMOUNT = 10;
const MAX_AMOUNT = 100000; // confirm with backend; backend must enforce it too

// Bonus removed: backend does not credit any bonus, so we must not promise one.
const PRESETS: { id: string; amount: number; bonus?: number }[] = [
    { id: "p1", amount: 100 },
    { id: "p2", amount: 200 },
    { id: "p3", amount: 500 },
    { id: "p4", amount: 1000 },
    { id: "p5", amount: 2000 },
    { id: "p6", amount: 5000 },
];

const METHODS: { id: string; key: PaymentMethodKey; title: string }[] = [
    { id: "m1", key: "UPI", title: "UPI" },
    { id: "m2", key: "CARD", title: "Credit / Debit card" },
    { id: "m3", key: "NETBANKING", title: "Net banking" },
];

const RZP_METHOD: Record<PaymentMethodKey, "upi" | "card" | "netbanking"> = {
    UPI: "upi",
    CARD: "card",
    NETBANKING: "netbanking",
};

/* map a wallet transaction to a history row */
function toTopUpItem(t: WalletTx): TopUpItem {
    const st = (t.status || "").toUpperCase();
    const status: TopUpStatus =
        st === "SUCCESS" || st === "COMPLETED" ? "SUCCESS" : st === "FAILED" || st === "REVERSED" || st === "CANCELLED" ? "FAILED" : "PENDING";
    const d = new Date(t.createdAt);
    const now = new Date();
    const sameMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return {
        id: t.id,
        reference: t.referenceId || t.id,
        title: t.title,
        status,
        amountPaid: Number(t.amount) || 0,
        detail: t.description,
        date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        month: sameMonth ? "This month" : d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    };
}

/* --------------------------------- helpers --------------------------------- */
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

const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

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
            <rect x="7" y="2.5" width="10" height="19" rx="2" />
            <path d="M11 18.5h2" />
        </>
    ),
    card: (
        <>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 10h18M7 15h4" />
        </>
    ),
    bank: <path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />,
    down: <path d="M12 5v14M6 13l6 6 6-6" />,
    chevUp: <path d="m6 15 6-6 6 6" />,
    chevDown: <path d="m6 9 6 6 6-6" />,
    wallet: (
        <>
            <rect x="3" y="6" width="18" height="14" rx="3" />
            <circle cx="15.5" cy="13" r="1.5" />
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

/* -------------------------------- component -------------------------------- */
export default function AddMoney({
    fluid = false,
    className,
    style,
}: {
    fluid?: boolean;
    className?: string;
    style?: React.CSSProperties;
}) {
    const [tab, setTab] = useState<"add" | "history">("add");
    const [amountText, setAmountText] = useState("500");
    const [methodId, setMethodId] = useState(METHODS[0].id);
    const [filter, setFilter] = useState<Filter>("ALL");
    const router = useRouter();
    const { refetchWallet, applyWalletTopUp } = useUserProfileData();
    
    /* ---- PAYMENT ---- */
    const { topUpWallet, loadRazorpay, getWalletTopUps } = usePayment();
    const { profile } = useMyProfile();
    const [stage, setStage] = useState<TopUpStage | "idle">("idle");
    const [payError, setPayError] = useState<string | null>(null);
    const busy = stage !== "idle";

    useEffect(() => {
        loadRazorpay(); // preload so the Razorpay window opens fast
    }, [loadRazorpay]);

    const amount = Number(amountText) || 0;
    const bonus = PRESETS.find((p) => p.amount === amount)?.bonus ?? 0;
    const canPay = amount >= MIN_AMOUNT && amount <= MAX_AMOUNT && !busy;
    const step = (d: number) => setAmountText(String(Math.min(MAX_AMOUNT, Math.max(0, amount + d))));

    async function handleAddMoney(value: number) {
        if (busy) return; // block double taps
        if (value < MIN_AMOUNT) return setPayError(`Minimum amount is ${CURRENCY}${fmt(MIN_AMOUNT)}`);
        if (value > MAX_AMOUNT) return setPayError(`Maximum ${CURRENCY}${fmt(MAX_AMOUNT)} ek baar mein add kar sakte ho.`);
        setPayError(null);

        const p = (profile ?? {}) as Record<string, any>;
        const method = METHODS.find((m) => m.id === methodId)?.key ?? "UPI";

        const res = await topUpWallet(value, {
            prefill: {
                name: p.name ?? p.fullName ?? p.firstName ?? undefined,
                email: p.email ?? undefined,
                contact: p.phone ?? p.mobile ?? p.phoneNumber ?? undefined,
                method: RZP_METHOD[method],
            },
            onStage: setStage,
        });
        setStage("idle");

        if (res.ok) {
            toast.success(`${CURRENCY}${fmt(res.amount)} wallet mein add ho gaye.`);
            void applyWalletTopUp(res.amount);
            await refetchWallet();
            router.push("/app/home/myBalances/mywallet"); // wallet page reloads the balance on mount
            return;
        }
        if (res.cancelled) return; // user closed Razorpay, stay here quietly
        setPayError(res.message);
        toast.error(res.message);
    }

    const payLabel =
        stage === "creating"
            ? "Preparing payment…"
            : stage === "awaiting"
              ? "Complete payment in the window…"
              : stage === "verifying"
                ? "Adding to wallet…"
                : `Add ${CURRENCY}${amount ? fmt(amount) : ""}`;

    /* ---- HISTORY (real data) ---- */
    const [history, setHistory] = useState<TopUpItem[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);

    const loadHistory = useCallback(async () => {
        setHistoryLoading(true);
        setHistoryError(null);
        const res = await getWalletTopUps({ filter: "ALL", page: 1, limit: 50 });
        if (res.ok) setHistory((res.data.transactions ?? []).map((t: WalletTx) => toTopUpItem(t)));
        else setHistoryError(res.message || "History load nahi hui.");
        setHistoryLoading(false);
    }, [getWalletTopUps]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const HISTORY = history;
    const TOTAL_ADDED = useMemo(
        () => history.filter((h) => h.status === "SUCCESS").reduce((sum, h) => sum + h.amountPaid, 0),
        [history]
    );

    const counts: Record<Filter, number> = {
        ALL: HISTORY.length,
        SUCCESS: HISTORY.filter((i) => i.status === "SUCCESS").length,
        FAILED: HISTORY.filter((i) => i.status === "FAILED").length,
        PENDING: HISTORY.filter((i) => i.status === "PENDING").length,
    };
    const shown = HISTORY.filter((i) => filter === "ALL" || i.status === filter);
    const groups: { label: string; rows: TopUpItem[] }[] = [];
    shown.forEach((i) => {
        const g = groups.find((x) => x.label === i.month);
        if (g) g.rows.push(i);
        else groups.push({ label: i.month, rows: [i] });
    });

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

    const filters: [Filter, string][] = [
        ["ALL", "All"],
        ["SUCCESS", "Success"],
        ["FAILED", "Failed"],
    ];

    return (
        <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                <div
                    className={
                        fluid
                            ? "absolute inset-0 overflow-hidden"
                            : "h-full aspect-[300/520] max-w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out"
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
      `}</style>

                        {/* header */}
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
                                onClick={() => { router.push("/app/home/myBalances/mywallet") }}
                                disabled={busy}
                                aria-label="Go back"
                                style={{
                                    width: U(10),
                                    height: U(10),
                                    borderRadius: "50%",
                                    background: C.white,
                                    border: `${HAIR} solid ${C.border}`,
                                    boxShadow: `0 ${U(0.5)} ${U(2)} rgba(0,0,0,.06)`,
                                    color: C.ink,
                                    fontSize: U(4.2),
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: 0,
                                    flexShrink: 0,
                                }}
                            >
                                <Icon name="back" />
                            </button>
                            <h1 style={{ margin: 0, fontSize: U(4.5), fontWeight: 500 }}>Add money</h1>
                        </header>

                        {/* tabs */}
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

                        {/* scroll */}
                        <div className="wam-scroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
                            <div style={{ boxSizing: "border-box", padding: `${U(6)} ${U(4.2)} ${U(8)}` }}>
                                {/* ===================== ADD MONEY TAB ===================== */}
                                {tab === "add" && (
                                    <>
                                        <h2 style={{ margin: `0 0 0 ${U(1.6)}`, fontSize: U(5.8), fontWeight: 500 }}>Add money</h2>
                                        <p style={{ margin: `${U(3)} 0 0 ${U(1.6)}`, fontSize: U(3.4), color: C.grey }}>
                                            Top up your Welvors wallet — instant, secure.
                                        </p>

                                        {/* presets */}
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                                                gap: U(3),
                                                marginTop: U(6.4),
                                            }}
                                        >
                                            {PRESETS.map((p) => {
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
                                                        {CURRENCY}
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
                                            <span style={{ fontSize: U(5.4), fontWeight: 500 }}>{CURRENCY}</span>
                                            <input
                                                className="wam-input"
                                                inputMode="numeric"
                                                aria-label="Amount"
                                                value={amountText}
                                                disabled={busy}
                                                onChange={(e) => {
                                                    setAmountText(e.target.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 6));
                                                    setPayError(null);
                                                }}
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
                                                You&apos;ll get +{CURRENCY}
                                                {fmt(bonus)} bonus coins
                                            </p>
                                        ) : amount > MAX_AMOUNT ? (
                                            <p style={{ margin: `${U(2.4)} 0 0 ${U(2)}`, fontSize: U(3), color: C.red }}>
                                                Maximum amount is {CURRENCY}
                                                {fmt(MAX_AMOUNT)}
                                            </p>
                                        ) : amount > 0 && amount < MIN_AMOUNT ? (
                                            <p style={{ margin: `${U(2.4)} 0 0 ${U(2)}`, fontSize: U(3), color: C.red }}>
                                                Minimum amount is {CURRENCY}
                                                {fmt(MIN_AMOUNT)}
                                            </p>
                                        ) : null}

                                        {/* methods */}
                                        
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
                                                background: "linear-gradient(135deg, #eafcf0, #d4f6e0)",
                                                border: `${U(0.4)} solid #a9e8c0`,
                                                boxShadow: "0 8px 22px rgba(60,190,120,.18)",
                                                overflow: "hidden",
                                                color: "#14532d",
                                            }}
                                        >
                                            <span
                                                aria-hidden
                                                style={{ position: "absolute", right: U(4), top: U(4), fontSize: U(21), color: "#bfeccf", display: "flex" }}
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
                                                {CURRENCY}
                                                {fmt(TOTAL_ADDED)}
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
                                            {filters.map(([key, text]) => {
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
                                        {historyLoading && groups.length === 0 ? (
                                            <p style={{ margin: `${U(10)} 0`, textAlign: "center", fontSize: U(3.4), color: "#a9a9a9" }}>
                                                Loading…
                                            </p>
                                        ) : historyError && groups.length === 0 ? (
                                            <div style={{ margin: `${U(10)} 0`, textAlign: "center" }}>
                                                <p style={{ margin: 0, fontSize: U(3.4), color: C.grey }}>{historyError}</p>
                                                <button
                                                    type="button"
                                                    className="wam-btn"
                                                    onClick={loadHistory}
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
                                                                    : r.status === "PENDING"
                                                                      ? { fg: C.amber, bg: "#fff1db" }
                                                                      : { fg: C.green, bg: "#e5f6ec" };
                                                            const name = r.status === "FAILED" ? "Add money failed" : r.title || "Money added";
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
                                                                            <Icon name="down" />
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
                                                                                {r.date}
                                                                                {r.detail ? ` · ${r.detail}` : ""}
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                                                                            <div style={{ fontSize: U(4), fontWeight: 500, color: st.color }}>
                                                                                +{CURRENCY}
                                                                                {fmt(r.amountPaid)}
                                                                            </div>
                                                                            <div style={{ marginTop: U(1.2), fontSize: U(2.7), fontWeight: 500, letterSpacing: "0.08em", color: st.color }}>
                                                                                {st.label}
                                                                            </div>
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

                        {/* pinned action bar */}
                        {tab === "add" && (
                            <footer style={{ flex: "0 0 auto", padding: `${U(3.4)} ${U(4.2)} ${U(5)}`, background: C.page }}>
                                {payError && (
                                    <p role="alert" style={{ margin: `0 0 ${U(3)}`, fontSize: U(3.2), lineHeight: 1.45, color: C.red, textAlign: "center" }}>
                                        {payError}
                                    </p>
                                )}
                                <button
                                    type="button"
                                    className="wam-btn"
                                    onClick={() => handleAddMoney(amount)}
                                    disabled={!canPay}
                                    aria-busy={busy}
                                    style={{
                                        width: "100%",
                                        height: U(13.9),
                                        borderRadius: U(3.6),
                                        background: canPay || busy ? C.accent : "#e6e6ea",
                                        color: canPay || busy ? C.white : "#8d8d8d",
                                        opacity: busy ? 0.8 : 1,
                                        fontSize: U(4.1),
                                        fontWeight: 500,
                                    }}
                                >
                                    {payLabel}
                                </button>
                            </footer>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}