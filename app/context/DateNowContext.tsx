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

// const DATE_PLANS_DISCOVER_URL = `${API_BASE_URL}/api/user/date-plans/discover`;
const DATE_PLANS_DISCOVER_URL = `https://dev-api.welvors.com/api/user/date-plans/discover`;

/** Appends the optional pagination cursor to a filter's discover URL. */
const datePlansUrl = (filter: DatePlanFilter, cursor?: string | null) => {
    const params = new URLSearchParams({ filter });
    if (cursor) params.set("cursor", cursor);
    return `${DATE_PLANS_DISCOVER_URL}?${params.toString()}`;
};

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type LoadStatus = "idle" | "loading" | "success" | "error";

/** The `filter` query the discover endpoint accepts. */
export type DatePlanFilter = "all" | "today" | "tomorrow" | "weekend";

export const DATE_PLAN_FILTERS: DatePlanFilter[] = [
    "all",
    "today",
    "tomorrow",
    "weekend",
];

export interface DatePlanHost {
    id: string;
    name: string;
    trustScore: number;
    profilePhoto: string;
    age: number;
}

export interface MatchScore {
    score: number;
    percentage: number;
}

export interface DatePlan {
    id: string;
    matchScore: MatchScore;
    venueName: string;
    distanceKm: number | null;
    distanceText: string | null;
    activity: string;
    activityIcon: string;
    title: string;
    quickTitle?: string;
    note: string;
    photoUrl: string | null;
    eventDate: string;
    eventTime: string;
    whoPays: string;
    duration: number;
    host: DatePlanHost;
}

export interface DatePlanPagination {
    limit: number;
    returnedCount: number;
    hasMore: boolean;
    nextCursor: string | null;
}

export interface DatePlansResponse {
    success: boolean;
    message: string;
    data: DatePlan[];
    pagination: DatePlanPagination;
}

const EMPTY_PAGINATION: DatePlanPagination = {
    limit: 0,
    returnedCount: 0,
    hasMore: false,
    nextCursor: null,
};

/** Everything the UI needs for one filter, cached independently. */
interface FilterState {
    plans: DatePlan[];
    status: LoadStatus;
    error: string | null;
    pagination: DatePlanPagination;
    loadMoreLoading: boolean;
    loadMoreError: string | null;
}

const emptyFilterState = (): FilterState => ({
    plans: [],
    status: "idle",
    error: null,
    pagination: EMPTY_PAGINATION,
    loadMoreLoading: false,
    loadMoreError: null,
});

const initialFilterStates = (): Record<DatePlanFilter, FilterState> => ({
    all: emptyFilterState(),
    today: emptyFilterState(),
    tomorrow: emptyFilterState(),
    weekend: emptyFilterState(),
});

/* ------------------------------------------------------------------ */
/* Context Type                                                       */
/* ------------------------------------------------------------------ */

interface DateNowContextData {
    /** The availability filter currently shown (owned here so the rail and
        the screen, which are siblings, share one value). */
    filter: DatePlanFilter;
    setFilter: (filter: DatePlanFilter) => void;

    /* Active filter's data */
    datePlans: DatePlan[];
    status: LoadStatus;
    /** True until the first request settles (idle counts as loading). */
    loading: boolean;
    error: string | null;
    pagination: DatePlanPagination;

    /** Reloads the active filter from the first page. Pass a filter to reload
        a different one without switching the visible selection. */
    refetchDatePlans: (filter?: DatePlanFilter) => Promise<void>;
    /** Fetches the active filter only if nothing has been requested yet. */
    ensureDatePlans: () => void;

    hasMore: boolean;
    loadMore: () => Promise<void>;
    loadMoreLoading: boolean;
    loadMoreError: string | null;
}

/* ------------------------------------------------------------------ */
/* Context                                                            */
/* ------------------------------------------------------------------ */

const DateNowContext = createContext<DateNowContextData>({
    filter: "all",
    setFilter: () => { },

    datePlans: [],
    status: "idle",
    loading: true,
    error: null,
    pagination: EMPTY_PAGINATION,

    refetchDatePlans: async () => { },
    ensureDatePlans: () => { },

    hasMore: false,
    loadMore: async () => { },
    loadMoreLoading: false,
    loadMoreError: null,
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

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */

export function DateNowProvider({
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
    /* Date plans state (cached per filter)                             */
    /* ---------------------------------------------------------------- */

    const [filter, setFilterState] = useState<DatePlanFilter>("all");
    const [filterStates, setFilterStates] =
        useState<Record<DatePlanFilter, FilterState>>(initialFilterStates);

    const setFilter = useCallback((next: DatePlanFilter) => {
        setFilterState(next);
    }, []);

    const patchFilter = useCallback(
        (target: DatePlanFilter, patch: Partial<FilterState>) => {
            setFilterStates((prev) => ({
                ...prev,
                [target]: { ...prev[target], ...patch },
            }));
        },
        []
    );

    /* ---------------------------------------------------------------- */
    /* Generic auth GET                                                 */
    /* ---------------------------------------------------------------- */

    /** Never throws. Returns the body, or the server's error message. */
    const authGet = useCallback(async <T,>(url: string): Promise<GetResult<T>> => {
        try {
            const response = await axios.get<T>(url, {
                headers: {
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxZDAwNzJiYi1kZDhkLTQ2ZGQtOTU2MC1iN2Q4MmQ0MDcwMzEiLCJzZXNzaW9uSWQiOiJjYzM2YTUwOC03ZTUyLTRjZjItYTg4NC04Mjc5MTA2NWM2MzkiLCJpYXQiOjE3OTE4OTE2ODYsImV4cCI6MTc5NDQ4MzY4Nn0.izVMnyCe10575CEzBJu6a9B9aFNV2tUiGo7ZoJEbRBM`
                }
            });
            return { data: response.data, error: null };
        } catch (err) {
            console.error("DateNow GET error:", url, err);
            return { data: null, error: errorMessage(err, "") || null };
        }
    }, []);

    /* ---------------------------------------------------------------- */
    /* DISCOVER (first page, per filter)                                */
    /* ---------------------------------------------------------------- */

    const refetchDatePlans = useCallback(
        (target: DatePlanFilter = filter) => {
            const active = target;

            return dedupe(`datePlans:${active}`, async () => {
                /* No session: "not loaded", not "empty". Stay idle so a later
                   `ensureDatePlans` can try again. */
                if (!getClientToken()) {
                    patchFilter(active, { status: "idle" });
                    return;
                }

                patchFilter(active, {
                    status: "loading",
                    error: null,
                    loadMoreError: null,
                });

                const { data, error } = await authGet<DatePlansResponse>(
                    datePlansUrl(active)
                );
                if (!mounted.current) return;

                if (data?.success && Array.isArray(data.data)) {
                    patchFilter(active, {
                        plans: data.data,
                        pagination: data.pagination ?? EMPTY_PAGINATION,
                        status: "success",
                    });
                } else {
                    patchFilter(active, {
                        plans: [],
                        pagination: EMPTY_PAGINATION,
                        error:
                            data?.message ||
                            error ||
                            "Couldn't load date plans.",
                        status: "error",
                    });
                }
            });
        },
        [authGet, dedupe, patchFilter, filter]
    );

    const ensureDatePlans = useCallback(() => {
        if (filterStates[filter].status === "idle") {
            void refetchDatePlans(filter);
        }
    }, [filter, filterStates, refetchDatePlans]);

    /* ---------------------------------------------------------------- */
    /* DISCOVER LOAD MORE                                               */
    /* ---------------------------------------------------------------- */

    const loadMore = useCallback(
        (target: DatePlanFilter = filter) =>
            dedupe(`datePlansMore:${target}`, async () => {
                const active = target;
                const { hasMore, nextCursor } = filterStates[active].pagination;
                if (!hasMore || !nextCursor || !getClientToken()) return;

                patchFilter(active, { loadMoreLoading: true, loadMoreError: null });

                const { data, error } = await authGet<DatePlansResponse>(
                    datePlansUrl(active, nextCursor)
                );
                if (!mounted.current) return;

                if (data?.success && Array.isArray(data.data)) {
                    const incoming = data.data;

                    /* Merge by id so an overlapping page can't duplicate rows. */
                    setFilterStates((prev) => {
                        const current = prev[active];
                        const byId = new Map(
                            current.plans.map((plan) => [plan.id, plan])
                        );
                        incoming.forEach((plan) => byId.set(plan.id, plan));

                        return {
                            ...prev,
                            [active]: {
                                ...current,
                                plans: Array.from(byId.values()),
                                pagination:
                                    data.pagination ?? current.pagination,
                                loadMoreLoading: false,
                            },
                        };
                    });
                } else {
                    patchFilter(active, {
                        loadMoreLoading: false,
                        loadMoreError:
                            data?.message ||
                            error ||
                            "Couldn't load more date plans.",
                    });
                }
            }),
        [authGet, dedupe, patchFilter, filter, filterStates]
    );

    /* ---------------------------------------------------------------- */
    /* INITIAL LOAD                                                     */
    /*                                                                  */
    /* The provider lives in the /app layout, so it can mount before a  */
    /* session exists. With no token the request stays "idle" and this  */
    /* effect retries once the filter changes or a screen calls `ensure`. */
    /* ---------------------------------------------------------------- */

    useEffect(() => {
        ensureDatePlans();
    }, [filter, ensureDatePlans]);

    /* ---------------------------------------------------------------- */
    /* CONTEXT VALUE                                                    */
    /* ---------------------------------------------------------------- */

    const active = filterStates[filter];

    const value = useMemo<DateNowContextData>(
        () => ({
            filter,
            setFilter,

            datePlans: active.plans,
            status: active.status,
            loading: active.status === "idle" || active.status === "loading",
            error: active.error,
            pagination: active.pagination,

            refetchDatePlans,
            ensureDatePlans,

            hasMore: active.pagination.hasMore,
            loadMore,
            loadMoreLoading: active.loadMoreLoading,
            loadMoreError: active.loadMoreError,
        }),
        [
            filter,
            setFilter,
            active,
            refetchDatePlans,
            ensureDatePlans,
            loadMore,
        ]
    );

    return (
        <DateNowContext.Provider value={value}>
            {children}
        </DateNowContext.Provider>
    );
}

/* ------------------------------------------------------------------ */
/* Hooks                                                              */
/* ------------------------------------------------------------------ */

export function useDateNow() {
    return useContext(DateNowContext);
}

/**
 * Date plan discovery. Triggers the first request for the active filter if the
 * provider couldn't make it at mount (no session yet), so the screen never
 * sits on an empty state.
 */
export function useDatePlans() {
    const {
        filter,
        setFilter,
        datePlans,
        loading,
        error,
        status,
        pagination,
        refetchDatePlans,
        ensureDatePlans,
        hasMore,
        loadMore,
        loadMoreLoading,
        loadMoreError,
    } = useDateNow();

    useEffect(() => {
        ensureDatePlans();
    }, [ensureDatePlans]);

    return {
        filter,
        setFilter,
        datePlans,
        loading,
        error,
        status,
        pagination,
        refetch: refetchDatePlans,
        hasMore,
        loadMore,
        loadMoreLoading,
        loadMoreError,
    };
}
