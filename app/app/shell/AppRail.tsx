"use client";

import React, { useEffect } from "react";

import { useUserDetails } from "@/app/context/UsersContext";

import type { ActiveSection } from "../config/sections";
import { Loader, Notice } from "../shared/Loader";
import AdmiererSidebar from "../panels/AdmirersSidebar";
import ChatSideBar from "../panels/ChatSideBar";
import DateNowSidebar from "../panels/DateNowSidebar";
import HomeSidebar from "../panels/HomeSidebar";
import ProfileSidebar from "../panels/ProfileSidebar";
import { useMyProfile } from "../shared/useMyProfile";

/* -------------------------------------------------------------------------- */
/*  The panel under the pink strip in the desktop rail.                        */
/*                                                                            */
/*  It lives in the layout rather than in a page because the rail is a sibling */
/*  of the screen slot, not part of it. The five account sections share one     */
/*  panel, so they all route here.                                             */
/*                                                                            */
/*  The account panel is driven by the onboarding-details payload, same as the  */
/*  profile card: while it is in flight the rail shows a loader, and when the   */
/*  user has no saved profile (or the request failed) it says so instead of    */
/*  rendering someone else's data.                                            */
/* -------------------------------------------------------------------------- */

export interface AppRailProps {
  section: ActiveSection;
}

const AppRail: React.FC<AppRailProps> = ({ section }) => {
  const { profile, summary, loading, error, isEmpty, refetch } = useMyProfile();

  /* Plan tier is not on the onboarding payload — the per-user details endpoint
     is the only one that ships `package`, so the sidebar reads it from there. */
  const isProfileSection =
    section === "profile" ||
    section === "edit-profile" ||
    section === "refer-earn" ||
    section === "callback" ||
    section === "delete-account" ||
    section === "account-status" ||
    section === "help" ||
    section === "logout";

  const { details: ownDetails, ensure: ensureOwnDetails } = useUserDetails(
    isProfileSection ? profile?.id : null
  );

  useEffect(() => {
    ensureOwnDetails();
  }, [ensureOwnDetails]);

  const pkg = ownDetails?.package?.name ?? profile?.package.name;

  switch (section) {
    case "home":
    case "plans":
      return <HomeSidebar />;

    case "admirer":
      return <AdmiererSidebar />;

    case "date-now":
      return <DateNowSidebar />;

    case "chat":
      return <ChatSideBar />;

    case "profile":
    case "edit-profile":
    case "refer-earn":
    case "callback":
    case "delete-account":
    case "account-status":
    case "help":
    case "logout": {
      if (loading) {
        return <Loader label="Loading your profile…" hint="Just a moment." />;
      }

      if (error) {
        return (
          <Notice
            title="Couldn't load your profile"
            detail="Check your connection and try again."
            actionLabel="Try again"
            onAction={refetch}
          />
        );
      }

      if (!summary || isEmpty) {
        return (
          <Notice
            title="No profile found"
            detail="Finish setting up your account and it'll appear here."
          />
        );
      }

      return (
        <ProfileSidebar
          avatarUrl={summary.avatarUrl}
          name={summary.name}
          age={summary.age}
          pkg={summary.pkg}
          verified={summary.verified}
          location={summary.location}
          isPlatinumMember={summary.isPlatinumMember}
          trustScore={summary.trustScore}
          completionPercent={summary.completionPercent}
        />
      );
    }
  }
};

export default AppRail;