"use client";

import React from "react";
//Date Plans Route
import DateNowMain from "../desktop/DateNowMain";
import MobileDateNowSection from "../mobile/MobileDateNowSection";
import Screen from "../shell/Screen";

export default function Page() {
  return (
    <Screen
      desktop={<DateNowMain />}
      mobile={<MobileDateNowSection />}
    />
  );
}
