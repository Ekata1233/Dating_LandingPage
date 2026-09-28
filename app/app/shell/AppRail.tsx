"use client";

import React from "react";

import type { ActiveSection } from "../config/sections";
import AdmiererSidebar from "../panels/AdmirersSidebar";
import ChatSideBar from "../panels/ChatSideBar";
import DateNowSidebar from "../panels/DateNowSidebar";
import HomeSidebar from "../panels/HomeSidebar";
import ProfileSidebar from "../panels/ProfileSidebar";
import { MOCK_MY_PROFILE_SUMMARY, PROFILE_IMAGE } from "../shared/mockData";

/* -------------------------------------------------------------------------- */
/*  The panel under the pink strip in the desktop rail.                        */
/*                                                                            */
/*  It lives in the layout rather than in a page because the rail is a sibling */
/*  of the screen slot, not part of it. The five account sections share one     */
/*  panel, so they all route here.                                             */
/* -------------------------------------------------------------------------- */

export interface AppRailProps {
  section: ActiveSection;
}

const AppRail: React.FC<AppRailProps> = ({ section }) => {
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
    case "help":
    case "logout":
      return (
        <ProfileSidebar
          avatarUrl={PROFILE_IMAGE}
          name={MOCK_MY_PROFILE_SUMMARY.name}
          age={MOCK_MY_PROFILE_SUMMARY.age}
          verified={MOCK_MY_PROFILE_SUMMARY.verified}
          location={MOCK_MY_PROFILE_SUMMARY.location}
          isPlatinumMember={MOCK_MY_PROFILE_SUMMARY.isPlatinumMember}
          trustScore={MOCK_MY_PROFILE_SUMMARY.trustScore}
          completionPercent={MOCK_MY_PROFILE_SUMMARY.completionPercent}
        />
      );
  }
};

export default AppRail;
