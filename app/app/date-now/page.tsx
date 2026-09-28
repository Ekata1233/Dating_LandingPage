"use client";

import React from "react";

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
