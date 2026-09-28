"use client";

import React from "react";

import HomeSidebar from "../components/ui/main/HomeSidebar";
import AdmiererSidebar from "../components/ui/main/AdmirersSidebar";
import DateNowSidebar from "../components/ui/main/DateNowSidebar";
import ProfileSidebar from "../components/ui/main/ProfileSidebar";

import HomeMain from "../components/ui/main/HomeMain";
import DateNowMain from "../components/ui/main/DateNowMain";
import ReferAndEarn from "../components/ui/main/ReferEarnMain";
import HelpSupport from "../components/ui/main/helpMain";
import LogoutMain from "../components/ui/main/LogoutMain";
import ProfileMain from "../components/ui/main/ProfileMain";
import ProfileEditCard from "../components/ui/main/ProfileEditMain";

import ChatSideBar from "../components/ui/main/ChatSideBar";
import ChatMain from "../components/ui/main/ChatMain";

import SidebarHeaderStrip from "../components/ui/main/SidebarHeaderStrip";
import MobileAppShell from "../components/ui/main/mobile/MobileAppShell";
import { NAV_ITEMS, navSlotFor } from "./appConfig";

import { useActiveSection } from "../context/ActiveSectionContext";
import { MOCK_MY_PROFILE_SUMMARY, PROFILE_IMAGE } from "../components/ui/main/shared/mockData";

function App() {
  const { activeSection, setActiveSection } = useActiveSection();

  /*
   * Desktop Sidebar
   */
  const renderSidebar = () => {
    switch (activeSection) {
      case "home":
        return <HomeSidebar />;

      case "admirer":
        return <AdmiererSidebar />;

      case "date-now":
        return <DateNowSidebar />;

      case "chat":
        return <ChatSideBar />;

      case "profile":
      case "refer-earn":
      case "help":
      case "logout":
      case "edit-profile":
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

      default:
        return null;
    }
  };

  /*
   * Desktop Main Content
   */
  const renderMainContent = () => {
    switch (activeSection) {
      case "home":
        return <HomeMain />;

      case "refer-earn":
        return <ReferAndEarn />;

      case "help":
        return <HelpSupport />;

      case "logout":
        return <LogoutMain />;

      case "chat":
        return <ChatMain />;

      case "profile":
      case "admirer":
        return <ProfileMain />;

      case "edit-profile":
        return <ProfileEditCard />;

      case "date-now":
        return <DateNowMain />;

      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-[320px] h-[550px] rounded-2xl bg-slate-200 shadow-2xl" />
          </div>
        );
    }
  };

  return (
    <div className="h-dvh md:h-screen min-h-screen max-h-screen font-figtree">

      {/* =========================================================
          MOBILE UI
          Below md (< 768px)
      ========================================================== */}
      <div className="block md:hidden h-full w-full">
        <MobileAppShell
          activeSection={activeSection}
          onSelect={setActiveSection}
          navItems={NAV_ITEMS}
          profileAvatar={PROFILE_IMAGE}
        />
      </div>


      {/* =========================================================
          DESKTOP UI
          md and above (>= 768px)
      ========================================================== */}
      <div className="hidden md:flex h-full bg-white text-white">

        {/* Left Sidebar */}
        <div className="w-74 bg-slate-50 flex flex-col">

          {/* Navigation Header */}
          <SidebarHeaderStrip
            variant="top"
            items={NAV_ITEMS}
            activeNav={navSlotFor(activeSection)}
            onSelect={setActiveSection}
            profileAvatar={PROFILE_IMAGE}
          />

          {/* Sidebar Content */}
          {renderSidebar()}

        </div>

        {/* Main Content */}
        {renderMainContent()}

      </div>

    </div>
  );
}

export default App;
