"use client";

import React from "react";

import HomeSidebar from "../panels/HomeSidebar";
import ProfileSidebar from "../panels/ProfileSidebar";
import AccountSupportSection from "../panels/AccountSupportSection";
import { Loader, Notice } from "../shared/Loader";
import {
  MOCK_BALANCES,
  MOCK_DATE_PLANS_SUMMARY,
  MOCK_PLANS,
} from "../shared/mockData";
import { BRAND } from "../shared/theme";
import type { Profile } from "../shared/types";
import { useMyProfile } from "../shared/useMyProfile";

/* -------------------------------------------------------------------------- */
/*  My profile (mobile).                                                        */
/*                                                                            */
/*  The desktop split puts the account rail beside the card; a phone has no    */
/*  rail, so the pieces are stacked into one scrolling page:                    */
/*                                                                            */
/*    ┌ ProfileSidebar    avatar, completion ring, Edit Profile                */
/*    ├ HomeSidebar       wallet balances / plan cards (Wallet · Plans tabs)   */
/*    └ AccountSupport    account & support rows, in their own section         */
/*                                                                            */
/*  AccountSupportSection lives outside ProfileSidebar, so it is turned off    */
/*  there (`showAccountSection={false}`) and mounted here as its own block —   */
/*  below the wallet panel, in `standalone` mode, since there is no profile    */
/*  sidebar around it to borrow a container from.                              */
/*                                                                            */
/*  Both sidebars are handed `flow`/`layout` variants that let them grow to    */
/*  their own height instead of scrolling inside a fixed frame.                */
/*                                                                            */
/*  There is no mock profile fallback here: the section renders a loader while */
/*  the request is in flight and a notice when it fails or comes back empty, */
/*  so a slow network is never mistaken for real data.                          */
/* -------------------------------------------------------------------------- */

export interface MobileProfileSectionProps {
  /** Called when "Edit Profile" is tapped. Defaults to the context's section. */
  onEditProfile?: () => void;
  /** Pre-resolved profile. The hook fetches one when this is omitted. */
  profile?: Profile | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const MobileProfileSection: React.FC<MobileProfileSectionProps> = ({
  onEditProfile,
  profile: profileProp,
  loading: loadingProp,
  error: errorProp,
  onRetry,
}) => {
  const live = useMyProfile();

  const profile = profileProp !== undefined ? profileProp : live.profile;
  const loading = loadingProp ?? live.loading;
  const error = errorProp ?? live.error;
  const retry = onRetry ?? live.refetch;

  if (loading) {
    return <Loader label="Loading your profile…" hint="Just a moment." />;
  }

  if (error) {
    return (
      <Notice
        title="Couldn't load your profile"
        detail="Check your connection and try again."
        actionLabel="Try again"
        onAction={retry}
      />
    );
  }

  if (!profile) {
    return (
      <Notice
        title="No profile found"
        detail="Finish setting up your account and it'll appear here."
      />
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto overscroll-contain">
      <ProfileSidebar
        flow="auto"
        showAccountSection={false}
        avatarUrl={live.summary?.avatarUrl ?? profile.image}
        name={profile.name}
        age={profile.age}
        verified={live.summary?.verified ?? false}
        location={profile.location}
        isPlatinumMember={live.summary?.isPlatinumMember ?? false}
        trustScore={live.summary?.trustScore ?? 0}
        completionPercent={live.summary?.completionPercent ?? 0}
        onEditProfile={onEditProfile}
      />

      {/* Separator so the panels do not read as one card. */}
      <div style={{ height: 1, background: BRAND.border }} />

      {/*
        HomeSidebar's root is `h-full` (it is built for a fixed desktop rail).
        The wrapper has an auto height, so that `h-full` resolves to `auto` and
        the panel grows with its content instead of scrolling inside a nested
        pane — the page above stays the single scroll container.
      */}
      <div>
        <HomeSidebar
          layout="stack"
          balances={MOCK_BALANCES}
          datePlan={MOCK_DATE_PLANS_SUMMARY}
          plans={MOCK_PLANS}
        />
      </div>

      {/* Separator so the panels do not read as one card. */}
      <div style={{ height: 1, background: BRAND.border }} />

      {/*
        Account & Support, below the wallet panel. `standalone` gives it the
        container its `cqw` sizing needs — the profile sidebar it used to live
        in is no longer an ancestor here.
      */}
      <AccountSupportSection variant="standalone" />
    </div>
  );
};

export default MobileProfileSection;
