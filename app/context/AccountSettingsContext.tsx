"use client";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
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

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

/* ------------------------------ Plans ----------------------------- */

export type ResetPeriod = "NONE" | "DAILY" | "WEEKLY" | (string & {}); // add "MONTHLY" etc. if the backend has them

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

/* ------------------------------ Support --------------------------- */

export type CallbackStatus =
    | "REQUESTED"
    | "SCHEDULED"
    | "RESOLVED"
    | "MISSED"
    | "CANCELLED"; // keeps autocomplete but accepts unknown backend values

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
    plansLoading: boolean;
    plansError: string | null;
    refetchPlans: () => Promise<void>;

    /* FAQs */
    faqs: Faq[];
    faqsLoading: boolean;
    faqsError: string | null;
    refetchFaqs: () => Promise<void>;

    /* Callback history */
    callbackHistory: Callback[];
    callbackHistoryLoading: boolean;
    callbackHistoryError: string | null;
    refetchCallbackHistory: () => Promise<void>;

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
    plansLoading: true,
    plansError: null,
    refetchPlans: async () => { },

    faqs: [],
    faqsLoading: true,
    faqsError: null,
    refetchFaqs: async () => { },

    callbackHistory: [],
    callbackHistoryLoading: true,
    callbackHistoryError: null,
    refetchCallbackHistory: async () => { },

    requestCallback: async () => null,
    requestCallbackLoading: false,
    requestCallbackError: null,
});

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */

export function AccountSettingsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [pauseLoading, setPauseLoading] = useState(false);
    const [resumeLoading, setResumeLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [pauseError, setPauseError] = useState<string | null>(null);
    const [resumeError, setResumeError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    /* See `paused` in the context type: written only by a successful action. */
    const [paused, setPaused] = useState<boolean | null>(null);

    /* ---------------------------------------------------------------- */
    /* Plans State                                                      */
    /* ---------------------------------------------------------------- */

    const [plans, setPlans] = useState<Plan[]>([]);
    const [plansLoading, setPlansLoading] = useState(true);
    const [plansError, setPlansError] = useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* FAQ State                                                        */
    /* ---------------------------------------------------------------- */

    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [faqsLoading, setFaqsLoading] = useState(true);
    const [faqsError, setFaqsError] = useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Callback History State                                           */
    /* ---------------------------------------------------------------- */

    const [callbackHistory, setCallbackHistory] = useState<Callback[]>([]);
    const [callbackHistoryLoading, setCallbackHistoryLoading] = useState(true);
    const [callbackHistoryError, setCallbackHistoryError] =
        useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Request Callback State                                           */
    /* ---------------------------------------------------------------- */

    const [requestCallbackLoading, setRequestCallbackLoading] = useState(false);
    const [requestCallbackError, setRequestCallbackError] =
        useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Generic Auth GET                                                 */
    /* ---------------------------------------------------------------- */

    const authGet = useCallback(async (url: string) => {
        try {
            const response = await axios.get(url, {
                headers: authHeader(),
            });

            return response.data;
        } catch (err) {
            console.error("Support API GET Error:", url, err);
            return null;
        }
    }, []);

    /* ---------------------------------------------------------------- */
    /* PAUSE ACCOUNT                                                    */
    /* ---------------------------------------------------------------- */

    const pauseAccount = async (
        data: PauseAccountRequest
    ): Promise<AccountSettingsResponse | null> => {
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

            setPauseError(
                response.data?.message || "Couldn't pause your account."
            );

            return null;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setPauseError(
                    err.response?.data?.message ||
                    "Something went wrong while pausing your account."
                );
            } else {
                setPauseError(
                    "Something went wrong while pausing your account."
                );
            }

            return null;
        } finally {
            setPauseLoading(false);
        }
    };

    /* ---------------------------------------------------------------- */
    /* RESUME ACCOUNT                                                   */
    /* ---------------------------------------------------------------- */

    const resumeAccount = async (): Promise<AccountSettingsResponse | null> => {
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

            setResumeError(
                response.data?.message || "Couldn't resume your account."
            );

            return null;
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setResumeError(
                    err.response?.data?.message ||
                    "Something went wrong while resuming your account."
                );
            } else {
                setResumeError(
                    "Something went wrong while resuming your account."
                );
            }

            return null;
        } finally {
            setResumeLoading(false);
        }
    };

    /* ---------------------------------------------------------------- */
    /* DELETE ACCOUNT                                                   */
    /* ---------------------------------------------------------------- */

    const deleteAccount = async (): Promise<AccountSettingsResponse | null> => {
        try {
            setDeleteLoading(true);
            setDeleteError(null);

            const response = await axios.delete(DELETE_ACCOUNT_URL, {
                headers: authHeader(),
            });

            if (response.data?.success) {
                return response.data as AccountSettingsResponse;
            }

            setDeleteError(
                response.data?.message || "Couldn't delete your account."
            );

            return null;
        } catch (err) {
            console.error("Delete Account Error:", err);

            if (axios.isAxiosError(err)) {
                setDeleteError(
                    err.response?.data?.message ||
                    "Something went wrong while deleting your account."
                );
            } else {
                setDeleteError(
                    "Something went wrong while deleting your account."
                );
            }

            return null;
        } finally {
            setDeleteLoading(false);
        }
    };

    /* ---------------------------------------------------------------- */
    /* PLANS                                                            */
    /* ---------------------------------------------------------------- */

    const applyPlans = useCallback((response: PlansResponse | null) => {
        if (response?.success && Array.isArray(response.data)) {
            /* Active plans only, in the order the API sends them. */
            setPlans(response.data.filter((plan) => plan.active));
            setPlansError(null);
        } else {
            setPlans([]);
            setPlansError(response?.message || "Couldn't load plans.");
        }

        setPlansLoading(false);
    }, []);

    const refetchPlans = useCallback(async () => {
        setPlansLoading(true);
        setPlansError(null);

        const response = await authGet(PLAN_CARDS_URL);

        applyPlans(response);
    }, [authGet, applyPlans]);

    /* ---------------------------------------------------------------- */
    /* FAQS                                                             */
    /* ---------------------------------------------------------------- */

    const applyFaqs = useCallback((response: FaqResponse | null) => {
        if (response?.success && Array.isArray(response.data)) {
            setFaqs(
                response.data
                    .filter((faq) => faq.isActive)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
            );
            setFaqsError(null);
        } else {
            setFaqs([]);
            setFaqsError(response?.message || "Couldn't load FAQs.");
        }

        setFaqsLoading(false);
    }, []);

    const refetchFaqs = useCallback(async () => {
        setFaqsLoading(true);
        setFaqsError(null);

        const response = await authGet(SUPPORT_FAQ_URL);

        applyFaqs(response);
    }, [authGet, applyFaqs]);

    /* ---------------------------------------------------------------- */
    /* CALLBACK HISTORY                                                 */
    /* ---------------------------------------------------------------- */

    const applyCallbackHistory = useCallback(
        (response: CallbackHistoryResponse | null) => {
            if (response?.success && Array.isArray(response.data)) {
                /* Newest first. */
                setCallbackHistory(
                    [...response.data].sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                    )
                );
                setCallbackHistoryError(null);
            } else {
                setCallbackHistory([]);
                setCallbackHistoryError(
                    response?.message || "Couldn't load callback history."
                );
            }

            setCallbackHistoryLoading(false);
        },
        []
    );

    const refetchCallbackHistory = useCallback(async () => {
        setCallbackHistoryLoading(true);
        setCallbackHistoryError(null);

        const response = await authGet(CALLBACK_HISTORY_URL);

        applyCallbackHistory(response);
    }, [authGet, applyCallbackHistory]);

    /* ---------------------------------------------------------------- */
    /* REQUEST CALLBACK                                                 */
    /* ---------------------------------------------------------------- */

    const requestCallback = useCallback(
        async (
            data: CallBackPayLoad
        ): Promise<CallbackActionResponse | null> => {
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
                    response.data?.message ||
                    "Couldn't request a callback."
                );

                return null;
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setRequestCallbackError(
                        err.response?.data?.message ||
                        "Something went wrong while requesting a callback."
                    );
                } else {
                    setRequestCallbackError(
                        "Something went wrong while requesting a callback."
                    );
                }

                return null;
            } finally {
                setRequestCallbackLoading(false);
            }
        },
        [refetchCallbackHistory]
    );

    /* ---------------------------------------------------------------- */
    /* INITIAL GET APIs (single Promise.all)                            */
    /* ---------------------------------------------------------------- */

    useEffect(() => {
        if (!getClientToken()) {
            return;
        }

        let alive = true;

        (async () => {
            const [faqResponse, historyResponse, plansResponse] =
                await Promise.all([
                    authGet(SUPPORT_FAQ_URL),
                    authGet(CALLBACK_HISTORY_URL),
                    authGet(PLAN_CARDS_URL),
                ]);

            if (!alive) return;

            applyFaqs(faqResponse);
            applyCallbackHistory(historyResponse);
            applyPlans(plansResponse);
        })();

        return () => {
            alive = false;
        };
    }, [authGet, applyFaqs, applyCallbackHistory, applyPlans]);

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
            plansLoading,
            plansError,
            refetchPlans,

            faqs,
            faqsLoading,
            faqsError,
            refetchFaqs,

            callbackHistory,
            callbackHistoryLoading,
            callbackHistoryError,
            refetchCallbackHistory,

            requestCallback,
            requestCallbackLoading,
            requestCallbackError,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            pauseLoading,
            resumeLoading,
            deleteLoading,
            pauseError,
            resumeError,
            deleteError,
            paused,

            plans,
            plansLoading,
            plansError,
            refetchPlans,

            faqs,
            faqsLoading,
            faqsError,
            refetchFaqs,

            callbackHistory,
            callbackHistoryLoading,
            callbackHistoryError,
            refetchCallbackHistory,

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
/* Hook                                                               */
/* ------------------------------------------------------------------ */

export function useAccountSettings() {
    return useContext(AccountSettingsContext);
}