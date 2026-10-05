/* -------------------------------------------------------------------------- */
/*  The signed-in user's own profile.                                          */
/*                                                                            */
/*  Source: `GET /api/user/onboarding-details` — the same endpoint             */
/*  `OnBoardingDataContext` already calls for the onboarding flow, exposed here */
/*  as its own hook so the /app shell does not have to mount that provider (and */
/*  drag its eight option-list requests along with it).                        */
/*                                                                            */
/*  `ProfileMain`, `ProfileSidebar`, `AppRail` and the mobile sections all read */
/*  from this, so the card and the rail can never show two different people.    */
/*  No mock fallback: the hook reports in-flight / failed / ready separately, so */
/*  a slow request is never mistaken for a real profile.                        */
/* -------------------------------------------------------------------------- */

"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  OnboardingDetailsApi,
  OnboardingDetailsResponse,
} from "@/app/context/OnBoardingDataContext";
import { API_BASE_URL } from "@/utils/api";
import { authHeader, getClientToken } from "@/utils/token";

import { mapMyProfile, mapMyProfileSummary } from "./mapMyProfile";
import type { MyProfile, Profile } from "./types";

const ONBOARDING_DETAILS_URL = `${API_BASE_URL}/api/user/onboarding-details`;

type MyProfileState =
  | { status: "loading"; details: null; error: null }
  | { status: "ready"; details: OnboardingDetailsApi; error: null }
  | { status: "empty"; details: null; error: null }
  | { status: "error"; details: null; error: string };

export interface MyProfileResult {
  /** Null until the request resolves, and forever without a token. */
  profile: Profile | null;
  /** The same profile reduced to the fields `ProfileSidebar` draws. */
  summary: MyProfile | null;
  /** True while the request is in flight. */
  loading: boolean;
  /** Set when the request failed. */
  error: string | null;
  /** The request succeeded but there is nothing saved to show. */
  isEmpty: boolean;
  /** Re-requests the profile. */
  refetch: () => void;
}

/**
 * One request, no state touched. `null` means "nothing to show" — either there is
 * no session (so the request is skipped entirely and never 401s) or the payload
 * carries no user yet. Throws only on a real transport/contract failure.
 */
async function fetchOnboardingDetails(): Promise<OnboardingDetailsApi | null> {
  /* No session means nothing to ask for. */
  if (!getClientToken()) return null;

  const response = await axios.get<OnboardingDetailsResponse>(ONBOARDING_DETAILS_URL, {
    headers: authHeader(),
  });

  const payload = response.data;

  if (!payload?.success) throw new Error(payload?.message || "Couldn't load your profile.");
  if (!payload.data?.userId) return null;

  return payload.data;
}

export function useMyProfile(): MyProfileResult {
  const [state, setState] = useState<MyProfileState>({
    status: "loading",
    details: null,
    error: null,
  });

  /**
   * Runs the request and writes the outcome. Kept separate from the effect so the
   * effect never calls `setState` synchronously, and `isCancelled` lets an
   * unmounted card drop its response instead of updating a dead tree.
   */
  const resolve = useCallback((isCancelled: () => boolean) => {
    void fetchOnboardingDetails()
      .then((details) => {
        if (isCancelled()) return;

        setState(
          details
            ? { status: "ready", details, error: null }
            : { status: "empty", details: null, error: null }
        );
      })
      .catch((err) => {
        if (isCancelled()) return;

        console.error("useMyProfile fetch error:", err);
        setState({ status: "error", details: null, error: "Couldn't load your profile." });
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    resolve(() => cancelled);

    return () => {
      cancelled = true;
    };
  }, [resolve]);

  /** Manual retry from an error notice. Runs on an event, so the reset is free. */
  const refetch = useCallback(() => {
    setState({ status: "loading", details: null, error: null });
    resolve(() => false);
  }, [resolve]);

  const profile = useMemo(
    () => (state.details ? mapMyProfile(state.details) : null),
    [state.details]
  );

  const summary = useMemo(
    () => (state.details && profile ? mapMyProfileSummary(state.details, profile) : null),
    [state.details, profile]
  );

  return {
    profile,
    summary,
    loading: state.status === "loading",
    error: state.error,
    isEmpty: state.status === "empty",
    refetch,
  };
}

export default useMyProfile;