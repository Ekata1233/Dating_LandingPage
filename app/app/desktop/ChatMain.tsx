import React, { useCallback, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  ChatConversation                                                           */
/*                                                                              */
/*  An independent, fully fluid chat screen made of four stacked parts:        */
/*    1. Header — avatar, name/age, plan badge, online status, menu            */
/*    2. Tabs — All / Gifts / Compliments / Date Invites                       */
/*    3. Scrollable message thread — text bubbles + a rich "gift" card         */
/*    4. Composer — emoji, message input, Try, attach, gift, mic/send          */
/*                                                                              */
/*  It fills 100% width and 100% height of its PARENT. Every size inside       */
/*  (fonts, padding, gaps, radii, icons, bubbles) is measured in `cqw`, i.e.   */
/*  1% of the parent's width, so everything scales with the parent. The       */
/*  message thread scrolls vertically on its own (scrollbar hidden across      */
/*  browsers, scrolling still works); header, tabs and composer stay fixed.    */
/*                                                                              */
/*  Usage:                                                                     */
/*    <div style={{ width: 390, height: 800 }}>                                */
/*      <ChatConversation name="yogesh Harsure" age={22} />                    */
/*    </div>                                                                   */
/*                                                                              */
/*  Zero dependencies: no Tailwind, no icon library, no CSS files.             */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */
export type ChatTab = "all" | "gifts" | "compliments" | "dateInvites";

export type MessageKind = "text" | "gift";

export interface TextMessage {
    kind: "text";
    id: string | number;
    from: "me" | "them";
    text: string;
    time: string;
    read?: boolean;
}

export interface GiftMessage {
    kind: "gift";
    id: string | number;
    from: "me" | "them";
    imageUrl?: string;
    giftName: string;
    note?: string;
    repliesDone: number;
    repliesNeeded: number;
    coinsSpent: number;
    time: string;
    read?: boolean;
}

export type ChatMessage = TextMessage | GiftMessage;

export interface ChatConversationProps {
    avatarUrl?: string;
    name?: string;
    age?: number;
    planLabel?: string;
    online?: boolean;
    lastSeenLabel?: string;

    tabs?: { key: ChatTab; label: string; icon: React.ReactNode; count?: number }[];
    activeTab?: ChatTab;
    onTabChange?: (tab: ChatTab) => void;

    messages?: ChatMessage[];

    messagePlaceholder?: string;
    onSend?: (text: string) => void;
    onMenu?: () => void;
    onAttach?: () => void;
    onOpenGifts?: () => void;
    onTry?: () => void;

    /**
     * Fill the parent edge to edge instead of rendering the 300px desktop
     * frame. The mobile shell sets this and supplies `onBack`.
     */
    fluid?: boolean;
    /** Renders a back chevron in the header (mobile chat → conversation list). */
    showBack?: boolean;
    onBack?: () => void;

    className?: string;
    style?: React.CSSProperties;
}

/* --------------------------------- helpers --------------------------------- */
/** 1 unit = 1% of the parent's width */
const U = (n: number) => `${n}cqw`;
const HAIR = "max(1px, 0.3cqw)";

const C = {
    pink: "#e23a6a",
    pinkText: "#e0355f",
    pinkSoft: "#fdeef1",
    pinkBorder: "#f7d3dd",
    ink: "#17151a",
    grey: "#8a8790",
    greyLight: "#b8b5bc",
    border: "#ececec",
    bubbleMine: "#fdeef1",
    bubbleTheirs: "#f4f3f5",
    coin: "#f1b400",
    white: "#ffffff",
    black: "#141317",
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

/* ---------------------------------- icons ---------------------------------- */
const DotsIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} fill="currentColor">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
    </svg>
);
const ChatIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <path d="M4 4h16v12H8l-4 4V4Z" />
    </svg>
);
const GiftTabIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase}>
        <rect x="3" y="10" width="18" height="10" rx="1.6" fill="#f28c12" />
        <rect x="2" y="6.5" width="20" height="4.5" rx="1.2" fill="#e2355f" />
        <rect x="10.6" y="6.5" width="2.8" height="13.5" fill="#fff3d6" />
        <path
            d="M12 6.5c-2-3-6-2-5 1s5 1 5-1Zm0 0c2-3 6-2 5 1s-5 1-5-1Z"
            fill="#ffd166"
        />
    </svg>
);
const HeartIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} fill="#e2355f">
        <path d="M12 21s-7.5-4.6-10-9.1C.4 8.4 2.4 5 6 5c2 0 3.5 1 6 3.4C14.5 6 16 5 18 5c3.6 0 5.6 3.4 4 6.9C19.5 16.4 12 21 12 21Z" />
    </svg>
);
const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase}>
        <rect x="3" y="4" width="18" height="17" rx="2.4" fill="#e2355f" />
        <rect x="3" y="4" width="18" height="5.4" rx="2.4" fill="#e2355f" />
        <text x="12" y="16.5" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#fff" fontFamily="Arial, sans-serif">
            17
        </text>
    </svg>
);
const CheckSingle = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke} strokeWidth={2.6}>
        <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
);
const CheckDouble = ({ color = "#7cc4f0" }: { color?: string }) => (
    <svg viewBox="0 0 24 24" style={svgBase} fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12.5l4.5 4.5L14 8" />
        <path d="M9.5 12.5L14 17 22.5 7" />
    </svg>
);
const SmileyIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="9" cy="10" r="0.6" fill="currentColor" />
        <circle cx="15" cy="10" r="0.6" fill="currentColor" />
        <path d="M8 14.5c1.2 1.4 2.6 2 4 2s2.8-.6 4-2" />
    </svg>
);
const BulbIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase}>
        <path d="M9 18h6M10 21h4" stroke="#e0355f" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path
            d="M12 3a6.5 6.5 0 0 0-3.8 11.8c.5.4.8 1 .8 1.7h6a2.2 2.2 0 0 1 .8-1.7A6.5 6.5 0 0 0 12 3Z"
            fill="#ffd85e"
            stroke="#e0355f"
            strokeWidth="1.3"
        />
    </svg>
);
const PaperclipIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <path d="M21 11.5 12.5 20a4.5 4.5 0 0 1-6.4-6.4l8.5-8.5a3 3 0 0 1 4.3 4.3L10.4 18a1.5 1.5 0 0 1-2.1-2.1l7.1-7.1" />
    </svg>
);
const GiftInputIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase}>
        <rect x="3" y="9" width="18" height="12" rx="2" fill="none" stroke="#e2355f" strokeWidth="1.8" />
        <path d="M3 13h18M12 9v12" stroke="#e2355f" strokeWidth="1.8" />
        <path
            d="M12 9c-3 0-4-3-2.5-4S12 6 12 9Zm0 0c3 0 4-3 2.5-4S12 6 12 9Z"
            fill="none"
            stroke="#e2355f"
            strokeWidth="1.8"
        />
    </svg>
);
const MicIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} fill="#fff">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M12 18v3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/* ---------------------------------- avatar ---------------------------------- */
const Avatar = ({ name, url, size }: { name: string; url?: string; size: number }) => (
    <span
        style={{
            width: U(size),
            height: U(size),
            flexShrink: 0,
            borderRadius: "50%",
            border: `${U(0.5)} solid #f3c6d2`,
            overflow: "hidden",
            background: "linear-gradient(135deg, #f6a37b, #e2355f)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.white,
            fontWeight: 700,
            fontSize: U(size * 0.4),
        }}
    >
        {url ? (
            <img src={url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
            name.trim().slice(0, 1).toUpperCase()
        )}
    </span>
);

/* -------------------------------- defaults --------------------------------- */
const DEFAULT_TABS: { key: ChatTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "all", label: "All", icon: <ChatIcon /> },
    { key: "gifts", label: "Gifts", icon: <GiftTabIcon />, count: 2 },
    { key: "compliments", label: "Compliments", icon: <HeartIcon /> },
    { key: "dateInvites", label: "Date Invites", icon: <CalendarIcon /> },
];

const DEFAULT_MESSAGES: ChatMessage[] = [
    { kind: "text", id: 1, from: "them", text: "hie", time: "3:33 PM" },
    { kind: "text", id: 2, from: "me", text: "hello", time: "3:34 PM", read: true },
    {
        kind: "gift",
        id: 3,
        from: "me",
        giftName: "Chocolate Box",
        note: "Chocolate Box",
        repliesDone: 0,
        repliesNeeded: 1,
        coinsSpent: 650,
        time: "11:02 AM",
        read: true,
    },
];

/* --------------------------------- bubbles ----------------------------------- */
const TextBubble = ({ msg }: { msg: TextMessage }) => {
    const mine = msg.from === "me";
    return (
        <div
            style={{
                display: "flex",
                justifyContent: mine ? "flex-end" : "flex-start",
                padding: `${U(1)} ${U(5)}`,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: U(1.6),
                    maxWidth: "78%",
                    padding: `${U(2.6)} ${U(4)}`,
                    borderRadius: U(5),
                    borderBottomRightRadius: mine ? U(1.2) : U(5),
                    borderBottomLeftRadius: mine ? U(5) : U(1.2),
                    background: mine ? C.bubbleMine : C.bubbleTheirs,
                    color: C.ink,
                }}
            >
                <span style={{ fontSize: U(3.6), lineHeight: 1.4 }}>{msg.text}</span>
                <span
                    style={{
                        flexShrink: 0,
                        fontSize: U(2.5),
                        color: C.greyLight,
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: U(0.8),
                    }}
                >
                    {msg.time}
                    {mine && msg.read !== undefined && (
                        <span style={{ fontSize: U(3.2), display: "flex" }}>
                            {msg.read ? <CheckDouble color={C.pinkText} /> : <CheckSingle />}
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
};

const GiftBubble = ({ msg }: { msg: GiftMessage }) => {
    const mine = msg.from === "me";
    const progress =
        msg.repliesNeeded > 0 ? Math.min(100, (msg.repliesDone / msg.repliesNeeded) * 100) : 0;
    const remaining = Math.max(0, msg.repliesNeeded - msg.repliesDone);

    return (
        <div style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", padding: `${U(2)} ${U(5)}` }}>
            <div
                style={{
                    width: "86%",
                    maxWidth: U(90),
                    borderRadius: U(5.5),
                    border: `${HAIR} solid ${C.pinkBorder}`,
                    background: C.white,
                    overflow: "hidden",
                    boxShadow: `0 ${U(1)} ${U(3.4)} rgba(226,58,106,.12)`,
                }}
            >
                {/* image */}
                <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 2", overflow: "hidden" }}>
                    {msg.imageUrl ? (
                        <img
                            src={msg.imageUrl}
                            alt={msg.giftName}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                    ) : (
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                background: "linear-gradient(135deg, #f43f5e, #7c1d3a)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#ffd9e2",
                                fontSize: U(9),
                            }}
                        >
                            <GiftTabIcon />
                        </div>
                    )}
                    <span
                        style={{
                            position: "absolute",
                            left: U(3),
                            bottom: U(3),
                            display: "inline-flex",
                            alignItems: "center",
                            gap: U(1.4),
                            padding: `${U(1.4)} ${U(3)}`,
                            borderRadius: U(4),
                            background: "rgba(255,255,255,.95)",
                            color: C.pinkText,
                            fontSize: U(2.9),
                            fontWeight: 700,
                        }}
                    >
                        <span style={{ fontSize: U(3.4), display: "flex" }}>
                            <GiftTabIcon />
                        </span>
                        GIFT SENT
                    </span>
                </div>

                {/* body */}
                <div style={{ padding: `${U(4.2)} ${U(4.4)} ${U(4)}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: U(2.2) }}>
                        <span style={{ fontSize: U(4.4), display: "flex" }}>
                            <GiftTabIcon />
                        </span>
                        <h3 style={{ margin: 0, fontSize: U(4), fontWeight: 700 }}>{msg.giftName}</h3>
                    </div>

                    {msg.note && (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: U(2),
                                marginTop: U(3),
                                paddingLeft: U(2.2),
                                borderLeft: `${U(0.7)} solid ${C.pinkText}`,
                            }}
                        >
                            <span style={{ fontSize: U(3.4), fontStyle: "italic", color: "#4a4750" }}>{msg.note}</span>
                        </div>
                    )}

                    <div
                        style={{
                            marginTop: U(3.4),
                            padding: `${U(3.2)} ${U(3.4)}`,
                            borderRadius: U(3.6),
                            border: `${HAIR} solid ${C.border}`,
                            background: "#fff",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: U(3.1), color: C.grey, fontWeight: 500 }}>Reply progress</span>
                            <span style={{ fontSize: U(3.1), color: C.pinkText, fontWeight: 700 }}>
                                {msg.repliesDone}/{msg.repliesNeeded} replies
                            </span>
                        </div>
                        <span
                            style={{
                                display: "block",
                                marginTop: U(2),
                                height: U(1.6),
                                borderRadius: U(1),
                                background: "#f2e2e7",
                                overflow: "hidden",
                            }}
                        >
                            <span
                                style={{
                                    display: "block",
                                    height: "100%",
                                    width: `${progress}%`,
                                    borderRadius: U(1),
                                    background: `linear-gradient(90deg, ${C.pink}, #f28c5a)`,
                                }}
                            />
                        </span>
                        {remaining > 0 && (
                            <p style={{ margin: `${U(2.2)} 0 0`, fontSize: U(3), color: "#4a4750" }}>
                                {remaining} more {remaining === 1 ? "reply" : "replies"} and your gift unlocks
                            </p>
                        )}
                    </div>

                    <div
                        style={{
                            marginTop: U(3.4),
                            paddingTop: U(3),
                            borderTop: `${HAIR} solid ${C.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: U(1.4),
                                padding: `${U(1.4)} ${U(3.2)}`,
                                borderRadius: U(5),
                                background: "#fff8e6",
                                color: "#8a6d00",
                                fontSize: U(3.1),
                                fontWeight: 700,
                            }}
                        >
                            <span
                                aria-hidden
                                style={{
                                    width: U(3),
                                    height: U(3),
                                    borderRadius: "50%",
                                    background: C.coin,
                                    display: "inline-block",
                                }}
                            />
                            {msg.coinsSpent} spent
                        </span>
                        <span
                            style={{
                                fontSize: U(2.7),
                                color: C.greyLight,
                                display: "flex",
                                alignItems: "center",
                                gap: U(1),
                            }}
                        >
                            {msg.time}
                            {mine && (
                                <span style={{ fontSize: U(3.2), display: "flex" }}>
                                    {msg.read ? <CheckSingle /> : null}
                                </span>
                            )}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* -------------------------------- component -------------------------------- */
export default function ChatMain({
    avatarUrl,
    name = "yogesh Harsure",
    age = 22,
    planLabel = "FREE",
    online = false,
    lastSeenLabel = "Offline",
    tabs = DEFAULT_TABS,
    activeTab = "all",
    onTabChange,
    messages = DEFAULT_MESSAGES,
    messagePlaceholder = "Message",
    onSend,
    onMenu,
    onAttach,
    onOpenGifts,
    onTry,
    fluid = false,
    showBack = false,
    onBack,
    className,
    style,
}: ChatConversationProps) {
    const [tab, setTab] = useState<ChatTab>(activeTab);
    const [draft, setDraft] = useState("");

    const handleTab = useCallback(
        (key: ChatTab) => {
            setTab(key);
            onTabChange?.(key);
        },
        [onTabChange]
    );

    const handleSend = () => {
        const trimmed = draft.trim();
        if (!trimmed) return;
        onSend?.(trimmed);
        setDraft("");
    };

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
                        className={`chat-root ${className ?? ""}`}
                        style={{
                            width: "100%",
                            height: "100%",
                            containerType: "inline-size",
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
                            background: C.white,
                            fontFamily: FONT,
                            color: C.ink,
                            overflow: "hidden",
                            ...style,
                        }}
                    >
                        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .chat-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .chat-tabs::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .chat-btn { cursor: pointer; border: 0; font: inherit; background: transparent; transition: transform .12s ease, filter .12s ease; }
        .chat-btn:active { transform: scale(.96); }
        .chat-input::placeholder { color: ${C.greyLight}; }
        .chat-input:focus-visible { outline: none; }
      `}</style>

                        {/* header */}
                        <header
                            style={{
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: U(3),
                                padding: `${U(3.6)} ${U(4.2)}`,
                                borderBottom: `${HAIR} solid ${C.border}`,
                            }}
                        >
                            {showBack && (
                                <button
                                    type="button"
                                    className="chat-btn"
                                    aria-label="Back to conversations"
                                    onClick={onBack}
                                    style={{
                                        width: U(9),
                                        height: U(9),
                                        flexShrink: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: C.ink,
                                        fontSize: U(4.6),
                                        marginRight: U(-1),
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
                                        <path d="M15 18l-6-6 6-6" />
                                    </svg>
                                </button>
                            )}
                            <Avatar name={name} url={avatarUrl} size={11.4} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: U(2) }}>
                                    <span
                                        style={{
                                            fontSize: U(4.2),
                                            fontWeight: 700,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {name}, {age}
                                    </span>
                                    <span
                                        style={{
                                            flexShrink: 0,
                                            padding: `${U(0.7)} ${U(2.2)}`,
                                            borderRadius: U(3),
                                            background: C.black,
                                            color: C.white,
                                            fontSize: U(2.5),
                                            fontWeight: 700,
                                            letterSpacing: "0.04em",
                                        }}
                                    >
                                        {planLabel}
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: U(1.4), marginTop: U(0.6) }}>
                                    <span
                                        aria-hidden
                                        style={{
                                            width: U(1.8),
                                            height: U(1.8),
                                            borderRadius: "50%",
                                            background: online ? "#2ecf6e" : C.greyLight,
                                            display: "inline-block",
                                        }}
                                    />
                                    <span style={{ fontSize: U(3.1), color: C.grey }}>{online ? "Online" : lastSeenLabel}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="chat-btn"
                                aria-label="More options"
                                onClick={onMenu}
                                style={{
                                    width: U(9),
                                    height: U(9),
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: C.ink,
                                    fontSize: U(4.4),
                                    flexShrink: 0,
                                }}
                            >
                                <DotsIcon />
                            </button>
                        </header>

                        {/* tabs */}
                        <nav
                            role="tablist"
                            className="chat-tabs"
                            style={{
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: U(5.6),
                                padding: `${U(3)} ${U(4.2)}`,
                                overflowX: "auto",
                                borderBottom: `${HAIR} solid ${C.border}`,
                            }}
                        >
                            {tabs.map(({ key, label, icon, count }) => {
                                const active = tab === key;
                                return (
                                    <button
                                        key={key}
                                        role="tab"
                                        aria-selected={active}
                                        type="button"
                                        className="chat-btn"
                                        onClick={() => handleTab(key)}
                                        style={{
                                            position: "relative",
                                            flexShrink: 0,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: U(1.6),
                                            paddingBottom: U(2.4),
                                            fontSize: U(3.5),
                                            fontWeight: active ? 700 : 500,
                                            color: active ? C.pinkText : "#4a4750",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        <span style={{ fontSize: U(4.2), display: "flex" }}>{icon}</span>
                                        {label}
                                        {typeof count === "number" && (
                                            <span
                                                style={{
                                                    fontSize: U(2.8),
                                                    fontWeight: 700,
                                                    color: active ? C.pinkText : C.greyLight,
                                                }}
                                            >
                                                {count}
                                            </span>
                                        )}
                                        {active && (
                                            <span
                                                aria-hidden
                                                style={{
                                                    position: "absolute",
                                                    left: 0,
                                                    right: 0,
                                                    bottom: `-${U(0.15)}`,
                                                    height: U(0.7),
                                                    borderRadius: U(1),
                                                    background: C.pinkText,
                                                }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* thread */}
                        <div
                            className="chat-scroll"
                            style={{
                                flex: 1,
                                minHeight: 0,
                                overflowY: "auto",
                                overflowX: "hidden",
                                scrollbarWidth: "none",
                                msOverflowStyle: "none",
                                padding: `${U(3)} 0`,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {messages.map((m) =>
                                m.kind === "text" ? <TextBubble key={m.id} msg={m} /> : <GiftBubble key={m.id} msg={m} />
                            )}
                        </div>

                        {/* composer */}
                        <div
                            style={{
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                gap: U(2.6),
                                padding: `${U(2.6)} ${U(3.6)}`,
                                borderTop: `${HAIR} solid ${C.border}`,
                            }}
                        >
                            <span style={{ fontSize: U(5.2), color: "#4a4750", display: "flex", flexShrink: 0 }}>
                                <SmileyIcon />
                            </span>

                            <div
                                style={{
                                    flex: 1,
                                    minWidth: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: U(2),
                                    height: U(10.6),
                                    padding: `0 ${U(3.6)}`,
                                    borderRadius: U(6),
                                    background: "#f4f3f5",
                                }}
                            >
                                <input
                                    className="chat-input"
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSend();
                                    }}
                                    placeholder={messagePlaceholder}
                                    aria-label="Message"
                                    style={{
                                        flex: 1,
                                        minWidth: 0,
                                        border: 0,
                                        background: "transparent",
                                        fontFamily: "inherit",
                                        fontSize: U(3.6),
                                        color: C.ink,
                                    }}
                                />
                            </div>

                            <button
                                type="button"
                                className="chat-btn"
                                onClick={onTry}
                                style={{
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: U(1.4),
                                    padding: `${U(1.8)} ${U(3.4)}`,
                                    borderRadius: U(6),
                                    background: C.pinkSoft,
                                    color: C.pinkText,
                                    fontSize: U(3.3),
                                    fontWeight: 600,
                                }}
                            >
                                <span style={{ fontSize: U(3.8), display: "flex" }}>
                                    <BulbIcon />
                                </span>
                                Try
                            </button>

                            <button
                                type="button"
                                className="chat-btn"
                                aria-label="Attach"
                                onClick={onAttach}
                                style={{
                                    flexShrink: 0,
                                    fontSize: U(4.6),
                                    color: "#4a4750",
                                    display: "flex",
                                }}
                            >
                                <PaperclipIcon />
                            </button>

                            <button
                                type="button"
                                className="chat-btn"
                                aria-label="Send a gift"
                                onClick={onOpenGifts}
                                style={{
                                    flexShrink: 0,
                                    fontSize: U(4.6),
                                    display: "flex",
                                }}
                            >
                                <GiftInputIcon />
                            </button>

                            <button
                                type="button"
                                className="chat-btn"
                                aria-label={draft.trim() ? "Send message" : "Record voice message"}
                                onClick={draft.trim() ? handleSend : undefined}
                                style={{
                                    flexShrink: 0,
                                    width: U(10.6),
                                    height: U(10.6),
                                    borderRadius: "50%",
                                    background: `linear-gradient(135deg, ${C.pink}, #c2185b)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: U(4.4),
                                    boxShadow: `0 ${U(1)} ${U(2.6)} rgba(226,58,106,.35)`,
                                }}
                            >
                                <MicIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
