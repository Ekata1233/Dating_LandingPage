"use client";

import React from "react";

import ProfileMain from "../desktop/ProfileMain";
import MobileProfileSection from "../mobile/MobileProfileSection";
import Screen from "../shell/Screen";

export default function Page() {
  return (
    <Screen desktop={<ProfileMain />} mobile={<MobileProfileSection />} />
  );
}
