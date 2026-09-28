"use client";

import React from "react";

import ProfileEditMain from "../../desktop/ProfileEditMain";
import MobileEditProfileSection from "../../mobile/MobileEditProfileSection";
import Screen from "../../shell/Screen";

export default function Page() {
  return (
    <Screen
      desktop={<ProfileEditMain />}
      mobile={<MobileEditProfileSection />}
    />
  );
}
