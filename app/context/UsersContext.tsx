"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/utils/api";

// NOTE: adjust this to the real discover/users endpoint for your app.
const USERS_URL = `${API_BASE_URL}/api/user/feed`;

/** Per-user deep profile. Slower and richer than the feed. */
const USER_DETAILS_URL = (userId: string) => `${API_BASE_URL}/api/user/feed/details/${userId}`;

/**
 * TODO: this bearer token is committed to the repo. Move it to a server-only
 * env var and proxy both endpoints through a route handler.
 */
const AUTH_HEADERS = {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YjcwYmNkYS03MDhjLTQ3MzMtOGM3ZC1jYzQ0NzAxYjE2NTkiLCJzZXNzaW9uSWQiOiI3ODk1YzBlMi0xZGIwLTRkYzAtODIzNC0zNjk4MzRlYmRjYmIiLCJpYXQiOjE3OTAwNTk3MTAsImV4cCI6MTc5MjY1MTcxMH0.IVSnp5erpjEohyX-QPNiblcoVKXVd1zs3xYkL-AjjKs'
};

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

interface UsersData {
    users: UserProfile[];
    loading: boolean;
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

const UsersContext = createContext<UsersData>({
    users: [],
    loading: true,
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

export function UsersProvider({ children }: { children: React.ReactNode }) {
    const [users, setUsers] = useState<UserProfile[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /* ------------------------------------------------------------------ */
    /*  Per-user details cache                                            */
    /*                                                                   */
    /*  Cards ask for the profile they are about to show. Results are kept  */
    /*  per user id so swiping back and forth costs nothing, and concurrent */
    /*  asks for the same id share one request.                            */
    /* ------------------------------------------------------------------ */
    const [detailsById, setDetailsById] = useState<Record<string, UserFeedDetails>>({});
    const [pendingIds, setPendingIds] = useState<Record<string, true>>({});
    const [failedIds, setFailedIds] = useState<Record<string, true>>({});
    const inflight = useRef<Set<string>>(new Set());

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<UsersApiResponse>(USERS_URL, {
                headers: AUTH_HEADERS
            });
            const data = response.data;

            if (data?.success && Array.isArray(data.users)) {
                setUsers(data.users);
            } else {
                setError("Couldn't load users.");
            }
        } catch (err) {
            console.error("UsersProvider fetch error:", err);
            setError("Couldn't load users.");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadDetails = useCallback((userId: string, options?: { force?: boolean }) => {
        if (!userId) return;
        if (inflight.current.has(userId)) return;
        if (!options?.force && (detailsById[userId] || failedIds[userId])) return;

        inflight.current.add(userId);
        setPendingIds((prev) => (prev[userId] ? prev : { ...prev, [userId]: true }));

        (async () => {
            try {
                const response = await axios.get<UserDetailsApiResponse>(
                    USER_DETAILS_URL(userId),
                    { headers: AUTH_HEADERS }
                );
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
                setFailedIds((prev) => (prev[userId] ? prev : { ...prev, [userId]: true }));
            } finally {
                inflight.current.delete(userId);
                setPendingIds((prev) => {
                    if (!prev[userId]) return prev;
                    const next = { ...prev };
                    delete next[userId];
                    return next;
                });
            }
        })();
    }, [detailsById, failedIds]);

    const detailsApi = useMemo<UserDetailsApi>(
        () => ({ detailsById, pendingIds, failedIds, load: loadDetails }),
        [detailsById, pendingIds, failedIds, loadDetails]
    );

    useEffect(() => {
        let alive = true;

        (async () => {
            if (!alive) return;
            await fetchUsers();
        })();

        return () => {
            alive = false;
        };
    }, [fetchUsers]);

    return (
        <UsersContext.Provider
            value={{
                users,
                loading,
                error,
                refetch: fetchUsers,
            }}
        >
            <UserDetailsContext.Provider value={detailsApi}>
                {children}
            </UserDetailsContext.Provider>
        </UsersContext.Provider>
    );
}

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
