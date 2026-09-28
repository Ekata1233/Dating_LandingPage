"use client";

import React from "react";

import LogoutMain from "../../desktop/LogoutMain";
import { useSectionBack } from "../../config/useSectionBack";
import Screen from "../../shell/Screen";

export default function Page() {
  const onBack = useSectionBack();

  return (
    <Screen
      desktop={<LogoutMain />}
      mobile={<LogoutMain fluid showBack={false} onBack={onBack} />}
    />
  );
}
