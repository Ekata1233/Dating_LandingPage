import React from "react";

/* -------------------------------------------------------------------------- */
/*  DeleteAccount                                                             */
/*                                                                            */
/*  One independent, fully fluid screen: back button + title, a short         */
/*  warning message about what happens if the account is deleted, and two    */
/*  stacked buttons — "Continue exploring" (primary) and "Delete account"    */
/*  (destructive, secondary).                                                */
/*                                                                            */
/*  It fills 100% width and 100% height of its PARENT. Every size inside      */
/*  (fonts, padding, gaps, radii, buttons) is measured in `cqw`, i.e. 1% of   */
/*  the parent's width, so everything scales with the parent. If the         */
/*  content is taller than the parent's height, it scrolls vertically        */
/*  (scrollbar hidden across browsers, scrolling still works).               */
/*                                                                            */
/*  Usage:                                                                   */
/*    <div style={{ width: 390, height: 800 }}>                              */
/*      <DeleteAccount                                                      */
/*        onBack={() => goBack()}                                           */
/*        onContinue={() => goBack()}                                       */
/*        onDeleteAccount={() => deleteAccount()}                           */
/*      />                                                                   */
/*    </div>                                                                 */
/*                                                                            */
/*  Zero dependencies: no Tailwind, no icon library, no CSS files.           */
/* -------------------------------------------------------------------------- */

export interface DeleteAccountProps {
    title?: string;
    message?: string;
    /** What the person loses, shown as a short bullet list under the message. */
    consequences?: string[];

    continueLabel?: string;
    deleteLabel?: string;

    onBack?: () => void;
    showBack?: boolean;
    onContinue?: () => void;
    onDeleteAccount?: () => void;
    deleting?: boolean;
    fluid?:boolean;
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
    red: "#d9352f",
    redSoft: "#fdeceb",
    ink: "#1f1f24",
    grey: "#8a817c",
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
const AlertIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <path d="M12 3L2 20h20L12 3Z" />
        <path d="M12 10v5" />
        <circle cx="12" cy="17.5" r="0.6" fill="currentColor" />
    </svg>
);

const DEFAULT_CONSEQUENCES = [
    "Your profile, photos and prompts are removed from Welvors.",
    "Your matches and conversations are gone for good.",
    "Any wallet balance or rewards you've earned are forfeited.",
    "This can't be undone — you'll need to sign up again from scratch.",
];

/* -------------------------------- component -------------------------------- */
export default function DeleteAccountMain({
    title = "Delete your account?",
    message = "We're sorry to see you go. Before you do, here's what deleting your account actually means:",
    consequences = DEFAULT_CONSEQUENCES,
    continueLabel = "Continue exploring",
    deleteLabel = "Delete account",
    onBack,
    showBack = true,
    onContinue,
    onDeleteAccount,
    deleting = false,
    className,
    style,
    fluid = false,
}: DeleteAccountProps) {
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
                        className={`da-scroll ${className ?? ""}`}
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
        .da-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease; }
        .da-btn:hover:not(:disabled) { filter: brightness(1.05); }
        .da-btn:active:not(:disabled) { transform: scale(.98); }
        .da-btn:disabled { cursor: not-allowed; opacity: 0.6; }
        .da-btn:focus-visible { outline: 2px solid ${C.pink}; outline-offset: 2px; }
        .da-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
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
                                    className="da-btn"
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
                                    Delete account
                                </h1>
                            </header>

                            {/* warning icon */}
                            <div
                                style={{
                                    width: U(16),
                                    height: U(16),
                                    margin: "0 auto",
                                    borderRadius: "50%",
                                    background: C.redSoft,
                                    color: C.red,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: U(7.2),
                                }}
                            >
                                <AlertIcon />
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

                            {/* consequences */}
                            {consequences.length > 0 && (
                                <ul
                                    style={{
                                        listStyle: "none",
                                        margin: `${U(5.2)} 0 0`,
                                        padding: `${U(4.4)} ${U(4.8)}`,
                                        background: C.redSoft,
                                        border: `${HAIR} solid #f6c9c6`,
                                        borderRadius: U(4.6),
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: U(2.8),
                                    }}
                                >
                                    {consequences.map((c, i) => (
                                        <li
                                            key={i}
                                            style={{
                                                position: "relative",
                                                paddingLeft: U(4.6),
                                                fontSize: U(3.15),
                                                lineHeight: 1.5,
                                                color: "#5a2a28",
                                            }}
                                        >
                                            <span
                                                aria-hidden
                                                style={{
                                                    position: "absolute",
                                                    left: U(0.4),
                                                    top: "0.55em",
                                                    width: U(1.7),
                                                    height: U(1.7),
                                                    borderRadius: "50%",
                                                    background: C.red,
                                                }}
                                            />
                                            {c}
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
                                    className="da-btn"
                                    onClick={onContinue}
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
                                    {continueLabel}
                                </button>

                                <button
                                    type="button"
                                    className="da-btn"
                                    onClick={onDeleteAccount}
                                    disabled={deleting}
                                    style={{
                                        width: "100%",
                                        height: U(13.9),
                                        borderRadius: U(4.6),
                                        background: C.white,
                                        border: `${U(0.3)} solid ${C.red}`,
                                        color: C.red,
                                        fontSize: U(4),
                                        fontWeight: 600,
                                    }}
                                >
                                    {deleting ? "Deleting…" : deleteLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
