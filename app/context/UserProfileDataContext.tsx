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

const REFERRAL_DASHBOARD_URL = `${API_BASE_URL}/api/user/referral/dashboard`;
const REFERRAL_HISTORY_URL = `${API_BASE_URL}/api/user/referral/history`;
const APPLY_REFERRAL_URL = `${API_BASE_URL}/api/user/apply-referral`;
const VALIDATE_REFERRAL_URL = `${API_BASE_URL}/api/user/referral-validate`;
const RELIGION_URL = `${API_BASE_URL}/api/religion/get`;
const LANGUAGES_URL = `${API_BASE_URL}/api/admin/languages/get-All`;

const FAMILY_STATUS_URL = `${API_BASE_URL}/api/admin/family/options?type=familyStatus`;
const FAMILY_TYPE_URL = `${API_BASE_URL}/api/admin/family/options?type=familyType`;
const FATHER_OCCUPATION_URL = `${API_BASE_URL}/api/admin/family/options?type=fatherOccupation`;
const FATHER_ORGANISATION_URL = `${API_BASE_URL}/api/admin/family/options?type=fatherOrganisation`;
const MOTHER_OCCUPATION_URL = `${API_BASE_URL}/api/admin/family/options?type=motherOccupation`;
const MOTHER_ORGANISATION_URL = `${API_BASE_URL}/api/admin/family/options?type=motherOrganisation`;
const SIBLING_TYPE_URL = `${API_BASE_URL}/api/admin/family/options?type=siblingtype`;
const SIBLING_OCCUPATION_URL = `${API_BASE_URL}/api/admin/family/options?type=siblingOccupation`;
const SIBLING_MARITAL_STATUS_URL = `${API_BASE_URL}/api/admin/family/options?type=siblingMarital`;
const FAMILY_HOME_URL = `${API_BASE_URL}/api/admin/family/options?type=familyHome`;
const NATIVE_PLACE_URL = `${API_BASE_URL}/api/admin/family/options?type=nativePlace`;
const FAMILY_INCOME_URL = `${API_BASE_URL}/api/admin/family/options?type=familyIncome`;
const FAMILY_SAVE_URL = `${API_BASE_URL}/api/user/profile/family`;

const MY_BALANCES_URL = `${API_BASE_URL}/api/user/my-balances`;
const ROSES_URL = `${API_BASE_URL}/api/admin/purchase-store/data/ROSE`;
const COMPLIMENTS_URL = `${API_BASE_URL}/admin/purchase-store/data/COMPLIMENT`;
const BOOSTS_URL = `${API_BASE_URL}/api/user/my-balances`;
const WALLET_URL = `${API_BASE_URL}/api/user/my-balances`;
const DATEPLANS_URL = `${API_BASE_URL}/user/date-now/date-plan-packages/get-all`;
export interface DatePlanPackage {
  id: string;
  title: string;
  description: string;
  planCount: number;
  price: string;
  pricePerPlan: string;
  discount: number;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DatePlanInfoItem {
  title: string;
  description: string;
}

export interface DatePlanInfo {
  id: string;
  howOnePlanWorks: DatePlanInfoItem[];
  whyPeopleBuyPlans: DatePlanInfoItem[];
  goodToKnow: DatePlanInfoItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DatePlansData {
  availableDatePlan: number;
  packages: DatePlanPackage[];
  info: DatePlanInfo;
}

export interface DatePlansApiResponse {
  success: boolean;
  data: DatePlansData;
}
export interface StorePack {
  id: string;
  itemType: string;
  title: string;
  quantity: number;
  pricePerUnit: string;
  totalPrice: string;
  badge: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreInfo {
  id: string;
  itemType: string;
  title: string;
  description: string;
  tag: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoreData {
  itemType: string;
  availableRoses: number;
  packs: StorePack[];
  info: StoreInfo[];
}

export interface StoreApiResponse {
  success: boolean;
  message: string;
  data: StoreData;
}
const FAMILY_OPTION_URLS: Record<FamilyOptionKey, string> = {
    familyStatus: FAMILY_STATUS_URL,
    familyType: FAMILY_TYPE_URL,
    fatherOccupation: FATHER_OCCUPATION_URL,
    fatherOrganisation: FATHER_ORGANISATION_URL,
    motherOccupation: MOTHER_OCCUPATION_URL,
    motherOrganisation: MOTHER_ORGANISATION_URL,
    relation: SIBLING_TYPE_URL,
    siblingOccupation: SIBLING_OCCUPATION_URL,
    siblingMarital: SIBLING_MARITAL_STATUS_URL,
    familyHome: FAMILY_HOME_URL,
    nativePlace: NATIVE_PLACE_URL,
    familyIncome: FAMILY_INCOME_URL,
};

const FAMILY_OPTION_KEYS = Object.keys(FAMILY_OPTION_URLS) as FamilyOptionKey[];


/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
export interface BalanceItem {
    balance: number;
    hasBalance: boolean;
}

export interface WalletBalance {
    balance: number;
    currency: string; // e.g. "INR"
    formattedBalance: string; // e.g. "₹0"
}

export interface UserBalances {
    roses: BalanceItem;
    compliments: BalanceItem;
    boosts: BalanceItem;
    wallet: WalletBalance;
    datePlans: BalanceItem;
}

export interface UserBalancesResponse {
    success: boolean;
    message?: string;
    data?: UserBalances;
}
export interface ReferralStats {
    totalEarned: number;
    joined: number;
    rewarded: number;
    pending: number;
}
export interface FamilyOptions {
    id: number;
    value: string;
}

/** One of the twelve family option lists — see `FAMILY_OPTION_URLS`. */
export type FamilyOptionKey =
    | "familyStatus"
    | "familyType"
    | "fatherOccupation"
    | "fatherOrganisation"
    | "motherOccupation"
    | "motherOrganisation"
    | "relation"
    | "siblingOccupation"
    | "siblingMarital"
    | "familyHome"
    | "nativePlace"
    | "familyIncome";

/** All twelve lists at once; `null` until the fetch has landed. */
export type FamilyOptionsMap = Record<FamilyOptionKey, FamilyOptions[]>;

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
export interface FamilyOptionsResponse {
    success: boolean;
    message?: string;
    data?: FamilyOptions[];
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
export interface Sibling {
    /** The `siblingtype` option naming this row's side of the family. */
    siblingTypeId?: number;
    occupationId?: number;
    maritalId?: number;
}

export interface FamilyProfilePayload {
    familyStatusId?: number;
    familyTypeId?: number;
    fatherOccupationId?: number;
    fatherOrganisationId?: number;
    motherOccupationId?: number;
    motherOrganisationId?: number;
    familyHomeId?: number;
    nativePlaceId?: number;
    familyIncomeId?: number;
    /** The `siblingtype` option for the sister/brother counts the user picked. */
    siblings: Sibling[];
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
    /* My Balances */
    balances: UserBalances | null;
    balancesLoading: boolean;
    balancesError: string | null;
    refetchBalances: () => Promise<void>;

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

    /* Family option lists (twelve GETs behind one lazy fetch) */
    familyOptions: FamilyOptionsMap | null;
    familyOptionsLoading: boolean;
    familyOptionsError: string | null;
    ensureFamilyOptions: () => void;
    refetchFamilyOptions: () => Promise<void>;

    /* Family save — PATCH /api/user/profile/family, called by the edit page. */
    saveFamily: (
        data: FamilyProfilePayload
    ) => Promise<ReferralActionResponse | null>;
    saveFamilyLoading: boolean;
    saveFamilyError: string | null;
}

/* ------------------------------------------------------------------ */
/* Context                                                            */
/* ------------------------------------------------------------------ */

const UserProfileDataContext =
    createContext<UserProfileDataContextData>({
        balances: null,
        balancesLoading: true,
        balancesError: null,
        refetchBalances: async () => { },

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

        familyOptions: null,
        familyOptionsLoading: false,
        familyOptionsError: null,
        ensureFamilyOptions: () => { },
        refetchFamilyOptions: async () => { },

        saveFamily: async () => null,
        saveFamilyLoading: false,
        saveFamilyError: null,
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
    /* My Balances State                                               */
    /* ---------------------------------------------------------------- */

    const [balances, setBalances] = useState<UserBalances | null>(null);

    const [balancesLoading, setBalancesLoading] = useState(true);

    const [balancesError, setBalancesError] =
        useState<string | null>(null);

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
    /* FAMILY OPTION LISTS (lazy)                                       */
    /* ---------------------------------------------------------------- */

    const [familyOptions, setFamilyOptions] =
        useState<FamilyOptionsMap | null>(null);

    const [familyOptionsLoading, setFamilyOptionsLoading] = useState(false);

    const [familyOptionsError, setFamilyOptionsError] =
        useState<string | null>(null);

    /* Set once the fetch has been asked for, so StrictMode double-effects
       and re-mounts of the edit page don't fire the twelve GETs twice. */
    const familyRequestedRef = useRef(false);

    /* ---------------------------------------------------------------- */
    /* FAMILY SAVE                                                      */
    /* ---------------------------------------------------------------- */

    /* Kept apart from the referral state the other account APIs share: the
       profile edit page runs this one, and a failed family save must not put
       a family message under the referral form on another page. */
    const [saveFamilyLoading, setSaveFamilyLoading] = useState(false);
    const [saveFamilyError, setSaveFamilyError] = useState<string | null>(null);

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
    /* MY BALANCES                                                      */
    /* ---------------------------------------------------------------- */

    const applyBalances = useCallback(
        (response: UserBalancesResponse | null) => {
            if (response?.success && response.data) {
                setBalances(response.data);
                setBalancesError(null);
            } else {
                setBalances(null);

                setBalancesError(
                    response?.message ||
                    "Couldn't load your balances."
                );
            }

            setBalancesLoading(false);
        },
        []
    );

    const refetchBalances = useCallback(async () => {
        setBalancesLoading(true);
        setBalancesError(null);

        const response = await authGet(MY_BALANCES_URL);

        applyBalances(response);
    }, [authGet, applyBalances]);

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
    /* FAMILY OPTION LISTS                                              */
    /* ---------------------------------------------------------------- */

    const refetchFamilyOptions = useCallback(async () => {
        setFamilyOptionsLoading(true);
        setFamilyOptionsError(null);

        const responses = await Promise.all(
            FAMILY_OPTION_KEYS.map((key) => authGet(FAMILY_OPTION_URLS[key]))
        );

        const next = {} as FamilyOptionsMap;
        let okCount = 0;
        let firstMessage: string | null = null;

        FAMILY_OPTION_KEYS.forEach((key, index) => {
            const response = responses[index] as FamilyOptionsResponse | null;

            if (response?.success && Array.isArray(response.data)) {
                next[key] = response.data;
                okCount += 1;
            } else {
                next[key] = [];
                firstMessage = firstMessage ?? response?.message ?? null;
            }
        });

        /* Nothing came back: keep the map null so consumers show the retry
           state rather than a form full of empty selects. */
        if (okCount === 0) {
            setFamilyOptionsError(
                firstMessage || "Couldn't load family options."
            );
        } else {
            setFamilyOptions(next);
            /* Partial success: surface the first failure as a banner while
               the lists that did arrive stay usable. */
            setFamilyOptionsError(
                okCount === FAMILY_OPTION_KEYS.length ? null : firstMessage
            );
        }

        setFamilyOptionsLoading(false);
    }, [authGet]);

    /* Only the profile edit page asks for these — marketing pages must not
       pay for twelve extra requests, so nothing runs until mount. */
    const ensureFamilyOptions = useCallback(() => {
        if (familyRequestedRef.current) return;
        familyRequestedRef.current = true;
        void refetchFamilyOptions();
    }, [refetchFamilyOptions]);


    /* ---------------------------------------------------------------- */
    /* APPLY REFERRAL                                                   */
    /* ---------------------------------------------------------------- */

    const applyReferral = async (
        data: ApplyReferralRequest
    ): Promise<ReferralActionResponse | null> => {
        try {
            setApplyReferralLoading(true);
            setApplyReferralError(null);
            const validityResponse = await validateReferral(data)
            if (!validityResponse) {
                setApplyReferralError(
                    validateReferralError ||
                    "Invalid Referral code"
                );
                return null;
            }
            const response = await axios.post(
                APPLY_REFERRAL_URL,
                data,
                {
                    headers: authHeader(),
                }
            );
            if (response.data?.success) {
                /*
                 * Refresh dashboard/history/balances after successfully
                 * applying a referral.
                 */
                await Promise.all([
                    refetchReferralDashboard(),
                    refetchReferralHistory(),
                    refetchBalances(),
                ]);

                return response.data as ReferralActionResponse;
            }

            setApplyReferralError(
                response.data?.message ||
                "Couldn't apply the referral code."
            );

            return null;
        } catch (err) {
            // console.error("Apply Referral Error:", err);

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
    /**
     * PATCH the family save endpoint: the nine family selects, the two sibling
     * counts as one `siblingTypeId`, and one row per sibling. Unsuccessful
     * answers come back as a `success: false` response (never `null`) so the
     * caller can show the backend's own message.
     */
    const SaveFamily = useCallback(async (
        data: FamilyProfilePayload
    ): Promise<ReferralActionResponse | null> => {
        try {
            setSaveFamilyLoading(true);
            setSaveFamilyError(null);
            console.log("Sending Data : ",data)
            const response = await axios.patch(
                FAMILY_SAVE_URL,
                data,
                {
                    headers: authHeader(),
                }
            );
            console.log("Response Data : ",response)
            if (response.data?.success) {
                return response.data as ReferralActionResponse;
            }

            const message =
                response.data?.message ||
                "Couldn't save your family details.";
            setSaveFamilyError(message);

            return { success: false, message };
        } catch (err) {
            // console.error("Save Family Error:", err);

            const message = axios.isAxiosError(err)
                ? err.response?.data?.message ||
                "Something went wrong while saving your family details."
                : "Something went wrong while saving your family details.";
            setSaveFamilyError(message);

            return { success: false, message };
        } finally {
            setSaveFamilyLoading(false);
        }
    }, []);

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
            // console.error("Validate Referral Error:", err);

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
                    balancesResponse,
                ] = await Promise.all([
                    authGet(REFERRAL_DASHBOARD_URL),
                    authGet(REFERRAL_HISTORY_URL),
                    authGet(RELIGION_URL),
                    authGet(LANGUAGES_URL),
                    authGet(MY_BALANCES_URL),
                ]);

                if (!alive) return;

                applyReferralDashboard(dashboardResponse);
                applyReferralHistory(historyResponse);
                applyReligions(religionResponse);
                applyLanguages(languagesResponse);
                applyBalances(balancesResponse);
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
        applyBalances,
    ]);

    /* ---------------------------------------------------------------- */
    /* CONTEXT VALUE                                                    */
    /* ---------------------------------------------------------------- */

    const value = useMemo<UserProfileDataContextData>(
        () => ({
            /* Balances */
            balances,
            balancesLoading,
            balancesError,
            refetchBalances,

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

            /* Family option lists */
            familyOptions,
            familyOptionsLoading,
            familyOptionsError,
            ensureFamilyOptions,
            refetchFamilyOptions,

            saveFamily: SaveFamily,
            saveFamilyLoading,
            saveFamilyError,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            balances,
            balancesLoading,
            balancesError,
            refetchBalances,

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

            familyOptions,
            familyOptionsLoading,
            familyOptionsError,
            ensureFamilyOptions,
            refetchFamilyOptions,

            SaveFamily,
            saveFamilyLoading,
            saveFamilyError,
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