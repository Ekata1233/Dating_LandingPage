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
import { PRESENCE_EVENT, type PresencePayload } from "@/lib/chat/socket";
import { packageType } from "../app/shared/types";
import { useUserProfileData } from "./UserProfileDataContext";

// NOTE: adjust this to the real discover/users endpoint for your app.
const USERS_URL = `${API_BASE_URL}/api/user/feed`;
const SWIPE_ACTION_URL = `${API_BASE_URL}/api/user/swipe`;
const FEED_PAGE_SIZE = 50;
/** Per-user deep profile. Slower and richer than the feed. */
const USER_DETAILS_URL = (userId: string) => `${API_BASE_URL}/api/user/feed/details/${userId}`;

/* ------------------------------------------------------------------ */
/*  Types (derived from the sample API response)                      */
/* ------------------------------------------------------------------ */

export type SwipeAction = "LIKE" | "PASS";

interface SwipeActionRequest {
    targetUserId: string;
    action: SwipeAction;
}

/** Shape is a guess; adjust to what your backend returns (e.g. a match flag). */
interface SwipeActionResponse {
    success: boolean;
    message?: string;
    isMatch?: boolean;
}

export interface SwipeResult {
    ok: boolean;
    isMatch: boolean;
    error: string | null;
}

interface Profile {
    city: string;
    state: string;
    country: string;
    latitude: string;
    longitude: string;
}

interface Profession {
    id: number;
    name: string;
}

interface EduWork {
    professionId: number | null;
    profession: Profession | null;
}

interface Photo {
    id: string;
    media_url: string;
    media_type: "IMAGE" | "VIDEO";
    order: number;
    is_primary: boolean;
}

export interface UserProfile {
    id: string;
    full_name: string;
    birth_date: string;
    age: number;
    height: number;
    created_at: string;
    last_active_at: string | null;
    profile: Profile;
    eduWork: EduWork;
    photos: Photo[];
    matchScore: number;
    compatibilityScore: number;
    distanceKm: number;
    trust: number;
    replyTime: string;
    isOnline: boolean;
    lastActiveAt: string | null;
    lastSeen: string;
    isBoosted: boolean;
    boost: unknown | null;
    package: packageType;
}

interface UsersApiResponse {
    success: boolean;
    users: UserProfile[];
    nextCursor: string | null;
    locationFallbackUsed: boolean;
}

/**
 * - idle:    no fetch has been made yet (e.g. no session token available).
 * - loading: a fetch is in flight.
 * - success: a fetch finished; `users` may legitimately be empty.
 * - error:   the last fetch failed.
 */
export type UsersStatus = "idle" | "loading" | "success" | "error";

interface UsersData {
    users: UserProfile[];
    /** True until the first fetch has settled (idle counts as loading). */
    loading: boolean;
    status: UsersStatus;
    error: string | null;
    refetch: () => void;
    /** False once the feed answered with fewer rows than the limit asked for. */
    hasMore: boolean;
    loadMore: () => void;
    /** Records a LIKE/PASS on a user. Resolves with the outcome; never throws. */
    swipe: (targetUserId: string, action: SwipeAction) => Promise<SwipeResult>;
}

/* ------------------------------------------------------------------ */
/*  Per-user detail types (GET /api/user/feed/details/:userId)         */
/* ------------------------------------------------------------------ */

export interface DetailPhoto {
    id: string;
    url: string;
    isPrimary: boolean;
    order: number;
    mediaType: "IMAGE" | "VIDEO";
}

/** Free-text Q&A. `prompts` uses the same shape, plus a category. */
export interface DetailAnswer {
    id?: string;
    question: string;
    answer: string;
    description: string | null;
    category?: string | null;
    displayOrder?: number;
}

export interface DetailCareer {
    highestEducation: string | null;
    degree: string | null;
    collegeName: string | null;
    graduationYear: number | null;
    profession: string | null;
    companyName: string | null;
    employmentType: string | null;
    experience: string | null;
    ambition: string | null;
    salaryRange: string | null;
    bigDreams: string | null;
}

export interface DetailFamily {
    familyStatus: string | null;
    familyType: string | null;
    fatherOccupation: string | null;
    fatherOrganisation: string | null;
    motherOccupation: string | null;
    motherOrganisation: string | null;
    familyHome: string | null;
    nativePlace: string | null;
    familyIncome: string | null;
    /** The `siblingtype` option id (or label) describing the sibling counts. */
    siblingTypeId?: number | string | null;
    /** Same answer under the backend's other key — read as either. */
    siblingType?: number | string | null;
    siblings: unknown[];
}

export interface UserFeedDetails {
    userId: string;
    fullName: string;
    age: number;
    gender: string | null;
    /** Deliberately not mapped onto the card: never surface a phone number. */
    matchScore: number;
    trust: number;
    replyTime: string | null;
    bio: string | null;
    lookingFor: string | null;
    package: packageType;
    lookingFor_subtitle: string | null;
    religion: string | null;
    community: string | null;
    motherTongue: string | null;
    height: number | null;
    city: string | null;
    state: string | null;
    country: string | null;
    area: string | null;
    zodiac: string | null;
    communicationStyle: string | null;
    loveLanguage: string | null;
    photos: DetailPhoto[];
    prompts: DetailAnswer[];
    career: DetailCareer | null;
    lifestyle: DetailAnswer[];
    interests: DetailAnswer[];
    networkingAnswers: DetailAnswer[];
    family: DetailFamily | null;
}

interface UserDetailsApiResponse {
    success: boolean;
    message: string;
    data: UserFeedDetails;
}

export type UserDetailsState = "idle" | "loading" | "ready" | "error";

export interface UserDetailsResult {
    details: UserFeedDetails | null;
    state: UserDetailsState;
    error: string | null;
    /** Requests details if they are not already cached or in flight. */
    ensure: () => void;
    /** Forces a re-request, ignoring the cache. */
    refresh: () => void;
}

/** The cache and loader, shared by every card that asks for details. */
interface UserDetailsApi {
    detailsById: Record<string, UserFeedDetails>;
    pendingIds: Record<string, true>;
    failedIds: Record<string, true>;
    load: (userId: string, options?: { force?: boolean }) => void;
}

/* ------------------------------------------------------------------ */
/*  Contexts                                                          */
/* ------------------------------------------------------------------ */

const UsersContext = createContext<UsersData>({
    users: [],
    loading: true,
    status: "idle",
    error: null,
    refetch: () => { },
    hasMore: false,
    loadMore: () => { },
    swipe: async () => ({ ok: false, isMatch: false, error: "Not ready" }),
});

/**
 * Details are kept in their own context, provided by the same
 * `UsersProvider`, so a details fetch re-renders only the card that asked for
 * it instead of the whole app shell.
 */
const UserDetailsContext = createContext<UserDetailsApi>({
    detailsById: {},
    pendingIds: {},
    failedIds: {},
    load: () => { },
});

/* ------------------------------------------------------------------ */
/*  Provider                                                          */
/* ------------------------------------------------------------------ */

/** Human-readable presence line for the feed, e.g. "Active 5m ago". */
function presenceLabel(lastSeenAt: string | null): string {
    if (!lastSeenAt) return "Inactive";

    const diff = Date.now() - new Date(lastSeenAt).getTime();
    if (!Number.isFinite(diff) || diff < 0) return "Inactive";

    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return "Active just now";
    if (diff < hour) return `Active ${Math.floor(diff / minute)}m ago`;
    if (diff < day) return `Active ${Math.floor(diff / hour)}h ago`;
    return `Active ${Math.floor(diff / day)}d ago`;
}

export function UsersProvider({ children }: { children: React.ReactNode }) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [status, setStatus] = useState<UsersStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const { refetchAdmirersSent } = useUserProfileData()


    /* Guards against out-of-order responses and updates after unmount. */
    const requestId = useRef(0);
    const mounted = useRef(true);
    const feedLimit = useRef(FEED_PAGE_SIZE);
    const loadMorePending = useRef(false);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    /* ------------------------------------------------------------------ */
    /*  Feed                                                              */
    /* ------------------------------------------------------------------ */

    const fetchUsers = useCallback(async () => {
        /* The provider is mounted in the root layout, so it also runs on the
           public marketing pages. Without a session there is nothing to ask
           for. That is "not loaded", not "empty": stay idle so consumers keep
           showing a loader and can call `refetch` once a session exists. */
        if (!getClientToken()) {
            setUsers([]);
            setError(null);
            setStatus("idle");
            return;
        }

        const id = ++requestId.current; // newest request wins
        setStatus("loading");
        setError(null);

        try {
            const response = await axios.get<UsersApiResponse>(
                `${USERS_URL}?limit=${FEED_PAGE_SIZE}`,
                { headers: authHeader() }
            );
            if (id !== requestId.current || !mounted.current) return;

            const data = response.data;
            if (data?.success && Array.isArray(data.users)) {
                setUsers(data.users);
                feedLimit.current = FEED_PAGE_SIZE;
                setHasMore(data.users.length >= FEED_PAGE_SIZE);
                setStatus("success");
            } else {
                setError("Couldn't load users.");
                setStatus("error");
            }
        } catch (err) {
            if (id !== requestId.current || !mounted.current) return;
            console.error("UsersProvider fetch error:", err);
            setError("Couldn't load users.");
            setStatus("error");
        }
    }, []);

    /* Topped up from HomeMain when only a few cards remain: the feed takes a
       plain `limit`, so each call asks for one more page worth and appends
       only the rows that are new. A short answer means the feed is drained. */
    const loadMore = useCallback(async () => {
        if (!getClientToken() || loadMorePending.current) return;

        const nextLimit = feedLimit.current + FEED_PAGE_SIZE;
        loadMorePending.current = true;
        const id = ++requestId.current;

        try {
            const response = await axios.get<UsersApiResponse>(
                `${USERS_URL}?limit=${nextLimit}`,
                { headers: authHeader() }
            );
            if (id !== requestId.current || !mounted.current) return;

            const data = response.data;
            if (data?.success && Array.isArray(data.users)) {
                setUsers((prev) => {
                    const seen = new Set(prev.map((u) => u.id));
                    const incoming = data.users.filter((u) => !seen.has(u.id));
                    return incoming.length ? [...prev, ...incoming] : prev;
                });
                feedLimit.current = nextLimit;
                if (data.users.length < nextLimit) setHasMore(false);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error("UsersProvider loadMore error:", err);
        } finally {
            loadMorePending.current = false;
        }
    }, []);

    useEffect(() => {
        void fetchUsers();
    }, [fetchUsers]);

    /* ------------------------------------------------------------------ */
    /*  Swipe action (POST /api/user/swipe)                                */
    /*                                                                    */
    /*  Never throws: callers branch on `result.ok`. One in-flight swipe   */
    /*  per user, so a double tap can't post twice.                        */
    /* ------------------------------------------------------------------ */

    const swipingIds = useRef<Set<string>>(new Set());

    const swipe = useCallback(
        async (targetUserId: string, action: SwipeAction): Promise<SwipeResult> => {
            if (!targetUserId) {
                return { ok: false, isMatch: false, error: "Missing user id." };
            }
            if (!getClientToken()) {
                return { ok: false, isMatch: false, error: "Not signed in." };
            }
            if (swipingIds.current.has(targetUserId)) {
                return { ok: false, isMatch: false, error: "Swipe already in progress." };
            }

            swipingIds.current.add(targetUserId);
            const body: SwipeActionRequest = { targetUserId, action };

            try {
                const response = await axios.post<SwipeActionResponse>(
                    SWIPE_ACTION_URL,
                    body,
                    { headers: authHeader() }
                );
                const data = response.data;

                if (data?.success) {
                    await refetchAdmirersSent();
                    return { ok: true, isMatch: Boolean(data.isMatch), error: null };
                }
                return {
                    ok: false,
                    isMatch: false,
                    error: data?.message ?? "Couldn't record your swipe.",
                };
            } catch (err) {
                console.error(`UsersProvider swipe error (${targetUserId}):`, err);
                const message = axios.isAxiosError(err)
                    ? (err.response?.data as { message?: string } | undefined)?.message
                    : undefined;
                return {
                    ok: false,
                    isMatch: false,
                    error: message ?? "Couldn't record your swipe.",
                };
            } finally {
                swipingIds.current.delete(targetUserId);
            }
        },
        []
    );

    /* ------------------------------------------------------------------ */
    /*  Realtime presence (chat socket → DOM event)                        */
    /* ------------------------------------------------------------------ */
    /*  The socket lives in `ChatContext`, which re-broadcasts the         */
    /*  `user:online` / `user:offline` payloads on `PRESENCE_EVENT`, so   */
    /*  feed cards flip their Online chip without a refetch.               */
    /* ------------------------------------------------------------------ */

    useEffect(() => {
        const onPresence = (event: Event) => {
            const payload = (event as CustomEvent<PresencePayload>).detail;
            if (!payload?.userId || !mounted.current) return;

            const online = payload.status === "ONLINE";
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === payload.userId
                        ? {
                            ...u,
                            isOnline: online,
                            last_active_at: payload.lastSeenAt,
                            lastActiveAt: payload.lastSeenAt,
                            lastSeen: online
                                ? "Active just now"
                                : presenceLabel(payload.lastSeenAt),
                        }
                        : u
                )
            );
        };

        window.addEventListener(PRESENCE_EVENT, onPresence);
        return () => window.removeEventListener(PRESENCE_EVENT, onPresence);
    }, []);

    /* ------------------------------------------------------------------ */
    /*  Per-user details cache                                            */
    /*                                                                    */
    /*  Cards ask for the profile they are about to show. Results are kept */
    /*  per user id so swiping back and forth costs nothing, and           */
    /*  concurrent asks for the same id share one request.                 */
    /* ------------------------------------------------------------------ */

    const [detailsById, setDetailsById] = useState<Record<string, UserFeedDetails>>({});
    const [pendingIds, setPendingIds] = useState<Record<string, true>>({});
    const [failedIds, setFailedIds] = useState<Record<string, true>>({});
    const inflight = useRef<Set<string>>(new Set());

    /* Mirror the cache in refs so `loadDetails` can read the latest values
       without listing them as dependencies. That keeps its identity (and the
       `ensure` that wraps it) stable across details fetches. */
    const detailsRef = useRef(detailsById);
    const failedRef = useRef(failedIds);
    detailsRef.current = detailsById;
    failedRef.current = failedIds;

    const loadDetails = useCallback((userId: string, options?: { force?: boolean }) => {
        if (!userId) return;
        if (!getClientToken()) return;
        if (inflight.current.has(userId)) return;
        if (!options?.force && (detailsRef.current[userId] || failedRef.current[userId])) return;

        inflight.current.add(userId);
        setPendingIds((prev) => (prev[userId] ? prev : { ...prev, [userId]: true }));

        (async () => {
            try {
                const response = await axios.get<UserDetailsApiResponse>(
                    USER_DETAILS_URL(userId),
                    { headers: authHeader() }
                );
                if (!mounted.current) return;
                const payload = response.data;

                if (payload?.success && payload.data?.userId) {
                    setDetailsById((prev) => ({ ...prev, [userId]: payload.data }));
                    /* A retry that succeeds clears the earlier failure. */
                    setFailedIds((prev) => {
                        if (!prev[userId]) return prev;
                        const next = { ...prev };
                        delete next[userId];
                        return next;
                    });
                } else {
                    setFailedIds((prev) => (prev[userId] ? prev : { ...prev, [userId]: true }));
                }
            } catch (err) {
                console.error(`UsersProvider details error (${userId}):`, err);
                if (!mounted.current) return;
                setFailedIds((prev) => (prev[userId] ? prev : { ...prev, [userId]: true }));
            } finally {
                inflight.current.delete(userId);
                if (mounted.current) {
                    setPendingIds((prev) => {
                        if (!prev[userId]) return prev;
                        const next = { ...prev };
                        delete next[userId];
                        return next;
                    });
                }
            }
        })();
    }, []);

    const detailsApi = useMemo<UserDetailsApi>(
        () => ({ detailsById, pendingIds, failedIds, load: loadDetails }),
        [detailsById, pendingIds, failedIds, loadDetails]
    );

    const usersValue = useMemo<UsersData>(
        () => ({
            users,
            status,
            error,
            loading: status === "idle" || status === "loading",
            refetch: fetchUsers,
            hasMore,
            loadMore,
            swipe,
        }),
        [users, status, error, fetchUsers, hasMore, loadMore, swipe]
    );

    return (
        <UsersContext.Provider value={usersValue}>
            <UserDetailsContext.Provider value={detailsApi}>
                {children}
            </UserDetailsContext.Provider>
        </UsersContext.Provider>
    );
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                             */
/* ------------------------------------------------------------------ */

export function useUsersData() {
    return useContext(UsersContext);
}

/**
 * Reads the details cache for one user. It never fetches on its own — the
 * caller decides *when* a request is worth making (see `ensure`), which is
 * what keeps fast swiping from firing a request per card.
 */
export function useUserDetails(userId: string | null | undefined): UserDetailsResult {
    const { detailsById, pendingIds, failedIds, load } = useContext(UserDetailsContext);

    const details = userId ? detailsById[userId] ?? null : null;

    const state: UserDetailsState = !userId
        ? "idle"
        : details
            ? "ready"
            : failedIds[userId]
                ? "error"
                : pendingIds[userId]
                    ? "loading"
                    : "idle";

    const ensure = useCallback(() => {
        if (userId) load(userId);
    }, [userId, load]);

    const refresh = useCallback(() => {
        if (userId) load(userId, { force: true });
    }, [userId, load]);

    return {
        details,
        state,
        error: state === "error" ? "Couldn't load profile details." : null,
        ensure,
        refresh,
    };
}
