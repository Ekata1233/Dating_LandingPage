"use client";

import React from "react";

import ReferAndEarn from "../../desktop/ReferEarnMain";
import { useSectionBack } from "../../config/useSectionBack";
import Screen from "../../shell/Screen";

export default function Page() {
  /* The screen draws its own back row, so the top bar's chevron is not the only
     way out of here. */
  const onBack = useSectionBack();

  return (
    <Screen
      desktop={<ReferAndEarn />}
      mobile={<ReferAndEarn fluid onBack={onBack} />}
    />
  );
}
