import React, { useCallback, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Messages                                                                   */
/*                                                                              */
/*  An independent, fully fluid screen showing a conversation/message list:    */
/*    1. Header ("Messages") + search action                                   */
/*    2. Horizontally scrollable filter tabs (All, Unread, Online, ...)        */
/*    3. List of conversation rows, each with avatar, name, match/trust pills, */
/*       timestamp, and a status line (last message, gift sent, date status,   */
/*       or a progress bar toward a milestone like "Dinner Date").             */
/*                                                                              */
/*  It fills 100% width and 100% height of its PARENT. Every size inside       */
/*  (fonts, padding, gaps, radii, icons) is measured in `cqw`, i.e. 1% of the  */
/*  parent's width, so everything scales with the parent. If the content is    */
/*  taller than the parent's height, it scrolls vertically (scrollbar hidden   */
/*  across browsers, scrolling still works).                                   */
/*                                                                              */
/*  Usage:                                                                     */
/*    <div style={{ width: 390, height: 800 }}>                                */
/*      <Messages conversations={myConversations} />                          */
/*    </div>                                                                   */
/*                                                                              */
/*  Zero dependencies: no Tailwind, no icon library, no CSS files.             */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */
export type FilterTab =
    | "all"
    | "unread"
    | "online"
    | "nearby"
    | "dateInvites"
    | "events";

export type StatusKind = "text" | "gift" | "dateConfirmed" | "progress";

export interface ConversationStatus {
    kind: StatusKind;
    /** Shown for kind "text" and "gift" */
    text?: string;
    /** Shown to the right of a "progress" row, e.g. "Dinner Date" */
    progressLabel?: string;
    /** 0-100, shown for kind "progress" */
    progressPercent?: number;
}

export interface Conversation {
    id: string | number;
    name: string;
    avatarUrl?: string;
    matchPercent: number;
    trustPercent: number;
    timestamp: string;
    unread?: boolean;
    status: ConversationStatus;
}

export interface MessagesProps {
    title?: string;
    tabs?: { key: FilterTab; label: string }[];
    activeTab?: FilterTab;
    conversations?: Conversation[];
    onTabChange?: (tab: FilterTab) => void;
    onSearch?: () => void;
    onSelectConversation?: (id: string | number) => void;

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
    green: "#1f9254",
    greenSoft: "#e7f7ee",
    greenBadge: "#22b56b",
    ink: "#17151a",
    grey: "#8a8790",
    greyLight: "#b8b5bc",
    border: "#ececec",
    track: "#e7e5e9",
    white: "#ffffff",
};

// const FONT =
    // "'DM Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const svgBase: React.CSSProperties = { width: "1em", height: "1em", display: "block", flexShrink: 0 };
const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

/* ---------------------------------- icons ---------------------------------- */
const SearchIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke} strokeWidth={2.3}>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.3-4.3" />
    </svg>
);
const GiftIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} fill="none" stroke="none">
        <rect x="3" y="9" width="18" height="12" rx="2" fill="#f28c12" />
        <rect x="2" y="6" width="20" height="5" rx="1.4" fill="#e2355f" />
        <rect x="10.6" y="6" width="2.8" height="15" fill="#fff3d6" />
        <path
            d="M12 6c-2-3-6-2-5 1s5 1 5-1Zm0 0c2-3 6-2 5 1s-5 1-5-1Z"
            fill="#ffd166"
        />
    </svg>
);
const CheckBadgeIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase}>
        <rect x="2" y="2" width="20" height="20" rx="5" fill={C.greenBadge} />
        <path
            d="M6.5 12.5l3.7 3.7L17.5 8"
            fill="none"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

/* -------------------------------- defaults --------------------------------- */
const DEFAULT_TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "online", label: "Online" },
    { key: "nearby", label: "Nearby" },
    { key: "dateInvites", label: "Date Invites" },
    { key: "events", label: "Events" },
];

export const DEFAULT_CONVERSATIONS: Conversation[] = [
    {
        id: 1,
        name: "yogesh Ha...",
        matchPercent: 0,
        trustPercent: 85,
        timestamp: "Yesterday",
        status: {
            kind: "gift",
            text: "You sent a gift",
            progressLabel: "Dinner Date",
            progressPercent: 78,
        },
    },
    {
        id: 2,
        name: "vaibhav bad...",
        matchPercent: 0,
        trustPercent: 85,
        timestamp: "12:51 PM",
        status: { kind: "dateConfirmed", text: "Date confirmed" },
    },
];

/* --------------------------------- avatar ----------------------------------- */
const initialsGradient = (seed: string) => {
    const palettes = [
        ["#f6a37b", "#e2355f"],
        ["#7bb6f6", "#3a5be2"],
        ["#a8e0b0", "#1f9254"],
        ["#f6d47b", "#e28c12"],
    ];
    const idx = seed.charCodeAt(0) % palettes.length;
    return `linear-gradient(135deg, ${palettes[idx][0]}, ${palettes[idx][1]})`;
};

const Avatar = ({ name, url }: { name: string; url?: string }) => (
    <span
        style={{
            position: "relative",
            width: U(15.4),
            height: U(15.4),
            flexShrink: 0,
            borderRadius: "50%",
            border: `${U(0.55)} solid #f3c6d2`,
            overflow: "hidden",
            background: url ? "#eee" : initialsGradient(name),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: C.white,
            fontSize: U(5.6),
            fontWeight: 700,
        }}
    >
        {url ? (
            <img
                src={url}
                alt={name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
        ) : (
            name.trim().slice(0, 1).toUpperCase()
        )}
    </span>
);

/* ---------------------------------- pill ------------------------------------ */
const Pill = ({
    label,
    color,
    background,
}: {
    label: string;
    color: string;
    background: string;
}) => (
    <span
        style={{
            display: "inline-flex",
            alignItems: "center",
            padding: `${U(0.9)} ${U(2.6)}`,
            borderRadius: U(5),
            background,
            color,
            fontSize: U(2.7),
            fontWeight: 700,
            whiteSpace: "nowrap",
            lineHeight: 1.6,
        }}
    >
        {label}
    </span>
);

/* --------------------------------- status row -------------------------------- */
const StatusRow = ({ status }: { status: ConversationStatus }) => {
    if (status.kind === "dateConfirmed") {
        return (
            <div style={{ display: "flex", alignItems: "center", gap: U(1.6) }}>
                <span style={{ fontSize: U(3.6), display: "flex" }}>
                    <CheckBadgeIcon />
                </span>
                <span style={{ fontSize: U(3.3), color: C.green, fontWeight: 600 }}>
                    {status.text}
                </span>
            </div>
        );
    }

    if (status.kind === "gift") {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: U(1.6) }}>
                <div style={{ display: "flex", alignItems: "center", gap: U(1.8) }}>
                    <span style={{ fontSize: U(3.8), display: "flex" }}>
                        <GiftIcon />
                    </span>
                    <span style={{ fontSize: U(3.3), color: C.grey, fontWeight: 500 }}>
                        {status.text}
                    </span>
                </div>
                {typeof status.progressPercent === "number" && (
                    <div style={{ display: "flex", alignItems: "center", gap: U(2.4) }}>
                        <span
                            style={{
                                flex: 1,
                                height: U(1.2),
                                borderRadius: U(1),
                                background: C.track,
                                overflow: "hidden",
                            }}
                        >
                            <span
                                style={{
                                    display: "block",
                                    height: "100%",
                                    width: `${Math.max(0, Math.min(100, status.progressPercent))}%`,
                                    borderRadius: U(1),
                                    background: `linear-gradient(90deg, ${C.pink}, #f28c5a)`,
                                }}
                            />
                        </span>
                        {status.progressLabel && (
                            <span
                                style={{
                                    flexShrink: 0,
                                    fontSize: U(3),
                                    fontWeight: 600,
                                    color: C.green,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {status.progressLabel}
                            </span>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <span style={{ fontSize: U(3.3), color: C.grey, fontWeight: 500 }}>
            {status.text}
        </span>
    );
};

/* -------------------------------- component -------------------------------- */
export default function ChatSideBar({
    /* `title` is accepted for API compatibility but the section heading is
       owned by the host (desktop sidebar header / mobile top bar). */
    tabs = DEFAULT_TABS,
    activeTab = "all",
    conversations = DEFAULT_CONVERSATIONS,
    onTabChange,
    onSearch,
    onSelectConversation,
    className,
    style,
}: MessagesProps) {
    const [tab, setTab] = useState<FilterTab>(activeTab);

    const handleTab = useCallback(
        (key: FilterTab) => {
            setTab(key);
            onTabChange?.(key);
        },
        [onTabChange]
    );

    return (
        <div
            className={`msg-scroll ${className ?? ""}`}
            style={{
                width: "100%",
                height: "100%",
                containerType: "inline-size",
                overflowY: "auto",
                overflowX: "hidden",
                background: C.white,
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                boxSizing: "border-box",
                ...style,
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .msg-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .msg-btn { cursor: pointer; border: 0; font: inherit; background: transparent; transition: transform .12s ease, filter .12s ease; }
        .msg-btn:active { transform: scale(.97); }
        .msg-row { cursor: pointer; transition: background-color .12s ease; }
        .msg-row:hover { background-color: #fafafa; }
        .msg-tabs::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .msg-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
      `}</style>

            <div
                style={{
                    // fontFamily: FONT,
                    color: C.ink,
                    boxSizing: "border-box",
                    minHeight: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* header */}
                <header
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: `${U(5)} ${U(5)} ${U(2.5)}`,
                    }}
                >
                    <h1
                        style={{
                            margin: 0,
                            fontSize: U(7.4),
                            fontWeight: 800,
                            letterSpacing: "-0.01em",
                        }}
                    >
                        <span style={{ color: C.ink }}>Mess</span>
                        <span style={{ color: C.pinkText }}>ages</span>
                    </h1>
                    {/* <button
                        type="button"
                        className="msg-btn"
                        aria-label="Search"
                        onClick={onSearch}
                        style={{
                            width: U(10.4),
                            height: U(10.4),
                            borderRadius: "50%",
                            background: "#f4f3f5",
                            color: C.ink,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: U(4.6),
                            flexShrink: 0,
                        }}
                    >
                        <SearchIcon />
                    </button> */}
                </header>

                {/* tabs */}
                {/* <nav
                    role="tablist"
                    className="msg-tabs"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: U(6.4),
                        padding: `0 ${U(5)} ${U(3.4)}`,
                        overflowX: "auto",
                        borderBottom: `${HAIR} solid ${C.border}`,
                    }}
                >
                    {tabs.map(({ key, label }) => {
                        const active = tab === key;
                        return (
                            <button
                                key={key}
                                role="tab"
                                aria-selected={active}
                                type="button"
                                className="msg-btn"
                                onClick={() => handleTab(key)}
                                style={{
                                    position: "relative",
                                    flexShrink: 0,
                                    paddingBottom: U(2.6),
                                    fontSize: U(3.7),
                                    fontWeight: active ? 700 : 500,
                                    color: active ? C.pinkText : "#4a4750",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {label}
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
                </nav> */}

                {/* list */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    {conversations.length === 0 ? (
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: U(10),
                            }}
                        >
                            <p style={{ margin: 0, fontSize: U(3.6), color: C.greyLight, textAlign: "center" }}>
                                No conversations yet
                            </p>
                        </div>
                    ) : (
                        conversations.map((c, i) => (
                            <div
                                key={c.id}
                                className="msg-row"
                                onClick={() => onSelectConversation?.(c.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: U(3.4),
                                    padding: `${U(4)} ${U(5)}`,
                                    borderTop: i === 0 ? "none" : `${HAIR} solid ${C.border}`,
                                }}
                            >
                                <Avatar name={c.name} url={c.avatarUrl} />

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: U(2),
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: U(2),
                                                minWidth: 0,
                                                flex: 1,
                                            }}
                                        >
                                            <span
                                                className="msg-ellipsis"
                                                style={{ fontSize: U(3.9), fontWeight: 700 }}
                                            >
                                                {c.name}
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                flexShrink: 0,
                                                fontSize: U(3),
                                                color: C.greyLight,
                                                fontWeight: 500,
                                            }}
                                        >
                                            {c.timestamp}
                                        </span>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: U(1.8),
                                            marginTop: U(1.4),
                                            marginBottom: U(2.4),
                                        }}
                                    >
                                        <Pill
                                            label={`${c.matchPercent}% Match`}
                                            color={C.pinkText}
                                            background={C.pinkSoft}
                                        />
                                        <Pill
                                            label={`${c.trustPercent}% Trust`}
                                            color={C.green}
                                            background={C.greenSoft}
                                        />
                                    </div>

                                    <StatusRow status={c.status} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
