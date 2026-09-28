"use client";

import React, { useCallback, useState } from "react";
import { Wallet } from "lucide-react";

import type { ActiveSection } from "@/app/context/ActiveSectionContext";
import { SECTION_META } from "@/app/app/appConfig";
import SidebarHeaderStrip from "../SidebarHeaderStrip";
import HomeSidebar from "../HomeSidebar";
import MobileTopBar from "./MobileTopBar";
import MobileSheet from "./MobileSheet";
import MobileHomeSection from "./MobileHomeSection";
import MobileDateNowSection from "./MobileDateNowSection";
import MobileAdmirerSection from "./MobileAdmirerSection";
import MobileChatSection from "./MobileChatSection";
import MobileProfileSection from "./MobileProfileSection";
import MobileEditProfileSection from "./MobileEditProfileSection";
import ReferAndEarn from "../ReferEarnMain";
import HelpSupport from "../helpMain";
import LogoutMain from "../LogoutMain";
import { BRAND } from "../shared/theme";
import {
  MOCK_BALANCES,
  MOCK_DATE_PLANS_SUMMARY,
  MOCK_PLANS,
} from "../shared/mockData";

/* -------------------------------------------------------------------------- */
/*  Mobile app shell.                                                          */
/*                                                                            */
/*  Rendered inside a `block md:hidden` wrapper, so it only ever exists below  */
/*  768px. The layout is a fixed viewport-height column:                        */
/*                                                                            */
/*    ┌ MobileTopBar      h-12, safe-area aware                               */
/*    ├ section content   flex-1 min-h-0, owns its own scrolling              */
/*    └ SidebarHeaderStrip  the desktop sidebar header, relocated to the BOTTOM */
/* -------------------------------------------------------------------------- */

export interface MobileAppShellProps {
  activeSection: ActiveSection;
  onSelect: (section: ActiveSection) => void;
  navItems: React.ComponentProps<typeof SidebarHeaderStrip>["items"];
  profileAvatar: string;
}

const MobileAppShell: React.FC<MobileAppShellProps> = ({
  activeSection,
  onSelect,
  navItems,
  profileAvatar,
}) => {
  const [walletOpen, setWalletOpen] = useState(false);

  const meta = SECTION_META[activeSection];
  const activeNav = meta.navSlot;

  const goBack = useCallback(() => {
    if (meta.backTo) onSelect(meta.backTo);
  }, [meta.backTo, onSelect]);

  const closeSheets = useCallback(() => {
    setWalletOpen(false);
  }, []);

  /* Stable identity: MobileSheet re-runs its scroll-lock effect whenever
     onClose changes, and this is passed straight through. */
  const closeWallet = useCallback(() => {
    setWalletOpen(false);
    if (activeSection === "plans") onSelect("home");
  }, [activeSection, onSelect]);

  /* Tapping a nav tab should never leave a sheet hanging open. */
  const selectSection = useCallback(
    (section: ActiveSection) => {
      closeSheets();
      onSelect(section);
    },
    [closeSheets, onSelect]
  );

  /* Rows inside ProfileSidebar (Refer & Earn, Help, Log out …) navigate through
     the context directly rather than through this shell, so a section change is
     also treated as a dismissal. Adjusting during render (rather than in an
     effect) keeps the sheet from ever painting over the new section. The plans
     sheet stays open because its `open` flag is derived from the section. */
  const [lastSection, setLastSection] = useState(activeSection);
  if (lastSection !== activeSection) {
    setLastSection(activeSection);
    setWalletOpen(false);
  }

  // const walletBalance =
  //   MOCK_BALANCES.find((item) => item.label === "My Wallet")?.value ?? "";

  /* ------------------------------- top actions ------------------------------ */

  /* The profile section used to open an account sheet from here. It is now a
     full page in its own right, so there is nothing left for this to do. */
  const actions = (() => {
    if (activeSection === "home") {
      return (
        <></>
      );
    }

    return null;
  })();

  /* Stable so the memoised ProfileSidebar is not re-rendered on every shell
     update just because a new closure was handed down. */
  const openEditProfile = useCallback(() => onSelect("edit-profile"), [onSelect]);

  /* -------------------------------- content -------------------------------- */

  const content = (() => {
    switch (activeSection) {
      case "home":
        return <MobileHomeSection />;

      case "date-now":
        return <MobileDateNowSection />;

      case "admirer":
        return <MobileAdmirerSection />;

      case "chat":
        return <MobileChatSection />;

      case "profile":
        return <MobileProfileSection onEditProfile={openEditProfile} />;

      case "edit-profile":
        return <MobileEditProfileSection />;

      case "refer-earn":
        return <ReferAndEarn fluid showBack={false} onBack={goBack} />;

      case "help":
        return <HelpSupport fluid showBack={false} onBack={goBack} />;

      case "logout":
        return <LogoutMain fluid showBack={false} onBack={goBack} />;

      /* "plans" is not a standalone destination on mobile: it opens the
         Wallet / Plans sheet over Home. */
      case "plans":
        return <MobileHomeSection />;

      default:
        return null;
    }
  })();

  const plansSheetTitle = activeSection === "plans" ? "Plans" : "Wallet & Plans";

  return (
    <div
      className="flex flex-col w-full h-dvh overflow-hidden"
      style={{ background: BRAND.white }}
    >
      <MobileTopBar title={meta.title} onBack={meta.backTo ? goBack : undefined} actions={actions} />

      <div className="flex-1 min-h-0 relative overflow-hidden">{content}</div>

      {/* The desktop sidebar header, relocated to the bottom of the screen. */}
      <div className="shrink-0">
        <SidebarHeaderStrip
          variant="bottom"
          items={navItems}
          activeNav={activeNav}
          onSelect={selectSection}
          profileAvatar={profileAvatar}
        />
      </div>

      {/* Wallet / Plans – desktop sidebar content, as a bottom sheet. */}
      <MobileSheet
        open={walletOpen || activeSection === "plans"}
        onClose={closeWallet}
        title={plansSheetTitle}
      >
        <HomeSidebar
          tab={activeSection === "plans" ? "plans" : undefined}
          layout="stack"
          balances={MOCK_BALANCES}
          datePlan={MOCK_DATE_PLANS_SUMMARY}
          plans={MOCK_PLANS}
        />
      </MobileSheet>
    </div>
  );
};

export default MobileAppShell;
