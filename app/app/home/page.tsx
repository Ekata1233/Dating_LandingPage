"use client";

import React from "react";

import HomeMain from "../desktop/HomeMain";
import MobileHomeSection from "../mobile/MobileHomeSection";
import Screen from "../shell/Screen";

export default function Page() {
  return <Screen desktop={<HomeMain />} mobile={<MobileHomeSection />} />;
}
