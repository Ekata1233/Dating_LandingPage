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
const INTERESTS_URL = `${API_BASE_URL}/api/user/profile/answer`;
const CAREER_URL = `${API_BASE_URL}/api/user/edit-profile/education-work`;
const ADD_PHOTOS_URL = `${API_BASE_URL}/api/user/profile/photos`;
const UPDATE_PHOTO_URL = `${API_BASE_URL}/api/user/profile/photos/:id`;
const DELETE_PHOTO_URL = `${API_BASE_URL}/api/user/profile/photos/:photoId`;
const BIO_URL = `${API_BASE_URL}/api/user/profile/bio`;
const PROMPTS_URL = `${API_BASE_URL}/api/user/profile/prompts`;
const LOCATION_URL = `${API_BASE_URL}/api/user/edit-profile/location`;

/**
 * `authHeader()` pins Content-Type to application/json, and axios reads that
 * before it sends: with a JSON content type it stringifies a FormData body
 * instead of posting multipart, so the file never leaves the browser. Uploads
 * send the bearer token only — the browser supplies the multipart boundary.
 */
function uploadAuthHeader(): Record<string, string> {
    const headers = { ...authHeader() };
    delete headers["Content-Type"];
    return headers;
}

/** The delete URL carries a `:photoId` placeholder; swap it for the real id. */
function deletePhotoUrl(photoId: string): string {
    return DELETE_PHOTO_URL.replace(":photoId", encodeURIComponent(photoId));
}

/**
 * The POST response isn't pinned to one shape, so accept the id spellings the
 * backend uses. Without this id the photo can never be deleted, so callers
 * treat "no id" as "uploaded, but not removable through the app".
 */
export function photoIdFrom(res: ProfileResponse | null): string | null {
    const data = res?.data;
    if (!data || typeof data !== "object") return null;

    /* One file goes up per request, so a list response carries one entry. */
    const entries: unknown[] = Array.isArray(data) ? data : [data];

    for (const entry of entries) {
        if (!entry || typeof entry !== "object") continue;

        const record = entry as Record<string, unknown>;
        const nested =
            record.photo && typeof record.photo === "object"
                ? (record.photo as Record<string, unknown>)
                : null;

        const found = [
            record.id,
            record._id,
            record.photoId,
            nested?.id,
            nested?._id,
        ].find((c) => typeof c === "string" && c.length > 0);

        if (typeof found === "string") return found;
    }

    return null;
}

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
export interface LocationRequest {
    country: string;
    state: string;
    city: string;
    area: string;
    longitude: number;
    latitude: number;
    max_distance_km: number;
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
export interface PhotosRequest {
    image: File;
}
export interface BioRequest {
    bio: string;
}

/** One answered question: the prompt's uuid from the prompt GET, plus the text. */
export interface PromptAnswerRequest {
    promptId: string;
    answer: string;
}

/** The whole set is replaced in one PATCH, so this is always the full list. */
export interface PromptsRequest {
    prompts: PromptAnswerRequest[];
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
    updateLocation: (
        data: LocationRequest
    ) => Promise<ProfileResponse | null>;

    createPhotos: (
        data: FormData
    ) => Promise<ProfileResponse | null>;

    /**
     * Removes one photo from the profile. The photo must already exist on the
     * server — only its id goes over the wire.
     */
    deletePhoto: (photoId: string) => Promise<ProfileResponse | null>;
    updateBio: (data: BioRequest) => Promise<ProfileResponse | null>;
    updatePrompts: (
        data: PromptsRequest
    ) => Promise<ProfileResponse | null>;

    basicInfoLoading: boolean;
    interestedInLoading: boolean;
    intentionsLoading: boolean;
    lifestyleLoading: boolean;
    careerLoading: boolean;
    interestsLoading: boolean;
    photosLoading: boolean;
    photoDeleteLoading: boolean;
    bioLoading: boolean;
    promptsLoading: boolean;
    locationLoading: boolean;

    basicInfoError: string | null;
    interestedInError: string | null;
    intentionsError: string | null;
    lifestyleError: string | null;
    careerError: string | null;
    interestsError: string | null;
    photosError: string | null;
    photoDeleteError: string | null;
    bioError: string | null;
    promptsError: string | null;
    locationError: string | null;
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
    createPhotos: async () => null,
    deletePhoto: async () => null,
    updateBio: async () => null,
    updatePrompts: async () => null,
    updateLocation: async () => null,
    basicInfoLoading: false,
    interestedInLoading: false,
    intentionsLoading: false,
    lifestyleLoading: false,
    careerLoading: false,
    interestsLoading: false,
    photosLoading: false,
    photoDeleteLoading: false,
    bioLoading: false,
    promptsLoading: false,
    locationLoading: false,

    basicInfoError: null,
    interestedInError: null,
    intentionsError: null,
    lifestyleError: null,
    careerError: null,
    interestsError: null,
    photosError: null,
    photoDeleteError: null,
    bioError: null,
    promptsError: null,
    locationError: null,
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
    const [photosLoading, setPhotosLoading] = useState(false);
    const [photoDeleteLoading, setPhotoDeleteLoading] = useState(false);
    const [bioLoading, setBioLoading] = useState(false);
    const [promptsLoading, setPromptsLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    const [basicInfoError, setBasicInfoError] = useState<string | null>(null);
    const [interestedInError, setInterestedInError] =
        useState<string | null>(null);
    const [intentionsError, setIntentionsError] =
        useState<string | null>(null);
    const [lifestyleError, setLifestyleError] =
        useState<string | null>(null);
    const [careerError, setCareerError] = useState<string | null>(null);
    const [interestsError, setInterestsError] = useState<string | null>(null);
    const [photosError, setPhotosError] = useState<string | null>(null);
    const [photoDeleteError, setPhotoDeleteError] = useState<string | null>(null);
    const [bioError, setBioError] = useState<string | null>(null);
    const [promptsError, setPromptsError] = useState<string | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);

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

            console.log("Sending Data", data)
            const response = await axios.patch(CAREER_URL, data, {
                headers: authHeader(),
            });
            console.log("Response", response)

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
    /* CREATE PHOTOS                                                    */
    /* ---------------------------------------------------------------- */
    const createPhotos = async (
        data: FormData
    ): Promise<ProfileResponse | null> => {
        setPhotosLoading(true);
        setPhotosError(null);

        try {
            const response = await axios.post(ADD_PHOTOS_URL, data, {
                headers: uploadAuthHeader(),
            });

            if (response.data?.success) {
                return response.data as ProfileResponse;
            }

            const message =
                response.data?.message || "Couldn't upload that photo.";
            setPhotosError(message);

            return { success: false, message };
        } catch (err) {
            console.error("Create Photos Error:", err);

            const message = axios.isAxiosError(err)
                ? err.response?.data?.message ||
                "Something went wrong while uploading that photo."
                : "Something went wrong while uploading that photo.";
            setPhotosError(message);

            return { success: false, message };
        } finally {
            setPhotosLoading(false);
        }
    };

    /* ---------------------------------------------------------------- */
    /* DELETE PHOTO                                                      */
    /* ---------------------------------------------------------------- */
    const deletePhoto = async (
        photoId: string
    ): Promise<ProfileResponse | null> => {
        setPhotoDeleteLoading(true);
        setPhotoDeleteError(null);

        try {
            const response = await axios.delete(deletePhotoUrl(photoId), {
                headers: authHeader(),
            });

            if (response.data?.success) {
                return response.data as ProfileResponse;
            }

            const message =
                response.data?.message || "Couldn't delete that photo.";
            setPhotoDeleteError(message);

            return { success: false, message };
        } catch (err) {
            console.error("Delete Photo Error:", err);

            const message = axios.isAxiosError(err)
                ? err.response?.data?.message ||
                "Something went wrong while deleting that photo."
                : "Something went wrong while deleting that photo.";
            setPhotoDeleteError(message);

            return { success: false, message };
        } finally {
            setPhotoDeleteLoading(false);
        }
    };
    const updateBio = async (
        data: BioRequest
    ): Promise<ProfileResponse | null> => {
        try {
            setBioLoading(true);
            setBioError(null);
            const response = await axios.patch(BIO_URL, data, {
                headers: authHeader(),
            });

            if (response.data?.success) {
                return response.data as ProfileResponse;
            }

            setBioError(
                response.data?.message ||
                "Couldn't update bio."
            );

            return null;
        } catch (err) {
            console.error("Update Bio Error:", err);

            if (axios.isAxiosError(err)) {
                setBioError(
                    err.response?.data?.message ||
                    "Something went wrong while updating bio."
                );
            } else {
                setBioError(
                    "Something went wrong while updating bio."
                );
            }

            return null;
        } finally {
            setBioLoading(false);
        }
    };

    /* ---------------------------------------------------------------- */
    /* UPDATE PROMPTS                                                   */
    /* ---------------------------------------------------------------- */
    const updatePrompts = async (
        data: PromptsRequest
    ): Promise<ProfileResponse | null> => {
        try {
            setPromptsLoading(true);
            setPromptsError(null);

            const response = await axios.patch(PROMPTS_URL, data, {
                headers: authHeader(),
            });

            if (response.data?.success) {
                return response.data as ProfileResponse;
            }

            setPromptsError(
                response.data?.message ||
                "Couldn't save your prompt answers."
            );

            return null;
        } catch (err) {
            console.error("Update Prompts Error:", err);

            if (axios.isAxiosError(err)) {
                setPromptsError(
                    err.response?.data?.message ||
                    "Something went wrong while saving your prompt answers."
                );
            } else {
                setPromptsError(
                    "Something went wrong while saving your prompt answers."
                );
            }

            return null;
        } finally {
            setPromptsLoading(false);
        }
    };
    const updateLocation = async (
        data: LocationRequest
    ): Promise<ProfileResponse | null> => {
        try {
            setLocationLoading(true);
            setLocationError(null);
            const response = await axios.patch(LOCATION_URL, data, {
                headers: authHeader(),
            });

            if (response.data?.success) {
                return response.data as ProfileResponse;
            }

            setLocationError(
                response.data?.message ||
                "Couldn't update location information."
            );

            return null;
        } catch (err) {
            console.error("Update Location Error:", err);

            if (axios.isAxiosError(err)) {
                setLocationError(
                    err.response?.data?.message ||
                    "Something went wrong while updating location information."
                );
            } else {
                setLocationError(
                    "Something went wrong while updating location information."
                );
            }

            return null;
        } finally {
            setLocationLoading(false);
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
                createPhotos,
                deletePhoto,
                updateBio,
                updatePrompts,
                updateLocation,
                basicInfoLoading,
                interestedInLoading,
                intentionsLoading,
                lifestyleLoading,
                careerLoading,
                interestsLoading,
                photosLoading,
                photoDeleteLoading,
                bioLoading,
                promptsLoading,
                locationLoading,

                basicInfoError,
                interestedInError,
                intentionsError,
                lifestyleError,
                careerError,
                interestsError,
                photosError,
                photoDeleteError,
                bioError,
                promptsError,
                locationError,
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