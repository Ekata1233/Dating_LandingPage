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

const REFERRAL_DASHBOARD_URL = `${API_BASE_URL}/api/user/referral/dashboard`;
const REFERRAL_HISTORY_URL = `${API_BASE_URL}/api/user/referral/history`;
const APPLY_REFERRAL_URL = `${API_BASE_URL}/api/user/apply-referral`;
const VALIDATE_REFERRAL_URL = `${API_BASE_URL}/api/user/validate`;
const RELIGION_URL = `${API_BASE_URL}/api/religion/get`;
const LANGUAGES_URL = `${API_BASE_URL}/api/admin/languages/get-All`;


/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface ReferralStats {
    totalEarned: number;
    joined: number;
    rewarded: number;
    pending: number;
}

export interface ReferralHistoryItem {
    [key: string]: unknown;
}

export interface ReferralPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface ReferralDashboardData {
    referralCode: string;
    shareLink: string;
    stats: ReferralStats;
    history: ReferralHistoryItem[];
    pagination: ReferralPagination;
}

export interface ReferralDashboardResponse {
    success: boolean;
    message?: string;
    data?: ReferralDashboardData;
}

export interface ReferralHistoryResponse {
    success: boolean;
    message?: string;
    data?: unknown;
}

export interface ApplyReferralRequest {
    referralCode: string;
}

export interface ValidateReferralRequest {
    referralCode: string;
}

export interface ReferralActionResponse {
    success: boolean;
    message?: string;
    data?: unknown;
}

/* ---------------------------- Religion ---------------------------- */

export interface Community {
    id: number;
    religionId: number;
    name: string;
    priority: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Religion {
    id: number;
    name: string;
    priority: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    communities: Community[];
}

export interface ReligionResponse {
    success: boolean;
    message?: string;
    data?: Religion[];
}

/* ---------------------------- Languages --------------------------- */

export interface Language {
    id: number;
    name: string;
    priority: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LanguagesResponse {
    success: boolean;
    message?: string;
    data?: Language[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Keeps active rows only and orders them by `priority` (then name). */
function activeByPriority<T extends { active: boolean; priority: number; name: string }>(
    rows: T[]
): T[] {
    return rows
        .filter((row) => row.active)
        .sort(
            (a, b) =>
                a.priority - b.priority || a.name.localeCompare(b.name)
        );
}

/* ------------------------------------------------------------------ */
/* Context Types                                                      */
/* ------------------------------------------------------------------ */

interface UserProfileDataContextData {
    /* Referral Dashboard */
    referralDashboard: ReferralDashboardData | null;
    referralDashboardLoading: boolean;
    referralDashboardError: string | null;
    refetchReferralDashboard: () => Promise<void>;

    /* Referral History */
    referralHistory: unknown;
    referralHistoryLoading: boolean;
    referralHistoryError: string | null;
    refetchReferralHistory: () => Promise<void>;

    /* Religions (each with nested communities) */
    religions: Religion[];
    religionsLoading: boolean;
    religionsError: string | null;
    refetchReligions: () => Promise<void>;

    /* Languages */
    languages: Language[];
    languagesLoading: boolean;
    languagesError: string | null;
    refetchLanguages: () => Promise<void>;

    /* Apply Referral */
    applyReferral: (
        data: ApplyReferralRequest
    ) => Promise<ReferralActionResponse | null>;

    applyReferralLoading: boolean;
    applyReferralError: string | null;

    /* Validate Referral */
    validateReferral: (
        data: ValidateReferralRequest
    ) => Promise<ReferralActionResponse | null>;

    validateReferralLoading: boolean;
    validateReferralError: string | null;
}

/* ------------------------------------------------------------------ */
/* Context                                                            */
/* ------------------------------------------------------------------ */

const UserProfileDataContext =
    createContext<UserProfileDataContextData>({
        referralDashboard: null,
        referralDashboardLoading: true,
        referralDashboardError: null,
        refetchReferralDashboard: async () => { },

        referralHistory: null,
        referralHistoryLoading: true,
        referralHistoryError: null,
        refetchReferralHistory: async () => { },

        religions: [],
        religionsLoading: true,
        religionsError: null,
        refetchReligions: async () => { },

        languages: [],
        languagesLoading: true,
        languagesError: null,
        refetchLanguages: async () => { },

        applyReferral: async () => null,
        applyReferralLoading: false,
        applyReferralError: null,

        validateReferral: async () => null,
        validateReferralLoading: false,
        validateReferralError: null,
    });

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */

export function UserProfileDataProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    /* ---------------------------------------------------------------- */
    /* Referral Dashboard State                                        */
    /* ---------------------------------------------------------------- */

    const [referralDashboard, setReferralDashboard] =
        useState<ReferralDashboardData | null>(null);

    const [referralDashboardLoading, setReferralDashboardLoading] =
        useState(true);

    const [referralDashboardError, setReferralDashboardError] =
        useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Referral History State                                          */
    /* ---------------------------------------------------------------- */

    const [referralHistory, setReferralHistory] =
        useState<unknown>(null);

    const [referralHistoryLoading, setReferralHistoryLoading] =
        useState(true);

    const [referralHistoryError, setReferralHistoryError] =
        useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Religion State                                                  */
    /* ---------------------------------------------------------------- */

    const [religions, setReligions] = useState<Religion[]>([]);

    const [religionsLoading, setReligionsLoading] = useState(true);

    const [religionsError, setReligionsError] =
        useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Languages State                                                 */
    /* ---------------------------------------------------------------- */

    const [languages, setLanguages] = useState<Language[]>([]);

    const [languagesLoading, setLanguagesLoading] = useState(true);

    const [languagesError, setLanguagesError] =
        useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Apply Referral State                                            */
    /* ---------------------------------------------------------------- */

    const [applyReferralLoading, setApplyReferralLoading] =
        useState(false);

    const [applyReferralError, setApplyReferralError] =
        useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Validate Referral State                                         */
    /* ---------------------------------------------------------------- */

    const [validateReferralLoading, setValidateReferralLoading] =
        useState(false);

    const [validateReferralError, setValidateReferralError] =
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
            console.error("Referral API GET Error:", url, err);
            return null;
        }
    }, []);

    /* ---------------------------------------------------------------- */
    /* REFERRAL DASHBOARD                                               */
    /* ---------------------------------------------------------------- */

    const applyReferralDashboard = useCallback(
        (response: ReferralDashboardResponse | null) => {
            if (response?.success && response.data) {
                setReferralDashboard(response.data);
                setReferralDashboardError(null);
            } else {
                setReferralDashboard(null);

                setReferralDashboardError(
                    response?.message ||
                    "Couldn't load referral dashboard."
                );
            }

            setReferralDashboardLoading(false);
        },
        []
    );

    const refetchReferralDashboard = useCallback(async () => {
        setReferralDashboardLoading(true);
        setReferralDashboardError(null);

        const response = await authGet(REFERRAL_DASHBOARD_URL);

        applyReferralDashboard(response);
    }, [authGet, applyReferralDashboard]);

    /* ---------------------------------------------------------------- */
    /* REFERRAL HISTORY                                                */
    /* ---------------------------------------------------------------- */

    const applyReferralHistory = useCallback(
        (response: ReferralHistoryResponse | null) => {
            if (response?.success) {
                setReferralHistory(response.data ?? null);
                setReferralHistoryError(null);
            } else {
                setReferralHistory(null);

                setReferralHistoryError(
                    response?.message ||
                    "Couldn't load referral history."
                );
            }

            setReferralHistoryLoading(false);
        },
        []
    );

    const refetchReferralHistory = useCallback(async () => {
        setReferralHistoryLoading(true);
        setReferralHistoryError(null);

        const response = await authGet(REFERRAL_HISTORY_URL);

        applyReferralHistory(response);
    }, [authGet, applyReferralHistory]);

    /* ---------------------------------------------------------------- */
    /* RELIGIONS                                                        */
    /* ---------------------------------------------------------------- */

    const applyReligions = useCallback(
        (response: ReligionResponse | null) => {
            if (response?.success && Array.isArray(response.data)) {
                setReligions(
                    activeByPriority(response.data).map((religion) => ({
                        ...religion,
                        communities: activeByPriority(
                            religion.communities ?? []
                        ),
                    }))
                );
                setReligionsError(null);
            } else {
                setReligions([]);

                setReligionsError(
                    response?.message ||
                    "Couldn't load religions."
                );
            }

            setReligionsLoading(false);
        },
        []
    );

    const refetchReligions = useCallback(async () => {
        setReligionsLoading(true);
        setReligionsError(null);

        const response = await authGet(RELIGION_URL);

        applyReligions(response);
    }, [authGet, applyReligions]);

    /* ---------------------------------------------------------------- */
    /* LANGUAGES                                                        */
    /* ---------------------------------------------------------------- */

    const applyLanguages = useCallback(
        (response: LanguagesResponse | null) => {
            if (response?.success && Array.isArray(response.data)) {
                setLanguages(activeByPriority(response.data));
                setLanguagesError(null);
            } else {
                setLanguages([]);

                setLanguagesError(
                    response?.message ||
                    "Couldn't load languages."
                );
            }

            setLanguagesLoading(false);
        },
        []
    );

    const refetchLanguages = useCallback(async () => {
        setLanguagesLoading(true);
        setLanguagesError(null);

        const response = await authGet(LANGUAGES_URL);

        applyLanguages(response);
    }, [authGet, applyLanguages]);

    /* ---------------------------------------------------------------- */
    /* APPLY REFERRAL                                                   */
    /* ---------------------------------------------------------------- */

    const applyReferral = async (
        data: ApplyReferralRequest
    ): Promise<ReferralActionResponse | null> => {
        try {
            setApplyReferralLoading(true);
            setApplyReferralError(null);
            const response = await axios.post(
                APPLY_REFERRAL_URL,
                data,
                {
                    headers: authHeader(),
                }
            );

            if (response.data?.success) {
                /*
                 * Refresh dashboard/history after successfully
                 * applying a referral.
                 */
                await Promise.all([
                    refetchReferralDashboard(),
                    refetchReferralHistory(),
                ]);

                return response.data as ReferralActionResponse;
            }

            setApplyReferralError(
                response.data?.message ||
                "Couldn't apply the referral code."
            );

            return null;
        } catch (err) {
            console.error("Apply Referral Error:", err);

            if (axios.isAxiosError(err)) {
                setApplyReferralError(
                    err.response?.data?.message ||
                    "Something went wrong while applying the referral code."
                );
            } else {
                setApplyReferralError(
                    "Something went wrong while applying the referral code."
                );
            }

            return null;
        } finally {
            setApplyReferralLoading(false);
        }
    };

    /* ---------------------------------------------------------------- */
    /* VALIDATE REFERRAL                                                */
    /* ---------------------------------------------------------------- */

    const validateReferral = async (
        data: ValidateReferralRequest
    ): Promise<ReferralActionResponse | null> => {
        try {
            setValidateReferralLoading(true);
            setValidateReferralError(null);

            const response = await axios.post(
                VALIDATE_REFERRAL_URL,
                data,
                {
                    headers: authHeader(),
                }
            );

            if (response.data?.success) {
                return response.data as ReferralActionResponse;
            }
            setValidateReferralError(
                response.data?.message ||
                "Couldn't validate the referral code."
            );

            return null;
        } catch (err) {
            console.error("Validate Referral Error:", err);

            if (axios.isAxiosError(err)) {
                setValidateReferralError(
                    err.response?.data?.message ||
                    "Something went wrong while validating the referral code."
                );
            } else {
                setValidateReferralError(
                    "Something went wrong while validating the referral code."
                );
            }

            return null;
        } finally {
            setValidateReferralLoading(false);
        }
    };

    /* ---------------------------------------------------------------- */
    /* INITIAL GET APIs (single Promise.all)                            */
    /* ---------------------------------------------------------------- */

    useEffect(() => {
        if (!getClientToken()) {
            return;
        } else {
            let alive = true;

            (async () => {
                const [
                    dashboardResponse,
                    historyResponse,
                    religionResponse,
                    languagesResponse,
                ] = await Promise.all([
                    authGet(REFERRAL_DASHBOARD_URL),
                    authGet(REFERRAL_HISTORY_URL),
                    authGet(RELIGION_URL),
                    authGet(LANGUAGES_URL),
                ]);

                if (!alive) return;

                applyReferralDashboard(dashboardResponse);
                applyReferralHistory(historyResponse);
                applyReligions(religionResponse);
                applyLanguages(languagesResponse);
            })();

            return () => {
                alive = false;
            };
        }
    }, [
        authGet,
        applyReferralDashboard,
        applyReferralHistory,
        applyReligions,
        applyLanguages,
    ]);

    /* ---------------------------------------------------------------- */
    /* CONTEXT VALUE                                                    */
    /* ---------------------------------------------------------------- */

    const value = useMemo<UserProfileDataContextData>(
        () => ({
            /* Dashboard */
            referralDashboard,
            referralDashboardLoading,
            referralDashboardError,
            refetchReferralDashboard,

            /* History */
            referralHistory,
            referralHistoryLoading,
            referralHistoryError,
            refetchReferralHistory,

            /* Religions */
            religions,
            religionsLoading,
            religionsError,
            refetchReligions,

            /* Languages */
            languages,
            languagesLoading,
            languagesError,
            refetchLanguages,

            /* Apply */
            applyReferral,
            applyReferralLoading,
            applyReferralError,

            /* Validate */
            validateReferral,
            validateReferralLoading,
            validateReferralError,
        }),
        [
            referralDashboard,
            referralDashboardLoading,
            referralDashboardError,
            refetchReferralDashboard,

            referralHistory,
            referralHistoryLoading,
            referralHistoryError,
            refetchReferralHistory,

            religions,
            religionsLoading,
            religionsError,
            refetchReligions,

            languages,
            languagesLoading,
            languagesError,
            refetchLanguages,

            applyReferralLoading,
            applyReferralError,

            validateReferralLoading,
            validateReferralError,
        ]
    );

    return (
        <UserProfileDataContext.Provider value={value}>
            {children}
        </UserProfileDataContext.Provider>
    );
}

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */

export function useUserProfileData() {
    return useContext(UserProfileDataContext);
}
