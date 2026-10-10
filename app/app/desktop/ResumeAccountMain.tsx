import React from "react";

/* -------------------------------------------------------------------------- */
/*  ResumeAccount                                                             */
/*                                                                            */
/*  One independent, fully fluid screen: back button + title, a short        */
/*  message confirming the account is currently paused (matches & chats are   */
/*  still safe, profile is still hidden), and two stacked buttons —          */
/*  "Resume account" (primary) and "Stay paused" (secondary).                */
/*                                                                            */
/*  It fills 100% width and 100% height of its PARENT. Every size inside      */
/*  (fonts, padding, gaps, radii, buttons) is measured in `cqw`, i.e. 1% of   */
/*  the parent's width, so everything scales with the parent. If the         */
/*  content is taller than the parent's height, it scrolls vertically        */
/*  (scrollbar hidden across browsers, scrolling still works).               */
/*                                                                            */
/*  Usage:                                                                   */
/*    <div style={{ width: 390, height: 800 }}>                              */
/*      <ResumeAccount                                                      */
/*        onBack={() => goBack()}                                           */
/*        onStayPaused={() => goBack()}                                     */
/*        onResumeAccount={() => resumeAccount()}                           */
/*      />                                                                   */
/*    </div>                                                                 */
/*                                                                            */
/*  Zero dependencies: no Tailwind, no icon library, no CSS files.           */
/* -------------------------------------------------------------------------- */

export interface ResumeAccountPoint {
    text: string;
    /** "safe" renders a green check, "hidden" renders a muted eye-off mark. */
    kind: "safe" | "hidden";
}

export interface ResumeAccountProps {
    title?: string;
    message?: string;
    points?: ResumeAccountPoint[];

    resumeLabel?: string;
    stayPausedLabel?: string;

    onBack?: () => void;
    showBack?: boolean;
    onStayPaused?: () => void;
    onResumeAccount?: () => void;
    resuming?: boolean;

    className?: string;
    style?: React.CSSProperties;
    fluid?: boolean;
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
    green: "#1f9d55",
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
const PlayIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} fill="currentColor">
        <path d="M7 4.5v15a1 1 0 0 0 1.5.87l12-7.5a1 1 0 0 0 0-1.74l-12-7.5A1 1 0 0 0 7 4.5Z" />
    </svg>
);
const CheckIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke} strokeWidth={2.6}>
        <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
);
const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <path d="M3 3l18 18" />
        <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6 0 9.5 6 9.9 7a11.9 11.9 0 0 1-3 3.9M6.6 6.6C3.9 8.3 2.2 10.9 2.1 12c.4 1 3.9 7 9.9 7 1.3 0 2.5-.3 3.6-.7" />
        <path d="M9.9 10a3 3 0 0 0 4.1 4.1" />
    </svg>
);

const DEFAULT_POINTS: ResumeAccountPoint[] = [
    { kind: "hidden", text: "Your account is paused — your profile is hidden and no one can find or match with you right now." },
    { kind: "safe", text: "Your matches and chat history are untouched and ready when you are." },
    { kind: "safe", text: "Resuming instantly makes you visible again — new likes and messages can come in right away." },
];

/* -------------------------------- component -------------------------------- */
export default function ResumeAccountMain({
    title = "You're currently paused",
    message = "Ready to be seen again? Resuming puts your profile back in front of people right away.",
    points = DEFAULT_POINTS,
    resumeLabel = "Resume account",
    stayPausedLabel = "Stay paused",
    onBack,
    showBack = true,
    onStayPaused,
    onResumeAccount,
    resuming = false,
    className,
    style,
    fluid = false,
}: ResumeAccountProps) {
    return (
        <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
            {/* Card container – fills remaining height */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden ">

                {/* Profile card */}
                <div
                    className={fluid
                        ? "absolute inset-0 overflow-hidden"
                        : "  mt-2 w-[320px] sm:w-[300px] h-[480px] sm:h-[520px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out "}>
                    <div
                        className={`ra-scroll ${className ?? ""}`}
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
        .ra-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease; }
        .ra-btn:hover:not(:disabled) { filter: brightness(1.05); }
        .ra-btn:active:not(:disabled) { transform: scale(.98); }
        .ra-btn:disabled { cursor: not-allowed; opacity: 0.6; }
        .ra-btn:focus-visible { outline: 2px solid ${C.pink}; outline-offset: 2px; }
        .ra-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
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
                                    marginBottom: U(7),
                                }}
                            >
                                <button
                                    type="button"
                                    className="ra-btn"
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
                                    Account paused
                                </h1>
                            </header>

                            {/* play icon */}
                            <div
                                style={{
                                    width: U(16),
                                    height: U(16),
                                    margin: "0 auto",
                                    borderRadius: "50%",
                                    background: C.pinkSoft,
                                    color: C.pinkText,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: U(6.4),
                                }}
                            >
                                <PlayIcon />
                            </div>

                            {/* title + message */}
                            <h2
                                style={{
                                    margin: `${U(6)} 0 0`,
                                    textAlign: "center",
                                    fontSize: U(5.4),
                                    fontWeight: 700,
                                    lineHeight: 1.25,
                                }}
                            >
                                {title}
                            </h2>
                            <p
                                style={{
                                    margin: `${U(3)} 0 0`,
                                    textAlign: "center",
                                    fontSize: U(3.4),
                                    lineHeight: 1.55,
                                    color: C.grey,
                                }}
                            >
                                {message}
                            </p>

                            {/* points */}
                            {points.length > 0 && (
                                <ul
                                    style={{
                                        listStyle: "none",
                                        margin: `${U(5.2)} 0 0`,
                                        padding: `${U(4.4)} ${U(4.8)}`,
                                        background: "#faf8f6",
                                        border: `${HAIR} solid ${C.border}`,
                                        borderRadius: U(4.6),
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: U(3),
                                    }}
                                >
                                    {points.map((p, i) => (
                                        <li
                                            key={i}
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: U(2.6),
                                                fontSize: U(3.15),
                                                lineHeight: 1.5,
                                                color: "#3a3632",
                                            }}
                                        >
                                            <span
                                                aria-hidden
                                                style={{
                                                    flexShrink: 0,
                                                    marginTop: "0.15em",
                                                    width: U(4.4),
                                                    height: U(4.4),
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: U(2.4),
                                                    background: p.kind === "safe" ? "#e5f6ea" : "#f1eeea",
                                                    color: p.kind === "safe" ? C.green : C.grey,
                                                }}
                                            >
                                                {p.kind === "safe" ? <CheckIcon /> : <EyeOffIcon />}
                                            </span>
                                            {p.text}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* spacer pushes buttons down when there's room */}
                            <div style={{ flex: 1, minHeight: U(6) }} />

                            {/* buttons */}
                            <div style={{ display: "flex", flexDirection: "column", gap: U(3), marginTop: U(8) }}>
                                <button
                                    type="button"
                                    className="ra-btn"
                                    onClick={onResumeAccount}
                                    disabled={resuming}
                                    style={{
                                        width: "100%",
                                        height: U(13.9),
                                        borderRadius: U(4.6),
                                        background: `linear-gradient(90deg, ${C.pink}, ${C.pinkDeep})`,
                                        color: C.white,
                                        fontSize: U(4),
                                        fontWeight: 600,
                                        boxShadow: `0 ${U(1.2)} ${U(3.4)} rgba(226,58,106,.35)`,
                                    }}
                                >
                                    {resuming ? "Resuming…" : resumeLabel}
                                </button>

                                <button
                                    type="button"
                                    className="ra-btn"
                                    onClick={onStayPaused}
                                    style={{
                                        width: "100%",
                                        height: U(13.9),
                                        borderRadius: U(4.6),
                                        background: C.white,
                                        border: `${U(0.3)} solid ${C.border}`,
                                        color: C.ink,
                                        fontSize: U(4),
                                        fontWeight: 600,
                                    }}
                                >
                                    {stayPausedLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
