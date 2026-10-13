"use client";

import React, { useCallback, useEffect, useState, type ReactNode } from "react";

import { useActiveSection } from "@/app/context/ActiveSectionContext";
import { useAccountSettings } from "@/app/context/AccountSettingsContext";
import { useUserProfileData } from "@/app/context/UserProfileDataContext";
import { AdmirersTabProvider } from "@/app/context/AdmirersTabContext";

import { NAV_ITEMS, SECTION_META, navSlotFor } from "./config/sections";
import { useSectionBack } from "./config/useSectionBack";
import AppRail from "./shell/AppRail";
import MobileTopBar from "./shell/MobileTopBar";
import SidebarHeaderStrip from "./shell/SidebarHeaderStrip";
import WalletSheet from "./shell/WalletSheet";
import { FALLBACK_AVATAR } from "./shared/mockData";
import { useMyProfile } from "./shared/useMyProfile";

/* -------------------------------------------------------------------------- */
/*  The /app shell.                                                            */
/*                                                                            */
/*  A fixed-viewport column that never unmounts, so a section change only       */
/*  swaps the screen — the rail, the pink strip and the mobile chrome all stay  */
/*  put. One tree serves both breakpoints, with `md:` deciding what shows:      */
/*                                                                            */
/*    ┌ MobileTopBar            md:hidden                                    */
/*    ├ rail + screen           flex-col on mobile, flex-row from md          */
/*    │   ├ rail                md:flex                                      */
/*    │   └ screen              Screen picks desktop or mobile                */
/*    ├ SidebarHeaderStrip      md:hidden (the desktop strip, moved to the    */
/*    │                         bottom of the phone)                         */
/*    └ WalletSheet             md:hidden                                    */
/* -------------------------------------------------------------------------- */

export interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { activeSection, setActiveSection } = useActiveSection();
  const onBack = useSectionBack();
  const [walletOpen, setWalletOpen] = useState(false);
  /* Same source as the profile card and the account rail, so the nav avatar can
     never be a different person. Neutral avatar until the payload lands. */
  const { profile } = useMyProfile();
  const profileAvatar = profile?.image || FALLBACK_AVATAR;
  const { ensureLoaded } = useUserProfileData();
  const { ensurePlans } = useAccountSettings();

  /* Wallet/plans live in providers that sit in the root layout, so they can
     mount before a session exists and then never load. The shell is the one
     thing every /app screen mounts, so it is where those idle resources are
     nudged awake on the first render. */
  useEffect(() => {
    ensureLoaded();
    ensurePlans();
  }, [ensureLoaded, ensurePlans]);

  const meta = SECTION_META[activeSection];
  const closeWallet = useCallback(() => setWalletOpen(false), []);

  /* Leaving a section should never leave the sheet hanging over the new one. */
  const selectSection = useCallback(
    (section: Parameters<typeof setActiveSection>[0]) => {
      setWalletOpen(false);
      setActiveSection(section);
    },
    [setActiveSection]
  );

  return (
    <div className="h-dvh md:h-screen font-figtree flex flex-col bg-white">
      {/* <MobileTopBar
        className="md:hidden"
        title={meta.title}
        onBack={meta.backTo ? onBack : undefined}
      /> */}

      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden md:overflow-visible md:text-white">
        <AdmirersTabProvider>
          <div
            className="hidden md:flex flex-col w-[22.6%] bg-slate-50"
            style={{ containerType: "size" }}
          >
            <SidebarHeaderStrip
              variant="top"
              items={NAV_ITEMS}
              activeNav={navSlotFor(activeSection)}
              onSelect={selectSection}
              profileAvatar={profileAvatar}
            />

            <AppRail section={activeSection} />
          </div>

          {children}
        </AdmirersTabProvider>
      </div>

      {/* The desktop sidebar header, relocated to the bottom of the screen. */}
      <SidebarHeaderStrip
        className="shrink-0 md:hidden"
        variant="bottom"
        items={NAV_ITEMS}
        activeNav={navSlotFor(activeSection)}
        onSelect={selectSection}
        profileAvatar={profileAvatar}
      />

      <WalletSheet className="md:hidden" open={walletOpen} onClose={closeWallet} />
    </div>
  );
}
