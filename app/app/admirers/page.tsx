"use client";

import React from "react";

import ProfileMain from "../desktop/ProfileMain";
import MobileAdmirerSection from "../mobile/MobileAdmirerSection";
import Screen from "../shell/Screen";

export default function Page() {
  return (
    <Screen desktop={<ProfileMain />} mobile={<MobileAdmirerSection />} />
  );
}
