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
const COMPLIMENTS_URL = `${API_BASE_URL}/api/admin/purchase-store/data/COMPLIMENT`;
const BOOSTS_URL = `${API_BASE_URL}/api/admin/boost/get-all?type=BOOST`;
const SUPER_BOOSTS_URL = `${API_BASE_URL}/api/admin/boost/get-all?type=SUPER`;
const WALLET_URL = `${API_BASE_URL}/api/user/my-wallet`;
const WALLET_FILTER_IN_URL = `${API_BASE_URL}/api/user/my-wallet?filter=IN`;
const WALLET_FILTER_OUT_URL = `${API_BASE_URL}/api/user/my-wallet?filter=OUT`;
const ADD_MONEY_URL = `${API_BASE_URL}/api/user/wallet/add-money`;
const DATEPLANS_URL = `${API_BASE_URL}/api/user/date-now/date-plan-packages/get-all`;

const ADMIRER_RECEIVED = `${API_BASE_URL}/api/user/admirers?type=LIKE&direction=RECEIVED`;
const ADMIRER_SENT = `${API_BASE_URL}/api/user/admirers?type=LIKE&direction=SENT`;
const SEND_ROSE = `${API_BASE_URL}/api/user/rose/send`;


/* ------------------------------------------------------------------ */
/* Types — Date plans                                                 */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* Types — Purchase stores                                            */
/* ------------------------------------------------------------------ */

export type PackBadge = "NONE" | "MOST_POPULAR" | "BEST_VALUE";

export interface StorePack {
    id: string;
    itemType: string;
    title: string;
    quantity: number;
    pricePerUnit: string;
    totalPrice: string;
    badge: PackBadge;
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
    /** e.g. availableCompliments / availableRoses */
    [key: string]: unknown;
}

export interface StoreApiResponse {
    success: boolean;
    message: string;
    data: StoreData;
}

/* ------------------------------------------------------------------ */
/* Types — Admirers                                                   */
/* ------------------------------------------------------------------ */

export type Admirer = {
    interactionId: string;
    type: "LIKE";
    user: {
        id: string;
        name: string;
        age: number;
        profileImage: string;
        gender:string;
        distanceKm: number;
        matchScore: number;
    };
    createdAt: string;
    timeAgo: string;
    isMatch: boolean;
    matchedAt: string | null;
    likeStatus: {
        sent: boolean;
        seen: boolean;
        matched: boolean;
    };
};

export type AdmirersResponse = {
    success: boolean;
    message: string;
    receivedLikesCount: number;
    isPackageActive: boolean;
    isLocked: boolean;
    data: Admirer[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        hasNext: boolean;
    };
};

/* ----------------------------- Send Rose -------------------------- */

export interface SendRoseRequest {
    receiverId: string;
}

export interface SendRoseResponse {
    success: boolean;
    message?: string;
    data?: unknown;
}

/* --------------------------------- Boosts --------------------------------- */

export interface BoostPack {
    id: string;
    itemType: string;
    title: string;
    quantity: number;
    pricePerUnit: string;
    totalPrice: string;
    badge: PackBadge;
    sortOrder: number;
    isActive: boolean;
}

export interface BoostInfo {
    id: string;
    itemType: string;
    title: string;
    description: string;
    tag: string | null;
    sortOrder: number;
    isActive: boolean;
}

export interface BoostComparisonRow {
    id?: string;
    feature: string;
    boost?: string | null;
    boostValue?: string | null;
    superBoost?: string | null;
    superBoostValue?: string | null;
    sortOrder?: number;
    isActive?: boolean;
}

export interface BoostData {
    itemType: string;
    packs: BoostPack[];
    info: BoostInfo[];
    comparison?: BoostComparisonRow[];
    durationMinutes?: number;
    [key: string]: unknown;
}

export interface BoostApiResponse {
    success: boolean;
    message: string;
    data: BoostData;
}

/* ----------------- /api/admin/boost/get-all raw payload ------------------ */

export interface RawBoostOption {
    id: string;
    label: string;
    boostCount: number;
    timePerBoost: number;
    pricePerBoost: string;
    discounted_price: string;
    discount_percent: number;
    totalPrice: string;
    is_best_value: boolean;
    is_popular: boolean;
    is_active: boolean;
}

export interface RawBoostReason {
    tag?: string | null;
    icon?: string;
    title: string;
    description: string;
}

export interface RawBoostComparisonTable {
    title?: string;
    features?: { feature: string; boost: string; super: string }[];
}

export interface RawBoostGroup {
    id: string;
    type: string;
    name: string;
    title: string;
    description?: string;
    is_active: boolean;
    options: RawBoostOption[];
    whyBoostWorks?: RawBoostReason[];
    /* the API ships this as a single object; tolerate an array too */
    boostVsSuperBoost?: RawBoostComparisonTable | RawBoostComparisonTable[];
}

export interface RawBoostData {
    availableBoost?: number;
    boosts: RawBoostGroup[];
}

export interface RawBoostApiResponse {
    success: boolean;
    message?: string;
    data?: RawBoostData;
}

/**
 * `/api/admin/boost/get-all?type=BOOST|SUPER` returns one group per item type
 * whose `options[]` are the packs, `whyBoostWorks[]` the info rows and
 * `boostVsSuperBoost[].features[]` the comparison table. The store screens read
 * a flat `{ packs, info, comparison }`, so flatten it here — the one place the
 * backend naming scheme meets the UI's.
 */
export function normalizeBoostData(
    raw: RawBoostData | null | undefined
): BoostData {
    const groups = Array.isArray(raw?.boosts) ? raw.boosts : [];

    const packs: BoostPack[] = [];
    const info: BoostInfo[] = [];
    const comparison: BoostComparisonRow[] = [];

    groups.forEach((group) => {
        (group.options ?? []).forEach((option, index) => {
            packs.push({
                id: option.id,
                itemType: group.type,
                /* the pack card prints `quantity` + `title`; keep the API
                   label (e.g. "10 Boosts") as the title. */
                title: option.label,
                quantity: option.boostCount,
                pricePerUnit: option.pricePerBoost,
                /* discounted_price is the payable; totalPrice is the list. */
                totalPrice: option.discounted_price || option.totalPrice,
                badge: option.is_best_value
                    ? "BEST_VALUE"
                    : option.is_popular
                        ? "MOST_POPULAR"
                        : "NONE",
                sortOrder: index,
                isActive: option.is_active !== false,
            });
        });

        (group.whyBoostWorks ?? []).forEach((row, index) => {
            info.push({
                id: `${group.id}-why-${index}`,
                itemType: group.type,
                title: row.title,
                description: row.description,
                tag: row.tag ?? null,
                sortOrder: index,
                isActive: true,
            });
        });

        const tables = group.boostVsSuperBoost
            ? Array.isArray(group.boostVsSuperBoost)
                ? group.boostVsSuperBoost
                : [group.boostVsSuperBoost]
            : [];

        tables.forEach((table) => {
            (table.features ?? []).forEach((f, index) => {
                comparison.push({
                    feature: f.feature,
                    boost: f.boost,
                    superBoost: f.super,
                    sortOrder: index,
                    isActive: true,
                });
            });
        });
    });

    return {
        itemType: groups[0]?.type ?? "",
        packs,
        info,
        comparison,
        availableBoost: raw?.availableBoost,
    };
}

/* --------------------------------- Wallet --------------------------------- */

export type WalletFilter = "ALL" | "IN" | "OUT";

export interface WalletTransaction {
    id: string;
    type: string;
    source?: string;
    status: string;
    direction: "IN" | "OUT";
    title: string;
    description?: string;
    amount: number;
    formattedAmount: string;
    balanceBefore?: number;
    balanceAfter?: number;
    referenceId?: string | null;
    createdAt: string;
}

export interface WalletData {
    wallet: { balance: number; currency: string; formattedBalance?: string };
    datePlans?: {
        balance: number;
        totalDatePlan: number;
        purchasedDatePlan: number;
        label: string;
    };
    filter: WalletFilter;
    transactions: WalletTransaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface WalletApiResponse {
    success: boolean;
    message?: string;
    data?: WalletData;
}

export interface WalletQuery {
    filter: WalletFilter;
    page: number;
    limit: number;
}

/* ------------------------------- Add money -------------------------------- */

export interface AddMoneyRequest {
    amount: number;
}

export interface AddMoneyResponse {
    success: boolean;
    message?: string;
    data?: unknown;
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

/** Currency symbols, mirroring the money() helper in MyWalletMain. */
const CURRENCY_SYMBOL: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
};

/** Formats an amount the way the API's `formattedBalance` does. */
const formatMoney = (amount: number, currency?: string) =>
    `${CURRENCY_SYMBOL[currency ?? "INR"] ?? ""}${Number(amount).toLocaleString(
        "en-IN",
        { maximumFractionDigits: 2 }
    )}`;

/* ------------------------------------------------------------------ */
/* Context Types                                                      */
/* ------------------------------------------------------------------ */

interface UserProfileDataContextData {
    /* My Balances */
    balances: UserBalances | null;
    balancesLoading: boolean;
    balancesError: string | null;
    refetchBalances: () => Promise<void>;

    /**
     * A wallet top-up landed. Updates the sidebar's "My Wallet" card
     * immediately (optimistic) and then reconciles it with the server.
     */
    applyWalletTopUp: (amount: number) => Promise<void>;

    /**
     * Runs the one-off full load (balances, wallet, date plans, referral…) if it
     * hasn't run yet. The provider lives in the root layout and can mount before
     * a session exists, so screens call this on mount to nudge it awake.
     */
    ensureLoaded: () => void;

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

    /* Purchase stores (Roses / Compliments) */
    roses: StoreData | null;
    rosesLoading: boolean;
    rosesError: string | null;
    refetchRoses: () => Promise<void>;

    compliments: StoreData | null;
    complimentsLoading: boolean;
    complimentsError: string | null;
    refetchCompliments: () => Promise<void>;

    /* Boosts + Super Boosts */
    boosts: BoostData | null;
    boostsLoading: boolean;
    boostsError: string | null;
    refetchBoosts: () => Promise<void>;

    superBoosts: BoostData | null;
    superBoostsLoading: boolean;
    superBoostsError: string | null;
    refetchSuperBoosts: () => Promise<void>;

    /* Wallet (pre-fetched ALL / IN / OUT) */
    wallet: WalletData | null;
    walletLoading: boolean;
    walletError: string | null;
    refetchWallet: () => Promise<void>;

    walletIn: WalletData | null;
    walletInLoading: boolean;
    walletInError: string | null;
    refetchWalletIn: () => Promise<void>;

    walletOut: WalletData | null;
    walletOutLoading: boolean;
    walletOutError: string | null;
    refetchWalletOut: () => Promise<void>;

    /* Paginated wallet fetch used by the My Wallet screen. */
    fetchWallet: (query: WalletQuery) => Promise<WalletData>;

    /* Add money — POST /api/user/wallet/add-money */
    addMoney: (payload: AddMoneyRequest) => Promise<AddMoneyResponse | null>;
    addMoneyLoading: boolean;
    addMoneyError: string | null;

    /* Date plan packages */
    datePlans: DatePlansData | null;
    datePlansLoading: boolean;
    datePlansError: string | null;
    refetchDatePlans: () => Promise<void>;

    /* Admirers (likes received / sent). The whole response is kept so screens
       can read `isLocked`, `isPackageActive`, `receivedLikesCount` and
       `pagination` alongside `data`. */
    admirersReceived: AdmirersResponse | null;
    admirersReceivedLoading: boolean;
    admirersReceivedError: string | null;
    refetchAdmirersReceived: () => Promise<void>;

    admirersSent: AdmirersResponse | null;
    admirersSentLoading: boolean;
    admirersSentError: string | null;
    refetchAdmirersSent: () => Promise<void>;

    /* Send Rose — POST /api/user/rose/send */
    sendRose: (receiverId: string) => Promise<SendRoseResponse | null>;
    sendRoseLoading: boolean;
    sendRoseError: string | null;
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
        applyWalletTopUp: async () => { },
        ensureLoaded: () => { },

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

        roses: null,
        rosesLoading: true,
        rosesError: null,
        refetchRoses: async () => { },

        compliments: null,
        complimentsLoading: true,
        complimentsError: null,
        refetchCompliments: async () => { },

        boosts: null,
        boostsLoading: true,
        boostsError: null,
        refetchBoosts: async () => { },

        superBoosts: null,
        superBoostsLoading: true,
        superBoostsError: null,
        refetchSuperBoosts: async () => { },

        wallet: null,
        walletLoading: true,
        walletError: null,
        refetchWallet: async () => { },

        walletIn: null,
        walletInLoading: true,
        walletInError: null,
        refetchWalletIn: async () => { },

        walletOut: null,
        walletOutLoading: true,
        walletOutError: null,
        refetchWalletOut: async () => { },

        fetchWallet: async () => {
            throw new Error("fetchWallet not implemented");
        },

        addMoney: async () => null,
        addMoneyLoading: false,
        addMoneyError: null,

        datePlans: null,
        datePlansLoading: true,
        datePlansError: null,
        refetchDatePlans: async () => { },

        admirersReceived: null,
        admirersReceivedLoading: true,
        admirersReceivedError: null,
        refetchAdmirersReceived: async () => { },

        admirersSent: null,
        admirersSentLoading: true,
        admirersSentError: null,
        refetchAdmirersSent: async () => { },

        sendRose: async () => null,
        sendRoseLoading: false,
        sendRoseError: null,
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

    /* Mirrors `balances` so async work (the wallet top-up sync) can read the
       latest wallet figure without waiting for a re-render. */
    const balancesRef = useRef<UserBalances | null>(null);

    /* The last wallet balance the server reported, before any optimistic
       bump. Tells "the backend credited the top-up" apart from "the balances
       endpoint answered before that write landed". */
    const serverWalletBalanceRef = useRef<number | null>(null);

    /* A top-up credited locally but not yet confirmed by the server. */
    const pendingWalletCreditRef = useRef<{
        amount: number;
        base: number;
    } | null>(null);

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
    /* Purchased Stores (Roses / Compliments) State                     */
    /* ---------------------------------------------------------------- */

    const [roses, setRoses] = useState<StoreData | null>(null);
    const [rosesLoading, setRosesLoading] = useState(true);
    const [rosesError, setRosesError] = useState<string | null>(null);

    const [compliments, setCompliments] = useState<StoreData | null>(null);
    const [complimentsLoading, setComplimentsLoading] = useState(true);
    const [complimentsError, setComplimentsError] =
        useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Boosts + Super Boosts State                                      */
    /* ---------------------------------------------------------------- */

    const [boosts, setBoosts] = useState<BoostData | null>(null);
    const [boostsLoading, setBoostsLoading] = useState(true);
    const [boostsError, setBoostsError] = useState<string | null>(null);

    const [superBoosts, setSuperBoosts] = useState<BoostData | null>(null);
    const [superBoostsLoading, setSuperBoostsLoading] = useState(true);
    const [superBoostsError, setSuperBoostsError] =
        useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Wallet State (ALL / IN / OUT)                                    */
    /* ---------------------------------------------------------------- */

    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [walletLoading, setWalletLoading] = useState(true);
    const [walletError, setWalletError] = useState<string | null>(null);

    const [walletIn, setWalletIn] = useState<WalletData | null>(null);
    const [walletInLoading, setWalletInLoading] = useState(true);
    const [walletInError, setWalletInError] = useState<string | null>(null);

    const [walletOut, setWalletOut] = useState<WalletData | null>(null);
    const [walletOutLoading, setWalletOutLoading] = useState(true);
    const [walletOutError, setWalletOutError] = useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Add Money State (POST)                                           */
    /* ---------------------------------------------------------------- */

    const [addMoneyLoading, setAddMoneyLoading] = useState(false);
    const [addMoneyError, setAddMoneyError] = useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Date Plan Packages State                                         */
    /* ---------------------------------------------------------------- */

    const [datePlans, setDatePlans] = useState<DatePlansData | null>(null);
    const [datePlansLoading, setDatePlansLoading] = useState(true);
    const [datePlansError, setDatePlansError] = useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Admirers State (Received / Sent)                                 */
    /* ---------------------------------------------------------------- */

    const [admirersReceived, setAdmirersReceived] =
        useState<AdmirersResponse | null>(null);
    const [admirersReceivedLoading, setAdmirersReceivedLoading] =
        useState(true);
    const [admirersReceivedError, setAdmirersReceivedError] =
        useState<string | null>(null);

    const [admirersSent, setAdmirersSent] =
        useState<AdmirersResponse | null>(null);
    const [admirersSentLoading, setAdmirersSentLoading] = useState(true);
    const [admirersSentError, setAdmirersSentError] =
        useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* Send Rose State                                                  */
    /* ---------------------------------------------------------------- */

    const [sendRoseLoading, setSendRoseLoading] = useState(false);
    const [sendRoseError, setSendRoseError] = useState<string | null>(null);

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
                const serverBalance = Number(
                    response.data.wallet?.balance ?? 0
                );

                serverWalletBalanceRef.current = serverBalance;

                let next = response.data;
                const pending = pendingWalletCreditRef.current;

                if (pending) {
                    const expected = pending.base + pending.amount;

                    if (serverBalance + 0.01 < expected) {
                        /* The backend has not credited the top-up yet. Keep
                           the optimistic figure instead of snapping back to
                           the old amount. */
                        next = {
                            ...next,
                            wallet: {
                                ...next.wallet,
                                balance: expected,
                                formattedBalance: formatMoney(
                                    expected,
                                    next.wallet?.currency
                                ),
                            },
                        };
                    } else {
                        /* The server knows about the credit — drop ours. */
                        pendingWalletCreditRef.current = null;
                    }
                }

                balancesRef.current = next;
                setBalances(next);
                setBalancesError(null);
            } else {
                balancesRef.current = null;
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
    /* ROSES STORE                                                      */
    /* ---------------------------------------------------------------- */

    const applyRoses = useCallback(
        (response: StoreApiResponse | null) => {
            if (response?.success && response.data) {
                setRoses(response.data);
                setRosesError(null);
            } else {
                setRoses(null);

                setRosesError(
                    response?.message || "Couldn't load roses."
                );
            }

            setRosesLoading(false);
        },
        []
    );

    const refetchRoses = useCallback(async () => {
        setRosesLoading(true);
        setRosesError(null);

        const response = await authGet(ROSES_URL);

        applyRoses(response);
    }, [authGet, applyRoses]);

    /* ---------------------------------------------------------------- */
    /* COMPLIMENTS STORE                                                */
    /* ---------------------------------------------------------------- */

    const applyCompliments = useCallback(
        (response: StoreApiResponse | null) => {
            if (response?.success && response.data) {
                setCompliments(response.data);
                setComplimentsError(null);
            } else {
                setCompliments(null);

                setComplimentsError(
                    response?.message || "Couldn't load compliments."
                );
            }

            setComplimentsLoading(false);
        },
        []
    );

    const refetchCompliments = useCallback(async () => {
        setComplimentsLoading(true);
        setComplimentsError(null);

        const response = await authGet(COMPLIMENTS_URL);

        applyCompliments(response);
    }, [authGet, applyCompliments]);

    /* ---------------------------------------------------------------- */
    /* BOOSTS                                                           */
    /* ---------------------------------------------------------------- */

    const applyBoosts = useCallback(
        (response: RawBoostApiResponse | null) => {
            if (response?.success && response.data) {
                setBoosts(normalizeBoostData(response.data));
                setBoostsError(null);
            } else {
                setBoosts(null);

                setBoostsError(
                    response?.message || "Couldn't load boosts."
                );
            }

            setBoostsLoading(false);
        },
        []
    );

    const refetchBoosts = useCallback(async () => {
        setBoostsLoading(true);
        setBoostsError(null);

        const response = await authGet(BOOSTS_URL);

        applyBoosts(response);
    }, [authGet, applyBoosts]);

    /* ---------------------------------------------------------------- */
    /* SUPER BOOSTS                                                     */
    /* ---------------------------------------------------------------- */

    const applySuperBoosts = useCallback(
        (response: RawBoostApiResponse | null) => {
            if (response?.success && response.data) {
                setSuperBoosts(normalizeBoostData(response.data));
                setSuperBoostsError(null);
            } else {
                setSuperBoosts(null);

                setSuperBoostsError(
                    response?.message || "Couldn't load super boosts."
                );
            }

            setSuperBoostsLoading(false);
        },
        []
    );

    const refetchSuperBoosts = useCallback(async () => {
        setSuperBoostsLoading(true);
        setSuperBoostsError(null);

        const response = await authGet(SUPER_BOOSTS_URL);

        applySuperBoosts(response);
    }, [authGet, applySuperBoosts]);

    /* ---------------------------------------------------------------- */
    /* WALLET — ALL                                                     */
    /* ---------------------------------------------------------------- */

    const applyWallet = useCallback(
        (response: WalletApiResponse | null) => {
            if (response?.success && response.data) {
                let next = response.data;
                const pending = pendingWalletCreditRef.current;

                if (pending) {
                    const expected = pending.base + pending.amount;
                    const serverBalance = Number(
                        next.wallet?.balance ?? 0
                    );

                    if (serverBalance + 0.01 < expected) {
                        /* Still waiting on the backend to credit it. */
                        next = {
                            ...next,
                            wallet: {
                                ...next.wallet,
                                balance: expected,
                                formattedBalance: formatMoney(
                                    expected,
                                    next.wallet?.currency
                                ),
                            },
                        };
                    }
                }

                setWallet(next);
                setWalletError(null);
            } else {
                setWallet(null);

                setWalletError(
                    response?.message || "Couldn't load your wallet."
                );
            }

            setWalletLoading(false);
        },
        []
    );

    const refetchWallet = useCallback(async () => {
        setWalletLoading(true);
        setWalletError(null);

        const response = await authGet(WALLET_URL);

        applyWallet(response);
    }, [authGet, applyWallet]);

    /* ---------------------------------------------------------------- */
    /* WALLET — IN                                                      */
    /* ---------------------------------------------------------------- */

    const applyWalletIn = useCallback(
        (response: WalletApiResponse | null) => {
            if (response?.success && response.data) {
                setWalletIn(response.data);
                setWalletInError(null);
            } else {
                setWalletIn(null);

                setWalletInError(
                    response?.message || "Couldn't load wallet credits."
                );
            }

            setWalletInLoading(false);
        },
        []
    );

    const refetchWalletIn = useCallback(async () => {
        setWalletInLoading(true);
        setWalletInError(null);

        const response = await authGet(WALLET_FILTER_IN_URL);

        applyWalletIn(response);
    }, [authGet, applyWalletIn]);

    /* ---------------------------------------------------------------- */
    /* WALLET — OUT                                                     */
    /* ---------------------------------------------------------------- */

    const applyWalletOut = useCallback(
        (response: WalletApiResponse | null) => {
            if (response?.success && response.data) {
                setWalletOut(response.data);
                setWalletOutError(null);
            } else {
                setWalletOut(null);

                setWalletOutError(
                    response?.message || "Couldn't load wallet debits."
                );
            }

            setWalletOutLoading(false);
        },
        []
    );

    const refetchWalletOut = useCallback(async () => {
        setWalletOutLoading(true);
        setWalletOutError(null);

        const response = await authGet(WALLET_FILTER_OUT_URL);

        applyWalletOut(response);
    }, [authGet, applyWalletOut]);

    /* ---------------------------------------------------------------- */
    /* WALLET — TOP-UP SYNC                                              */
    /* ---------------------------------------------------------------- */

    /**
     * A wallet top-up just succeeded. The home sidebar's "My Wallet" card
     * reads `balances`, so bump it locally first — the card updates in the
     * same tick as the success toast — and then pull the server balance.
     *
     * The backend credits the wallet while handling /api/payment/verify, but
     * /api/user/my-balances can answer before that write lands, so keep
     * pulling for a moment until the credited amount shows up.
     */
    const applyWalletTopUp = useCallback(
        async (amount: number) => {
            const credit = Number(amount);

            if (!Number.isFinite(credit) || credit <= 0) return;

            const base = Number(balancesRef.current?.wallet?.balance ?? 0);

            pendingWalletCreditRef.current = { amount: credit, base };

            /* Optimistic: the card shows the new amount right away. */
            setBalances((prev) => {
                if (!prev?.wallet) return prev;

                const balance = Number(prev.wallet.balance ?? 0) + credit;
                const next = {
                    ...prev,
                    wallet: {
                        ...prev.wallet,
                        balance,
                        formattedBalance: formatMoney(
                            balance,
                            prev.wallet.currency
                        ),
                    },
                };

                balancesRef.current = next;
                return next;
            });

            setWallet((prev) => {
                if (!prev?.wallet) return prev;

                const balance = Number(prev.wallet.balance ?? 0) + credit;

                return {
                    ...prev,
                    wallet: {
                        ...prev.wallet,
                        balance,
                        formattedBalance: formatMoney(
                            balance,
                            prev.wallet.currency
                        ),
                    },
                };
            });

            const expected = base + credit;

            for (let attempt = 0; attempt < 4; attempt++) {
                await Promise.all([refetchBalances(), refetchWallet()]);

                const server = serverWalletBalanceRef.current;

                /* Nothing to wait for, or the backend has caught up. */
                if (server === null || server + 0.01 >= expected) {
                    pendingWalletCreditRef.current = null;
                    return;
                }

                await new Promise((resolve) =>
                    setTimeout(resolve, 1500)
                );
            }
        },
        [refetchBalances, refetchWallet]
    );

    /* Paginated wallet fetch used by the My Wallet screen: the screen owns
       its filter/page state, so this returns the per-query payload instead
       of mutating shared state. */
    const fetchWallet = useCallback(
        async (query: WalletQuery): Promise<WalletData> => {
            const base =
                query.filter === "IN"
                    ? WALLET_FILTER_IN_URL
                    : query.filter === "OUT"
                        ? WALLET_FILTER_OUT_URL
                        : WALLET_URL;

            const separator = base.includes("?") ? "&" : "?";
            const response = await authGet(
                `${base}${separator}page=${query.page}&limit=${query.limit}`
            );

            if (response?.success && response.data) {
                return response.data as WalletData;
            }

            throw new Error(response?.message || "Could not load wallet");
        },
        [authGet]
    );

    /* ---------------------------------------------------------------- */
    /* ADD MONEY — POST /api/user/wallet/add-money                     */
    /* ---------------------------------------------------------------- */

    const addMoney = useCallback(
        async (payload: AddMoneyRequest): Promise<AddMoneyResponse | null> => {
            try {
                setAddMoneyLoading(true);
                setAddMoneyError(null);

                const response = await axios.post(ADD_MONEY_URL, payload, {
                    headers: authHeader(),
                });

                if (response.data?.success) {
                    await Promise.all([
                        refetchBalances(),
                        refetchWallet(),
                    ]);

                    return response.data as AddMoneyResponse;
                }

                const message =
                    response.data?.message || "Couldn't add money.";
                setAddMoneyError(message);

                return { success: false, message };
            } catch (err) {
                const message = axios.isAxiosError(err)
                    ? err.response?.data?.message ||
                    "Something went wrong while adding money."
                    : "Something went wrong while adding money.";
                setAddMoneyError(message);

                return { success: false, message };
            } finally {
                setAddMoneyLoading(false);
            }
        },
        [refetchBalances, refetchWallet]
    );

    /* ---------------------------------------------------------------- */
    /* DATE PLAN PACKAGES                                               */
    /* ---------------------------------------------------------------- */

    const applyDatePlans = useCallback(
        (response: DatePlansApiResponse | null) => {
            if (response?.success && response.data) {
                setDatePlans(response.data);
                setDatePlansError(null);
            } else {
                setDatePlans(null);

                setDatePlansError("Couldn't load date plan packages.");
            }

            setDatePlansLoading(false);
        },
        []
    );

    const refetchDatePlans = useCallback(async () => {
        setDatePlansLoading(true);
        setDatePlansError(null);

        const response = await authGet(DATEPLANS_URL);

        applyDatePlans(response);
    }, [authGet, applyDatePlans]);

    /* ---------------------------------------------------------------- */
    /* ADMIRERS — RECEIVED                                              */
    /* ---------------------------------------------------------------- */

    const applyAdmirerReceived = useCallback(
        (response: AdmirersResponse | null) => {
            if (response?.success && Array.isArray(response.data)) {
                setAdmirersReceived(response);
                setAdmirersReceivedError(null);
            } else {
                setAdmirersReceived(null);

                setAdmirersReceivedError(
                    response?.message ||
                    "Couldn't load admirers who liked you."
                );
            }

            setAdmirersReceivedLoading(false);
        },
        []
    );

    const refetchAdmirersReceived = useCallback(async () => {
        setAdmirersReceivedLoading(true);
        setAdmirersReceivedError(null);

        const response = await authGet(ADMIRER_RECEIVED);

        applyAdmirerReceived(response);
    }, [authGet, applyAdmirerReceived]);

    /* ---------------------------------------------------------------- */
    /* ADMIRERS — SENT                                                  */
    /* ---------------------------------------------------------------- */

    const applyAdmirerSent = useCallback(
        (response: AdmirersResponse | null) => {
            if (response?.success && Array.isArray(response.data)) {
                setAdmirersSent(response);
                setAdmirersSentError(null);
            } else {
                setAdmirersSent(null);

                setAdmirersSentError(
                    response?.message || "Couldn't load likes you sent."
                );
            }

            setAdmirersSentLoading(false);
        },
        []
    );

    const refetchAdmirersSent = useCallback(async () => {
        setAdmirersSentLoading(true);
        setAdmirersSentError(null);

        const response = await authGet(ADMIRER_SENT);

        applyAdmirerSent(response);
    }, [authGet, applyAdmirerSent]);

    /* ---------------------------------------------------------------- */
    /* SEND ROSE — POST /api/user/rose/send                             */
    /* ------------------------------------------------------------------ */

    const sendRose = useCallback(
        async (receiverId: string): Promise<SendRoseResponse | null> => {
            try {
                setSendRoseLoading(true);
                setSendRoseError(null);

                const payload: SendRoseRequest = { receiverId };
                const response = await axios.post(SEND_ROSE, payload, {
                    headers: authHeader(),
                });

                if (response.data?.success) {
                    /* A rose spends coins and shows up in the sent list. */
                    await Promise.all([
                        refetchBalances(),
                        refetchAdmirersSent(),
                    ]);

                    return response.data as SendRoseResponse;
                }

                const message =
                    response.data?.message || "Couldn't send the rose.";
                setSendRoseError(message);

                return { success: false, message };
            } catch (err) {
                const message = axios.isAxiosError(err)
                    ? err.response?.data?.message ||
                    "Something went wrong while sending the rose."
                    : "Something went wrong while sending the rose.";
                setSendRoseError(message);

                return { success: false, message };
            } finally {
                setSendRoseLoading(false);
            }
        },
        [refetchBalances, refetchAdmirersSent]
    );

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
            console.log("Sending Data : ", data)
            const response = await axios.patch(
                FAMILY_SAVE_URL,
                data,
                {
                    headers: authHeader(),
                }
            );
            console.log("Response Data : ", response)
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

    /* Guards against state updates after unmount. */
    const alive = useRef(true);
    useEffect(() => {
        alive.current = true;
        return () => {
            alive.current = false;
        };
    }, []);

    /* True once a load has run with a session. A token-less call leaves it
       clear, so `ensureLoaded` can retry after login. */
    const loaded = useRef(false);

    /**
     * The one-off full load, shared by the mount effect and `ensureLoaded`.
     * No session means "not loaded" rather than "empty", so it stays retryable.
     */
    const loadAll = useCallback(() => {
        if (loaded.current) return;
        if (!getClientToken()) return;
        loaded.current = true;

        void (async () => {
            const [
                dashboardResponse,
                historyResponse,
                religionResponse,
                languagesResponse,
                balancesResponse,
                rosesResponse,
                complimentsResponse,
                boostsResponse,
                superBoostsResponse,
                walletResponse,
                walletInResponse,
                walletOutResponse,
                datePlansResponse,
                admirersReceivedResponse,
                admirersSentResponse,
            ] = await Promise.all([
                authGet(REFERRAL_DASHBOARD_URL),
                authGet(REFERRAL_HISTORY_URL),
                authGet(RELIGION_URL),
                authGet(LANGUAGES_URL),
                authGet(MY_BALANCES_URL),
                authGet(ROSES_URL),
                authGet(COMPLIMENTS_URL),
                authGet(BOOSTS_URL),
                authGet(SUPER_BOOSTS_URL),
                authGet(WALLET_URL),
                authGet(WALLET_FILTER_IN_URL),
                authGet(WALLET_FILTER_OUT_URL),
                authGet(DATEPLANS_URL),
                authGet(ADMIRER_RECEIVED),
                authGet(ADMIRER_SENT),
            ]);

            if (!alive.current) return;

            applyReferralDashboard(dashboardResponse);
            applyReferralHistory(historyResponse);
            applyReligions(religionResponse);
            applyLanguages(languagesResponse);
            applyBalances(balancesResponse);
            applyRoses(rosesResponse);
            applyCompliments(complimentsResponse);
            applyBoosts(boostsResponse);
            applySuperBoosts(superBoostsResponse);
            applyWallet(walletResponse);
            applyWalletIn(walletInResponse);
            applyWalletOut(walletOutResponse);
            applyDatePlans(datePlansResponse);
            applyAdmirerReceived(admirersReceivedResponse);
            applyAdmirerSent(admirersSentResponse);
        })();
    }, [
        authGet,
        applyReferralDashboard,
        applyReferralHistory,
        applyReligions,
        applyLanguages,
        applyBalances,
        applyRoses,
        applyCompliments,
        applyBoosts,
        applySuperBoosts,
        applyWallet,
        applyWalletIn,
        applyWalletOut,
        applyDatePlans,
        applyAdmirerReceived,
        applyAdmirerSent,
    ]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const ensureLoaded = useCallback(() => {
        loadAll();
    }, [loadAll]);

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
            applyWalletTopUp,
            ensureLoaded,

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

            /* Purchase stores */
            roses,
            rosesLoading,
            rosesError,
            refetchRoses,

            compliments,
            complimentsLoading,
            complimentsError,
            refetchCompliments,

            /* Boosts + Super boosts */
            boosts,
            boostsLoading,
            boostsError,
            refetchBoosts,

            superBoosts,
            superBoostsLoading,
            superBoostsError,
            refetchSuperBoosts,

            /* Wallet */
            wallet,
            walletLoading,
            walletError,
            refetchWallet,

            walletIn,
            walletInLoading,
            walletInError,
            refetchWalletIn,

            walletOut,
            walletOutLoading,
            walletOutError,
            refetchWalletOut,

            fetchWallet,

            /* Add money */
            addMoney,
            addMoneyLoading,
            addMoneyError,

            /* Date plans */
            datePlans,
            datePlansLoading,
            datePlansError,
            refetchDatePlans,

            /* Admirers */
            admirersReceived,
            admirersReceivedLoading,
            admirersReceivedError,
            refetchAdmirersReceived,

            admirersSent,
            admirersSentLoading,
            admirersSentError,
            refetchAdmirersSent,

            sendRose,
            sendRoseLoading,
            sendRoseError,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [
            balances,
            balancesLoading,
            balancesError,
            refetchBalances,
            applyWalletTopUp,
            ensureLoaded,

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

            roses,
            rosesLoading,
            rosesError,
            refetchRoses,

            compliments,
            complimentsLoading,
            complimentsError,
            refetchCompliments,

            boosts,
            boostsLoading,
            boostsError,
            refetchBoosts,

            superBoosts,
            superBoostsLoading,
            superBoostsError,
            refetchSuperBoosts,

            wallet,
            walletLoading,
            walletError,
            refetchWallet,

            walletIn,
            walletInLoading,
            walletInError,
            refetchWalletIn,

            walletOut,
            walletOutLoading,
            walletOutError,
            refetchWalletOut,

            fetchWallet,

            addMoney,
            addMoneyLoading,
            addMoneyError,

            datePlans,
            datePlansLoading,
            datePlansError,
            refetchDatePlans,

            admirersReceived,
            admirersReceivedLoading,
            admirersReceivedError,
            refetchAdmirersReceived,

            admirersSent,
            admirersSentLoading,
            admirersSentError,
            refetchAdmirersSent,

            sendRose,
            sendRoseLoading,
            sendRoseError,
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
