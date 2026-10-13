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

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

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

export interface Pagination {
    hasMore: boolean;
    nextCursor: string | null;
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