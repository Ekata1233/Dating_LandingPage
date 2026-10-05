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

import type { FieldDef, FieldOption } from "../onBoarding/stepSchemas";

const INTENTION_URL = `${API_BASE_URL}/api/onboarding/intention/get`;
const LIFESTYLE_URL = `${API_BASE_URL}/api/question/fetch?category=DATING&screen=LIFESTYLE`;
const PROFESSION_URL = `${API_BASE_URL}/api/onboarding/professions/get`;
const EXPERIENCE_URL = `${API_BASE_URL}/api/onboarding/experiences/get`;
const EMPLOYMENT_TYPE_URL = `${API_BASE_URL}/api/onboarding/employment-type/get`;
const SALARY_RANGE_URL = `${API_BASE_URL}/api/onboarding/salary-ranges/get`;
const AMBITION_URL = `${API_BASE_URL}/api/admin/ambitions/get`;
const INTERESTS_URL = `${API_BASE_URL}/api/question/fetch?category=DATING&screen=THINGS_U_LOVE`;
const ONBOARDING_DETAILS_URL = `${API_BASE_URL}/api/user/onboarding-details`;
const PROMPTS_URL = `${API_BASE_URL}/api/onboarding/prompt/get`;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface IntentionOptionApi {
    id: string;
    option: string;
    optDescription?: string;
    intentionId: string;
}

/** One question group. The endpoint returns a list; onboarding renders the first. */
export interface IntentionQuestionApi {
    id: string;
    title: string;
    description: string;
    sortOrder: number;
    isActive: boolean;
    options: IntentionOptionApi[];
}

export interface IntentionQuestion {
    title: string;
    subtitle: string;
    options: FieldOption[];
}

// used for interests as well
export interface LifestyleOptionApi {
    id: string;
    question_id: string;
    value: string;
    label: string;
    created_at: string;
}

/** One lifestyle question (drinking, smoking, workout, ...). The endpoint returns a list of these. */
export interface LifestyleQuestionApi {
    id: string;
    key: string;
    title: string;
    category: string;
    isMulti: boolean;
    screen: string;
    created_at: string;
    updated_at: string;
    options: LifestyleOptionApi[];
}

/** UI-facing shape, after mapping the API response. */
export interface LifestyleQuestion {
    id: string;
    key: string;
    title: string;
    isMulti: boolean;
    options: FieldOption[];
}

/** One profession row, as returned by the professions endpoint. */
export interface ProfessionApi {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Row shape shared by the simple "pick one from a list" endpoints
 * (experiences, employment types, salary ranges, ambitions). Same as the
 * professions row, with `label` / `title` accepted as fallbacks for the
 * display text.
 */
export interface NamedOptionApi {
    id: number | string;
    name?: string;
    label?: string;
    title?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
/** One prompt row as returned by GET /api/onboarding/prompt/get. */
export interface PromptApi {
    id: string;
    categoryId: string;
    question: string;
    active: boolean;
    priority: number;
    maxLength: number;
    visibility: string;
    createdAt: string;
    updatedAt: string;
}

/** One category, with its prompts nested, exactly as the endpoint sends it. */
export interface PromptCategoryApi {
    id: string;
    name: string;
    description: string | null;
    priority: number;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    prompts: PromptApi[];
}

/**
 * What the prompts step renders: the question and how much may be typed into it.
 * The id is what the save endpoint takes back, so it has to survive the mapping.
 */
export interface PromptItem {
    id: string;
    question: string;
    maxLength: number;
}

/** The picker only ever draws these three things off a category. */
export interface PromptCategory {
    id: string;
    name: string;
    prompts: PromptItem[];
}

/** Envelope of GET /api/onboarding/prompt/get. */
export interface PromptCategoriesResponse {
    success?: boolean;
    message?: string;
    data?: PromptCategoryApi[];
}
/* ------------------------------------------------------------------ */
/*  GET /api/user/onboarding-details                                  */
/* ------------------------------------------------------------------ */

/** One photo already stored on the server. `id` is what the delete endpoint needs. */
export interface OnboardingPhotoApi {
    id: string;
    mediaUrl: string;
    mediaType: "IMAGE" | "VIDEO";
    isPrimary: boolean;
    order: number;
}

/** One saved answer, either a lifestyle or an interest question. */
export interface OnboardingAnswerApi {
    answerId: string;
    question: {
        id: string;
        key: string;
        title: string;
        category: string;
        screen: string;
        isMulti: boolean;
    };
    option: {
        id: string;
        value: string;
        label: string;
    };
    description: string | null;
    createdAt: string;
}

/**
 * Everything the profile already holds, grouped by the flow that owns it. The
 * group keys are the endpoint's, so `flows.PHOTOS` is the list the photos step
 * renders and `flows.REVIEW_FINISH.onboardingStep` says where the flow resumes.
 */
export interface OnboardingDetailsApi {
    userId: string;
    flows: {
        VERIFY_PHONE?: { phoneNumber: string; isPhoneVerified: boolean };
        BASIC_INFO?: {
            fullName: string;
            email: string;
            dateOfBirth: string;
            height: number;
            gender: string;
            genderOption: string;
        };
        INTERESTED_IN?: { interestedIn: string };
        LOOKING_FOR?: {
            intention?: {
                id: string;
                option: string;
                intentionId: string;
            };
        };
        LIFESTYLE?: OnboardingAnswerApi[];
        CAREER_AMBITION?: Record<string, unknown>;
        INTEREST?: OnboardingAnswerApi[];
        PHOTOS?: OnboardingPhotoApi[];
        STORY?: { bio: string };
        PROMPT?: unknown[];
        LOCATION?: Record<string, unknown>;
        REVIEW_FINISH?: {
            profileCompletion: number;
            onboardingStep: string;
            nextStep: string;
            onboardingCompleted: boolean;
        };
    };
}

export interface OnboardingDetailsResponse {
    success: boolean;
    message?: string;
    data?: OnboardingDetailsApi;
}

export interface ProfileDetailsSource {
    /** `null` until the request succeeds, and forever without a token. */
    details: OnboardingDetailsApi | null;
    /** Photos in server order, always an array so callers never branch on null. */
    photos: OnboardingPhotoApi[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export interface PromptCategoriesSource {
    /** Active categories with their active prompts, in the order the API sends them. */
    categories: PromptCategory[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export interface OnBoardingDataState {
    intentions: {
        question: IntentionQuestion | null;
        /** Always an array, so consumers never branch on null. */
        options: FieldOption[];
        loading: boolean;
        error: string | null;
        refetch: () => Promise<void>;
    };
    lifestyle: {
        questions: LifestyleQuestion[];
        loading: boolean;
        error: string | null;
        refetch: () => Promise<void>;
    };
    professions: {
        /** Always an array, so consumers never branch on null. */
        options: FieldOption[];
        loading: boolean;
        error: string | null;
        refetch: () => Promise<void>;
    };
    experiences: {
        /** Always an array, so consumers never branch on null. */
        options: FieldOption[];
        loading: boolean;
        error: string | null;
        refetch: () => Promise<void>;
    };
    employmentTypes: {
        /** Always an array, so consumers never branch on null. */
        options: FieldOption[];
        loading: boolean;
        error: string | null;
        refetch: () => Promise<void>;
    };
    salaryRanges: {
        /** Always an array, so consumers never branch on null. */
        options: FieldOption[];
        loading: boolean;
        error: string | null;
        refetch: () => Promise<void>;
    };
    ambitions: {
        /** Always an array, so consumers never branch on null. */
        options: FieldOption[];
        loading: boolean;
        error: string | null;
        refetch: () => Promise<void>;
    };
    /**
     * Same endpoint and response shape as lifestyle, just a different `screen`
     * (THINGS_U_LOVE), so it reuses `LifestyleQuestion` and its mapper.
     */
    interests: {
        questions: LifestyleQuestion[];
        loading: boolean;
        error: string | null;
        refetch: () => Promise<void>;
    };
    /**
     * The prompt catalogue, grouped by category. A public endpoint, so unlike
     * `profileDetails` it is asked for regardless of who is signed in.
     */
    prompts: PromptCategoriesSource;
    /**
     * The signed-in user's saved profile, refetched after every step save so the
     * ids the server owns stay in step with what the flow just wrote. Never
     * requested without a token.
     */
    profileDetails: ProfileDetailsSource;
}

/* ------------------------------------------------------------------ */
/*  Helpers / mappers                                                  */
/* ------------------------------------------------------------------ */

/**
 * The endpoint stores these strings double-encoded, so `"What kind of love are
 * you ready for?"` arrives wrapped in literal quote characters. Strip one pair
 * so the UI does not render the escaping. Remove once the API stops sending it.
 */
function unquote(value: string): string {
    const trimmed = value.trim();

    if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.slice(1, -1);
    }

    return trimmed;
}

/** Flattens the first question group into the shapes the onboarding UI already speaks. */
function toIntentionQuestion(data: IntentionQuestionApi[]): IntentionQuestion {
    const first = data[0];

    return {
        title: unquote(first?.title ?? ""),
        subtitle: unquote(first?.description ?? ""),
        options: (first?.options ?? []).map((option) => ({
            // The save endpoint expects the option uuid back.
            value: option.id,
            label: unquote(option.option),
            description: option.optDescription
                ? unquote(option.optDescription)
                : undefined,
        })),
    };
}

/** Lifestyle returns every question, so all are kept. `key` becomes the form field name. */
function toLifestyleQuestions(data: LifestyleQuestionApi[]): LifestyleQuestion[] {
    return data.map((question) => ({
        id: question.id,
        key: question.key,
        title: unquote(question.title),
        isMulti: question.isMulti,
        options: (question.options ?? []).map((option) => ({
            value: option.id,
            label: unquote(option.label),
        })),
    }));
}

/**
 * Active professions only, in the order the API sends them (it already puts
 * "Other" and "Prefer not to say" last). The numeric id is stringified because
 * `FieldOption.value` is a string; the save endpoint gets it back as the id.
 */
function toProfessionOptions(data: ProfessionApi[]): FieldOption[] {
    return data
        .filter((profession) => profession.isActive)
        .map((profession) => ({
            value: String(profession.id),
            label: unquote(profession.name),
        }));
}

/** Used when a prompt comes back without a usable `maxLength`. */
const PROMPT_FALLBACK_MAX_LENGTH = 200;

/**
 * The prompt catalogue. Everything the picker draws is here, so inactive
 * categories and inactive questions are dropped rather than offered and then
 * rejected by the save endpoint. Order is left as the API sends it, which is
 * already by `priority`. `maxLength` falls back to 200 — the value the endpoint
 * uses everywhere — so the counter never shows a blank limit.
 */
function toPromptCategories(data: PromptCategoryApi[]): PromptCategory[] {
    return data
        .filter((category) => category.active !== false)
        .map((category) => ({
            id: category.id,
            name: category.name,
            prompts: (category.prompts ?? [])
                .filter((prompt) => prompt.active !== false)
                .map((prompt) => ({
                    id: prompt.id,
                    question: prompt.question,
                    maxLength: prompt.maxLength || PROMPT_FALLBACK_MAX_LENGTH,
                })),
        }));
}

/**
 * Generic mapper for the simple option lists. Skips inactive rows (a missing
 * `isActive` counts as active), keeps the API order, and stringifies the id so
 * it fits `FieldOption.value`.
 */
function toNamedOptions(data: NamedOptionApi[]): FieldOption[] {
    return data
        .filter((item) => item.isActive !== false)
        .map((item) => ({
            value: String(item.id),
            label: unquote(item.name ?? item.label ?? item.title ?? String(item.id)),
        }));
}

/**
 * Turns an API question into a renderable schema field. The question's `key`
 * becomes the form field name, so the lifestyle step is driven entirely by the
 * endpoint.
 */
export function toLifestyleField(question: LifestyleQuestion): FieldDef {
    return {
        name: question.key,
        label: question.title,
        kind: question.isMulti ? "multi" : "radio",
        required: false,
        skippable: true,
        options: question.options,
    };
}

/**
 * Interests are capped across the whole step, not per question — otherwise N
 * questions would buy N × the limit. The step owns both numbers; the field
 * mapper deliberately does not set `min`/`max`, because a per-field cap cannot
 * express a shared budget.
 */
export const INTERESTS_MIN = 5;
export const INTERESTS_MAX = 10;

/**
 * Same idea as `toLifestyleField`, but for the interests screen. The question's
 * `key` is the form field name, so the ids the save endpoint wants come along
 * for free.
 */
export function toInterestsField(question: LifestyleQuestion): FieldDef {
    return {
        name: question.key,
        label: question.title,
        kind: question.isMulti ? "multi" : "radio",
        options: question.options,
    };
}

/** GET with auth. Never throws: a failed request resolves to `null`. */
async function authGet(url: string) {
    try {
        const response = await axios.get(url, { headers: authHeader() });
        return response.data;
    } catch (err) {
        console.error("OnBoardingData fetch error:", url, err);
        return null;
    }
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const OnBoardingDataContext = createContext<OnBoardingDataState>({
    intentions: {
        question: null,
        options: [],
        loading: true,
        error: null,
        refetch: async () => { },
    },
    lifestyle: {
        questions: [],
        loading: true,
        error: null,
        refetch: async () => { },
    },
    professions: {
        options: [],
        loading: true,
        error: null,
        refetch: async () => { },
    },
    experiences: {
        options: [],
        loading: true,
        error: null,
        refetch: async () => { },
    },
    employmentTypes: {
        options: [],
        loading: true,
        error: null,
        refetch: async () => { },
    },
    salaryRanges: {
        options: [],
        loading: true,
        error: null,
        refetch: async () => { },
    },
    ambitions: {
        options: [],
        loading: true,
        error: null,
        refetch: async () => { },
    },
    interests: {
        questions: [],
        loading: true,
        error: null,
        refetch: async () => { },
    },
    prompts: {
        categories: [],
        loading: true,
        error: null,
        refetch: async () => { },
    },
    profileDetails: {
        details: null,
        photos: [],
        loading: true,
        error: null,
        refetch: async () => { },
    },
});

export function OnBoardingDataProvider({ children }: { children: React.ReactNode }) {
    const [intention, setIntention] = useState<IntentionQuestion | null>(null);
    const [intentionsLoading, setIntentionsLoading] = useState(true);
    const [intentionsError, setIntentionsError] = useState<string | null>(null);

    const [lifestyle, setLifestyle] = useState<LifestyleQuestion[]>([]);
    const [lifestyleLoading, setLifestyleLoading] = useState(true);
    const [lifestyleError, setLifestyleError] = useState<string | null>(null);

    const [professions, setProfessions] = useState<FieldOption[]>([]);
    const [professionsLoading, setProfessionsLoading] = useState(true);
    const [professionsError, setProfessionsError] = useState<string | null>(null);

    const [experiences, setExperiences] = useState<FieldOption[]>([]);
    const [experiencesLoading, setExperiencesLoading] = useState(true);
    const [experiencesError, setExperiencesError] = useState<string | null>(null);

    const [employmentTypes, setEmploymentTypes] = useState<FieldOption[]>([]);
    const [employmentTypesLoading, setEmploymentTypesLoading] = useState(true);
    const [employmentTypesError, setEmploymentTypesError] = useState<string | null>(null);

    const [salaryRanges, setSalaryRanges] = useState<FieldOption[]>([]);
    const [salaryRangesLoading, setSalaryRangesLoading] = useState(true);
    const [salaryRangesError, setSalaryRangesError] = useState<string | null>(null);

    const [ambitions, setAmbitions] = useState<FieldOption[]>([]);
    const [ambitionsLoading, setAmbitionsLoading] = useState(true);
    const [ambitionsError, setAmbitionsError] = useState<string | null>(null);

    const [interests, setInterests] = useState<LifestyleQuestion[]>([]);
    const [interestsLoading, setInterestsLoading] = useState(true);
    const [interestsError, setInterestsError] = useState<string | null>(null);

    const [profileDetails, setProfileDetails] = useState<OnboardingDetailsApi | null>(null);
    const [profileDetailsLoading, setProfileDetailsLoading] = useState(true);
    const [profileDetailsError, setProfileDetailsError] = useState<string | null>(null);

    const [promptCategories, setPromptCategories] = useState<PromptCategory[]>([]);
    const [promptsLoading, setPromptsLoading] = useState(true);
    const [promptsError, setPromptsError] = useState<string | null>(null);

    const applyIntentions = useCallback((res: any) => {
        if (res?.success && res.data) {
            setIntention(toIntentionQuestion(res.data as IntentionQuestionApi[]));
            setIntentionsError(null);
        } else {
            setIntention(null);
            setIntentionsError(res?.message || "Couldn't load intentions.");
        }

        setIntentionsLoading(false);
    }, []);

    const applyLifestyle = useCallback((res: any) => {
        if (res?.success && res.data) {
            setLifestyle(toLifestyleQuestions(res.data as LifestyleQuestionApi[]));
            setLifestyleError(null);
        } else {
            setLifestyle([]);
            setLifestyleError(res?.message || "Couldn't load lifestyle questions.");
        }

        setLifestyleLoading(false);
    }, []);

    const applyProfessions = useCallback((res: any) => {
        if (res?.success && res.data) {
            setProfessions(toProfessionOptions(res.data as ProfessionApi[]));
            setProfessionsError(null);
        } else {
            setProfessions([]);
            setProfessionsError(res?.message || "Couldn't load professions.");
        }

        setProfessionsLoading(false);
    }, []);

    const applyExperiences = useCallback((res: any) => {
        if (res?.success && res.data) {
            setExperiences(toNamedOptions(res.data as NamedOptionApi[]));
            setExperiencesError(null);
        } else {
            setExperiences([]);
            setExperiencesError(res?.message || "Couldn't load experiences.");
        }

        setExperiencesLoading(false);
    }, []);

    const applyEmploymentTypes = useCallback((res: any) => {
        if (res?.success && res.data) {
            setEmploymentTypes(toNamedOptions(res.data as NamedOptionApi[]));
            setEmploymentTypesError(null);
        } else {
            setEmploymentTypes([]);
            setEmploymentTypesError(res?.message || "Couldn't load employment types.");
        }

        setEmploymentTypesLoading(false);
    }, []);

    const applySalaryRanges = useCallback((res: any) => {
        if (res?.success && res.data) {
            setSalaryRanges(toNamedOptions(res.data as NamedOptionApi[]));
            setSalaryRangesError(null);
        } else {
            setSalaryRanges([]);
            setSalaryRangesError(res?.message || "Couldn't load salary ranges.");
        }

        setSalaryRangesLoading(false);
    }, []);

    const applyAmbitions = useCallback((res: any) => {
        if (res?.success && res.data) {
            setAmbitions(toNamedOptions(res.data as NamedOptionApi[]));
            setAmbitionsError(null);
        } else {
            setAmbitions([]);
            setAmbitionsError(res?.message || "Couldn't load ambitions.");
        }

        setAmbitionsLoading(false);
    }, []);

    const applyInterests = useCallback((res: any) => {
        if (res?.success && res.data) {
            setInterests(toLifestyleQuestions(res.data as LifestyleQuestionApi[]));
            setInterestsError(null);
        } else {
            setInterests([]);
            setInterestsError(res?.message || "Couldn't load interests.");
        }

        setInterestsLoading(false);
    }, []);

    const applyPromptCategories = useCallback((res: PromptCategoriesResponse | null) => {
        if (res?.success && res.data) {
            setPromptCategories(toPromptCategories(res.data));
            setPromptsError(null);
        } else {
            setPromptCategories([]);
            setPromptsError(res?.message || "Couldn't load prompts.");
        }

        setPromptsLoading(false);
    }, []);

    const refetchIntentions = useCallback(async (): Promise<void> => {
        setIntentionsLoading(true);
        setIntentionsError(null);

        applyIntentions(await authGet(INTENTION_URL));
    }, [applyIntentions]);

    const refetchLifestyle = useCallback(async (): Promise<void> => {
        setLifestyleLoading(true);
        setLifestyleError(null);

        applyLifestyle(await authGet(LIFESTYLE_URL));
    }, [applyLifestyle]);

    const refetchProfessions = useCallback(async (): Promise<void> => {
        setProfessionsLoading(true);
        setProfessionsError(null);

        applyProfessions(await authGet(PROFESSION_URL));
    }, [applyProfessions]);

    const refetchExperiences = useCallback(async (): Promise<void> => {
        setExperiencesLoading(true);
        setExperiencesError(null);

        applyExperiences(await authGet(EXPERIENCE_URL));
    }, [applyExperiences]);

    const refetchEmploymentTypes = useCallback(async (): Promise<void> => {
        setEmploymentTypesLoading(true);
        setEmploymentTypesError(null);

        applyEmploymentTypes(await authGet(EMPLOYMENT_TYPE_URL));
    }, [applyEmploymentTypes]);

    const refetchSalaryRanges = useCallback(async (): Promise<void> => {
        setSalaryRangesLoading(true);
        setSalaryRangesError(null);

        applySalaryRanges(await authGet(SALARY_RANGE_URL));
    }, [applySalaryRanges]);

    const refetchAmbitions = useCallback(async (): Promise<void> => {
        setAmbitionsLoading(true);
        setAmbitionsError(null);

        applyAmbitions(await authGet(AMBITION_URL));
    }, [applyAmbitions]);

    const refetchInterests = useCallback(async (): Promise<void> => {
        setInterestsLoading(true);
        setInterestsError(null);

        applyInterests(await authGet(INTERESTS_URL));
    }, [applyInterests]);

    const refetchPrompts = useCallback(async (): Promise<void> => {
        setPromptsLoading(true);
        setPromptsError(null);

        applyPromptCategories(await authGet(PROMPTS_URL));
    }, [applyPromptCategories]);

    /* ---------------------------------------------------------------- */
    /* ONBOARDING DETAILS — the signed-in user's saved profile          */
    /* ---------------------------------------------------------------- */

    const applyProfileDetails = useCallback((res: OnboardingDetailsResponse | null) => {
        if (res?.success && res.data?.userId) {
            setProfileDetails(res.data);
            setProfileDetailsError(null);
        } else {
            setProfileDetails(null);
            setProfileDetailsError(res?.message || "Couldn't load your details.");
        }

        setProfileDetailsLoading(false);
    }, []);

    /**
     * Called after every step save, so the ids the server owns — a photo's,
     * above all — never go stale after the flow writes one.
     */
    const refetchProfileDetails = useCallback(async (): Promise<void> => {
        /* Same guard as the users feed: with no token in the cookie there is
           nothing to ask for, and the request would only come back 401. */
        if (!getClientToken()) {
            setProfileDetails(null);
            setProfileDetailsError(null);
            setProfileDetailsLoading(false);
            return;
        }

        setProfileDetailsLoading(true);
        setProfileDetailsError(null);

        applyProfileDetails(await authGet(ONBOARDING_DETAILS_URL));
    }, [applyProfileDetails]);

    /* First load happens in the batched effect below, alongside the option lists. */

    // All GET APIs are called once, together.
    useEffect(() => {
        let alive = true;

        (async () => {
            /* The onboarding details are the user's own profile, so they need a
               session: without a token in the cookie there is nothing to ask
               for and the request would only come back 401. */
            const token = getClientToken();

            const [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10] = await Promise.all([
                authGet(INTENTION_URL),
                authGet(LIFESTYLE_URL),
                authGet(PROFESSION_URL),
                authGet(EXPERIENCE_URL),
                authGet(EMPLOYMENT_TYPE_URL),
                authGet(SALARY_RANGE_URL),
                authGet(AMBITION_URL),
                authGet(INTERESTS_URL),
                token ? authGet(ONBOARDING_DETAILS_URL) : null,
                authGet(PROMPTS_URL),
            ]);

            if (!alive) return;

            applyIntentions(r1);
            applyLifestyle(r2);
            applyProfessions(r3);
            applyExperiences(r4);
            applyEmploymentTypes(r5);
            applySalaryRanges(r6);
            applyAmbitions(r7);
            applyInterests(r8);
            applyPromptCategories(r10);

            if (token) {
                applyProfileDetails(r9);
            } else {
                /* Never asked, so never an error — just nothing to show. */
                setProfileDetails(null);
                setProfileDetailsError(null);
                setProfileDetailsLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [
        applyIntentions,
        applyLifestyle,
        applyProfessions,
        applyExperiences,
        applyEmploymentTypes,
        applySalaryRanges,
        applyAmbitions,
        applyInterests,
        applyPromptCategories,
        applyProfileDetails,
    ]);

    const value = useMemo<OnBoardingDataState>(
        () => ({
            intentions: {
                question: intention,
                options: intention?.options ?? [],
                loading: intentionsLoading,
                error: intentionsError,
                refetch: refetchIntentions,
            },
            lifestyle: {
                questions: lifestyle,
                loading: lifestyleLoading,
                error: lifestyleError,
                refetch: refetchLifestyle,
            },
            professions: {
                options: professions,
                loading: professionsLoading,
                error: professionsError,
                refetch: refetchProfessions,
            },
            experiences: {
                options: experiences,
                loading: experiencesLoading,
                error: experiencesError,
                refetch: refetchExperiences,
            },
            employmentTypes: {
                options: employmentTypes,
                loading: employmentTypesLoading,
                error: employmentTypesError,
                refetch: refetchEmploymentTypes,
            },
            salaryRanges: {
                options: salaryRanges,
                loading: salaryRangesLoading,
                error: salaryRangesError,
                refetch: refetchSalaryRanges,
            },
            ambitions: {
                options: ambitions,
                loading: ambitionsLoading,
                error: ambitionsError,
                refetch: refetchAmbitions,
            },
            interests: {
                questions: interests,
                loading: interestsLoading,
                error: interestsError,
                refetch: refetchInterests,
            },
            prompts: {
                categories: promptCategories,
                loading: promptsLoading,
                error: promptsError,
                refetch: refetchPrompts,
            },
            profileDetails: {
                details: profileDetails,
                photos: profileDetails?.flows?.PHOTOS ?? [],
                loading: profileDetailsLoading,
                error: profileDetailsError,
                refetch: refetchProfileDetails,
            },
        }),
        [
            intention,
            intentionsLoading,
            intentionsError,
            refetchIntentions,
            lifestyle,
            lifestyleLoading,
            lifestyleError,
            refetchLifestyle,
            professions,
            professionsLoading,
            professionsError,
            refetchProfessions,
            experiences,
            experiencesLoading,
            experiencesError,
            refetchExperiences,
            employmentTypes,
            employmentTypesLoading,
            employmentTypesError,
            refetchEmploymentTypes,
            salaryRanges,
            salaryRangesLoading,
            salaryRangesError,
            refetchSalaryRanges,
            ambitions,
            ambitionsLoading,
            ambitionsError,
            refetchAmbitions,
            interests,
            interestsLoading,
            interestsError,
            refetchInterests,
            promptCategories,
            promptsLoading,
            promptsError,
            refetchPrompts,
            profileDetails,
            profileDetailsLoading,
            profileDetailsError,
            refetchProfileDetails,
        ]
    );

    return (
        <OnBoardingDataContext.Provider value={value}>
            {children}
        </OnBoardingDataContext.Provider>
    );
}

export function useOnBoardingData() {
    return useContext(OnBoardingDataContext);
}

/* ------------------------------------------------------------------ */
/*  Career selects                                                     */
/* ------------------------------------------------------------------ */

/**
 * The five career dropdowns, each fed by its own endpoint. The strings are the
 * form field names they satisfy, so this list is the only place that says which
 * fetch belongs to which field — the step and the review summary both read it.
 */
export type CareerFieldName =
    | "profession"
    | "employmentType"
    | "experience"
    | "salaryRange"
    | "ambition";

const CAREER_FIELD_NAMES: readonly CareerFieldName[] = [
    "profession",
    "employmentType",
    "experience",
    "salaryRange",
    "ambition",
];

/** Narrows a schema field name to one of the API-backed career selects. */
export function isCareerField(name: string): name is CareerFieldName {
    return (CAREER_FIELD_NAMES as readonly string[]).includes(name);
}

export interface CareerOptionSource {
    options: FieldOption[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Per-field view of the career option lists, so a consumer can render one
 * dropdown without knowing which endpoint backs it.
 */
export function useCareerOptionSources(): Record<CareerFieldName, CareerOptionSource> {
    const { professions, employmentTypes, experiences, salaryRanges, ambitions } =
        useOnBoardingData();

    return useMemo(
        () => ({
            profession: professions,
            employmentType: employmentTypes,
            experience: experiences,
            salaryRange: salaryRanges,
            ambition: ambitions,
        }),
        [professions, employmentTypes, experiences, salaryRanges, ambitions]
    );
}

/* ------------------------------------------------------------------ */
/*  Prompts                                                            */
/* ------------------------------------------------------------------ */

/**
 * The prompt catalogue for the prompts step. Kept as its own selector because
 * the step only ever needs the categories, not the rest of the onboarding data.
 */
export function usePromptCategories(): PromptCategoriesSource {
    return useOnBoardingData().prompts;
}
