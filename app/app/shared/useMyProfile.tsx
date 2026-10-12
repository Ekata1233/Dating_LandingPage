/* -------------------------------------------------------------------------- */
/*  The signed-in user's own profile.                                          */
/*                                                                            */
/*  Source: `GET /api/user/onboarding-details` — the same endpoint             */
/*  `OnBoardingDataContext` already calls for the onboarding flow, exposed here */
/*  as a provider plus a hook so the /app shell does not have to mount that     */
/*  provider (and drag its eight option-list requests along with it).          */
/*                                                                            */
/*  `ProfileMain`, `ProfileSidebar`, `AppRail`, the mobile sections, the navbar */
/*  and the event page all read from this one store, so the card and the rail   */
/*  can never show two different people — and the endpoint is hit once per       */
/*  session instead of once per consumer.                                       */
/*                                                                            */
/*  No mock fallback: the store reports in-flight / failed / ready separately,  */
/*  so a slow request is never mistaken for a real profile.                     */
/* -------------------------------------------------------------------------- */

"use client";

import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

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
  /** Re-requests the profile, even if one already came back. */
  refetch: () => void;
  /** Requests the profile once, if it has not been fetched yet. */
  ensure: () => void;
}

const MyProfileContext = createContext<MyProfileResult | null>(null);

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

export function MyProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MyProfileState>({
    status: "loading",
    details: null,
    error: null,
  });

  /* True once a request has been made with a session. A token-less attempt is
     NOT recorded, so `ensure` can still try again after login. */
  const requested = useRef(false);
  /* One in-flight promise, shared by every concurrent caller (StrictMode's
     double effect, several consumers mounting at once). */
  const inflight = useRef<Promise<void> | null>(null);

  const run = useCallback(() => {
    if (inflight.current) return inflight.current;

    /* No session yet: resolve to "nothing to show" without recording an attempt,
       so a later `ensure` retries once the token lands. State is written in a
       microtask, never synchronously, to keep the mount effect side-effect free. */
    if (!getClientToken()) {
      requested.current = false;
      return Promise.resolve().then(() => {
        setState({ status: "empty", details: null, error: null });
      });
    }

    requested.current = true;

    const promise = fetchOnboardingDetails()
      .then((details) => {
        setState(
          details
            ? { status: "ready", details, error: null }
            : { status: "empty", details: null, error: null }
        );
      })
      .catch((err) => {
        console.error("MyProfile fetch error:", err);
        setState({ status: "error", details: null, error: "Couldn't load your profile." });
      })
      .finally(() => {
        inflight.current = null;
      });

    inflight.current = promise;
    return promise;
  }, []);

  /* The provider lives in the root layout, so it can mount before a session
     exists; consumers call `ensure` from their own mount effects to retry. */
  useEffect(() => {
    void run();
  }, [run]);

  /* An event-driven retry, so resetting to the loading state here is free. */
  const refetch = useCallback(() => {
    requested.current = false;
    setState({ status: "loading", details: null, error: null });
    void run();
  }, [run]);

  const ensure = useCallback(() => {
    if (requested.current || inflight.current) return;
    void run();
  }, [run]);

  const profile = useMemo(
    () => (state.details ? mapMyProfile(state.details) : null),
    [state.details]
  );

  const summary = useMemo(
    () => (state.details && profile ? mapMyProfileSummary(state.details, profile) : null),
    [state.details, profile]
  );

  const value = useMemo<MyProfileResult>(
    () => ({
      profile,
      summary,
      loading: state.status === "loading",
      error: state.error,
      isEmpty: state.status === "empty",
      refetch,
      ensure,
    }),
    [profile, summary, state.status, state.error, refetch, ensure]
  );

  return <MyProfileContext.Provider value={value}>{children}</MyProfileContext.Provider>;
}

export function useMyProfile(): MyProfileResult {
  const context = useContext(MyProfileContext);

  /* If the provider mounted before a session existed, the first consumer to
     render is what wakes the request up. Idempotent, so simultaneous consumers
     still share one fetch. */
  const ensure = context?.ensure;
  useEffect(() => {
    ensure?.();
  }, [ensure]);

  if (!context) {
    throw new Error("useMyProfile must be used within a MyProfileProvider");
  }

  return context;
}

export default useMyProfile;
