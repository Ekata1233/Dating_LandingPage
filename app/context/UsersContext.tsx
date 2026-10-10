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

// NOTE: adjust this to the real discover/users endpoint for your app.
const USERS_URL = `${API_BASE_URL}/api/user/feed?limit=30`;
/** Per-user deep profile. Slower and richer than the feed. */
const USER_DETAILS_URL = (userId: string) => `${API_BASE_URL}/api/user/feed/details/${userId}`;

/* ------------------------------------------------------------------ */
/*  Types (derived from the sample API response)                      */
/* ------------------------------------------------------------------ */

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

export function UsersProvider({ children }: { children: React.ReactNode }) {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [status, setStatus] = useState<UsersStatus>("idle");
    const [error, setError] = useState<string | null>(null);

    /* Guards against out-of-order responses and updates after unmount. */
    const requestId = useRef(0);
    const mounted = useRef(true);
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
            const response = await axios.get<UsersApiResponse>(USERS_URL, {
                headers: authHeader(),
            });
            if (id !== requestId.current || !mounted.current) return;

            const data = response.data;
            if (data?.success && Array.isArray(data.users)) {
                setUsers(data.users);
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

    useEffect(() => {
        void fetchUsers();
    }, [fetchUsers]);

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
        }),
        [users, status, error, fetchUsers]
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
