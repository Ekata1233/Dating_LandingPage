/* -------------------------------------------------------------------------- */
/*  The signed-in user's own profile.                                          */
/*                                                                            */
/*  `useUsersData()` returns the discover feed and the codebase already treats  */
/*  its first entry as the logged-in user (see `MOCK_MY_PROFILE`, which is     */
/*  documented as "the logged-in user, doubled as the first card"). This hook   */
/*  turns that into a single `Profile` the profile surfaces can render, with   */
/*  the deep-profile request folded in, and reports the three states the UI    */
/*  needs to tell apart: in flight, failed, and ready.                         */
/*                                                                            */
/*  NOTE: a dedicated `/api/user/profile` endpoint would be the correct source */
/*  here. Until that exists, feed[0] stands in for "me", so a user who is not  */
/*  the first card in their own feed sees someone else's profile. Swap the     */
/*  `users[0]` line below when that endpoint lands.                            */
/* -------------------------------------------------------------------------- */

"use client";

import { useCallback, useEffect, useMemo } from "react";

import { useUserDetails, useUsersData } from "@/app/context/UsersContext";
import { mapUserToProfile, mergeUserDetails } from "./mapUser";
import type { Profile } from "./types";

export interface MyProfileResult {
  /** Null until the feed resolves and carries at least one user. */
  profile: Profile | null;
  /** True while the feed request is in flight. */
  loading: boolean;
  /** Set when the feed request failed. */
  error: string | null;
  /** The request succeeded but there is nobody to show. */
  isEmpty: boolean;
  /** True while the rich profile is still being fetched behind the feed. */
  detailsPending: boolean;
  /** Re-requests the feed. */
  retry: () => void;
}

export function useMyProfile(): MyProfileResult {
  const { users, loading, error, refetch } = useUsersData();

  const base = useMemo<Profile | null>(
    () => (users[0] ? mapUserToProfile(users[0]) : null),
    [users]
  );

  const {
    details,
    state: detailsState,
    ensure: ensureDetails,
    refresh: refreshDetails,
  } = useUserDetails(base?.id);

  /* The feed has already told us who this is, so the extra request is worth
     firing straight away — unlike a feed card, which waits for intent. */
  useEffect(() => {
    ensureDetails();
  }, [ensureDetails]);

  const profile = useMemo(
    () => (base && details ? mergeUserDetails(base, details) : base),
    [base, details]
  );

  const retry = useCallback(() => {
    refetch();
    refreshDetails();
  }, [refetch, refreshDetails]);

  return {
    profile,
    loading,
    error,
    isEmpty: !loading && !error && !base,
    detailsPending: Boolean(base) && detailsState !== "ready",
    retry,
  };
}

export default useMyProfile;
