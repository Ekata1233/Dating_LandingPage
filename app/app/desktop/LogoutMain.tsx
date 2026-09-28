import { useActiveSection } from "@/app/context/ActiveSectionContext";
import React, { useCallback } from "react";

/* -------------------------------------------------------------------------- */
/*  LogoutMain                                                             */
/*                                                                            */
/*  Independent, fully fluid "Log out" confirmation screen. It fills 100%     */
/*  width and 100% height of its PARENT. Every size inside (fonts, padding,   */
/*  gaps, radii, icons, illustration, buttons) is measured in `cqw` = 1% of   */
/*  the parent's width, so the whole screen scales with whatever it is placed */
/*  in. The action buttons stay pinned to the bottom of the parent; if the    */
/*  content is taller than the parent, the screen scrolls.                    */
/*                                                                            */
/*  Usage:                                                                    */
/*    <div style={{ width: 390, height: 800 }}>                               */
/*      <LogoutMain onLogout={signOut} onStay={() => history.back()} />    */
/*    </div>                                                                  */
/*                                                                            */
/*  Zero dependencies: no Tailwind, no icon library, no CSS files.            */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */
export interface SafeItem {
    id?: string | number;
    title: string;
    description: string;
    /** "safe" = green check, "warning" = amber exclamation */
    tone?: "safe" | "warning";
}

export interface LogoutMainProps {
    title?: string;
    showHeader?: boolean;
    heading?: string;
    subtitle?: string;
    sectionLabel?: string;
    items?: SafeItem[];
    logoutLabel?: string;
    stayLabel?: string;
    /** Shows a busy state on the logout button and disables both actions */
    loggingOut?: boolean;
    /** Replace the default illustration with your own node */
    illustration?: React.ReactNode;

    onBack?: () => void;
    showBack?: boolean;
    onLogout?: () => void;
    onStay?: () => void;

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
const HAIR = "max(1px, 0.25cqw)";

const C = {
    ink: "#1c1c21",
    grey: "#8b8b8b",
    greyWarm: "#8d8778",
    divider: "#f0efe2",
    border: "#eeeeee",
    white: "#ffffff",
    pink: "#e5386a",
    green: "#2aa565",
    greenBg: "#e6f6ec",
    amber: "#f5a623",
    amberBg: "#fff3d9",
};

const FONT = "'DM Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/* ---------------------------------- icons ---------------------------------- */
const iconBase: React.CSSProperties = { width: "1em", height: "1em", display: "block" };

const BackIcon = () => (
    <svg viewBox="0 0 24 24" style={iconBase} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5l-7 7 7 7" />
    </svg>
);
const CheckIcon = () => (
    <svg viewBox="0 0 24 24" style={iconBase} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.500l4.500 4.500L19 7" />
    </svg>
);
const BangIcon = () => (
    <svg viewBox="0 0 24 24" style={iconBase} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M12 5v9" />
        <path d="M12 19.500v.01" />
    </svg>
);

/* ------------------------------ illustration ------------------------------- */
const HAIR_COLOR = "#1c0b30";
const SKIN = "#f9a473";
const SKIN_DARK = "#ee8a5c";

const ThinkingPerson = () => (
    <svg viewBox="0 0 170 224" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden>
        {/* hair back */}
        <g fill={HAIR_COLOR}>
            <circle cx="34" cy="62" r="19" />
            <circle cx="52" cy="36" r="20" />
            <circle cx="80" cy="24" r="22" />
            <circle cx="106" cy="34" r="20" />
            <circle cx="122" cy="58" r="17" />
        </g>
        {/* ears */}
        <circle cx="28" cy="106" r="8" fill={SKIN} />
        <circle cx="128" cy="82" r="7" fill={SKIN} />
        {/* neck + collar */}
        <path d="M62 136h34v36c-6 6-28 6-34 0z" fill={SKIN_DARK} />
        <rect x="61" y="143" width="36" height="8" rx="4" fill="#f36b7f" />
        {/* arm + finger */}
        <path
            d="M118 224 L120 174 Q123 166 130 168 L132 132 Q133 120 141 122 Q149 124 148 134 L146 152 Q170 166 170 224 Z"
            fill={SKIN}
        />
        {/* shirt */}
        <path d="M0 224 C0 196 16 176 52 170 L98 170 C114 172 122 184 124 198 L118 224 Z" fill="#f5147a" />
        {/* face */}
        <ellipse cx="78" cy="95" rx="48" ry="52" fill={SKIN} />
        {/* fringe */}
        <g fill={HAIR_COLOR}>
            <circle cx="46" cy="50" r="17" />
            <circle cx="68" cy="46" r="17" />
            <circle cx="92" cy="47" r="17" />
            <circle cx="113" cy="56" r="14" />
        </g>
        {/* cheeks */}
        <circle cx="54" cy="106" r="7" fill="#ff4fa3" />
        <circle cx="108" cy="90" r="7" fill="#ff4fa3" />
        {/* brows */}
        <path d="M50 76L68 82" stroke={HAIR_COLOR} strokeWidth="4.500" strokeLinecap="round" />
        <path d="M80 74L97 68" stroke={HAIR_COLOR} strokeWidth="4.500" strokeLinecap="round" />
        {/* eyes */}
        <circle cx="62" cy="93" r="3.600" fill={HAIR_COLOR} />
        <circle cx="93" cy="90" r="3.600" fill={HAIR_COLOR} />
        {/* nose */}
        <path d="M79 96Q75 108 84 112" fill="none" stroke="#c8724a" strokeWidth="2.200" strokeLinecap="round" />
        {/* mouth */}
        <path d="M76 124Q90 114 102 122Q94 132 84 130Z" fill="#e9583f" />
    </svg>
);

/* -------------------------------- defaults --------------------------------- */
const DEFAULT_ITEMS: SafeItem[] = [
    { title: "Matches & chats", description: "Every conversation stays exactly where it is", tone: "safe" },
    { title: "Wallet & plan", description: "₹3,240 and your plan stay active", tone: "safe" },
    { title: "Bookings & plans", description: "Event tickets and date plans unaffected", tone: "safe" },
    { title: "Notifications pause", description: "You won't get match or message alerts", tone: "warning" },
];

/* -------------------------------- component -------------------------------- */
export default function LogoutMain({
    title = "Log out",
    showHeader = true,
    heading = "Log out of Welvors?",
    subtitle = "You'll need your number and a one-time code to get back in.",
    sectionLabel = "What stays safe",
    items = DEFAULT_ITEMS,
    logoutLabel = "Log out of this device",
    stayLabel = "Stay logged in",
    loggingOut = false,
    illustration,
    onBack,
    showBack = true,
    onLogout,
    onStay,
    fluid = false,
    className,
    style,
}: LogoutMainProps) {
    const { setActiveSection } = useActiveSection();

    const handleCLick = useCallback(
        () => () => setActiveSection("profile"),
        [setActiveSection]
    );
    return (
        <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
            {/* Card container – fills remaining height */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                <div className={fluid ? "hidden" : "w-[300px] flex gap-1 justify-start items-start"}>
                </div>
                {/* Profile card */}
                <div
                    className={fluid
                        ? "absolute inset-0 overflow-hidden"
                        : "  mt-2 w-[320px] sm:w-[300px] h-[480px] sm:h-[520px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out"}>
                    <div
                        className={className}
                        style={{
                            width: "100%",
                            height: "100%",
                            containerType: "inline-size",
                            overflowY: "auto",
                            overflowX: "hidden",
                            background: C.white,
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            ...style,
                        }}
                    >
                        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .lc-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease, opacity .12s ease; }
        .lc-btn:hover:not(:disabled) { filter: brightness(1.05); }
        .lc-btn:active:not(:disabled) { transform: scale(.98); }
        .lc-btn:disabled { cursor: not-allowed; opacity: .65; }
        .lc-btn:focus-visible { outline: 2px solid ${C.pink}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { .lc-btn { transition: none; } }
      `}</style>

                        <div
                            style={{
                                fontFamily: FONT,
                                color: C.ink,
                                boxSizing: "border-box",
                                minHeight: "100%",
                                display: "flex",
                                flexDirection: "column",
                                padding: `${U(4)} ${U(6.1)} ${U(5)}`,
                            }}
                        >
                            {/* header */}
                            {showHeader && (
                                <header
                                    style={{
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minHeight: U(10),
                                        marginBottom: U(3.5),
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="lc-btn cursor-pointer"
                                        aria-label="Go back"
                                        onClick={onBack ?? handleCLick()}
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
                                    <h1 style={{ margin: 0, fontSize: U(4.4), fontWeight: 600 }}>{title}</h1>
                                </header>

                            )}

                            {/* illustration + copy */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                                <div style={{ width: U(23.6), height: U(31), display: "block" }}>
                                    {illustration ?? <ThinkingPerson />}
                                </div>
                                <h2
                                    style={{
                                        margin: `${U(3.9)} 0 0`,
                                        fontSize: U(5.8),
                                        fontWeight: 700,
                                        lineHeight: 1.2,
                                        letterSpacing: "-0.01em",
                                    }}
                                >
                                    {heading}
                                </h2>
                                <p
                                    style={{
                                        margin: `${U(3.6)} 0 0`,
                                        maxWidth: U(80),
                                        fontSize: U(3.75),
                                        lineHeight: 1.4,
                                        fontWeight: 500,
                                        color: C.greyWarm,
                                    }}
                                >
                                    {subtitle}
                                </p>
                            </div>

                            {/* what stays safe */}
                            <h3
                                style={{
                                    margin: `${U(6)} 0 ${U(3.8)}`,
                                    fontSize: U(2.9),
                                    fontWeight: 600,
                                    letterSpacing: "0.13em",
                                    textTransform: "uppercase",
                                    color: C.greyWarm,
                                }}
                            >
                                {sectionLabel}
                            </h3>

                            <ul
                                style={{
                                    listStyle: "none",
                                    margin: 0,
                                    padding: 0,
                                    background: C.white,
                                    border: `${HAIR} solid ${C.border}`,
                                    borderRadius: U(5.5),
                                    boxShadow: `0 ${U(0.8)} ${U(3.4)} rgba(0,0,0,.06)`,
                                    overflow: "hidden",
                                }}
                            >
                                {items.map((it, i) => {
                                    const warn = it.tone === "warning";
                                    return (
                                        <li
                                            key={it.id ?? i}
                                            style={{
                                                display: "flex",
                                                alignItems: "stretch",
                                                paddingLeft: U(4),
                                            }}
                                        >
                                            <div
                                                style={{
                                                    flex: `0 0 ${U(6.1)}`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    marginRight: U(4.2),
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        width: U(6.1),
                                                        height: U(6.1),
                                                        borderRadius: "50%",
                                                        background: warn ? C.amberBg : C.greenBg,
                                                        color: warn ? C.amber : C.green,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: warn ? U(3.4) : U(3.6),
                                                    }}
                                                >
                                                    {warn ? <BangIcon /> : <CheckIcon />}
                                                </span>
                                            </div>

                                            <div
                                                style={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    justifyContent: "center",
                                                    gap: U(1),
                                                    minHeight: U(18),
                                                    boxSizing: "border-box",
                                                    padding: `${U(3.4)} ${U(3)} ${U(3.4)} 0`,
                                                    borderTop: i === 0 ? "none" : `${HAIR} solid ${C.divider}`,
                                                }}
                                            >
                                                <span style={{ fontSize: U(3.5), fontWeight: 500, lineHeight: 1.3 }}>{it.title}</span>
                                                <span style={{ fontSize: U(3.05), lineHeight: 1.35, color: C.grey }}>{it.description}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* spacer keeps actions pinned to the bottom of the parent */}
                            <div style={{ flex: "1 1 auto", minHeight: U(8) }} />

                            {/* actions */}
                            <button
                                type="button"
                                className="lc-btn"
                                onClick={onLogout}
                                disabled={loggingOut}
                                style={{
                                    width: "100%",
                                    height: U(13.2),
                                    borderRadius: U(3.9),
                                    background: C.pink,
                                    color: C.white,
                                    fontSize: U(3.75),
                                    fontWeight: 600,
                                    letterSpacing: "0.01em",
                                    boxShadow: `0 ${U(1.6)} ${U(4)} rgba(229,56,106,.35)`,
                                }}
                            >
                                {loggingOut ? "Logging out…" : logoutLabel}
                            </button>

                            <button
                                type="button"
                                className="lc-btn"
                                onClick={onStay}
                                disabled={loggingOut}
                                style={{
                                    alignSelf: "center",
                                    marginTop: U(2),
                                    padding: `${U(3.4)} ${U(6)}`,
                                    background: "transparent",
                                    color: C.greyWarm,
                                    fontSize: U(3.6),
                                    fontWeight: 500,
                                }}
                            >
                                {stayLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>

    );
}
