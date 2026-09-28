"use client";

import React from "react";

import HelpSupport from "../../desktop/helpMain";
import { useSectionBack } from "../../config/useSectionBack";
import Screen from "../../shell/Screen";

export default function Page() {
  const onBack = useSectionBack();

  return (
    <Screen
      desktop={<HelpSupport />}
      mobile={<HelpSupport fluid showBack={false} onBack={onBack} />}
    />
  );
}
