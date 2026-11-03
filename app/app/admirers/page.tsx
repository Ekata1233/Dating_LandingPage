"use client";

import React from "react";

import AdmirersMain from "../desktop/AdmirersMain";
import MobileAdmirerSection from "../mobile/MobileAdmirerSection";
import Screen from "../shell/Screen";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter()
  function handleOnBoost() {
    router.push("/app/home/myBalances/myboosts")
  }
  function handleImprove() {
    router.push("/app/profile")
  }
  return (
    <Screen
      desktop={<AdmirersMain onBoost={handleOnBoost} onImproveProfile={handleImprove} />}
      mobile={<MobileAdmirerSection fluid onBoost={handleOnBoost} />}
    />
  );
}
