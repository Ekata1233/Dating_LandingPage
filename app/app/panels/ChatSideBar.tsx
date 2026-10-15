import NewMatches, { NewMatch } from "@/app/components/ui/newMatches";
import {
    Conversation,
    useConversations,
    useNewMatches,
} from "@/app/context/ChatContext";
import React, { useCallback, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Messages                                                                   */
/*                                                                              */
/*  An independent, fully fluid screen showing a conversation/message list:    */
/*    1. Header ("Messages") + new matches                                     */
/*    2. Horizontally scrollable filter tabs (All, Unread, Online, ...)        */
/*    3. List of conversation rows, each with avatar, name, match/trust pills, */
/*       timestamp, and a status line (last message, gift sent, date status).  */
/*                                                                              */
/*  It fills 100% width and 100% height of its PARENT. Every size inside       */
/*  (fonts, padding, gaps, radii, icons) is measured in `cqw`, i.e. 1% of the  */
/*  parent's width, so everything scales with the parent. If the content is    */
/*  taller than the parent's height, it scrolls vertically (scrollbar hidden   */
/*  across browsers, scrolling still works).                                   */
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

export interface MessagesProps {
    title?: string;
    tabs?: { key: FilterTab; label: string }[];
    activeTab?: FilterTab;
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

/* -------------------------------- defaults --------------------------------- */
const DEFAULT_TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "online", label: "Online" },
    { key: "nearby", label: "Nearby" },
    { key: "dateInvites", label: "Date Invites" },
    { key: "events", label: "Events" },
];

/* --------------------------------- chrome ---------------------------------- */
/* The "Messages" header + new matches + filter tabs. Extracted so the mobile
   thread can keep the same chrome pinned above the conversation, not just the
   list. */
export interface ChatChromeProps {
    tabs?: { key: FilterTab; label: string }[];
    activeTab?: FilterTab;
    onTabChange?: (tab: FilterTab) => void;
    className?: string;
    style?: React.CSSProperties;
}

export function ChatChrome({
    tabs = DEFAULT_TABS,
    activeTab = "all",
    onTabChange,
    className,
    style,
}: ChatChromeProps) {
    const [tab, setTab] = useState<FilterTab>(activeTab);
    const { newMatches } = useNewMatches();
    const { conversations, selectConversation } = useConversations();

    const matches: NewMatch[] = newMatches.map((m) => ({
        id: m.sender.id,
        name: m.sender.name,
        photo: m.sender.photo,
        hasGift: m.type === "GIFT",
    }));

    const handleTab = useCallback(
        (key: FilterTab) => {
            setTab(key);
            onTabChange?.(key);
        },
        [onTabChange]
    );

    const openMatch = useCallback(
        (senderId: string) => {
            const conversation = conversations.find((c) => c.user.id === senderId);
            if (conversation) selectConversation(conversation.conversationId);
        },
        [conversations, selectConversation]
    );

    return (
        <div
            className={`shrink-0 ${className ?? ""}`}
            style={{
                width: "100%",
                boxSizing: "border-box",
                containerType: "inline-size",
                ...style,
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .msg-tabs::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>

            {/* header */}
            <header
                className="px-[4.054cqw] py-[1.778cqh]"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <h1
                    className="text-[7.432cqw]"
                    style={{
                        margin: 0,
                        fontWeight: 800,
                        letterSpacing: "-0.01em",
                    }}
                >
                    <span style={{ color: C.ink }}>Mess</span>
                    <span style={{ color: C.pinkText }}>ages</span>
                </h1>
            </header>

            {/* new matches + tabs */}
            <NewMatches matches={matches} onSelect={openMatch} />
            <nav
                role="tablist"
                className="msg-tabs pt-2 pb-3 px-2"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: U(6.4),
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
            </nav>
        </div>
    );
}

export function formatTimeAgo(timestamp: string) {
    const time = new Date(timestamp).getTime();

    if (Number.isNaN(time)) return "";

    const diff = Math.max(0, Date.now() - time);

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;
    const year = 365 * day;

    if (diff < minute) return "now";
    if (diff < hour) return `${Math.floor(diff / minute)}m`;
    if (diff < day) return `${Math.floor(diff / hour)}hr`;
    if (diff < week) return `${Math.floor(diff / day)}d`;
    if (diff < month) return `${Math.floor(diff / week)}w`;
    if (diff < year) return `${Math.floor(diff / month)}mo`;

    return `${Math.floor(diff / year)}y`;
}

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
            // eslint-disable-next-line @next/next/no-img-element
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
/* Last-message line. Unread conversations render black + bold; read ones keep
   their original color and weight. Inline styles are used on purpose, since
   they would override any Tailwind color/weight classes. */
const StatusRow = ({ conversation }: { conversation: Conversation }) => {
    const unread = conversation.unreadCount >= 1;
    const { messageType, content } = conversation.lastMessage;

    const textStyle = (
        readColor: string,
        readWeight: number
    ): React.CSSProperties => ({
        fontSize: U(3.5),
        color: unread ? C.ink : readColor,
        fontWeight: unread ? 700 : readWeight,
    });

    if (messageType === "DATE_CONFIRMED") {
        return (
            <div style={{ display: "flex", alignItems: "center", gap: U(1.6) }}>
                <span style={textStyle(C.green, 400)}>{content}</span>
            </div>
        );
    }

    if (messageType === "GIFT") {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: U(1.6) }}>
                <div style={{ display: "flex ", alignItems: "center", gap: U(1.8) }}>
                    <span style={textStyle(C.grey, 500)}>{content}</span>
                </div>
            </div>
        );
    }

    return <span style={textStyle(C.grey, 500)}>{content}</span>;
};

/* -------------------------------- component -------------------------------- */
export default function ChatSideBar({
    /* `title` is accepted for API compatibility but the section heading is
       owned by the host (desktop sidebar header / mobile top bar). */
    tabs = DEFAULT_TABS,
    activeTab = "all",
    onTabChange,
    onSelectConversation,
    className,
    style,
}: MessagesProps) {
    const { conversations, activeConversationId, selectConversation } =
        useConversations();

    const openConversation = useCallback(
        (id: string) => {
            selectConversation(id);
            onSelectConversation?.(id);
        },
        [selectConversation, onSelectConversation]
    );

    return (
        <div
            className={`msg-scroll bg-slate-50 ${className ?? ""}`}
            style={{
                width: "100%",
                height: "100%",
                containerType: "inline-size",
                overflowY: "auto",
                overflowX: "hidden",
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
                    color: C.ink,
                    boxSizing: "border-box",
                    minHeight: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* header + new matches + tabs */}
                <ChatChrome
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                />

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
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: U(3.6),
                                    color: C.greyLight,
                                    textAlign: "center",
                                }}
                            >
                                No conversations yet
                            </p>
                        </div>
                    ) : (
                        conversations
                            .toSorted(
                                (a, b) =>
                                    new Date(b.updatedAt).getTime() -
                                    new Date(a.updatedAt).getTime()
                            )
                            .map((c, i) => (
                                <div
                                    key={c.conversationId}
                                    className="msg-row bg-white"
                                    onClick={() => openConversation(c.conversationId)}
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: U(3.4),
                                        padding: `${U(4)} ${U(5)}`,
                                        borderTop:
                                            i === 0 ? "none" : `${HAIR} solid ${C.border}`,
                                        backgroundColor:
                                            c.conversationId === activeConversationId
                                                ? "#F2F2F2"
                                                : undefined,
                                    }}
                                >
                                    <Avatar name={c.user.fullName} url={c.user.profilePhoto} />

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
                                                className="justify-between"
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: U(2),
                                                    minWidth: 0,
                                                    flex: 1,
                                                }}
                                            >
                                                <span
                                                    className="msg-ellipsis truncate"
                                                    style={{ fontSize: U(3.9), fontWeight: 700 }}
                                                >
                                                    {c.user.fullName},&nbsp;{c.user.age}
                                                </span>
                                                <span className="flex">
                                                    <Pill
                                                        label={`${c.user.matchPercentage}% Match`}
                                                        color={C.pinkText}
                                                        background={C.pinkSoft}
                                                    />
                                                    <Pill
                                                        label={`${c.user.trustPercentage}% Trust`}
                                                        color={C.green}
                                                        background={C.greenSoft}
                                                    />
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
                                                {formatTimeAgo(c.updatedAt)}
                                            </span>
                                        </div>

                                        <div
                                            className="flex justify-between"
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: U(1.8),
                                                marginTop: U(1.4),
                                                marginBottom: U(2.4),
                                            }}
                                        >
                                            <StatusRow conversation={c} />
                                            {c.unreadCount > 0 && (
                                                <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-[#E7477D] px-1 text-[10px] font-bold leading-none text-white">
                                                    {c.unreadCount > 99 ? "99+" : c.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </div>
        </div>
    );
}