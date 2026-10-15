"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

/* -------------------------------------------------------------------------- */
/*  WithdrawMoney (static)                                                    */
/*  No API, no context, no router. All data lives in the constants below.     */
/*  Fills its PARENT, every size in `cqw`.                                    */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */
type PayoutType = "BANK" | "UPI";
type WithdrawStatus = "PROCESSING" | "PROCESSED" | "REVERSED";
type Filter = "ALL" | WithdrawStatus;

interface WithdrawItem {
    id: string;
    reference: string;
    status: WithdrawStatus;
    destinationType: PayoutType;
    destinationLabel: string;
    amount: number;
    serviceCharge: number;
    netAmount: number;
    date: string;
    month: string;
}

/* ------------------------------ static data -------------------------------- */
const CURRENCY = "₹";
const BALANCE = 500;
const SERVICE_CHARGE_PERCENT = 25;
const MIN_AMOUNT = 100;
const TOTAL_RECEIVED = 1125;

const ACCOUNTS: { id: string; type: PayoutType; label: string }[] = [
    { id: "a1", type: "BANK", label: "HDFC •••• 1234" },
    { id: "a2", type: "UPI", label: "tanishka@oksbi" },
];

const HISTORY: WithdrawItem[] = [
    { id: "w1", reference: "WDR-3K91XA2", status: "PROCESSING", destinationType: "BANK", destinationLabel: "HDFC •••• 1234", amount: 400, serviceCharge: 100, netAmount: 300, date: "13 Oct", month: "This month" },
    { id: "w2", reference: "WDR-2J80WB1", status: "PROCESSED", destinationType: "UPI", destinationLabel: "tanishka@oksbi", amount: 800, serviceCharge: 200, netAmount: 600, date: "5 Oct", month: "This month" },
    { id: "w3", reference: "WDR-1H70VC0", status: "REVERSED", destinationType: "BANK", destinationLabel: "HDFC •••• 1234", amount: 200, serviceCharge: 50, netAmount: 200, date: "21 Sep", month: "SEPTEMBER 2026" },
    { id: "w4", reference: "WDR-0G60UD9", status: "PROCESSED", destinationType: "BANK", destinationLabel: "HDFC •••• 1234", amount: 700, serviceCharge: 175, netAmount: 525, date: "9 Sep", month: "SEPTEMBER 2026" },
];

/* --------------------------------- helpers --------------------------------- */
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

const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
const round2 = (n: number) => Math.round(n * 100) / 100;

const STATUS: Record<WithdrawStatus, { label: string; color: string; netLabel: string }> = {
    PROCESSING: { label: "PROCESSING", color: C.amber, netLabel: "You will receive" },
    PROCESSED: { label: "PROCESSED", color: C.green, netLabel: "Received in bank" },
    REVERSED: { label: "REVERSED", color: C.red, netLabel: "Refunded to wallet" },
};

type IconName = "back" | "phone" | "bank" | "up" | "warn";

const ICONS: Record<IconName, React.ReactNode> = {
    back: <path d="M15 5l-7 7 7 7" />,
    phone: (
        <>
            <rect x="7" y="2.5" width="10" height="19" rx="2" />
            <path d="M11 18.5h2" />
        </>
    ),
    bank: <path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18" />,
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
export default function WithdrawMoney({
    fluid = false,
    className,
    style,
}: {
    fluid?: boolean;
    className?: string;
    style?: React.CSSProperties;
}) {
    const [tab, setTab] = useState<"withdraw" | "history">("withdraw");
    const [amountText, setAmountText] = useState(String(BALANCE));
    const [accountId, setAccountId] = useState(ACCOUNTS[0].id);
    const [filter, setFilter] = useState<Filter>("ALL");

    const amount = Number(amountText) || 0;
    const charge = round2((amount * SERVICE_CHARGE_PERCENT) / 100);
    const net = round2(amount - charge);
    const tooMuch = amount > BALANCE;
    const tooLittle = amount > 0 && amount < MIN_AMOUNT;
    const canGo = amount >= MIN_AMOUNT && !tooMuch;
    const router = useRouter()
    const counts: Record<Filter, number> = {
        ALL: HISTORY.length,
        PROCESSED: HISTORY.filter((i) => i.status === "PROCESSED").length,
        PROCESSING: HISTORY.filter((i) => i.status === "PROCESSING").length,
        REVERSED: HISTORY.filter((i) => i.status === "REVERSED").length,
    };
    const shown = HISTORY.filter((i) => filter === "ALL" || i.status === filter);
    const groups: { label: string; rows: WithdrawItem[] }[] = [];
    shown.forEach((i) => {
        const g = groups.find((x) => x.label === i.month);
        if (g) g.rows.push(i);
        else groups.push({ label: i.month, rows: [i] });
    });

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
        .wwd-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease; }
        .wwd-btn:hover:not(:disabled) { filter: brightness(1.04); }
        .wwd-btn:active:not(:disabled) { transform: scale(.985); }
        .wwd-btn:disabled { cursor: not-allowed; }
        .wwd-btn:focus-visible, .wwd-input:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; }
        .wwd-scroll, .wwd-chips { scrollbar-width: none; -ms-overflow-style: none; }
        .wwd-scroll::-webkit-scrollbar, .wwd-chips::-webkit-scrollbar { display: none; width: 0; height: 0; }
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
                                className="wwd-btn"
                                aria-label="Go back"
                                onClick={()=>{router.push("/app/home/myBalances/mywallet")}}
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
                            <h1 style={{ margin: 0, fontSize: U(4.5), fontWeight: 500 }}>Withdraw</h1>
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

                        {/* scroll */}
                        <div className="wwd-scroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
                            <div style={{ boxSizing: "border-box", padding: `${U(6)} ${U(4.2)} ${U(8)}` }}>
                                {/* ===================== WITHDRAW TAB ===================== */}
                                {tab === "withdraw" && (
                                    <>
                                        <h2 style={{ margin: `0 0 0 ${U(1.6)}`, fontSize: U(5.8), fontWeight: 500 }}>Withdraw to bank</h2>
                                        <p style={{ margin: `${U(3)} 0 0 ${U(1.6)}`, fontSize: U(3.4), color: C.grey }}>
                                            Move wallet balance to your bank or UPI.
                                        </p>
                                        <p style={{ margin: `${U(2.4)} 0 0 ${U(1.6)}`, fontSize: U(3.8), fontWeight: 500, color: C.green }}>
                                            Available balance: {CURRENCY}
                                            {fmt(BALANCE)}
                                        </p>

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
                                            <span style={{ fontSize: U(5.4), fontWeight: 500 }}>{CURRENCY}</span>
                                            <input
                                                className="wwd-input"
                                                inputMode="numeric"
                                                aria-label="Withdrawal amount"
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
                                        </div>
                                        {(tooMuch || tooLittle) && (
                                            <p style={{ margin: `${U(2.2)} 0 0 ${U(2)}`, fontSize: U(3), color: C.red }}>
                                                {tooMuch
                                                    ? `You can withdraw up to ${CURRENCY}${fmt(BALANCE)}`
                                                    : `Minimum withdrawal is ${CURRENCY}${fmt(MIN_AMOUNT)}`}
                                            </p>
                                        )}

                                        {/* service charge notice */}
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
                                                    A {SERVICE_CHARGE_PERCENT}% service charge
                                                </b>
                                                <br />
                                                applies to all withdrawals. Tip: use your balance for gifts, boosts &amp; plans to get full value.
                                            </p>
                                        </div>

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
                                                    {CURRENCY}
                                                    {fmt(amount)}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span>Service charge ({SERVICE_CHARGE_PERCENT}%)</span>
                                                <span style={{ color: C.accentText, fontWeight: 500 }}>
                                                    -{CURRENCY}
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
                                                    {CURRENCY}
                                                    {fmt(net)}
                                                </span>
                                            </div>
                                        </section>

                                        {/* accounts */}
                                        <h3 style={label}>Send to</h3>
                                        <div role="radiogroup" aria-label="Payout account" style={{ display: "flex", flexDirection: "column", gap: U(3.2) }}>
                                            {ACCOUNTS.map((a) => {
                                                const on = a.id === accountId;
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
                                            })}
                                        </div>
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
                                                style={{ position: "absolute", right: U(4), top: U(4), fontSize: U(21), color: "#fdeef1", display: "flex" }}
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
                                                {CURRENCY}
                                                {fmt(TOTAL_RECEIVED)}
                                            </div>
                                            <div style={{ position: "relative", marginTop: U(4), fontSize: U(3.5), color: "#e57a96" }}>
                                                Lifetime successfully processed
                                            </div>
                                        </section>

                                        {/* filters */}
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

                                        {groups.length === 0 ? (
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
                                                                                {r.date} · {r.destinationLabel}
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                                                                            <div style={{ fontSize: U(4), fontWeight: 500, color: C.red }}>
                                                                                -{CURRENCY}
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
                                                                                {CURRENCY}
                                                                                {fmt(r.amount)}
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                            <span>Service charge ({SERVICE_CHARGE_PERCENT}%)</span>
                                                                            <span style={{ color: C.red, fontWeight: 500 }}>
                                                                                -{CURRENCY}
                                                                                {fmt(r.serviceCharge)}
                                                                            </span>
                                                                        </div>
                                                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                            <span>{st.netLabel}</span>
                                                                            <span style={{ color: C.green, fontWeight: 500 }}>
                                                                                {CURRENCY}
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

                        {/* pinned action bar */}
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
                                    Withdraw {CURRENCY}
                                    {amount > 0 ? fmt(net) : ""}
                                </button>
                                <button
                                    type="button"
                                    className="wwd-btn"
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
