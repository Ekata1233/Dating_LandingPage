"use client";

import React, { useCallback, useState, type ReactNode } from "react";

import { useActiveSection } from "@/app/context/ActiveSectionContext";

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
    <div className="h-dvh md:h-screen min-h-screen max-h-screen font-figtree flex flex-col bg-white">
      {/* <MobileTopBar
        className="md:hidden"
        title={meta.title}
        onBack={meta.backTo ? onBack : undefined}
      /> */}

      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden md:overflow-visible md:text-white">
        <div className="hidden md:flex flex-col w-74 bg-slate-50">
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
