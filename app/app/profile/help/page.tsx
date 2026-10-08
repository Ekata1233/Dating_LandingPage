"use client";

import React from "react";

import HelpSupport from "../../desktop/helpMain";
import { useSectionBack } from "../../config/useSectionBack";
import Screen from "../../shell/Screen";
import { useAccountSettings } from "@/app/context/AccountSettingsContext";

export default function Page() {
  const onBack = useSectionBack();
  const {faqs} = useAccountSettings()
  return (
    <Screen
      desktop={<HelpSupport faqs={faqs}/>}
      mobile={<HelpSupport fluid showBack={false} onBack={onBack} faqs={faqs} />}
    />
  );
}
