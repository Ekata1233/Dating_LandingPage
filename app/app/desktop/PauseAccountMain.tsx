import React from "react";

/* -------------------------------------------------------------------------- */
/*  PauseAccount                                                              */
/*                                                                            */
/*  One independent, fully fluid screen: back button + title, a short        */
/*  message about what pausing does (matches & chats stay safe, profile is   */
/*  hidden from everyone), and two stacked buttons — "Pause account"         */
/*  (primary) and "Not now, keep browsing" (secondary).                      */
/*                                                                            */
/*  It fills 100% width and 100% height of its PARENT. Every size inside      */
/*  (fonts, padding, gaps, radii, buttons) is measured in `cqw`, i.e. 1% of   */
/*  the parent's width, so everything scales with the parent. If the         */
/*  content is taller than the parent's height, it scrolls vertically        */
/*  (scrollbar hidden across browsers, scrolling still works).               */
/*                                                                            */
/*  Usage:                                                                   */
/*    <div style={{ width: 390, height: 800 }}>                              */
/*      <PauseAccount                                                       */
/*        onBack={() => goBack()}                                           */
/*        onKeepBrowsing={() => goBack()}                                   */
/*        onPauseAccount={() => pauseAccount()}                             */
/*      />                                                                   */
/*    </div>                                                                 */
/*                                                                            */
/*  Zero dependencies: no Tailwind, no icon library, no CSS files.           */
/* -------------------------------------------------------------------------- */

export interface PauseAccountPoint {
    text: string;
    /** "safe" renders a green check, "hidden" renders a muted eye-off mark. */
    kind: "safe" | "hidden";
}

export interface PauseAccountProps {
    title?: string;
    message?: string;
    points?: PauseAccountPoint[];

    pauseLabel?: string;
    keepBrowsingLabel?: string;
    reasonLabel?: string;
    reasonPlaceholder?: string;
    reasonMaxLength?: number;
    /** Controlled value. Omit to let the component manage its own state. */
    reason?: string;
    onReasonChange?: (reason: string) => void;
    onBack?: () => void;
    showBack?: boolean;
    onKeepBrowsing?: () => void;
    onPauseAccount?: (data: { reason: string }) => void;
    pausing?: boolean;

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
const PauseIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} fill="currentColor">
        <rect x="6" y="4" width="4" height="16" rx="1.2" />
        <rect x="14" y="4" width="4" height="16" rx="1.2" />
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

const DEFAULT_POINTS: PauseAccountPoint[] = [
    { kind: "safe", text: "Your matches and chat history stay exactly as they are." },
    { kind: "safe", text: "Any wallet balance or rewards you've earned are kept." },
    { kind: "hidden", text: "Your profile is hidden — no one new can find or match with you." },
    { kind: "hidden", text: "You won't receive new likes or messages while paused." },
];

/* -------------------------------- component -------------------------------- */
export default function PauseAccountMain({
    title = "Pause your account?",
    message = "Taking a break? Pausing hides you from Welvors without losing anything.",
    points = DEFAULT_POINTS,
    reasonLabel = "Help us improve (optional)",
    reasonPlaceholder = "What's prompting the pause?",
    reasonMaxLength = 300,
    reason,
    onReasonChange,
    pauseLabel = "Pause account",
    keepBrowsingLabel = "Not now, keep browsing",
    onBack,
    showBack = true,
    onKeepBrowsing,
    onPauseAccount,
    pausing = false,
    className,
    style,
    fluid = false,
}: PauseAccountProps) {
    const [reasonInner, setReasonInner] = React.useState("");
    const reasonValue = reason ?? reasonInner;

    const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const next = e.target.value.slice(0, reasonMaxLength);
        if (reason === undefined) setReasonInner(next);
        onReasonChange?.(next);
    };
    return (
        <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
            {/* Card container – fills remaining height */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden ">
                {/* Profile card */}
                <div
                    className={
                        fluid
                            ? "absolute inset-0 overflow-hidden"
                            : "mt-2 w-[320px] sm:w-[300px] h-[480px] sm:h-[520px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out"
                    }
                >
                    <div
                        className={`pa-scroll ${className ?? ""}`}
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

            .pa-btn {
                cursor: pointer;
                border: 0;
                font: inherit;
                transition: transform .12s ease, filter .12s ease;
            }

            .pa-btn:hover:not(:disabled) {
                filter: brightness(1.05);
            }

            .pa-btn:active:not(:disabled) {
                transform: scale(.98);
            }

            .pa-btn:disabled {
                cursor: not-allowed;
                opacity: 0.6;
            }

            .pa-btn:focus-visible {
                outline: 2px solid ${C.pink};
                outline-offset: 2px;
            }

            .pa-textarea {
                font-family: inherit;
            }

            .pa-textarea::placeholder {
                color: ${C.grey};
            }

            .pa-textarea:focus-visible {
                outline: 2px solid ${C.pink};
                outline-offset: 2px;
            }

            .pa-scroll::-webkit-scrollbar {
                display: none;
                width: 0;
                height: 0;
            }
        `}</style>

                        <div
                            style={{
                                fontFamily: FONT,
                                color: C.ink,
                                boxSizing: "border-box",
                                minHeight: "100%",
                                padding: `${U(3)} ${U(5)} ${U(5)}`,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {/* Header */}
                            <header
                                style={{
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minHeight: U(9),
                                    marginBottom: U(4),
                                }}
                            >
                                <button
                                    type="button"
                                    className="pa-btn"
                                    aria-label="Go back"
                                    onClick={onBack}
                                    style={{
                                        position: "absolute",
                                        left: U(-1.9),
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: U(9),
                                        height: U(9),
                                        borderRadius: "50%",
                                        background: C.white,
                                        border: `${HAIR} solid ${C.border}`,
                                        boxShadow: `0 ${U(0.5)} ${U(2)} rgba(0,0,0,.06)`,
                                        color: C.ink,
                                        fontSize: U(3.7),
                                        display: showBack ? "flex" : "none",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: 0,
                                    }}
                                >
                                    <BackIcon />
                                </button>

                                <h1
                                    style={{
                                        margin: 0,
                                        fontSize: U(4),
                                        fontWeight: 600,
                                        letterSpacing: "0.02em",
                                    }}
                                >
                                    Pause account
                                </h1>
                            </header>

                            {/* Pause icon */}
                            <div
                                style={{
                                    width: U(14),
                                    height: U(14),
                                    margin: "0 auto",
                                    borderRadius: "50%",
                                    background: C.pinkSoft,
                                    color: C.pinkText,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: U(5.6),
                                }}
                            >
                                <PauseIcon />
                            </div>

                            {/* Title */}
                            <h2
                                style={{
                                    margin: `${U(3.5)} 0 0`,
                                    textAlign: "center",
                                    fontSize: U(5),
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                }}
                            >
                                {title}
                            </h2>

                            {/* Message */}
                            <p
                                style={{
                                    margin: `${U(2)} 0 0`,
                                    textAlign: "center",
                                    fontSize: U(3.2),
                                    lineHeight: 1.45,
                                    color: C.grey,
                                }}
                            >
                                {message}
                            </p>

                            {/* Points */}
                            {points.length > 0 && (
                                <ul
                                    style={{
                                        listStyle: "none",
                                        margin: `${U(3.5)} 0 0`,
                                        padding: `${U(3.5)} ${U(4)}`,
                                        background: "#faf8f6",
                                        border: `${HAIR} solid ${C.border}`,
                                        borderRadius: U(4),
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: U(2),
                                    }}
                                >
                                    {points.map((p, i) => (
                                        <li
                                            key={i}
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: U(2.3),
                                                fontSize: U(3),
                                                lineHeight: 1.45,
                                                color: "#3a3632",
                                            }}
                                        >
                                            <span
                                                aria-hidden
                                                style={{
                                                    flexShrink: 0,
                                                    marginTop: "0.15em",
                                                    width: U(4),
                                                    height: U(4),
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: U(2.2),
                                                    background:
                                                        p.kind === "safe"
                                                            ? "#e5f6ea"
                                                            : "#f1eeea",
                                                    color:
                                                        p.kind === "safe"
                                                            ? C.green
                                                            : C.grey,
                                                }}
                                            >
                                                {p.kind === "safe" ? (
                                                    <CheckIcon />
                                                ) : (
                                                    <EyeOffIcon />
                                                )}
                                            </span>

                                            {p.text}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Reason */}
                            {reasonLabel !== "" && (
                                <div style={{ marginTop: U(3.5) }}>
                                    <label
                                        htmlFor="pa-reason"
                                        style={{
                                            display: "block",
                                            marginBottom: U(1.5),
                                            fontSize: U(3),
                                            fontWeight: 600,
                                            color: C.ink,
                                        }}
                                    >
                                        {reasonLabel}
                                    </label>

                                    <textarea
                                        id="pa-reason"
                                        className="pa-textarea"
                                        value={reasonValue}
                                        onChange={handleReasonChange}
                                        maxLength={reasonMaxLength}
                                        placeholder={reasonPlaceholder}
                                        rows={3}
                                        style={{
                                            width: "100%",
                                            boxSizing: "border-box",
                                            resize: "vertical",
                                            minHeight: U(20),
                                            padding: `${U(3)} ${U(3.5)}`,
                                            background: C.white,
                                            border: `${HAIR} solid ${C.border}`,
                                            borderRadius: U(3.8),
                                            fontSize: U(3.1),
                                            lineHeight: 1.45,
                                            color: C.ink,
                                        }}
                                    />

                                    <span
                                        style={{
                                            display: "block",
                                            marginTop: U(1),
                                            textAlign: "right",
                                            fontSize: U(2.5),
                                            color: C.grey,
                                        }}
                                    >
                                        {reasonValue.length} / {reasonMaxLength}
                                    </span>
                                </div>
                            )}

                            {/* buttons */}
                            <div style={{ display: "flex", flexDirection: "column", gap: U(3), marginTop: U(7) }}>
                                <button
                                    type="button"
                                    className="pa-btn"
                                    onClick={() => onPauseAccount?.({ reason: reasonValue })}
                                    disabled={pausing}
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
                                    {pausing ? "Pausing…" : pauseLabel}
                                </button>

                                <button
                                    type="button"
                                    className="pa-btn"
                                    onClick={onKeepBrowsing}
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
                                    {keepBrowsingLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
