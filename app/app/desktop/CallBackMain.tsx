import { Callback, CallbackStatus } from "@/app/context/AccountSettingsContext";
import React from "react";

/* -------------------------------------------------------------------------- */
/*  Callbacks                                                                 */
/*                                                                            */
/*  One independent, fully fluid screen with two tabs:                       */
/*    "Request a call" — pick a day, a time window and (optionally) a topic, */
/*                        then Confirm. On confirm, a "Call booked" card      */
/*                        appears over the page.                             */
/*    "History"         — every past callback, newest first, with a status   */
/*                        badge.                                             */
/*                                                                            */
/*  Same structure/styling approach as DeleteAccountMain: a `fluid` prop      */
/*  toggles between a 300px desktop frame and filling the parent edge to     */
/*  edge, every size inside is measured in `cqw` (1% of the parent's width)  */
/*  so everything scales together, and the scrollbar is hidden while         */
/*  scrolling still works.                                                   */
/*                                                                            */
/*  Usage:                                                                   */
/*    <div style={{ width: 390, height: 800 }}>                              */
/*      <Callbacks                                                          */
/*        fluid                                                             */
/*        supportPhone="+91 97653 03735"                                    */
/*        userPhone="+91 98765 43210"                                       */
/*        history={pastCallbacks}                                           */
/*        onConfirm={(booking) => createCallback(booking)}                  */
/*        onBack={() => goBack()}                                           */
/*      />                                                                   */
/*    </div>                                                                 */
/*                                                                            */
/*  Zero dependencies: no Tailwind-required classNames beyond layout utility */
/*  classes already used by DeleteAccountMain, no icon library, no CSS files. */
/* -------------------------------------------------------------------------- */
export function formatDate(input: string | Date) {
    const d = new Date(input);
    if (isNaN(d.getTime())) return "";

    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}
/* ---------------------------------- types ---------------------------------- */
export interface CallbackHistoryItem {
    id: string;
    topic: string;
    /** ISO-ish display date, e.g. "2026-10-07" */
    date: string;
    timeWindow: string;
    status: CallbackStatus;
    note?: string;
    reference: string;
}

export interface TimeWindowOption {
    id: string;
    label: string;
}

export interface TopicOption {
    id: string;
    label: string;
}

export interface CallbackBooking {
    day: string;
    dayLabel: string
    timeWindow: string;
    topic: string;
}

export interface CallbacksProps {
    title?: string;
    heading?: string;
    subtitle?: string;

    /** The number shown in the subtitle — the number Welvors calls *from*. */
    supportPhone?: string;
    /** The number shown in the "Call booked" card — the number that gets called. */
    userPhone?: string;

    timeWindows?: TimeWindowOption[];
    topics?: TopicOption[];

    history: Callback[];

    onBack?: () => void;
    showBack?: boolean;
    onConfirm?: (booking: CallbackBooking) => void;
    onHelp?: () => void;
    confirming?: boolean;

    /** Fill the parent edge to edge instead of rendering the 300px desktop frame. */
    fluid?: boolean;

    className?: string;
    style?: React.CSSProperties;
}

/* --------------------------------- helpers --------------------------------- */
/** 1 unit = 1% of the parent's width */
const U = (n: number) => `${n}cqw`;
const HAIR = "max(1px, 0.3cqw)";

const C = {
    pink: "#e23a6a",
    pinkDeep: "#c2185b",
    pinkText: "#e0355f",
    pinkSoft: "#fde4ea",
    ink: "#1f1f24",
    grey: "#8a817c",
    greyLight: "#b3b3b3",
    green: "#1f9d55",
    greenSoft: "#e6f6ea",
    blue: "#1d6fd6",
    blueSoft: "#e6f0fd",
    amber: "#b5790c",
    amberSoft: "#fdf2e0",
    border: "#ececec",
    white: "#ffffff",
};

const FONT =
    "'DM Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

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
const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
);
const CheckIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke} strokeWidth={2.8}>
        <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
);

const DEFAULT_TIME_WINDOWS: TimeWindowOption[] = [
    { id: "10-12", label: "10–12 PM" },
    { id: "12-2", label: "12–2 PM" },
    { id: "2-4", label: "2–4 PM" },
    { id: "4-6", label: "4–6 PM" },
    { id: "6-7", label: "6–7 PM" },
];

const DEFAULT_TOPICS: TopicOption[] = [
    { id: "payment", label: "Payment or refund" },
    { id: "account", label: "Account or login" },
    { id: "verification", label: "Verification" },
    { id: "safety", label: "Safety concern" },
    { id: "other", label: "Something else" },
];

const STATUS_STYLE: Record<CallbackStatus, { label: string; fg: string; bg: string }> = {
    REQUESTED: { label: "REQUESTED", fg: C.blue, bg: C.blueSoft },
    SCHEDULED: { label: "SCHEDULED", fg: C.amber, bg: C.amberSoft },
    RESOLVED: { label: "COMPLETED", fg: C.green, bg: C.greenSoft },
    MISSED: { label: "MISSED", fg: C.pinkText, bg: C.pinkSoft },
    CANCELLED: { label: "CANCELLED", fg: C.grey, bg: "#f1eeea" },
};

function makeReference() {
    const n = Math.floor(100000 + Math.random() * 900000);
    return `CB-${n}`;
}

function formatPickedDate(d: Date) {
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/* -------------------------------- component -------------------------------- */
export default function CallbackMain({
    title = "Callbacks",
    heading = "When should we call?",
    subtitle,
    supportPhone = "+91 97653 03735",
    userPhone = "+91 98765 43210",
    timeWindows = DEFAULT_TIME_WINDOWS,
    topics = DEFAULT_TOPICS,
    history,
    onBack,
    showBack = true,
    onConfirm,
    onHelp,
    confirming = false,
    fluid = false,
    className,
    style,
}: CallbacksProps) {
    const [tab, setTab] = React.useState<"request" | "history">("request");

    const [day, setDay] = React.useState<"today" | "tomorrow" | "custom" | null>(null);
    const [customDate, setCustomDate] = React.useState<Date | null>(null);
    const [timeWindowId, setTimeWindowId] = React.useState<string | null>(null);
    const [topicId, setTopicId] = React.useState<string>("");


    const dateInputRef = React.useRef<HTMLInputElement>(null);

    const selectedTimeWindow = timeWindows.find((t) => t.id === timeWindowId) ?? null;
    const selectedTopic = topics.find((t) => t.id === topicId);
    const canConfirm = day !== null && (day !== "custom" || customDate !== null) && selectedTimeWindow !== null && selectedTopic;

    const dayLabel = day === "custom" && customDate
        ? formatDate(customDate)
        : "Pick a date";

    const handlePickDate = () => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click();

    const handleDateChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.value) return;
        setCustomDate(new Date(e.target.value));
        setDay("custom");
    };

    const handleConfirm = () => {
        if (!canConfirm || !selectedTimeWindow) return;
        const booking: CallbackBooking = {
            day: day as "today" | "tomorrow" | "custom",
            dayLabel,
            timeWindow: selectedTimeWindow.label,
            topic: selectedTopic?.label || "",
        };
        onConfirm?.(booking);
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
                        className={`cb-scroll ${className ?? ""}`}
                        style={{
                            width: "100%",
                            height: "100%",
                            containerType: "inline-size",
                            overflowY: "auto",
                            overflowX: "hidden",
                            background: C.white,
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            position: "relative",
                            ...style,
                        }}
                    >
                        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .cb-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease, border-color .12s ease, background-color .12s ease, color .12s ease; }
        .cb-btn:hover:not(:disabled) { filter: brightness(1.05); }
        .cb-btn:active:not(:disabled) { transform: scale(.98); }
        .cb-btn:disabled { cursor: not-allowed; opacity: 0.55; }
        .cb-btn:focus-visible { outline: 2px solid ${C.pink}; outline-offset: 2px; }
        .cb-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .cb-date-input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
      `}</style>

                        <div
                            style={{
                                fontFamily: FONT,
                                color: C.ink,
                                boxSizing: "border-box",
                                minHeight: "100%",
                                padding: `${U(4)} ${U(5)} ${U(8)}`,
                                display: "flex",
                                flexDirection: "column",
                                transition: "filter .15s ease",
                            }}
                        >
                            {/* header */}
                            <header
                                style={{
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minHeight: U(10),
                                    marginBottom: U(6),
                                }}
                            >
                                <button
                                    type="button"
                                    className="cb-btn"
                                    aria-label="Go back"
                                    onClick={onBack}
                                    style={{
                                        position: "absolute",
                                        left: U(-1.9),
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
                                    <BackIcon />
                                </button>
                                <h1 style={{ margin: 0, fontSize: U(4.3), fontWeight: 600, letterSpacing: "0.02em" }}>
                                    {title}
                                </h1>
                            </header>

                            {/* tabs */}
                            <div style={{ display: "flex", alignItems: "center", gap: U(7), borderBottom: `${HAIR} solid ${C.border}` }}>
                                <button
                                    type="button"
                                    className="cb-btn"
                                    onClick={() => setTab("request")}
                                    style={{
                                        background: "transparent",
                                        padding: `0 0 ${U(2.6)}`,
                                        fontSize: U(3.5),
                                        fontWeight: 600,
                                        color: tab === "request" ? C.pinkText : C.grey,
                                        borderBottom: `${U(0.6)} solid ${tab === "request" ? C.pink : "transparent"}`,
                                        marginBottom: `calc(-1 * ${HAIR})`,
                                    }}
                                >
                                    Request a call
                                </button>
                                <button
                                    type="button"
                                    className="cb-btn"
                                    onClick={() => setTab("history")}
                                    style={{
                                        background: "transparent",
                                        padding: `0 0 ${U(2.6)}`,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: U(1.6),
                                        fontSize: U(3.5),
                                        fontWeight: 600,
                                        color: tab === "history" ? C.pinkText : C.grey,
                                        borderBottom: `${U(0.6)} solid ${tab === "history" ? C.pink : "transparent"}`,
                                        marginBottom: `calc(-1 * ${HAIR})`,
                                    }}
                                >
                                    History
                                    <span
                                        style={{
                                            minWidth: U(5),
                                            height: U(5),
                                            padding: `0 ${U(1)}`,
                                            boxSizing: "border-box",
                                            borderRadius: "50%",
                                            background: tab === "history" ? C.pinkSoft : "#efefef",
                                            color: tab === "history" ? C.pinkText : "#8d8d8d",
                                            fontSize: U(2.8),
                                            fontWeight: 600,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        {history.length}
                                    </span>
                                </button>
                            </div>

                            {tab === "request" ? (
                                <>
                                    <h2 style={{ margin: `${U(6.4)} 0 0`, fontSize: U(5.4), fontWeight: 700, lineHeight: 1.2 }}>
                                        {heading}
                                    </h2>
                                    <p style={{ margin: `${U(2.6)} 0 0`, fontSize: U(3.3), lineHeight: 1.55, color: C.grey }}>
                                        {subtitle ?? (
                                            <>
                                                Pick a day and a time window that suits you. We call from{" "}
                                                <strong style={{ color: C.ink }}>{supportPhone}</strong> — usually within your
                                                chosen slot.
                                            </>
                                        )}
                                    </p>

                                    {/* day */}
                                    <p
                                        style={{
                                            margin: `${U(6.4)} 0 ${U(3)}`,
                                            fontSize: U(2.8),
                                            fontWeight: 700,
                                            letterSpacing: "0.08em",
                                            color: C.grey,
                                        }}
                                    >
                                        DAY
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: U(2.6) }}>
                                        <Pill selected={day === "today"} onClick={() => setDay("today")}>
                                            Today
                                        </Pill>
                                        <Pill selected={day === "tomorrow"} onClick={() => setDay("tomorrow")}>
                                            Tomorrow
                                        </Pill>
                                        <Pill selected={day === "custom"} onClick={handlePickDate}>
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: U(1.6) }}>
                                                <span style={{ fontSize: U(3.2), display: "flex" }}>
                                                    <CalendarIcon />
                                                </span>
                                                {dayLabel}
                                            </span>
                                        </Pill>
                                        <input
                                            ref={dateInputRef}
                                            type="date"
                                            className="cb-date-input"
                                            onChange={handleDateChosen}
                                            min={new Date().toISOString().slice(0, 10)}
                                            aria-label="Pick a date"
                                        />
                                    </div>

                                    {/* time window */}
                                    <p
                                        style={{
                                            margin: `${U(6.4)} 0 ${U(3)}`,
                                            fontSize: U(2.8),
                                            fontWeight: 700,
                                            letterSpacing: "0.08em",
                                            color: C.grey,
                                        }}
                                    >
                                        TIME WINDOW
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: U(2.6) }}>
                                        {timeWindows.map((t) => (
                                            <Pill key={t.id} selected={timeWindowId === t.id} onClick={() => setTimeWindowId(t.id)}>
                                                {t.label}
                                            </Pill>
                                        ))}
                                    </div>

                                    {/* topic */}
                                    <p
                                        style={{
                                            margin: `${U(6.4)} 0 ${U(3)}`,
                                            fontSize: U(2.8),
                                            fontWeight: 700,
                                            letterSpacing: "0.08em",
                                            color: C.grey,
                                        }}
                                    >
                                        WHAT&rsquo;S IT ABOUT? <span style={{ fontWeight: 500 }}>Optional</span>
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: U(2.6) }}>
                                        {topics.map((t) => (
                                            <Pill key={t.id} selected={topicId === t.id} onClick={() => setTopicId((cur) => (cur === t.id ? "" : t.id))}>
                                                {t.label}
                                            </Pill>
                                        ))}
                                    </div>

                                    {/* spacer pushes the button down when there's room */}
                                    <div style={{ flex: 1, minHeight: U(6) }} />

                                    <button
                                        type="button"
                                        className="cb-btn"
                                        onClick={handleConfirm}
                                        disabled={!canConfirm || confirming}
                                        style={{
                                            marginTop: U(8),
                                            width: "100%",
                                            height: U(13.9),
                                            borderRadius: U(4.6),
                                            background: canConfirm
                                                ? `linear-gradient(90deg, ${C.pink}, ${C.pinkDeep})`
                                                : "#efeae3",
                                            color: canConfirm ? C.white : "#8d897f",
                                            fontSize: U(4),
                                            fontWeight: 600,
                                            boxShadow: canConfirm ? `0 ${U(1.2)} ${U(3.4)} rgba(226,58,106,.35)` : "none",
                                        }}
                                    >
                                        {confirming ? "Booking…" : "Confirm"}
                                    </button>
                                </>
                            ) : (
                                <HistoryList history={history} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

/* ------------------------------- sub-components ------------------------------ */
function Pill({
    selected,
    onClick,
    children,
}: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            className="cb-btn"
            onClick={onClick}
            aria-pressed={selected}
            style={{
                padding: `${U(2.4)} ${U(4)}`,
                borderRadius: U(6),
                background: selected ? C.pinkSoft : C.white,
                border: `${U(0.3)} solid ${selected ? C.pink : "#e2ddd3"}`,
                color: selected ? C.pinkText : C.ink,
                fontSize: U(3.2),
                fontWeight: selected ? 600 : 500,
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </button>
    );
}

function HistoryList({ history }: { history: Callback[] }) {
    return (
        <>
            <h2 style={{ margin: `${U(6.4)} 0 0`, fontSize: U(5.4), fontWeight: 700, lineHeight: 1.2 }}>
                Past callbacks
            </h2>
            <p style={{ margin: `${U(2.6)} 0 0`, fontSize: U(3.3), lineHeight: 1.55, color: C.grey }}>
                Every call we&rsquo;ve made to you, and how it ended.
            </p>

            {history.length === 0 ? (
                <p style={{ margin: `${U(8)} 0 0`, textAlign: "center", fontSize: U(3.3), color: C.greyLight }}>
                    No callbacks yet.
                </p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: U(3.2), marginTop: U(6) }}>
                    {history.map((item) => {
                        const s = STATUS_STYLE[item.status];
                        return (
                            <div
                                key={item.id}
                                style={{
                                    padding: `${U(4)} ${U(4.4)}`,
                                    background: "#faf8f6",
                                    border: `${HAIR} solid ${C.border}`,
                                    borderRadius: U(4.6),
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: U(2.6) }}>
                                    <h3 style={{ margin: 0, fontSize: U(3.8), fontWeight: 700, lineHeight: 1.3 }}>{item.topic}</h3>
                                    <span
                                        style={{
                                            flexShrink: 0,
                                            padding: `${U(1)} ${U(2.4)}`,
                                            borderRadius: U(3),
                                            background: s.bg,
                                            color: s.fg,
                                            fontSize: U(2.4),
                                            fontWeight: 700,
                                            letterSpacing: "0.05em",
                                        }}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                                <p style={{ margin: `${U(1.2)} 0 0`, fontSize: U(2.9), color: C.grey }}>
                                    {formatDate(item.callbackDate)} · {item.timeWindow}
                                </p>
                                <p
                                    style={{
                                        margin: `${U(3)} 0 0`,
                                        paddingTop: U(3),
                                        borderTop: `${HAIR} dashed ${C.border}`,
                                        fontSize: U(3.1),
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {item.resolutionNote == null ? "We will call you soon" : item.resolutionNote}                                    </p>
                                <p style={{ margin: `${U(2.4)} 0 0`, fontSize: U(2.7), color: C.greyLight }}>
                                    {item.callbackNumber}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}
