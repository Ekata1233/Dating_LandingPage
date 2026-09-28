import { useActiveSection } from "@/app/context/ActiveSectionContext";
import React, { useCallback } from "react";

/* -------------------------------------------------------------------------- */
/*  HelpSupport                                                               */
/*                                                                            */
/*  Independent, fully fluid "Help & Support" screen. It fills 100% width and */
/*  100% height of its PARENT. Every size inside (fonts, padding, gaps,       */
/*  radii, icons) is measured in `cqw` = 1% of the parent's width, so the     */
/*  whole screen scales with whatever it is placed in. If the content is      */
/*  taller than the parent it scrolls vertically.                             */
/*                                                                            */
/*  Usage:                                                                    */
/*    <div style={{ width: 390, height: 800 }}>                               */
/*      <HelpSupport onBack={() => history.back()} />                         */
/*    </div>                                                                  */
/*                                                                            */
/*  Zero dependencies: no Tailwind, no icon library, no CSS files.            */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */
export type ContactIcon = "chat" | "email" | "call" | "whatsapp";

export interface ContactOption {
    id: string;
    icon: ContactIcon;
    title: string;
    description: string;
    /** Small line at the bottom of the card */
    status?: { text: string; tone?: "success" | "muted" };
    /** If provided the card renders as a link, otherwise as a button */
    href?: string;
    onClick?: () => void;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface HelpSupportProps {
    title?: string;
    showHeader?: boolean;
    contacts?: ContactOption[];
    faqTitle?: string;
    faqs?: FaqItem[];
    /** Ids of FAQ items that start expanded */
    defaultOpenIds?: string[];
    /** When false, opening one FAQ closes the others (default true) */
    allowMultiple?: boolean;

    onBack?: () => void;
    showBack?: boolean;

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
    grey: "#8b8b90",
    greyLight: "#9c9ca1",
    divider: "#eeeeee",
    border: "#eeeeee",
    white: "#ffffff",
    green: "#3aa64a",
    pink: "#e0457b",
};

const FONT = "'DM Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const svgFill: React.CSSProperties = { width: "100%", height: "100%", display: "block" };

/* ---------------------------------- icons ---------------------------------- */
const BackIcon = () => (
    <svg viewBox="0 0 24 24" style={{ width: "1em", height: "1em", display: "block" }} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5l-7 7 7 7" />
    </svg>
);

const PHONE_PATH =
    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z";

const ICONS: Record<ContactIcon, { bg: string; node: React.ReactNode; solid?: boolean }> = {
    chat: {
        bg: "#fde3e9",
        node: (
            <svg viewBox="0 0 24 24" style={svgFill} fill="none" stroke="#2a2a2e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3.500c4.700 0 8.500 3.100 8.500 7s-3.800 7-8.500 7c-.9 0-1.800-.1-2.600-.3L5 19.500l1-3.600C4.400 14.700 3.500 12.900 3.500 10.500c0-3.900 3.800-7 8.500-7Z" />
                <circle cx="8.500" cy="10.500" r="0.7" fill="#2a2a2e" />
                <circle cx="12" cy="10.500" r="0.7" fill="#2a2a2e" />
                <circle cx="15.500" cy="10.500" r="0.7" fill="#2a2a2e" />
            </svg>
        ),
    },
    email: {
        bg: "#e2effb",
        node: (
            <svg viewBox="0 0 24 24" style={svgFill} fill="none" stroke="#5f9fd8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.500" y="5" width="19" height="14" rx="2" />
                <path d="M3 7l9 7 9-7" />
            </svg>
        ),
    },
    call: {
        bg: "#e3f4e6",
        node: (
            <svg viewBox="0 0 24 24" style={svgFill} fill="#3f4a45" stroke="#3f4a45" strokeWidth="1" strokeLinejoin="round">
                <path d={PHONE_PATH} />
            </svg>
        ),
    },
    whatsapp: {
        bg: "#27c94c",
        solid: true,
        node: (
            <svg viewBox="0 0 24 24" style={svgFill} fill="none">
                <path
                    d="M12 3.500a8.500 8.500 0 0 0-7.300 12.800L3.500 20.500l4.300-1.100A8.500 8.500 0 1 0 12 3.500Z"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                />
                <g transform="translate(7.200 7.200) scale(0.4)">
                    <path d={PHONE_PATH} fill="#ffffff" />
                </g>
            </svg>
        ),
    },
};

const PlusIcon = () => (
    <svg viewBox="0 0 24 24" style={{ width: "1em", height: "1em", display: "block" }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 4v16M4 12h16" />
    </svg>
);

/* -------------------------------- defaults --------------------------------- */
const DEFAULT_CONTACTS: ContactOption[] = [
    {
        id: "chat",
        icon: "chat",
        title: "Live Chat",
        description: "Chat with our support team",
        status: { text: "Online · ~2 min", tone: "success" },
    },
    {
        id: "email",
        icon: "email",
        title: "Email Us",
        description: "support@welvors.com",
        status: { text: "Replies in 24h", tone: "muted" },
        href: "mailto:support@welvors.com",
    },
    {
        id: "call",
        icon: "call",
        title: "Request a Call",
        description: "We call you back",
        status: { text: "Mon-Sat, 10am-7pm", tone: "muted" },
    },
    {
        id: "whatsapp",
        icon: "whatsapp",
        title: "WhatsApp",
        description: "+91 97653 03735",
        status: { text: "Fastest reply", tone: "success" },
        href: "https://wa.me/919765303735",
    },
];

const DEFAULT_FAQS: FaqItem[] = [
    {
        id: "verify",
        question: "How do I verify my profile?",
        answer: "Open your profile, tap Verification and follow the steps to confirm your identity.",
    },
    {
        id: "wallet",
        question: "How does the Welvors Wallet work?",
        answer:
            "Your rewards and credits are stored in the Welvors Wallet. You can withdraw the balance to UPI or bank anytime.",
    },
    {
        id: "datenow",
        question: "How do Date Now plans work?",
        answer: "You can create a Date Now plan or request to join another available plan.",
    },
    {
        id: "block",
        question: "How do I block or report someone?",
        answer: "Open the user's profile or conversation and select the block or report option.",
    },
];

/* -------------------------------- component -------------------------------- */
export default function HelpSupport({
    title = "Help & Support",
    showHeader = true,
    contacts = DEFAULT_CONTACTS,
    faqTitle = "Popular questions",
    faqs = DEFAULT_FAQS,
    defaultOpenIds = ["datenow", "block"],
    allowMultiple = true,
    onBack,
    showBack = true,
    fluid = false,
    className,
    style,
}: HelpSupportProps) {
    const [openIds, setOpenIds] = React.useState<string[]>(defaultOpenIds);
    const { setActiveSection } = useActiveSection();

    const handleCLick = useCallback(
        () => () => setActiveSection("profile"),

        [setActiveSection]
    );    const toggle = (id: string) =>
        setOpenIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : allowMultiple ? [...prev, id] : [id]
        );

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
                        className={className}
                        style={{
                            width: "100%",
                            height: "100%",
                            containerType: "inline-size",
                            overflowY: "auto",
                            overflowX: "hidden",
                            background: "#fafafa",
                            scrollbarWidth: "none",      // ← added
                            msOverflowStyle: "none",
                            ...style,
                        }}
                    >
                        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .hs-btn { cursor: pointer; border: 0; font: inherit; text-align: left; text-decoration: none; transition: transform .12s ease, box-shadow .12s ease; }
        .hs-btn:active { transform: scale(.98); }
        .hs-btn:focus-visible { outline: 2px solid ${C.pink}; outline-offset: 2px; }
        .hs-anim { transition: grid-template-rows .25s ease, opacity .25s ease; }
        .hs-rot { transition: transform .25s ease, color .25s ease; }
        @media (prefers-reduced-motion: reduce) {
          .hs-anim, .hs-rot, .hs-btn { transition: none; }
        }
      `}</style>

                        <div
                            style={{
                                fontFamily: FONT,
                                color: C.ink,
                                boxSizing: "border-box",
                                padding: `${U(4)} ${U(5.1)} ${U(8)}`,
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
                                        marginBottom: U(6.2),
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
                                    <h1 style={{ margin: 0, fontSize: U(4.7), fontWeight: 500 }}>{title}</h1>
                                </header>
                            )}

                            {/* contact cards */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                    gridAutoRows: "1fr",
                                    gap: U(4.2),
                                }}
                            >
                                {contacts.map((c) => {
                                    const icon = ICONS[c.icon];
                                    const cardStyle: React.CSSProperties = {
                                        display: "flex",
                                        flexDirection: "column",
                                        minHeight: U(39.6),
                                        padding: U(3.5),
                                        boxSizing: "border-box",
                                        background: C.white,
                                        color: C.ink,
                                        borderRadius: U(5.5),
                                        boxShadow: `0 ${U(0.8)} ${U(3.2)} rgba(0,0,0,.07)`,
                                        minWidth: 0,
                                    };
                                    const inner = (
                                        <>
                                            <span
                                                style={{
                                                    width: U(9.7),
                                                    height: U(9.7),
                                                    borderRadius: U(2.8),
                                                    background: icon.bg,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <span style={{ width: U(6), height: U(6), display: "block" }}>{icon.node}</span>
                                            </span>

                                            <span style={{ marginTop: U(3.4), fontSize: U(3.6), fontWeight: 500, lineHeight: 1.25 }}>
                                                {c.title}
                                            </span>
                                            <span
                                                style={{
                                                    marginTop: U(1.2),
                                                    flex: 1,
                                                    fontSize: U(2.9),
                                                    lineHeight: 1.35,
                                                    color: C.grey,
                                                    overflowWrap: "anywhere",
                                                }}
                                            >
                                                {c.description}
                                            </span>

                                            {c.status && (
                                                <span
                                                    style={{
                                                        marginTop: U(2.2),
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: U(1.2),
                                                        fontSize: U(2.9),
                                                        fontWeight: 500,
                                                        color: c.status.tone === "success" ? C.green : C.grey,
                                                    }}
                                                >
                                                    {c.status.tone === "success" && (
                                                        <span
                                                            aria-hidden
                                                            style={{
                                                                width: U(1.6),
                                                                height: U(1.6),
                                                                borderRadius: "50%",
                                                                background: C.green,
                                                                flexShrink: 0,
                                                            }}
                                                        />
                                                    )}
                                                    {c.status.text}
                                                </span>
                                            )}
                                        </>
                                    );

                                    return c.href ? (
                                        <a
                                            key={c.id}
                                            href={c.href}
                                            target={c.href.startsWith("http") ? "_blank" : undefined}
                                            rel="noreferrer"
                                            className="hs-btn"
                                            onClick={c.onClick}
                                            style={cardStyle}
                                        >
                                            {inner}
                                        </a>
                                    ) : (
                                        <button key={c.id} type="button" className="hs-btn" onClick={c.onClick} style={cardStyle}>
                                            {inner}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* FAQ */}
                            <h2
                                style={{
                                    margin: `${U(8.9)} 0 ${U(4.4)}`,
                                    fontSize: U(3.1),
                                    fontWeight: 500,
                                    letterSpacing: "0.12em",
                                    textTransform: "uppercase",
                                    color: "#7d7d82",
                                }}
                            >
                                {faqTitle}
                            </h2>

                            <section
                                style={{
                                    background: C.white,
                                    borderRadius: U(5.5),
                                    boxShadow: `0 ${U(0.8)} ${U(3.2)} rgba(0,0,0,.07)`,
                                    padding: `0 0 ${U(1)}`,
                                }}
                            >
                                {faqs.map((f, i) => {
                                    const open = openIds.includes(f.id);
                                    return (
                                        <div
                                            key={f.id}
                                            style={{
                                                margin: `0 ${U(4)}`,
                                                borderTop: i === 0 ? "none" : `${HAIR} solid ${C.divider}`,
                                            }}
                                        >
                                            <button
                                                type="button"
                                                className="hs-btn"
                                                aria-expanded={open}
                                                aria-controls={`hs-answer-${f.id}`}
                                                onClick={() => toggle(f.id)}
                                                style={{
                                                    width: "100%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    gap: U(3),
                                                    padding: `${U(4.5)} 0`,
                                                    background: "transparent",
                                                    color: C.ink,
                                                    fontSize: U(3.5),
                                                    fontWeight: 500,
                                                    lineHeight: 1.3,
                                                }}
                                            >
                                                <span style={{ minWidth: 0 }}>{f.question}</span>
                                                <span
                                                    className="hs-rot"
                                                    aria-hidden
                                                    style={{
                                                        fontSize: U(3.4),
                                                        display: "flex",
                                                        flexShrink: 0,
                                                        color: open ? C.pink : C.greyLight,
                                                        transform: open ? "rotate(45deg)" : "rotate(0deg)",
                                                        marginRight: U(0.4),
                                                    }}
                                                >
                                                    <PlusIcon />
                                                </span>
                                            </button>

                                            <div
                                                id={`hs-answer-${f.id}`}
                                                className="hs-anim"
                                                style={{
                                                    display: "grid",
                                                    gridTemplateRows: open ? "1fr" : "0fr",
                                                    opacity: open ? 1 : 0,
                                                }}
                                            >
                                                <div style={{ overflow: "hidden", minHeight: 0 }}>
                                                    <p
                                                        style={{
                                                            margin: `${U(-1)} 0 0`,
                                                            padding: `0 ${U(1)} ${U(4.3)} 0`,
                                                            fontSize: U(3.2),
                                                            lineHeight: 1.5,
                                                            color: C.grey,
                                                        }}
                                                    >
                                                        {f.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}
