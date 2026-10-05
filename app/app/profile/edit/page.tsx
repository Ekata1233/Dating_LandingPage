"use client";

import React from "react";

import { OnBoardingDataProvider } from "@/app/context/OnBoardingDataContext";

import ProfileEditMain from "../../desktop/ProfileEditMain";
import MobileEditProfileSection from "../../mobile/MobileEditProfileSection";
import Screen from "../../shell/Screen";

/**
 * Edit profile.
 *
 * This is the one /app screen that needs the onboarding option lists — the
 * intentions radio, the lifestyle and interest questions, the five career
 * dropdowns and the prompt catalogue — so `OnBoardingDataProvider` is mounted
 * here rather than in the shell. Scoping it to this route keeps the other
 * screens from paying for those GETs, and covers both the desktop frame and the
 * mobile Edit/Preview tabs because `Screen` renders both from this page.
 *
 * The provider has to be here at all: `useOnBoardingData()` falls back to a
 * default whose lists are empty and whose `loading` is permanently `true`, so a
 * form rendered outside it would look loaded and offer no options.
 */
export default function Page() {
  return (
    <OnBoardingDataProvider>
      <Screen
        desktop={<ProfileEditMain />}
        mobile={<MobileEditProfileSection />}
      />
    </OnBoardingDataProvider>
  );
}