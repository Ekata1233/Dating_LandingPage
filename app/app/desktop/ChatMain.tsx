import React, { useCallback, useEffect, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  ChatConversation                                                           */
/*                                                                              */
/*  An independent, fully fluid chat screen made of these parts:               */
/*    1. Header — avatar, name/age, plan badge, online status, 3-dot menu      */
/*    2. Scrollable message thread — text bubbles + rich cards                 */
/*         • GiftCard       (image, "You sent … a gift", reply progress)       */
/*         • RoseCard       (ribbon, rose, progress bar, coins)                */
/*         • ComplimentCard (blue chip, quoted text)                           */
/*    3. Composer — emoji, message input, Try, attach, gift, mic/send          */
/*    4. Dropdown menu opened from the 3 dots (Report / Block / Unmatch /      */
/*       Clear Chat / Delete Conversation)                                     */
/*                                                                              */
/*  It fills 100% width and 100% height of its PARENT. Every size inside       */
/*  (fonts, padding, gaps, radii, icons, bubbles) is measured in `cqw`, i.e.   */
/*  1% of the parent's width, so everything scales with the parent.            */
/*                                                                              */
/*  Zero dependencies: no Tailwind-only styling inside the cards, no icon      */
/*  library, no CSS files.                                                     */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */
export type ChatTab = "all" | "gifts" | "compliments" | "dateInvites";

export type MessageKind = "text" | "gift" | CardMessage["kind"];

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
    triggerLine?:string;
    /** Emoji shown before the gift name, e.g. "☕" */
    giftEmoji?: string;
    /** Italic quoted line under the title */
    note?: string;
    repliesDone?: number;
    repliesNeeded?: number;
    /** Coins the gift unlocks for the receiver */
    coinsSpent?: number;
    time: string;
    read?: boolean;
}

/**
 * Card for everything that is not plain text or a gift.
 *  - rose:       title = "A rose from …", subtitle = italic line,
 *                repliesDone / repliesNeeded / coins drive the footer.
 *  - compliment: title = "Compliment from …", subtitle = the compliment text.
 *  - image / event: generic badge card.
 */
export interface CardMessage {
    kind: "rose" | "compliment" | "image" | "event";
    id: string | number;
    from: "me" | "them";
    title: string;
    triggerLine?:string;
    subtitle?: string;
    imageUrl?: string;
    time: string;
    /** Shown under generic cards: Sent / Delivered / Read / Received. */
    status?: string;
    read?: boolean;
    /** rose only */
    repliesDone?: number;
    repliesNeeded?: number;
    coins?: number;
}

export type ChatMessage = TextMessage | GiftMessage | CardMessage;

export interface ChatConversationProps {
    userId:string,
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
    messagesLoading?: boolean;
    messagesError?: string | null;
    onRetryMessages?: () => void;
    hasOlderMessages?: boolean;
    onLoadOlderMessages?: () => void;
    loadingOlderMessages?: boolean;

    messagePlaceholder?: string;
    onSend?: (text: string) => void;
    /** Called when the 3-dot menu is opened. */
    onMenu?: () => void;
    onAttach?: () => void;
    onOpenGifts?: () => void;
    onTry?: () => void;

    /** Dropdown menu actions (menu closes automatically after each). */
    onReport?: () => void;
    onBlock?: () => void;
    onUnmatch?: () => void;
    onClearChat?: () => void;
    onDeleteConversation?: () => void;

    fluid?: boolean;
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
    pinkDeep: "#d1305f",
    pinkSoft: "#fdeef1",
    pinkTrack: "#fbe1e8",
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
    /* compliment card */
    blue: "#3a66c9",
    blueSoft: "#eef2fe",
    blueBorder: "#dbe3f3",
    mauve: "#b08aa0",
    /* dropdown */
    menuInk: "#111827",
    menuIconBg: "#f5f6f8",
    menuIconBorder: "#ebedf0",
    menuDanger: "#d9284f",
    menuDangerBg: "#fff0f2",
    menuDangerBorder: "#fbdde3",
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
        <path d="M12 6.5c-2-3-6-2-5 1s5 1 5-1Zm0 0c2-3 6-2 5 1s-5 1-5-1Z" fill="#ffd166" />
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
const RoseIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase}>
        <path d="M12 12.5V21" stroke="#2f9e5e" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M12 16.5c-2.4 0-4-1.5-4-3.4M12 18.5c2.4 0 4-1.5 4-3.4" stroke="#2f9e5e" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <circle cx="12" cy="8" r="4.6" fill="#e2355f" />
        <circle cx="12" cy="8" r="2" fill="#fdeef1" />
    </svg>
);
const ImageIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <rect x="3" y="4" width="18" height="16" rx="2.4" />
        <circle cx="8.6" cy="9.4" r="1.6" />
        <path d="M4 17.2l4.6-4.6 3.4 3.4 3-3L20 17.2" />
    </svg>
);
const CheckSingle = ({ color }: { color?: string }) => (
    <svg viewBox="0 0 24 24" style={{ ...svgBase, color }} {...stroke} strokeWidth={2.6}>
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
        <path d="M12 9c-3 0-4-3-2.5-4S12 6 12 9Zm0 0c3 0 4-3 2.5-4S12 6 12 9Z" fill="none" stroke="#e2355f" strokeWidth="1.8" />
    </svg>
);
const MicIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} fill="#fff">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M12 18v3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

/** Gold coin with a little bank/treasury mark, as in the gift + rose cards. */
const CoinIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase}>
        <circle cx="12" cy="12" r="11" fill="#f4b81a" />
        <circle cx="12" cy="12" r="8.6" fill="#fbd04a" stroke="#d99a0b" strokeWidth="1" />
        <path d="M12 6.4 6.6 9.4h10.8L12 6.4Z" fill="#b97a06" />
        <rect x="7.4" y="10.4" width="1.7" height="5" fill="#b97a06" />
        <rect x="11.15" y="10.4" width="1.7" height="5" fill="#b97a06" />
        <rect x="14.9" y="10.4" width="1.7" height="5" fill="#b97a06" />
        <rect x="6.6" y="16" width="10.8" height="1.5" rx="0.4" fill="#b97a06" />
    </svg>
);

/** Little ribbon bow that sits on top of the rose card's ribbon. */
const BowIcon = () => (
    <svg viewBox="0 0 48 40" style={{ width: "100%", height: "auto", display: "block" }}>
        <path d="M24 20 18 36l6-5 6 5-6-16Z" fill="#c92b57" />
        <path d="M24 18C17 6 3 8 3 16s14 6 21 2Z" fill="#ef5683" />
        <path d="M24 18C31 6 45 8 45 16s-14 6-21 2Z" fill="#ef5683" />
        <path d="M24 18C14 12 8 12 5.5 15" fill="none" stroke="#fb86a6" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="24" cy="17" r="5.4" fill="#e23a6a" />
        <circle cx="22.4" cy="15.4" r="1.6" fill="#f98aa8" />
    </svg>
);

/* dropdown-menu icons */
const FlagIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <path d="M6 21V4" />
        <path d="M6 4h11l-2.5 4L17 12H6" />
    </svg>
);
const BanIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <circle cx="12" cy="12" r="9" />
        <path d="M5.6 5.6l12.8 12.8" />
    </svg>
);
const BrokenHeartIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <path d="M12 20.5s-7.3-4.5-9.3-8.9C1.4 8.4 3.4 5 6.6 5c2 0 3.5 1 5.4 3 2-2 3.4-3 5.4-3 3.2 0 5.2 3.4 3.9 6.6-2 4.4-9.3 8.9-9.3 8.9Z" />
        <path d="M12 8.2 10 11.4l3 1.8-2 3.8" />
    </svg>
);
const BroomIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <path d="M12 3v6" />
        <path d="M8 21v-8a1.6 1.6 0 0 1 1.6-1.6h4.8A1.6 1.6 0 0 1 16 13v8Z" />
        <path d="M8 16.5h8" />
        <path d="M11 16.5V21M13 16.5V21" />
    </svg>
);
const TrashIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <path d="M4 7h16" />
        <path d="M9 7V4h6v3" />
        <path d="M6 7l1 13h10l1-13" />
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
        kind: "compliment",
        id: 3,
        from: "them",
        title: "Compliment from Anjali Jathar",
        subtitle: "heyy good evening",
        time: "5:36 PM",
    },
    {
        kind: "rose",
        id: 4,
        from: "them",
        title: "A rose from Snehal Sanjay Garad",
        subtitle: "She sent this hoping you'd write back. The ambition bit got me.",
        repliesDone: 0,
        repliesNeeded: 25,
        coins: 10,
        time: "12:39 PM",
    },
    {
        kind: "gift",
        id: 5,
        from: "me",
        giftName: "Coffee Date",
        giftEmoji: "☕",
        note: "Send a rose to make their profile moment a little more special 🌹",
        repliesDone: 1,
        repliesNeeded: 25,
        coinsSpent: 700,
        time: "1:26 PM",
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

/* --------------------------------- shared card bits --------------------------------- */

/** Row wrapper that aligns a card left/right and gives it its width. */
const CardRow = ({ mine, children }: { mine: boolean; children: React.ReactNode }) => (
    <div
        style={{
            display: "flex",
            justifyContent: mine ? "flex-end" : "flex-start",
            padding: `${U(1.4)} ${U(4)}`,
        }}
    >
        <div style={{ width: "90%", minWidth: 0 }}>{children}</div>
    </div>
);

/** Pink progress track + fill. */
const ProgressBar = ({ pct, height = 1.9 }: { pct: number; height?: number }) => (
    <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        style={{
            width: "100%",
            height: U(height),
            borderRadius: U(height),
            background: C.pinkTrack,
            overflow: "hidden",
        }}
    >
        <div
            style={{
                width: `${Math.max(0, Math.min(100, pct))}%`,
                height: "100%",
                borderRadius: U(height),
                background: C.pinkDeep,
                // keep a visible nub when progress is tiny but non-zero
                minWidth: pct > 0 ? U(height * 2.4) : 0,
            }}
        />
    </div>
);

const Coin = ({ size = 4.4 }: { size?: number }) => (
    <span style={{ fontSize: U(size), display: "inline-flex", verticalAlign: "middle" }}>
        <CoinIcon />
    </span>
);

/* --------------------------------- gift card (image 1) --------------------------------- */
const GiftCard = ({ msg, otherName }: { msg: GiftMessage; otherName: string }) => {
    const mine = msg.from === "me";
    const first = otherName.trim().split(/\s+/)[0] || "them";
    const needed = msg.repliesNeeded ?? 0;
    const done = Math.min(msg.repliesDone ?? 0, needed);
    const remaining = Math.max(needed - done, 0);
    const pct = needed > 0 ? (done / needed) * 100 : 0;
    const giftLabel = `${msg.giftEmoji ? `${msg.giftEmoji} ` : ""}${msg.giftName}`;

    return (
        <CardRow mine={mine}>
            <div
                style={{
                    overflow: "hidden",
                    borderRadius: U(6),
                    background: "#fffaf9",
                    border: `${HAIR} solid ${C.pinkBorder}`,
                    boxShadow: `0 ${U(1)} ${U(4)} rgba(226,58,106,.08)`,
                    color: C.ink,
                }}
            >
                {msg.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- backend media URL; no remote image loader is configured
                    <img
                        src={msg.imageUrl}
                        alt={msg.giftName}
                        style={{
                            display: "block",
                            width: "100%",
                            aspectRatio: "2 / 1",
                            objectFit: "cover",
                        }}
                    />
                )}

                <div style={{ padding: `${U(4)} ${U(4.4)} ${U(3)}`, display: "flex", flexDirection: "column", gap: U(3.4) }}>
                    {/* title */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: U(2.2),
                            color: C.pinkDeep,
                            fontSize: U(4.1),
                            fontWeight: 600,
                            lineHeight: 1.3,
                        }}
                    >
                        <span style={{ fontSize: U(5.2), display: "flex", marginTop: U(0.2) }}>
                            <GiftTabIcon />
                        </span>
                        <span style={{ minWidth: 0 }}>
                            {mine
                                ? `You sent ${otherName} a ${giftLabel}`
                                : `${otherName} sent you a ${giftLabel}`}
                        </span>
                    </div>

                    {/* quoted note */}
                    {msg.note && (
                        <div
                            style={{
                                borderLeft: `${U(0.9)} solid ${C.pinkDeep}`,
                                paddingLeft: U(3),
                                fontSize: U(3.7),
                                fontStyle: "italic",
                                lineHeight: 1.45,
                                color: "#2b282f",
                            }}
                        >
                            {msg.note}
                        </div>
                    )}

                    {/* reply progress */}
                    {needed > 0 && (
                        <div
                            style={{
                                borderRadius: U(4.4),
                                background: C.white,
                                border: `${HAIR} solid ${C.pinkBorder}`,
                                padding: `${U(3.4)} ${U(3.8)}`,
                                display: "flex",
                                flexDirection: "column",
                                gap: U(2.4),
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "baseline",
                                    justifyContent: "space-between",
                                    gap: U(2),
                                }}
                            >
                                <span style={{ fontSize: U(3.5), color: C.grey, fontWeight: 500 }}>
                                    {mine ? `${first}'s reply progress` : "Your reply progress"}
                                </span>
                                <span style={{ fontSize: U(3.5), color: C.pinkDeep, fontWeight: 700, whiteSpace: "nowrap" }}>
                                    {done}/{needed} replies
                                </span>
                            </div>

                            <ProgressBar pct={pct} />

                            <div style={{ fontSize: U(3.3), color: C.grey, lineHeight: 1.5 }}>
                                {remaining > 0 ? (
                                    <>
                                        {remaining} more {remaining === 1 ? "reply" : "replies"} and{" "}
                                        {mine ? `your gift unlocks for ${first} as` : "this gift unlocks for you as"}{" "}
                                    </>
                                ) : (
                                    <>{mine ? "Your gift is unlocked for " + first + " as " : "This gift is unlocked for you as "}</>
                                )}
                                {typeof msg.coinsSpent === "number" && (
                                    <span style={{ whiteSpace: "nowrap", color: C.ink, fontWeight: 600, fontSize: U(3.6) }}>
                                        <Coin size={4.2} /> {msg.coinsSpent}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* footer */}
                    <div
                        style={{
                            borderTop: `${HAIR} solid ${C.pinkBorder}`,
                            paddingTop: U(2.4),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: U(1.4),
                            fontSize: U(3),
                            color: C.greyLight,
                        }}
                    >
                        {msg.time}
                        {mine && (
                            <span style={{ fontSize: U(4), display: "flex" }}>
                                {msg.read ? <CheckDouble color="#a9a6ae" /> : <CheckSingle color="#a9a6ae" />}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </CardRow>
    );
};

/* --------------------------------- rose card (image 2) --------------------------------- */
const RoseCard = ({ msg, name }: { msg: CardMessage, name: string }) => {
    const mine = msg.from === "me";
    const needed = msg.repliesNeeded ?? 0;
    const done = Math.min(msg.repliesDone ?? 0, needed || msg.repliesDone || 0);
    const pct = needed > 0 ? (done / needed) * 100 : 0;

    return (
        <CardRow mine={mine}>
            <div
                style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: U(6),
                    background: C.white,
                    border: `${HAIR} solid ${C.pinkBorder}`,
                    padding: `${U(4)} ${U(4.4)} ${U(3.6)} ${U(17)}`,
                    color: C.ink,
                    boxShadow: `0 ${U(1)} ${U(4)} rgba(226,58,106,.07)`,
                }}
            >
                {/* ribbon */}
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: U(7.2),
                        width: U(5.6),
                        background: "linear-gradient(90deg, #d8315f, #ea4673 55%, #d8315f)",
                    }}
                />
                {/* bow */}
                <div aria-hidden style={{ position: "absolute", top: U(3.6), left: U(3.6), width: U(13.2) }}>
                    <BowIcon />
                </div>

                {/* glowing rose */}
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        top: U(3),
                        right: U(2.4),
                        width: U(17),
                        height: U(17),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "radial-gradient(circle, rgba(226,58,106,.2) 0%, rgba(226,58,106,0) 68%)",
                        fontSize: U(10),
                        lineHeight: 1,
                    }}
                >
                    🌹
                </div>

                <div style={{ paddingRight: U(15) }}>
                    <div style={{ fontSize: U(3.9), fontWeight: 600, lineHeight: 1.3 }}>{msg.title === "Rose Sent" ? `A Rose to ${name}` : `A Rose from ${name}`}</div>
                    {/* {msg.subtitle && (
                        <div
                            style={{
                                marginTop: U(2),
                                fontSize: U(3.7),
                                fontStyle: "italic",
                                lineHeight: 1.5,
                                color: "#2b282f",
                            }}
                        >
                            
                        </div>
                    )} */}
                </div>
                <div className="italic w-60" style={{ fontSize: U(3.2)}}>
                    {msg.from==="me" ? `I read your whole profile before this. The ambition bit got me.` : `Sent this hoping you'd write back. The ambition bit got me.`}
                </div>

                <div style={{ marginTop: U(4) }}>
                    <ProgressBar pct={pct} height={1.9} />
                </div>
                <div
                    style={{
                        marginTop: U(3.4),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: U(2),
                    }}
                >
                    <span
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: U(1.6),
                            fontSize: U(4),
                            fontWeight: 500,
                            color: "#6f6c74",
                        }}
                    >
                        {needed > 0 && (
                            <span>
                                {done}/{needed}
                            </span>
                        )}
                        {needed > 0 && typeof msg.coins === "number" && <span style={{ color: C.greyLight }}>·</span>}
                        {typeof msg.coins === "number" && (
                            <span style={{ display: "flex", alignItems: "center", gap: U(1.4) }}>
                                <Coin size={4.6} />
                                {msg.coins}
                            </span>
                        )}
                    </span>
                    <span style={{ fontSize: U(3.3), color: C.greyLight, whiteSpace: "nowrap" }}>{msg.time}</span>
                </div>
            </div>
        </CardRow>
    );
};

/* --------------------------------- compliment card (image 3) --------------------------------- */
const ComplimentCard = ({ msg }: { msg: CardMessage }) => {
    const mine = msg.from === "me";
    return (
        <CardRow mine={mine}>
            <div
                style={{
                    borderRadius: U(6),
                    background: C.white,
                    border: `${HAIR} solid ${C.blueBorder}`,
                    padding: `${U(3.6)} ${U(4.4)} ${U(3.2)}`,
                    color: C.ink,
                    boxShadow: `0 ${U(1)} ${U(4)} rgba(58,102,201,.06)`,
                }}
            >
                {/* chip */}
                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: U(2),
                        maxWidth: "100%",
                        padding: `${U(1.5)} ${U(2)}`,
                        borderRadius: U(6),
                        background: C.pinkSoft,
                        border: `${HAIR} solid ${C.pinkBorder}`,
                        color: C.pink,
                        fontSize: U(1.4),
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                        textTransform: "uppercase",
                    }}
                >
                    <span style={{ fontSize: U(2.5), lineHeight: 1 }}>💝</span>
                    <span style={{ fontSize: U(2.5),minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        COMPLIMENT SENT
                    </span>
                </span>

                {/* quote */}
                <div className="p-2 italic flex flex-row gap-2" style={{fontSize: U(3.9)}}>
                        <span className="bg-pink-500 rounded-full h-5 w-1"></span>
                        <span>{msg.title}</span>
                    </div>
                {msg.subtitle && (
                    <div
                        style={{
                            marginTop: U(3.4),
                            borderLeft: `${U(1)} solid ${C.blue}`,
                            paddingLeft: U(3),
                            fontSize: U(4.3),
                            fontStyle: "italic",
                            lineHeight: 1.4,
                            color: "#2b282f",
                            wordBreak: "break-word",
                        }}
                    >
                        {msg.subtitle}
                    </div>
                )}

                {/* footer */}
                <div
                    style={{
                        marginTop: U(3.4),
                        borderTop: `${HAIR} solid ${C.blueBorder}`,
                        paddingTop: U(2.8),
                        textAlign: "right",
                        fontSize: U(3.4),
                        color: C.mauve,
                    }}
                >
                    {msg.time}
                </div>
            </div>
        </CardRow>
    );
};

/* --------------------------------- generic card (image / event) --------------------------------- */
const CARD_ACCENT: Record<"image" | "event", { bg: string; fg: string; icon: React.ReactNode }> = {
    image: { bg: "#eef3f8", fg: "#4a4750", icon: <ImageIcon /> },
    event: { bg: "#fdeef1", fg: "#e0355f", icon: <CalendarIcon /> },
};

const CardBubble = ({ msg }: { msg: CardMessage }) => {
    const mine = msg.from === "me";
    const accent = CARD_ACCENT[msg.kind === "image" ? "image" : "event"];
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
                    maxWidth: "78%",
                    display: "flex",
                    flexDirection: "column",
                    gap: U(1.6),
                    padding: `${U(2.6)} ${U(3.4)}`,
                    borderRadius: U(5),
                    borderBottomRightRadius: mine ? U(1.2) : U(5),
                    borderBottomLeftRadius: mine ? U(5) : U(1.2),
                    background: mine ? C.bubbleMine : C.bubbleTheirs,
                    border: `${HAIR} solid ${C.border}`,
                    color: C.ink,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: U(2.4) }}>
                    <span
                        style={{
                            width: U(8.4),
                            height: U(8.4),
                            flexShrink: 0,
                            borderRadius: "50%",
                            background: accent.bg,
                            color: accent.fg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: U(4.6),
                        }}
                    >
                        {accent.icon}
                    </span>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: U(3.4), fontWeight: 700 }}>{msg.title}</div>
                        {msg.subtitle && (
                            <div
                                style={{
                                    fontSize: U(2.9),
                                    color: C.grey,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {msg.subtitle}
                            </div>
                        )}
                    </div>
                </div>

                {msg.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- backend media URL; no remote image loader is configured
                    <img
                        src={msg.imageUrl}
                        alt={msg.title}
                        style={{
                            width: "100%",
                            maxHeight: U(42),
                            objectFit: "cover",
                            borderRadius: U(3),
                        }}
                    />
                )}

                <span
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: U(1.4),
                        fontSize: U(2.5),
                        color: C.greyLight,
                    }}
                >
                    {msg.status && <span style={{ color: mine ? C.pinkText : C.greyLight }}>{msg.status}</span>}
                    {msg.time}
                    {mine && (
                        <span style={{ fontSize: U(3.2), display: "flex" }}>
                            {msg.read ? <CheckDouble color={C.pinkText} /> : <CheckSingle />}
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
};

/* --------------------------------- dropdown menu (image 4) --------------------------------- */
interface MenuItem {
    key: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    danger?: boolean;
    onClick?: () => void;
}

const MenuRow = ({ item, onPick }: { item: MenuItem; onPick: (fn?: () => void) => void }) => (
    <button
        type="button"
        role="menuitem"
        className="chat-btn chat-menu-item"
        onClick={() => onPick(item.onClick)}
        style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: U(4),
            padding: `${U(2.2)} ${U(2.4)}`,
            borderRadius: U(4),
            textAlign: "left",
        }}
    >
        <span
            aria-hidden
            style={{
                width: U(11.4),
                height: U(11.4),
                flexShrink: 0,
                borderRadius: U(3.4),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: U(5.4),
                background: item.danger ? C.menuDangerBg : C.menuIconBg,
                border: `${HAIR} solid ${item.danger ? C.menuDangerBorder : C.menuIconBorder}`,
                color: item.danger ? C.menuDanger : "#2f3747",
            }}
        >
            {item.icon}
        </span>
        <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: U(0.8) }}>
            <span
                style={{
                    fontSize: U(4.2),
                    fontWeight: 600,
                    lineHeight: 1.2,
                    color: item.danger ? C.menuDanger : C.menuInk,
                }}
            >
                {item.title}
            </span>
            <span style={{ fontSize: U(3.3), color: "#8e9096", lineHeight: 1.3 }}>{item.subtitle}</span>
        </span>
    </button>
);

/* -------------------------------- component -------------------------------- */
export default function ChatMain({
    userId,
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
    messagesLoading = false,
    messagesError = null,
    onRetryMessages,
    hasOlderMessages = false,
    onLoadOlderMessages,
    loadingOlderMessages = false,
    messagePlaceholder = "Message",
    onSend,
    onMenu,
    onAttach,
    onOpenGifts,
    onTry,
    onReport,
    onBlock,
    onUnmatch,
    onClearChat,
    onDeleteConversation,
    fluid = false,
    showBack = false,
    onBack,
    className,
    style,
}: ChatConversationProps) {
    const [tab, setTab] = useState<ChatTab>(activeTab);
    const [draft, setDraft] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

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

    const toggleMenu = () => {
        setMenuOpen((open) => {
            if (!open) onMenu?.();
            return !open;
        });
    };

    const pickMenu = (fn?: () => void) => {
        setMenuOpen(false);
        fn?.();
    };

    // close on Escape
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    const menuItems: MenuItem[] = [
        {
            key: "report",
            title: "Report User",
            subtitle: "Report inappropriate behavior or safety concerns",
            icon: <FlagIcon />,
            onClick: onReport,
        },
        {
            key: "block",
            title: `Block ${name}`,
            subtitle: "Prevent them from contacting you",
            icon: <BanIcon />,
            danger: true,
            onClick: onBlock,
        },
        {
            key: "unmatch",
            title: "Unmatch",
            subtitle: "Removes the match and this chat",
            icon: <BrokenHeartIcon />,
            danger: true,
            onClick: onUnmatch,
        },
        {
            key: "clear",
            title: "Clear Chat",
            subtitle: "Remove all messages from this chat",
            icon: <BroomIcon />,
            onClick: onClearChat,
        },
        {
            key: "delete",
            title: "Delete Conversation",
            subtitle: "Remove this conversation from your chat list",
            icon: <TrashIcon />,
            danger: true,
            onClick: onDeleteConversation,
        },
    ];

    return (
        <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
            {/* Card container – fills remaining height */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden ">

                {/* Profile card */}
                <div
                    className={fluid
                        ? "absolute inset-0 overflow-hidden"
                        : "  h-full aspect-[300/520] max-w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out "}>
                    <div
                        className={`chat-root ${className ?? ""}`}
                        style={{
                            position: "relative",
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap');
        .chat-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .chat-tabs::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .chat-btn { cursor: pointer; border: 0; font: inherit; background: transparent; transition: transform .12s ease, filter .12s ease, background-color .12s ease; }
        .chat-btn:active { transform: scale(.96); }
        .chat-btn:focus-visible { outline: 2px solid ${C.pink}; outline-offset: 2px; }
        .chat-menu-item:hover { background: #f8f8fa; }
        .chat-input::placeholder { color: ${C.greyLight}; }
        .chat-input:focus-visible { outline: none; }
        @keyframes chat-menu-in { from { opacity: 0; transform: translateY(-1.2cqw) scale(.98); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) { .chat-menu-panel { animation: none !important; } }
      `}</style>

                        {/* click-away layer for the dropdown */}
                        {menuOpen && (
                            <div
                                aria-hidden
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    zIndex: 20,
                                    background: "rgba(20,19,23,.12)",
                                }}
                            />
                        )}

                        {/* header (+ dropdown anchored underneath) */}
                        <div style={{ position: "relative", flexShrink: 0, zIndex: menuOpen ? 21 : 1, background: C.white }}>
                            <header
                                style={{
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
                                    aria-haspopup="menu"
                                    aria-expanded={menuOpen}
                                    onClick={toggleMenu}
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
                                        background: menuOpen ? "#f4f3f5" : "transparent",
                                    }}
                                >
                                    <DotsIcon />
                                </button>
                            </header>

                            {menuOpen && (
                                <div
                                    role="menu"
                                    aria-label="Chat options"
                                    className="chat-menu-panel"
                                    style={{
                                        position: "absolute",
                                        top: `calc(100% + ${U(1.6)})`,
                                        right: U(3),
                                        width: U(88),
                                        maxWidth: "calc(100% - " + U(6) + ")",
                                        padding: U(2),
                                        borderRadius: U(5),
                                        background: C.white,
                                        border: `${HAIR} solid #eeeeee`,
                                        boxShadow: `0 ${U(2)} ${U(8)} rgba(20,19,23,.18)`,
                                        animation: "chat-menu-in .14s ease-out",
                                        transformOrigin: "top right",
                                    }}
                                >
                                    {menuItems.map((item) => (
                                        <MenuRow key={item.key} item={item} onPick={pickMenu} />
                                    ))}
                                </div>
                            )}
                        </div>

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
                            {messagesLoading && messages.length === 0 ? (
                                <div
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: U(3.4),
                                        color: C.grey,
                                    }}
                                >
                                    Loading messages…
                                </div>
                            ) : messagesError && messages.length === 0 ? (
                                <div
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: U(3),
                                        padding: `0 ${U(8)}`,
                                        textAlign: "center",
                                    }}
                                >
                                    <span style={{ fontSize: U(3.4), color: C.grey }}>{messagesError}</span>
                                    <button
                                        type="button"
                                        className="chat-btn"
                                        onClick={onRetryMessages}
                                        style={{
                                            padding: `${U(2)} ${U(5)}`,
                                            borderRadius: U(6),
                                            background: C.pinkSoft,
                                            color: C.pinkText,
                                            fontSize: U(3.3),
                                            fontWeight: 600,
                                        }}
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : messages.length === 0 ? (
                                <div
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: U(3.4),
                                        color: C.grey,
                                    }}
                                >
                                    No messages yet.
                                </div>
                            ) : (
                                <>
                                    {hasOlderMessages && (
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                padding: `${U(1)} ${U(5)} ${U(2)}`,
                                            }}
                                        >
                                            <button
                                                type="button"
                                                className="chat-btn"
                                                onClick={onLoadOlderMessages}
                                                disabled={loadingOlderMessages}
                                                style={{
                                                    padding: `${U(1.6)} ${U(4.5)}`,
                                                    borderRadius: U(6),
                                                    background: C.pinkSoft,
                                                    color: C.pinkText,
                                                    fontSize: U(3),
                                                    fontWeight: 600,
                                                    opacity: loadingOlderMessages ? 0.6 : 1,
                                                }}
                                            >
                                                {loadingOlderMessages ? "Loading…" : "Load earlier messages"}
                                            </button>
                                        </div>
                                    )}
                                    {messages.map((m) => {
                                        if (m.kind === "text") return <TextBubble key={m.id} msg={m} />;
                                        if (m.kind === "gift") return <GiftCard key={m.id} msg={m} otherName={name} />;
                                        if (m.kind === "rose") return <RoseCard name={name} key={m.id} msg={m} />;
                                        if (m.kind === "compliment") return <ComplimentCard key={m.id} msg={m} />;
                                        return <CardBubble key={m.id} msg={m} />;
                                    })}
                                    {messagesError && (
                                        <div
                                            style={{
                                                textAlign: "center",
                                                padding: `${U(2)} ${U(5)}`,
                                                fontSize: U(2.9),
                                                color: C.grey,
                                            }}
                                        >
                                            {messagesError}
                                        </div>
                                    )}
                                </>
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
