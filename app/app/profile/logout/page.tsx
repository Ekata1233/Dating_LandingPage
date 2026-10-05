"use client";

import React from "react";

import LogoutMain from "../../desktop/LogoutMain";
import { useSectionBack } from "../../config/useSectionBack";
import Screen from "../../shell/Screen";
// function handleLogOut() {
//   deleteSession();
// }
export default function Page() {
  const onBack = useSectionBack();

  return (
    <Screen
      desktop={<LogoutMain />}
      mobile={<LogoutMain fluid showBack={false} onBack={onBack}  />}
    />
  );
}
