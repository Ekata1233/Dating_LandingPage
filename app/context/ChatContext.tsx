"use client";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import axios from "axios";
import { API_BASE_URL } from "@/utils/api";
import { authHeader, getClientToken } from "@/utils/token";

/* ------------------------------------------------------------------ */
/* API URLs                                                           */
/* ------------------------------------------------------------------ */

const CHAT_CONVERSATIONS_URL = `${API_BASE_URL}/api/user/chat/conversations`; // GET ?cursor=
const NEW_MATCHES_URL = `${API_BASE_URL}/api/user/matches/new`; // GET ?cursor=
/** Appends an optional pagination cursor to a list URL. */
const withCursor = (base: string, cursor?: string | null) =>
    cursor ? `${base}?cursor=${encodeURIComponent(cursor)}` : base;

const conversationsUrl = (cursor?: string | null) =>
    withCursor(CHAT_CONVERSATIONS_URL, cursor);

const newMatchesUrl = (cursor?: string | null) =>
    withCursor(NEW_MATCHES_URL, cursor);

/**
 * GET chat history for one conversation: `?cursor=` for older pages.
 * The id is `Conversation.conversationId` from the chat_conversations
 * response — i.e. the active conversation in the chat section.
 */
const chatHistoryUrl = (conversationId: string, cursor?: string | null) =>
    withCursor(
        `${CHAT_CONVERSATIONS_URL}/${encodeURIComponent(conversationId)}/messages`,
        cursor
    );

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
export interface Pagination {
    hasMore: boolean;
    nextCursor: string | null;
}

export interface MessagesResponse {
    success: boolean;
    message?: string;
    data?: Message[];
    pagination?: Pagination;
}


export interface Compliment {
    id: string;
    senderId: string;
    receiverId: string;
    message: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string | null;
    messageType: MessageType;
    mediaUrl: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    deliveredAt: string | null;
    readAt: string | null;

    compliment: Compliment | null;
    rose: unknown | null;
    gift: unknown | null;
    event: unknown | null;
    datePlan: unknown | null;
    progress: unknown | null;

    // frontend only
    status?: "sending" | "sent" | "failed";
}
export type LoadStatus = "idle" | "loading" | "success" | "error";

/* ----------------------------- New matches ------------------------ */

export type NewMatchType = "ROSE" | "GIFT" | "COMPLIMENT";

export interface NewMatchMessage {
    messageId: string;
    type: NewMatchType;
    content: string | null;
    metadata: {
        targetId: string | null;
        targetType: string | null;
    };
    createdAt: string; // ISO date
    sender: {
        id: string;
        name: string;
        age: number;
        photo: string;
    };
}

export interface NewMatchesResponse {
    success: boolean;
    message?: string;
    data?: NewMatchMessage[];
    pagination?: Pagination;
}

/** @deprecated Use `NewMatchesResponse`. Kept so existing imports still compile. */
export type RoseResponse = NewMatchesResponse;

/* ----------------------------- Conversations ---------------------- */

export type MessageType =
    | "DATE_CONFIRMED"
    | "RELATIONSHIP_TAG_PROPOSAL"
    | "ROSE"
    | "ENGAGEMENT"
    | "GIFT"
    | "IMAGE"
    | "TEXT";

export type ProgressType = "GIFT" | "ROSE";

export interface ChatUser {
    id: string;
    fullName: string;
    age: number;
    profilePhoto: string;
    matchPercentage: number;
    trustPercentage: number;
    isOnline: boolean;
    lastSeenAt: string | null; // ISO date
}

export interface LastMessage {
    id: string;
    senderId: string;
    content: string;
    messageType: MessageType;
    mediaUrl: string | null;
    createdAt: string; // ISO date
    deliveredAt: string | null;
    readAt: string | null;
}

export interface ConversationProgress {
    current: number;
    target: number;
    percentage: number;
    label: string;
    type: ProgressType;
    giftName: string | null;
    expiresAt: string; // ISO date
}

export interface Conversation {
    conversationId: string;
    user: ChatUser;
    lastMessage: LastMessage;
    unreadCount: number;
    progress: ConversationProgress | null;
    updatedAt: string; // ISO date
}

export interface ConversationListResponse {
    success: boolean;
    message?: string;
    data?: Conversation[];
    pagination?: Pagination;
}

/* ------------------------------------------------------------------ */
/* Context Type                                                       */
/* ------------------------------------------------------------------ */

interface ChatConversationsContextData {
    /* Conversations */
    conversations: Conversation[];
    conversationsStatus: LoadStatus;
    /** True until the first request settles (idle counts as loading). */
    conversationsLoading: boolean;
    conversationsError: string | null;

    /** The conversation currently open in the main/thread pane, if any. */
    activeConversationId: string | null;
    /** Opens a conversation, or `null` to return to the list. */
    selectConversation: (id: string | null) => void;

    /** Reloads from the first page. */
    refetchConversations: () => Promise<void>;
    /** Fetches conversations only if nothing has been requested yet. */
    ensureConversations: () => void;

    hasMore: boolean;
    loadMore: () => Promise<void>;
    loadMoreLoading: boolean;
    loadMoreError: string | null;

    /* New matches */
    newMatches: NewMatchMessage[];
    newMatchesStatus: LoadStatus;
    newMatchesLoading: boolean;
    newMatchesError: string | null;
    refetchNewMatches: () => Promise<void>;
    ensureNewMatches: () => void;

    newMatchesHasMore: boolean;
    loadMoreNewMatches: () => Promise<void>;
    loadMoreNewMatchesLoading: boolean;
    loadMoreNewMatchesError: string | null;

    /* Chat history (messages of the active conversation) */
    messages: Message[];
    messagesStatus: LoadStatus;
    messagesLoading: boolean;
    messagesError: string | null;
    refetchMessages: () => Promise<void>;

    messagesHasMore: boolean;
    loadMoreMessages: () => Promise<void>;
    messagesLoadMoreLoading: boolean;
    messagesLoadMoreError: string | null;
}

/* ------------------------------------------------------------------ */
/* Context                                                            */
/* ------------------------------------------------------------------ */

const ChatConversationsContext = createContext<ChatConversationsContextData>({
    conversations: [],
    conversationsStatus: "idle",
    conversationsLoading: true,
    conversationsError: null,
    activeConversationId: null,
    selectConversation: () => { },
    refetchConversations: async () => { },
    ensureConversations: () => { },

    hasMore: false,
    loadMore: async () => { },
    loadMoreLoading: false,
    loadMoreError: null,

    newMatches: [],
    newMatchesStatus: "idle",
    newMatchesLoading: true,
    newMatchesError: null,
    refetchNewMatches: async () => { },
    ensureNewMatches: () => { },

    newMatchesHasMore: false,
    loadMoreNewMatches: async () => { },
    loadMoreNewMatchesLoading: false,
    loadMoreNewMatchesError: null,

    messages: [],
    messagesStatus: "idle",
    messagesLoading: true,
    messagesError: null,
    refetchMessages: async () => { },

    messagesHasMore: false,
    loadMoreMessages: async () => { },
    messagesLoadMoreLoading: false,
    messagesLoadMoreError: null,
});

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

type GetResult<T> = { data: T | null; error: string | null };

/** Pulls a readable message out of an unknown thrown value. */
function errorMessage(err: unknown, fallback: string): string {
    if (axios.isAxiosError(err)) {
        return err.response?.data?.message || fallback;
    }
    return fallback;
}

/** Most recently active first. */
function sortByUpdated(list: Conversation[]): Conversation[] {
    return [...list].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

/** Newest first. */
function sortByCreated(list: NewMatchMessage[]): NewMatchMessage[] {
    return [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

/** Oldest first — the order a chat thread is rendered in. */
function sortMessagesByCreated(list: Message[]): Message[] {
    return [...list].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */

export function ChatConversationsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    /* Guards against state updates after unmount. */
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    /* One in-flight promise per resource key. */
    const inflight = useRef<Record<string, Promise<void> | undefined>>({});
    const dedupe = useCallback((key: string, task: () => Promise<void>) => {
        const existing = inflight.current[key];
        if (existing) return existing;

        const promise = task().finally(() => {
            delete inflight.current[key];
        });
        inflight.current[key] = promise;
        return promise;
    }, []);

    /* ---------------------------------------------------------------- */
    /* Conversations state                                              */
    /* ---------------------------------------------------------------- */

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [conversationsStatus, setConversationsStatus] =
        useState<LoadStatus>("idle");
    const [conversationsError, setConversationsError] =
        useState<string | null>(null);

    const [activeConversationId, setActiveConversationId] =
        useState<string | null>(null);
    const selectConversation = useCallback((id: string | null) => {
        setActiveConversationId(id);
    }, []);

    const [pagination, setPagination] = useState<Pagination>({
        hasMore: false,
        nextCursor: null,
    });
    const [loadMoreLoading, setLoadMoreLoading] = useState(false);
    const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* New matches state                                                */
    /* ---------------------------------------------------------------- */

    const [newMatches, setNewMatches] = useState<NewMatchMessage[]>([]);
    const [newMatchesStatus, setNewMatchesStatus] = useState<LoadStatus>("idle");
    const [newMatchesError, setNewMatchesError] = useState<string | null>(null);

    const [newMatchesPagination, setNewMatchesPagination] = useState<Pagination>({
        hasMore: false,
        nextCursor: null,
    });
    const [loadMoreNewMatchesLoading, setLoadMoreNewMatchesLoading] =
        useState(false);
    const [loadMoreNewMatchesError, setLoadMoreNewMatchesError] =
        useState<string | null>(null);

    /* Mirrors so `ensure*` / `loadMore*` keep a stable identity. */
    const conversationsStatusRef = useRef(conversationsStatus);
    const paginationRef = useRef(pagination);
    const newMatchesStatusRef = useRef(newMatchesStatus);
    const newMatchesPaginationRef = useRef(newMatchesPagination);
    conversationsStatusRef.current = conversationsStatus;
    paginationRef.current = pagination;
    newMatchesStatusRef.current = newMatchesStatus;
    newMatchesPaginationRef.current = newMatchesPagination;

    /* ---------------------------------------------------------------- */
    /* Chat history state (bound to the active conversation)            */
    /* ---------------------------------------------------------------- */

    const [messages, setMessages] = useState<Message[]>([]);
    const [messagesStatus, setMessagesStatus] = useState<LoadStatus>("idle");
    const [messagesError, setMessagesError] = useState<string | null>(null);
    const [messagesPagination, setMessagesPagination] = useState<Pagination>({
        hasMore: false,
        nextCursor: null,
    });
    const [messagesLoadMoreLoading, setMessagesLoadMoreLoading] =
        useState(false);
    const [messagesLoadMoreError, setMessagesLoadMoreError] =
        useState<string | null>(null);

    /* Read inside async continuations to detect that the user switched
       conversations mid-flight. Written by the chat-history effect below,
       never during render. */
    const activeConversationIdRef = useRef<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Generic auth GET                                                 */
    /* ---------------------------------------------------------------- */

    /** Never throws. Returns the body, or the server's error message. */
    const authGet = useCallback(async <T,>(url: string): Promise<GetResult<T>> => {
        try {
            const response = await axios.get<T>(url, {
                headers: authHeader(),
            });
            return { data: response.data, error: null };
        } catch (err) {
            console.error("ChatConversations GET error:", url, err);
            return { data: null, error: errorMessage(err, "") || null };
        }
    }, []);

    /* ---------------------------------------------------------------- */
    /* CONVERSATIONS (first page)                                       */
    /* ---------------------------------------------------------------- */

    const refetchConversations = useCallback(
        () =>
            dedupe("conversations", async () => {
                /* No session: "not loaded", not "empty". Stay idle so a
                   later `ensureConversations` can try again. */
                if (!getClientToken()) {
                    setConversationsStatus("idle");
                    return;
                }

                setConversationsStatus("loading");
                setConversationsError(null);
                setLoadMoreError(null);

                const { data, error } =
                    await authGet<ConversationListResponse>(conversationsUrl());
                if (!mounted.current) return;

                if (data?.success && Array.isArray(data.data)) {
                    setConversations(sortByUpdated(data.data));
                    setPagination({
                        hasMore: !!data.pagination?.hasMore,
                        nextCursor: data.pagination?.nextCursor ?? null,
                    });
                    setConversationsStatus("success");
                } else {
                    setConversations([]);
                    setPagination({ hasMore: false, nextCursor: null });
                    setConversationsError(
                        data?.message || error || "Couldn't load conversations."
                    );
                    setConversationsStatus("error");
                }
            }),
        [authGet, dedupe]
    );

    const ensureConversations = useCallback(() => {
        if (conversationsStatusRef.current === "idle") void refetchConversations();
    }, [refetchConversations]);

    /* ---------------------------------------------------------------- */
    /* CONVERSATIONS LOAD MORE                                          */
    /* ---------------------------------------------------------------- */

    const loadMore = useCallback(
        () =>
            dedupe("conversationsMore", async () => {
                const { hasMore, nextCursor } = paginationRef.current;
                if (!hasMore || !nextCursor || !getClientToken()) return;

                setLoadMoreLoading(true);
                setLoadMoreError(null);

                const { data, error } = await authGet<ConversationListResponse>(
                    conversationsUrl(nextCursor)
                );
                if (!mounted.current) return;

                if (data?.success && Array.isArray(data.data)) {
                    const incoming = data.data;

                    /* Merge by id so an overlapping page can't duplicate rows. */
                    setConversations((prev) => {
                        const byId = new Map(prev.map((c) => [c.conversationId, c]));
                        incoming.forEach((c) => byId.set(c.conversationId, c));
                        return sortByUpdated(Array.from(byId.values()));
                    });
                    setPagination({
                        hasMore: !!data.pagination?.hasMore,
                        nextCursor: data.pagination?.nextCursor ?? null,
                    });
                } else {
                    setLoadMoreError(
                        data?.message || error || "Couldn't load more conversations."
                    );
                }
                setLoadMoreLoading(false);
            }),
        [authGet, dedupe]
    );

    /* ---------------------------------------------------------------- */
    /* NEW MATCHES (first page)                                         */
    /* ---------------------------------------------------------------- */

    const refetchNewMatches = useCallback(
        () =>
            dedupe("newMatches", async () => {
                if (!getClientToken()) {
                    setNewMatchesStatus("idle");
                    return;
                }

                setNewMatchesStatus("loading");
                setNewMatchesError(null);
                setLoadMoreNewMatchesError(null);

                const { data, error } =
                    await authGet<NewMatchesResponse>(newMatchesUrl());
                if (!mounted.current) return;

                if (data?.success && Array.isArray(data.data)) {
                    setNewMatches(sortByCreated(data.data));
                    setNewMatchesPagination({
                        hasMore: !!data.pagination?.hasMore,
                        nextCursor: data.pagination?.nextCursor ?? null,
                    });
                    setNewMatchesStatus("success");
                } else {
                    setNewMatches([]);
                    setNewMatchesPagination({ hasMore: false, nextCursor: null });
                    setNewMatchesError(
                        data?.message || error || "Couldn't load new matches."
                    );
                    setNewMatchesStatus("error");
                }
            }),
        [authGet, dedupe]
    );

    const ensureNewMatches = useCallback(() => {
        if (newMatchesStatusRef.current === "idle") void refetchNewMatches();
    }, [refetchNewMatches]);

    /* ---------------------------------------------------------------- */
    /* NEW MATCHES LOAD MORE                                            */
    /* ---------------------------------------------------------------- */

    const loadMoreNewMatches = useCallback(
        () =>
            dedupe("newMatchesMore", async () => {
                const { hasMore, nextCursor } = newMatchesPaginationRef.current;
                if (!hasMore || !nextCursor || !getClientToken()) return;

                setLoadMoreNewMatchesLoading(true);
                setLoadMoreNewMatchesError(null);

                const { data, error } = await authGet<NewMatchesResponse>(
                    newMatchesUrl(nextCursor)
                );
                if (!mounted.current) return;

                if (data?.success && Array.isArray(data.data)) {
                    const incoming = data.data;

                    /* Merge by messageId so an overlapping page can't duplicate. */
                    setNewMatches((prev) => {
                        const byId = new Map(prev.map((m) => [m.messageId, m]));
                        incoming.forEach((m) => byId.set(m.messageId, m));
                        return sortByCreated(Array.from(byId.values()));
                    });
                    setNewMatchesPagination({
                        hasMore: !!data.pagination?.hasMore,
                        nextCursor: data.pagination?.nextCursor ?? null,
                    });
                } else {
                    setLoadMoreNewMatchesError(
                        data?.message || error || "Couldn't load more new matches."
                    );
                }
                setLoadMoreNewMatchesLoading(false);
            }),
        [authGet, dedupe]
    );

    /* ---------------------------------------------------------------- */
    /* CHAT HISTORY (first page of the active conversation)             */
    /* ---------------------------------------------------------------- */

    const refetchMessages = useCallback(
        () => {
            const conversationId = activeConversationId;
            return dedupe(`messages:${conversationId ?? ""}`, async () => {
                /* No conversation / no session → stay idle, never "empty". */
                if (!conversationId || !getClientToken()) {
                    setMessagesStatus("idle");
                    return;
                }

                /* Drop the previous conversation's thread the moment the new
                   fetch starts. Lives in the async body so the effect below
                   never calls setState synchronously. */
                setMessages([]);
                setMessagesPagination({ hasMore: false, nextCursor: null });
                setMessagesError(null);
                setMessagesLoadMoreError(null);
                setMessagesLoadMoreLoading(false);
                setMessagesStatus("loading");

                const { data, error } =
                    await authGet<MessagesResponse>(chatHistoryUrl(conversationId));
                if (!mounted.current) return;
                /* The user switched conversations while this was in flight. */
                if (activeConversationIdRef.current !== conversationId) return;

                if (data?.success && Array.isArray(data.data)) {
                    setMessages(sortMessagesByCreated(data.data));
                    setMessagesPagination({
                        hasMore: !!data.pagination?.hasMore,
                        nextCursor: data.pagination?.nextCursor ?? null,
                    });
                    setMessagesStatus("success");
                } else {
                    setMessages([]);
                    setMessagesPagination({ hasMore: false, nextCursor: null });
                    setMessagesError(
                        data?.message || error || "Couldn't load messages."
                    );
                    setMessagesStatus("error");
                }
            });
        },
        [activeConversationId, authGet, dedupe]
    );

    /* ---------------------------------------------------------------- */
    /* CHAT HISTORY LOAD MORE (older pages)                             */
    /* ---------------------------------------------------------------- */

    const loadMoreMessages = useCallback(
        () => {
            const conversationId = activeConversationId;
            const { hasMore, nextCursor } = messagesPagination;
            return dedupe(`messagesMore:${conversationId ?? ""}`, async () => {
                if (
                    !conversationId ||
                    !hasMore ||
                    !nextCursor ||
                    !getClientToken()
                )
                    return;

                setMessagesLoadMoreLoading(true);
                setMessagesLoadMoreError(null);

                const { data, error } = await authGet<MessagesResponse>(
                    chatHistoryUrl(conversationId, nextCursor)
                );
                if (!mounted.current) return;
                if (activeConversationIdRef.current !== conversationId) return;

                if (data?.success && Array.isArray(data.data)) {
                    const incoming = data.data;

                    /* Merge by id so an overlapping page can't duplicate rows.
                       Sorting is redone so the merge order never leaks into
                       the thread — it always renders oldest → newest. */
                    setMessages((prev) => {
                        const byId = new Map(prev.map((m) => [m.id, m]));
                        incoming.forEach((m) => byId.set(m.id, m));
                        return sortMessagesByCreated(Array.from(byId.values()));
                    });
                    setMessagesPagination({
                        hasMore: !!data.pagination?.hasMore,
                        nextCursor: data.pagination?.nextCursor ?? null,
                    });
                } else {
                    setMessagesLoadMoreError(
                        data?.message || error || "Couldn't load more messages."
                    );
                }
                setMessagesLoadMoreLoading(false);
            });
        },
        [activeConversationId, messagesPagination, authGet, dedupe]
    );

    /* ---------------------------------------------------------------- */
    /* CHAT HISTORY LOAD — runs whenever the active conversation changes */
    /* ---------------------------------------------------------------- */

    useEffect(() => {
        activeConversationIdRef.current = activeConversationId;
        if (!activeConversationId) return;
        void refetchMessages();
    }, [activeConversationId, refetchMessages]);

    /* ---------------------------------------------------------------- */
    /* INITIAL LOAD                                                     */
    /*                                                                  */
    /* If there is no token at mount, the requests stay "idle" and the  */
    /* screens that need the data call `ensure*` (via the hooks below)  */
    /* once they mount.                                                 */
    /* ---------------------------------------------------------------- */

    useEffect(() => {
        if (!getClientToken()) return;
        void Promise.all([refetchConversations(), refetchNewMatches()]);
    }, [refetchConversations, refetchNewMatches]);

    /* ---------------------------------------------------------------- */
    /* CONTEXT VALUE                                                    */
    /* ---------------------------------------------------------------- */

    const value = useMemo<ChatConversationsContextData>(
        () => ({
            conversations,
            conversationsStatus,
            conversationsLoading:
                conversationsStatus === "idle" || conversationsStatus === "loading",
            conversationsError,
            activeConversationId,
            selectConversation,
            refetchConversations,
            ensureConversations,

            hasMore: pagination.hasMore,
            loadMore,
            loadMoreLoading,
            loadMoreError,

            newMatches,
            newMatchesStatus,
            newMatchesLoading:
                newMatchesStatus === "idle" || newMatchesStatus === "loading",
            newMatchesError,
            refetchNewMatches,
            ensureNewMatches,

            newMatchesHasMore: newMatchesPagination.hasMore,
            loadMoreNewMatches,
            loadMoreNewMatchesLoading,
            loadMoreNewMatchesError,

            messages,
            messagesStatus,
            messagesLoading:
                messagesStatus === "idle" || messagesStatus === "loading",
            messagesError,
            refetchMessages,

            messagesHasMore: messagesPagination.hasMore,
            loadMoreMessages,
            messagesLoadMoreLoading,
            messagesLoadMoreError,
        }),
        [
            conversations,
            conversationsStatus,
            conversationsError,
            activeConversationId,
            selectConversation,
            refetchConversations,
            ensureConversations,
            pagination.hasMore,
            loadMore,
            loadMoreLoading,
            loadMoreError,

            newMatches,
            newMatchesStatus,
            newMatchesError,
            refetchNewMatches,
            ensureNewMatches,
            newMatchesPagination.hasMore,
            loadMoreNewMatches,
            loadMoreNewMatchesLoading,
            loadMoreNewMatchesError,

            messages,
            messagesStatus,
            messagesError,
            refetchMessages,
            messagesPagination.hasMore,
            loadMoreMessages,
            messagesLoadMoreLoading,
            messagesLoadMoreError,
        ]
    );

    return (
        <ChatConversationsContext.Provider value={value}>
            {children}
        </ChatConversationsContext.Provider>
    );
}

/* ------------------------------------------------------------------ */
/* Hooks                                                              */
/* ------------------------------------------------------------------ */

export function useChatConversations() {
    return useContext(ChatConversationsContext);
}

/**
 * Conversation list. Triggers the first request if the provider couldn't make
 * it at mount (no session yet), so the page never sits on an empty state.
 */
export function useConversations() {
    const {
        conversations,
        conversationsLoading,
        conversationsError,
        conversationsStatus,
        activeConversationId,
        selectConversation,
        refetchConversations,
        ensureConversations,
        hasMore,
        loadMore,
        loadMoreLoading,
        loadMoreError,
    } = useChatConversations();

    useEffect(() => {
        ensureConversations();
    }, [ensureConversations]);

    return {
        conversations,
        loading: conversationsLoading,
        error: conversationsError,
        status: conversationsStatus,
        activeConversationId,
        selectConversation,
        refetch: refetchConversations,
        hasMore,
        loadMore,
        loadMoreLoading,
        loadMoreError,
    };
}

/** New matches list, with the same "ensure on mount" behaviour. */
export function useNewMatches() {
    const {
        newMatches,
        newMatchesLoading,
        newMatchesError,
        newMatchesStatus,
        refetchNewMatches,
        ensureNewMatches,
        newMatchesHasMore,
        loadMoreNewMatches,
        loadMoreNewMatchesLoading,
        loadMoreNewMatchesError,
    } = useChatConversations();

    useEffect(() => {
        ensureNewMatches();
    }, [ensureNewMatches]);

    return {
        newMatches,
        loading: newMatchesLoading,
        error: newMatchesError,
        status: newMatchesStatus,
        refetch: refetchNewMatches,
        hasMore: newMatchesHasMore,
        loadMore: loadMoreNewMatches,
        loadMoreLoading: loadMoreNewMatchesLoading,
        loadMoreError: loadMoreNewMatchesError,
    };
}

/**
 * Chat history for the conversation currently open in the chat section.
 * The provider fetches whenever `activeConversationId` changes, so this hook
 * only exposes state — no effect of its own.
 */
export function useChatMessages() {
    const {
        messages,
        messagesStatus,
        messagesLoading,
        messagesError,
        refetchMessages,
        messagesHasMore,
        loadMoreMessages,
        messagesLoadMoreLoading,
        messagesLoadMoreError,
    } = useChatConversations();

    return {
        messages,
        status: messagesStatus,
        loading: messagesLoading,
        error: messagesError,
        refetch: refetchMessages,
        hasMore: messagesHasMore,
        loadMore: loadMoreMessages,
        loadMoreLoading: messagesLoadMoreLoading,
        loadMoreError: messagesLoadMoreError,
    };
}