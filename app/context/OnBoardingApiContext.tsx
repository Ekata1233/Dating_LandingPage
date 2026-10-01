// Saare On Boarding steps ka save endpoint
"use client";
import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/utils/api";
import { authHeader } from "@/utils/token";

/* ------------------------------------------------------------------ */
/* API URLs                                                           */
/* ------------------------------------------------------------------ */

const BASIC_INFO_URL = `${API_BASE_URL}/api/user/profile/basic-info`;
const INTERESTED_IN_URL = `${API_BASE_URL}/api/user/profile/interested-in`;
const INTENTIONS_URL = `${API_BASE_URL}/api/user/profile/looking-for`;
const LIFESTYLE_URL = `${API_BASE_URL}/api/user/profile/answer`;
/* Same endpoint as lifestyle — one PATCH per question, the question's screen
   decides which bucket the answer lands in. */
const INTERESTS_URL = `${API_BASE_URL}/api/user/profile/answer`;
const CAREER_URL = `${API_BASE_URL}/api/user/edit-profile/education-work`;

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface BasicInfoRequest {
    fullName: string;
    email: string;
    birth_date: string;
    height: number;
    gender: string;
    gender_option: string;
}

export interface InterestedInRequest {
    interested_in: string;
    sexual_orientation: string;
}
export interface IntentionsRequest {
    optionId: string;
}
export interface LifestyleRequest {
    questionId: string;
    optionIds: string[];
}

/** Identical shape to `LifestyleRequest` — the endpoint and body are the same. */
export interface InterestsRequest {
    questionId: string;
    optionIds: string[];
}

/** `*Id` fields are the option ids from the career list endpoints; `null` means unanswered. */
export interface CareerRequest {
    highestEdu: string | null;
    degree: string | null;
    collegeName: string | null;
    graduationYear: number | null;
    professionId: number | null;
    companyName: string | null;
    employmentTypeId: number | null;
    experienceId: number | null;
    ambitionId: number | null;
    salaryRangeId: number | null;
    bigDreams: string | null;
}

export interface ProfileResponse {
    success: boolean;
    message?: string;
    data?: unknown;
}

/* ------------------------------------------------------------------ */
/* Context Type                                                       */
/* ------------------------------------------------------------------ */

interface ProfileContextData {
    updateBasicInfo: (
        data: BasicInfoRequest
    ) => Promise<ProfileResponse | null>;

    updateInterestedIn: (
        data: InterestedInRequest
    ) => Promise<ProfileResponse | null>;
    updateIntentions: (
        data: IntentionsRequest
    ) => Promise<ProfileResponse | null>;
    updateLifestyle: (
        data: LifestyleRequest
    ) => Promise<ProfileResponse | null>;

    updateCareer: (
        data: CareerRequest
    ) => Promise<ProfileResponse | null>;

    updateInterests: (
        data: InterestsRequest
    ) => Promise<ProfileResponse | null>;

    basicInfoLoading: boolean;
    interestedInLoading: boolean;
    intentionsLoading: boolean;
    lifestyleLoading: boolean;
    careerLoading: boolean;
    interestsLoading: boolean;

    basicInfoError: string | null;
    interestedInError: string | null;
    intentionsError: string | null;
    lifestyleError: string | null;
    careerError: string | null;
    interestsError: string | null;
}

/* ------------------------------------------------------------------ */
/* Context                                                            */
/* ------------------------------------------------------------------ */

const ProfileContext = createContext<ProfileContextData>({
    updateBasicInfo: async () => null,
    updateInterestedIn: async () => null,
    updateIntentions: async () => null,
    updateLifestyle: async () => null,
updateCareer: async () => null,
    updateInterests: async () => null,

    basicInfoLoading: false,
    interestedInLoading: false,
    intentionsLoading:false,
    lifestyleLoading:false,
    careerLoading:false,
    interestsLoading:false,

    basicInfoError: null,
    interestedInError: null,
    intentionsError:null,
    lifestyleError:null,
    careerError:null,
    interestsError:null,
});

/* ------------------------------------------------------------------ */
/* Provider                                                           */
/* ------------------------------------------------------------------ */

export function ProfileProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [basicInfoLoading, setBasicInfoLoading] = useState(false);
    const [interestedInLoading, setInterestedInLoading] = useState(false);
    const [intentionsLoading, setIntentionsLoading] = useState(false);
    const [lifestyleLoading, setLifestyleLoading] = useState(false);
    const [careerLoading, setCareerLoading] = useState(false);
    const [interestsLoading, setInterestsLoading] = useState(false);

    const [basicInfoError, setBasicInfoError] = useState<string | null>(null);
    const [interestedInError, setInterestedInError] =
        useState<string | null>(null);
    const [intentionsError, setIntentionsError] =
        useState<string | null>(null);
    const [lifestyleError, setLifestyleError] =
        useState<string | null>(null);
    const [careerError, setCareerError] = useState<string | null>(null);
    const [interestsError, setInterestsError] = useState<string | null>(null);

    /* ---------------------------------------------------------------- */
    /* UPDATE BASIC INFO                                                */
    /* ---------------------------------------------------------------- */

    const updateBasicInfo = async (
        data: BasicInfoRequest
    ): Promise<ProfileResponse | null> => {
        try {
            setBasicInfoLoading(true);
            setBasicInfoError(null);
            const response = await axios.patch(BASIC_INFO_URL, data, {
                headers: authHeader(),
            });

            if (response.data?.success) {
                return response.data as ProfileResponse;
            }

            setBasicInfoError(
                response.data?.message ||
                "Couldn't update basic information."
            );

            return null;
        } catch (err) {
            console.error("Update Basic Info Error:", err);

            if (axios.isAxiosError(err)) {
                setBasicInfoError(
                    err.response?.data?.message ||
                    "Something went wrong while updating basic information."
                );
            } else {
                setBasicInfoError(
                    "Something went wrong while updating basic information."
                );
            }

            return null;
        } finally {
            setBasicInfoLoading(false);
        }
    };

    /* ---------------------------------------------------------------- */
    /* UPDATE INTERESTED IN                                             */
    /* ---------------------------------------------------------------- */

    const updateInterestedIn = async (
        data: InterestedInRequest
    ): Promise<ProfileResponse | null> => {
        try {
            setInterestedInLoading(true);
            setInterestedInError(null);
            const response = await axios.patch(INTERESTED_IN_URL, data, {
                headers: authHeader(),
            });

            if (response.data?.success) {
                return response.data as ProfileResponse;
            }

            setInterestedInError(
                response.data?.message ||
                "Couldn't update interested-in information."
            );

            return null;
        } catch (err) {
            console.error("Update Interested In Error:", err);

            if (axios.isAxiosError(err)) {
                setInterestedInError(
                    err.response?.data?.message ||
                    "Something went wrong while updating interested-in information."
                );
            } else {
                setInterestedInError(
                    "Something went wrong while updating interested-in information."
                );
            }

            return null;
        } finally {
            setInterestedInLoading(false);
        }
    };
    /* ---------------------------------------------------------------- */
    /* UPDATE INTENTIONS                                             */
    /* ---------------------------------------------------------------- */
    const updateIntentions = async (
        data: IntentionsRequest
    ): Promise<ProfileResponse | null> => {
        try {
            setIntentionsLoading(true);
            setIntentionsError(null);
            const response = await axios.patch(INTENTIONS_URL, data, {
                headers: authHeader(),
            });
            if (response.data?.success) {
                return response.data as ProfileResponse;
            }

            setIntentionsError(
                response.data?.message ||
                "Couldn't update intentions information."
            );

            return null;
        } catch (err) {
            console.error("Update Intentions Error:", err);

            if (axios.isAxiosError(err)) {
                setIntentionsError(
                    err.response?.data?.message ||
                    "Something went wrong while updating intentions information."
                );
            } else {
                setIntentionsError(
                    "Something went wrong while updating intentions information."
                );
            }

            return null;
        } finally {
            setIntentionsLoading(false);
        }
    };
    /* ---------------------------------------------------------------- */
    /* UPDATE LIFESTYLE                                             */
    /* ---------------------------------------------------------------- */
    const updateLifestyle = async (
        data: LifestyleRequest
    ): Promise<ProfileResponse | null> => {
        try {
            setLifestyleLoading(true);
            setLifestyleError(null);
            const response = await axios.patch(LIFESTYLE_URL, data, {
                headers: authHeader(),
            });

            if (response.data?.success) {
                return response.data as ProfileResponse;
            }

            setLifestyleError(
                response.data?.message ||
                "Couldn't update lifestyle information."
            );

            return null;
        } catch (err) {
            console.error("Update Lifestyle Error:", err);

            if (axios.isAxiosError(err)) {
                setLifestyleError(
                    err.response?.data?.message ||
                    "Something went wrong while updating lifestyle information."
                );
            } else {
                setLifestyleError(
                    "Something went wrong while updating lifestyle information."
                );
            }

            return null;
        } finally {
            setLifestyleLoading(false);
        }
    };
    /* ---------------------------------------------------------------- */
    /* UPDATE CAREER / EDUCATION + WORK                                */
    /* ---------------------------------------------------------------- */
    const updateCareer = async (
        data: CareerRequest
    ): Promise<ProfileResponse | null> => {
        try {
            setCareerLoading(true);
            setCareerError(null);


            const response = await axios.patch(CAREER_URL, data, {
                headers: authHeader(),
            });

            if (response.data?.success) {
                return response.data as ProfileResponse;
            }

            setCareerError(
                response.data?.message ||
                "Couldn't update career information."
            );

            return null;
        } catch (err) {
            console.error("Update Career Error:", err);

            if (axios.isAxiosError(err)) {
                setCareerError(
                    err.response?.data?.message ||
                    "Something went wrong while updating career information."
                );
            } else {
                setCareerError(
                    "Something went wrong while updating career information."
                );
            }

            return null;
        } finally {
            setCareerLoading(false);
        }
    };

    /* ---------------------------------------------------------------- */
    /* UPDATE INTERESTS                                                 */
    /* ---------------------------------------------------------------- */
    const updateInterests = async (
        data: InterestsRequest
    ): Promise<ProfileResponse | null> => {
        try {
            setInterestsLoading(true);
            setInterestsError(null);
            // console.log("Sending Data",data )
            // console.log("Response",response )
            const response = await axios.patch(INTERESTS_URL, data, {
                headers: authHeader(),
            });
            
            if (response.data?.success) {
                return response.data as ProfileResponse;
            }

            setInterestsError(
                response.data?.message ||
                "Couldn't update interests information."
            );

            return null;
        } catch (err) {
            console.error("Update Interests Error:", err);

            if (axios.isAxiosError(err)) {
                setInterestsError(
                    err.response?.data?.message ||
                    "Something went wrong while updating interests information."
                );
            } else {
                setInterestsError(
                    "Something went wrong while updating interests information."
                );
            }

            return null;
        } finally {
            setInterestsLoading(false);
        }
    };

    /* ---------------------------------------------------------------- */
    /* PROVIDER                                                         */
    /* ---------------------------------------------------------------- */

    return (
        <ProfileContext.Provider
            value={{
                updateBasicInfo,
                updateInterestedIn,
                updateIntentions,
                updateLifestyle,
                updateCareer,
                updateInterests,

                basicInfoLoading,
                interestedInLoading,
                intentionsLoading,
                lifestyleLoading,
                careerLoading,
                interestsLoading,

                basicInfoError,
                interestedInError,
                intentionsError,
                lifestyleError,
                careerError,
                interestsError,
            }}
        >
            {children}
        </ProfileContext.Provider>
    );
}

/* ------------------------------------------------------------------ */
/* Hook                                                               */
/* ------------------------------------------------------------------ */

export function useProfileData() {
    return useContext(ProfileContext);
}