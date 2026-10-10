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

const DELETE_ACCOUNT_URL = `${API_BASE_URL}/api/user/account/delete`;
const PAUSE_ACCOUNT_URL = `${API_BASE_URL}/api/user/account/pause`;
const RESUME_ACCOUNT_URL = `${API_BASE_URL}/api/user/account/resume`;
const SUPPORT_FAQ_URL = `${API_BASE_URL}/api/admin/support/faqs/get`; // GET
const SUPPORT_CALLBACK_URL = `${API_BASE_URL}/api/user/support/callback`; // POST
const CALLBACK_HISTORY_URL = `${API_BASE_URL}/api/user/support/callback/history`; // GET
const PLAN_CARDS_URL = `${API_BASE_URL}/api/package/get/cards`; // GET
const PLAN_DETAIL_URL = `${API_BASE_URL}/api/package/get`; // GET /:id

/** Builds the detail URL for one plan. */
const planDetailUrl = (id: string) =>
    `${PLAN_DETAIL_URL}/${encodeURIComponent(id)}`;

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type BillingCycle =
    | "YEARLY"
    | "QUARTERLY"
    | "MONTHLY"
    | "HALF_YEARLY";

export type ResetPeriod = "NONE" | "WEEKLY" | "DAILY";

/**
 * - idle:    no request has been made yet (e.g. no session token at mount).
 * - loading: a request is in flight.
 * - success: a request finished; the list may legitimately be empty.
 * - error:   the last request failed.
 *
 * "Not fetched yet" and "fetched, nothing there" are different states, so a
 * single `loading` boolean isn't enough. The `*Loading` flags exposed below
 * are derived from this and are true for both idle and loading.
 */
export type LoadStatus = "idle" | "loading" | "success" | "error";

export interface PremiumPrice {
    id: string;
    billingCycle: BillingCycle;
    months: number;
    price: number;
    originalPrice: number;
    discountPercent: number;
    isHighlighted: boolean;
    active: boolean;
}

export interface PremiumFeatureDetails {
    id: string;
    code: string;
    title: string;
    category: string;
    description: string;
}

export interface PremiumFeature {
    id: string;
    featureId: string;
    feature: PremiumFeatureDetails;
    enabled: boolean;
    unlimited: boolean;
    limit: number | null;
    resetPeriod: ResetPeriod;
}

export interface PremiumPlan {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    badgeLabel: string;
    discoveryPool: string;
    visibilityRule: string;
    description: string;
    isPopular: boolean;
    active: boolean;
    sortOrder: number;
    prices: PremiumPrice[];
    limits: PremiumFeature[];
    createdAt: string;
    updatedAt: string;
}

export interface PremiumApiResponse {
    success: boolean;
    data: PremiumPlan;
}

/* ------------------------------ Plans ----------------------------- */

export interface PlanFeature {
    title: string;
    description: string;
    limit: number | null; // null = unlimited / not applicable
    resetPeriod: ResetPeriod;
}

export interface Plan {
    id: string;
    name: string;
    slug: string;
    badgeLabel: string | null;
    discoveryPool: string;
    active: boolean;
    price: number;
    originalPrice: number;
    features: PlanFeature[];
    categoryCount: Record<string, number>;
    featureSummary: string;
}

export interface PlansResponse {
    success: boolean;
    message?: string;
    data?: Plan[];
}

/* --------------------------- Plan details ------------------------- */

export interface PlanDetailResponse {
    success: boolean;
    message?: string;
    data?: PremiumPlan;
}

/* ------------------------------ Support --------------------------- */

export type CallbackStatus =
    | "REQUESTED"
    | "SCHEDULED"
    | "RESOLVED"
    | "MISSED"
    | "CANCELLED";

export interface Callback {
    id: string;
    callbackNumber: string;
    topic: string;
    callbackDate: string; // ISO 8601
    timeWindow: string;
    status: CallbackStatus;
    agentName: string | null;
    callDuration: number | null;
    resolutionNote: string | null;
    resolvedAt: string | null;
    missedAt: string | null;
    cancelledAt: string | null;
    createdAt: string;
}

export interface Faq {
    id: string;
    question: string;
    answer: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

export interface FaqResponse {
    success: boolean;
    message?: string;
    data?: Faq[];
}

export interface CallbackHistoryResponse {
    success: boolean;
    message?: string;
    data?: Callback[];
}

/** POST /support/callback body. */
export interface CallBackPayLoad {
    callbackDate: string;
    timeWindow: string;
    topic: string;
}

export interface CallbackActionResponse {
    success: boolean;
    message?: string;
    data?: Callback;
}

/* ------------------------------ Account --------------------------- */

/** PATCH /account/pause body. */
export interface PauseAccountRequest {
    reason: string;
}

export interface AccountSettingsResponse {
    success: boolean;
    message?: string;
    data?: unknown;
}

/* ------------------------------------------------------------------ */
/* Context Type                                                       */
/* ------------------------------------------------------------------ */

interface AccountSettingsContextData {
    /** Hides the profile from discovery. `reason` is sent as the request body. */
    pauseAccount: (
        data: PauseAccountRequest
    ) => Promise<AccountSettingsResponse | null>;

    /** Brings a paused account back. No body. */
    resumeAccount: () => Promise<AccountSettingsResponse | null>;

    /** Permanently deletes the account. No body. */
    deleteAccount: () => Promise<AccountSettingsResponse | null>;

    pauseLoading: boolean;
    resumeLoading: boolean;
    deleteLoading: boolean;

    pauseError: string | null;
    resumeError: string | null;
    deleteError: string | null;

    /**
     * Session answer from the last successful pause/resume: `true` after a
     * pause, `false` after a resume, `null` until one happens.
     */
    paused: boolean | null;

    /* Plans */
    plans: Plan[];
    plansStatus: LoadStatus;
    /** True until the first request settles (idle counts as loading). */
    plansLoading: boolean;
    plansError: string | null;
    refetchPlans: () => Promise<void>;
    /** Fetches plans only if nothing has been requested yet. */
    ensurePlans: () => void;

    /* Plan details — cached per plan id, fetched on demand */
    planDetails: Record<string, PremiumPlan>;
    planDetailsLoading: Record<string, boolean>;
    planDetailsError: Record<string, string | null>;
    /** Fetches one plan's detail. Skips the call if cached unless `force`. */
    fetchPlanDetail: (
        id: string,
        force?: boolean
    ) => Promise<PremiumPlan | null>;

    /* FAQs */
    faqs: Faq[];
    faqsStatus: LoadStatus;
    faqsLoading: boolean;
    faqsError: string | null;
    refetchFaqs: () => Promise<void>;
    ensureFaqs: () => void;

    /* Callback history */
    callbackHistory: Callback[];
    callbackHistoryStatus: LoadStatus;
    callbackHistoryLoading: boolean;
    callbackHistoryError: string | null;
    refetchCallbackHistory: () => Promise<void>;
    ensureCallbackHistory: () => void;

    /* Request a callback */
    requestCallback: (
        data: CallBackPayLoad
    ) => Promise<CallbackActionResponse | null>;
    requestCallbackLoading: boolean;
    requestCallbackError: string | null;
}

/* ------------------------------------------------------------------ */
/* Context                                                            */
/* ------------------------------------------------------------------ */

const AccountSettingsContext = createContext<AccountSettingsContextData>({
    pauseAccount: async () => null,
    resumeAccount: async () => null,
    deleteAccount: async () => null,

    pauseLoading: false,
    resumeLoading: false,
    deleteLoading: false,

    pauseError: null,
    resumeError: null,
    deleteError: null,

    paused: null,

    plans: [],
    plansStatus: "idle",
    plansLoading: true,
    plansError: null,
    refetchPlans: async () => { },
    ensurePlans: () => { },

    planDetails: {},
    planDetailsLoading: {},
    planDetailsError: {},
    fetchPlanDetail: async () => null,

    faqs: [],
    faqsStatus: "idle",
    faqsLoading: true,
    faqsError: null,
    refetchFaqs: async () => { },
    ensureFaqs: () => { },

    callbackHistory: [],
    callbackHistoryStatus: "idle",
    callbackHistoryLoading: true,
    callbackHistoryError: null,
    refetchCallbackHistory: async () => { },
    ensureCallbackHistory: () => { },

    requestCallback: async () => null,
    requestCallbackLoading: false,
    requestCallbackError: null,
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

export function AccountSettingsProvider({
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

    /* One in-flight promise per resource key. Concurrent callers (StrictMode
       double effects, several components asking at once) share one request. */
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
    /* Account actions state                                            */
    /* ---------------------------------------------------------------- */

    const [pauseLoading, setPauseLoading] = useState(false);
    const [resumeLoading, setResumeLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [pauseError, setPauseError] = useState<string | null>(null);
    const [resumeError, setResumeError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    /* See `paused` in the context type: written only by a successful action. */
    const [paused, setPaused] = useState<boolean | null>(null);

    /* ---------------------------------------------------------------- */
    /* Plans state                                                      */
    /* ---------------------------------------------------------------- */

    const [plans, setPlans] = useState<Plan[]>([]);
    const [plansStatus, setPlansStatus] = useState<LoadStatus>("idle");
    const [plansError, setPlansError] = useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Plan details state (keyed by plan id)                            */
    /* ---------------------------------------------------------------- */

    const [planDetails, setPlanDetails] = useState<Record<string, PremiumPlan>>({});
    const [planDetailsLoading, setPlanDetailsLoading] =
        useState<Record<string, boolean>>({});
    const [planDetailsError, setPlanDetailsError] =
        useState<Record<string, string | null>>({});

    /* Ids already requested or in flight, so repeated mounts don't fire the
       same GET twice. Cleared on failure so a retry is possible. */
    const planDetailRequestedRef = useRef<Set<string>>(new Set());
    const planDetailsRef = useRef(planDetails);
    planDetailsRef.current = planDetails;

    /* ---------------------------------------------------------------- */
    /* FAQ state                                                        */
    /* ---------------------------------------------------------------- */

    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [faqsStatus, setFaqsStatus] = useState<LoadStatus>("idle");
    const [faqsError, setFaqsError] = useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Callback history state                                           */
    /* ---------------------------------------------------------------- */

    const [callbackHistory, setCallbackHistory] = useState<Callback[]>([]);
    const [callbackHistoryStatus, setCallbackHistoryStatus] =
        useState<LoadStatus>("idle");
    const [callbackHistoryError, setCallbackHistoryError] =
        useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Request callback state                                           */
    /* ---------------------------------------------------------------- */

    const [requestCallbackLoading, setRequestCallbackLoading] = useState(false);
    const [requestCallbackError, setRequestCallbackError] =
        useState<string | null>(null);

    /* Mirror the statuses so the `ensure*` functions can read the latest
       value without depending on it, which keeps their identity stable. */
    const plansStatusRef = useRef(plansStatus);
    const faqsStatusRef = useRef(faqsStatus);
    const callbackHistoryStatusRef = useRef(callbackHistoryStatus);
    plansStatusRef.current = plansStatus;
    faqsStatusRef.current = faqsStatus;
    callbackHistoryStatusRef.current = callbackHistoryStatus;

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
            console.error("AccountSettings GET error:", url, err);
            return { data: null, error: errorMessage(err, "") || null };
        }
    }, []);

    /* ---------------------------------------------------------------- */
    /* PAUSE / RESUME / DELETE ACCOUNT                                  */
    /* ---------------------------------------------------------------- */

    const pauseAccount = useCallback(
        async (data: PauseAccountRequest): Promise<AccountSettingsResponse | null> => {
            try {
                setPauseLoading(true);
                setPauseError(null);

                const response = await axios.patch(PAUSE_ACCOUNT_URL, data, {
                    headers: authHeader(),
                });

                if (response.data?.success) {
                    setPaused(true);
                    return response.data as AccountSettingsResponse;
                }

                setPauseError(response.data?.message || "Couldn't pause your account.");
                return null;
            } catch (err) {
                setPauseError(
                    errorMessage(err, "Something went wrong while pausing your account.")
                );
                return null;
            } finally {
                setPauseLoading(false);
            }
        },
        []
    );

    const resumeAccount = useCallback(
        async (): Promise<AccountSettingsResponse | null> => {
            try {
                setResumeLoading(true);
                setResumeError(null);

                const response = await axios.patch(RESUME_ACCOUNT_URL, undefined, {
                    headers: authHeader(),
                });

                if (response.data?.success) {
                    setPaused(false);
                    return response.data as AccountSettingsResponse;
                }

                setResumeError(response.data?.message || "Couldn't resume your account.");
                return null;
            } catch (err) {
                setResumeError(
                    errorMessage(err, "Something went wrong while resuming your account.")
                );
                return null;
            } finally {
                setResumeLoading(false);
            }
        },
        []
    );

    const deleteAccount = useCallback(
        async (): Promise<AccountSettingsResponse | null> => {
            try {
                setDeleteLoading(true);
                setDeleteError(null);

                const response = await axios.delete(DELETE_ACCOUNT_URL, {
                    headers: authHeader(),
                });

                if (response.data?.success) {
                    return response.data as AccountSettingsResponse;
                }

                setDeleteError(response.data?.message || "Couldn't delete your account.");
                return null;
            } catch (err) {
                console.error("Delete Account Error:", err);
                setDeleteError(
                    errorMessage(err, "Something went wrong while deleting your account.")
                );
                return null;
            } finally {
                setDeleteLoading(false);
            }
        },
        []
    );

    /* ---------------------------------------------------------------- */
    /* PLANS                                                            */
    /* ---------------------------------------------------------------- */

    const refetchPlans = useCallback(
        () =>
            dedupe("plans", async () => {
                /* No session: this is "not loaded", not "empty". Stay idle so
                   a later `ensurePlans` can try again. */
                if (!getClientToken()) {
                    setPlansStatus("idle");
                    return;
                }

                setPlansStatus("loading");
                setPlansError(null);

                const { data, error } = await authGet<PlansResponse>(PLAN_CARDS_URL);
                if (!mounted.current) return;

                if (data?.success && Array.isArray(data.data)) {
                    /* Active plans only, in the order the API sends them. */
                    setPlans(data.data.filter((plan) => plan.active));
                    setPlansStatus("success");
                } else {
                    setPlans([]);
                    setPlansError(data?.message || error || "Couldn't load plans.");
                    setPlansStatus("error");
                }
            }),
        [authGet, dedupe]
    );

    const ensurePlans = useCallback(() => {
        if (plansStatusRef.current === "idle") void refetchPlans();
    }, [refetchPlans]);

    /* ---------------------------------------------------------------- */
    /* PLAN DETAILS                                                     */
    /* ---------------------------------------------------------------- */

    const fetchPlanDetail = useCallback(
        async (id: string, force = false): Promise<PremiumPlan | null> => {
            if (!id) return null;
            /* Not added to the requested set, so a later call can still run
               once a session exists. */
            if (!getClientToken()) return null;

            /* Already cached or in flight — return what we have. */
            if (!force && planDetailRequestedRef.current.has(id)) {
                return planDetailsRef.current[id] ?? null;
            }
            planDetailRequestedRef.current.add(id);

            setPlanDetailsLoading((prev) => ({ ...prev, [id]: true }));
            setPlanDetailsError((prev) => ({ ...prev, [id]: null }));

            const { data, error } = await authGet<PlanDetailResponse>(planDetailUrl(id));
            if (!mounted.current) return null;

            if (data?.success && data.data) {
                const detail = data.data;

                setPlanDetails((prev) => ({ ...prev, [id]: detail }));
                setPlanDetailsLoading((prev) => ({ ...prev, [id]: false }));
                return detail;
            }

            /* Allow a retry after a failure. */
            planDetailRequestedRef.current.delete(id);

            setPlanDetailsError((prev) => ({
                ...prev,
                [id]: data?.message || error || "Couldn't load plan details.",
            }));
            setPlanDetailsLoading((prev) => ({ ...prev, [id]: false }));
            return null;
        },
        [authGet]
    );

    /* ---------------------------------------------------------------- */
    /* FAQS                                                             */
    /* ---------------------------------------------------------------- */

    const refetchFaqs = useCallback(
        () =>
            dedupe("faqs", async () => {
                if (!getClientToken()) {
                    setFaqsStatus("idle");
                    return;
                }

                setFaqsStatus("loading");
                setFaqsError(null);

                const { data, error } = await authGet<FaqResponse>(SUPPORT_FAQ_URL);
                if (!mounted.current) return;

                if (data?.success && Array.isArray(data.data)) {
                    setFaqs(
                        data.data
                            .filter((faq) => faq.isActive)
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                    );
                    setFaqsStatus("success");
                } else {
                    setFaqs([]);
                    setFaqsError(data?.message || error || "Couldn't load FAQs.");
                    setFaqsStatus("error");
                }
            }),
        [authGet, dedupe]
    );

    const ensureFaqs = useCallback(() => {
        if (faqsStatusRef.current === "idle") void refetchFaqs();
    }, [refetchFaqs]);

    /* ---------------------------------------------------------------- */
    /* CALLBACK HISTORY                                                 */
    /* ---------------------------------------------------------------- */

    const refetchCallbackHistory = useCallback(
        () =>
            dedupe("callbackHistory", async () => {
                if (!getClientToken()) {
                    setCallbackHistoryStatus("idle");
                    return;
                }

                setCallbackHistoryStatus("loading");
                setCallbackHistoryError(null);

                const { data, error } =
                    await authGet<CallbackHistoryResponse>(CALLBACK_HISTORY_URL);
                if (!mounted.current) return;

                if (data?.success && Array.isArray(data.data)) {
                    /* Newest first. */
                    setCallbackHistory(
                        [...data.data].sort(
                            (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime()
                        )
                    );
                    setCallbackHistoryStatus("success");
                } else {
                    setCallbackHistory([]);
                    setCallbackHistoryError(
                        data?.message || error || "Couldn't load callback history."
                    );
                    setCallbackHistoryStatus("error");
                }
            }),
        [authGet, dedupe]
    );

    const ensureCallbackHistory = useCallback(() => {
        if (callbackHistoryStatusRef.current === "idle") void refetchCallbackHistory();
    }, [refetchCallbackHistory]);

    /* ---------------------------------------------------------------- */
    /* REQUEST CALLBACK                                                 */
    /* ---------------------------------------------------------------- */

    const requestCallback = useCallback(
        async (data: CallBackPayLoad): Promise<CallbackActionResponse | null> => {
            try {
                setRequestCallbackLoading(true);
                setRequestCallbackError(null);

                const response = await axios.post(SUPPORT_CALLBACK_URL, data, {
                    headers: authHeader(),
                });

                if (response.data?.success) {
                    /* Refresh the history so the new request shows up. */
                    await refetchCallbackHistory();
                    return response.data as CallbackActionResponse;
                }

                setRequestCallbackError(
                    response.data?.message || "Couldn't request a callback."
                );
                return null;
            } catch (err) {
                setRequestCallbackError(
                    errorMessage(err, "Something went wrong while requesting a callback.")
                );
                return null;
            } finally {
                setRequestCallbackLoading(false);
            }
        },
        [refetchCallbackHistory]
    );

    /* ---------------------------------------------------------------- */
    /* INITIAL LOAD                                                     */
    /*                                                                  */
    /* The provider lives in the root layout, so it can mount before    */
    /* a session exists. If there is no token here, the requests stay   */
    /* "idle" and the screens that need the data call `ensure*` (or the */
    /* hooks below) once they mount, by which time the token is there.  */
    /* ---------------------------------------------------------------- */

    useEffect(() => {
        if (!getClientToken()) return;

        void Promise.all([refetchFaqs(), refetchCallbackHistory(), refetchPlans()]);
    }, [refetchFaqs, refetchCallbackHistory, refetchPlans]);

    /* ---------------------------------------------------------------- */
    /* CONTEXT VALUE                                                    */
    /* ---------------------------------------------------------------- */

    const value = useMemo<AccountSettingsContextData>(
        () => ({
            pauseAccount,
            resumeAccount,
            deleteAccount,

            pauseLoading,
            resumeLoading,
            deleteLoading,

            pauseError,
            resumeError,
            deleteError,

            paused,

            plans,
            plansStatus,
            plansLoading: plansStatus === "idle" || plansStatus === "loading",
            plansError,
            refetchPlans,
            ensurePlans,

            planDetails,
            planDetailsLoading,
            planDetailsError,
            fetchPlanDetail,

            faqs,
            faqsStatus,
            faqsLoading: faqsStatus === "idle" || faqsStatus === "loading",
            faqsError,
            refetchFaqs,
            ensureFaqs,

            callbackHistory,
            callbackHistoryStatus,
            callbackHistoryLoading:
                callbackHistoryStatus === "idle" ||
                callbackHistoryStatus === "loading",
            callbackHistoryError,
            refetchCallbackHistory,
            ensureCallbackHistory,

            requestCallback,
            requestCallbackLoading,
            requestCallbackError,
        }),
        [
            pauseAccount,
            resumeAccount,
            deleteAccount,
            pauseLoading,
            resumeLoading,
            deleteLoading,
            pauseError,
            resumeError,
            deleteError,
            paused,

            plans,
            plansStatus,
            plansError,
            refetchPlans,
            ensurePlans,

            planDetails,
            planDetailsLoading,
            planDetailsError,
            fetchPlanDetail,

            faqs,
            faqsStatus,
            faqsError,
            refetchFaqs,
            ensureFaqs,

            callbackHistory,
            callbackHistoryStatus,
            callbackHistoryError,
            refetchCallbackHistory,
            ensureCallbackHistory,

            requestCallback,
            requestCallbackLoading,
            requestCallbackError,
        ]
    );

    return (
        <AccountSettingsContext.Provider value={value}>
            {children}
        </AccountSettingsContext.Provider>
    );
}

/* ------------------------------------------------------------------ */
/* Hooks                                                              */
/* ------------------------------------------------------------------ */

export function useAccountSettings() {
    return useContext(AccountSettingsContext);
}

/**
 * Plans list. Triggers the first request if the provider couldn't make it at
 * mount (no session yet), so the page never sits on an empty state.
 */
export function usePlans() {
    const { plans, plansLoading, plansError, plansStatus, refetchPlans, ensurePlans } =
        useAccountSettings();

    useEffect(() => {
        ensurePlans();
    }, [ensurePlans]);

    return { plans, loading: plansLoading, error: plansError, status: plansStatus, refetch: refetchPlans };
}

/** FAQ list, with the same "ensure on mount" behaviour as `usePlans`. */
export function useFaqs() {
    const { faqs, faqsLoading, faqsError, faqsStatus, refetchFaqs, ensureFaqs } =
        useAccountSettings();

    useEffect(() => {
        ensureFaqs();
    }, [ensureFaqs]);

    return { faqs, loading: faqsLoading, error: faqsError, status: faqsStatus, refetch: refetchFaqs };
}

/** Callback history, with the same "ensure on mount" behaviour. */
export function useCallbackHistory() {
    const {
        callbackHistory,
        callbackHistoryLoading,
        callbackHistoryError,
        callbackHistoryStatus,
        refetchCallbackHistory,
        ensureCallbackHistory,
    } = useAccountSettings();

    useEffect(() => {
        ensureCallbackHistory();
    }, [ensureCallbackHistory]);

    return {
        history: callbackHistory,
        loading: callbackHistoryLoading,
        error: callbackHistoryError,
        status: callbackHistoryStatus,
        refetch: refetchCallbackHistory,
    };
}

/**
 * Loads and returns one plan's detail. Pass the id from your page; the GET
 * runs in a useEffect and is cached, so revisiting the page won't refetch.
 */
export function usePlanDetail(id?: string) {
    const { planDetails, planDetailsError, fetchPlanDetail } = useAccountSettings();

    useEffect(() => {
        if (id) void fetchPlanDetail(id);
    }, [id, fetchPlanDetail]);

    const plan = id ? planDetails[id] ?? null : null;
    const error = id ? planDetailsError[id] ?? null : null;

    /* Loading from the first render until data or an error arrives, so the
       page never flashes an empty state before the effect has run. */
    const loading = !!id && !plan && !error;

    return {
        plan,
        loading,
        error,
        refetch: () => (id ? fetchPlanDetail(id, true) : Promise.resolve(null)),
    };
}
