"use client";

import React from "react";

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
  const { summary, loading, error, isEmpty, refetch } = useMyProfile();

  switch (section) {
    case "home":
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
    case "pause-account":
    case "resume-account":
    case "delete-account":
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