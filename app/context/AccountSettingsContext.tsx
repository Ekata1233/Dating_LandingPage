"use client";
import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/utils/api";
import { authHeader } from "@/utils/token";

/* ------------------------------------------------------------------ */
/* API URLs                                                           */
/* ------------------------------------------------------------------ */

const DELETE_ACCOUNT_URL = `${API_BASE_URL}/api/user/account/delete`;
const PAUSE_ACCOUNT_URL = `${API_BASE_URL}/api/user/account/pause`;
const RESUME_ACCOUNT_URL = `${API_BASE_URL}/api/user/account/resume`;

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

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
     * pause, `false` after a resume, `null` until one happens. It lets the
     * Account & Support list flip its row the moment the API says success,
     * without waiting for `profileDetails.refetch()` to come back — the
     * server's `pausedAt` stays the fallback for first paint.
     */
    paused: boolean | null;
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
                /* Pause confirmed: the Account & Support list swaps to
                   "Resume Account" right away. */
                setPaused(true);

                return response.data as AccountSettingsResponse;
            }

            setPauseError(
                response.data?.message || "Couldn't pause your account."
            );

            return null;
        } catch (err) {
            console.error("Pause Account Error:", err);

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

            /* PATCH with no body: the second argument is the (absent) payload. */
            const response = await axios.patch(RESUME_ACCOUNT_URL, undefined, {
                headers: authHeader(),
            });

            if (response.data?.success) {
                /* Resume confirmed: the row swaps back to "Pause Account". */
                setPaused(false);

                return response.data as AccountSettingsResponse;
            }

            setResumeError(
                response.data?.message || "Couldn't resume your account."
            );

            return null;
        } catch (err) {
            console.error("Resume Account Error:", err);

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
    /* PROVIDER                                                         */
    /* ---------------------------------------------------------------- */

    return (
        <AccountSettingsContext.Provider
            value={{
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
            }}
        >
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