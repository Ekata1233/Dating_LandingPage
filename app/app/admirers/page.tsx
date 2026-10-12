"use client";

import React from "react";

import ProfileMain from "../desktop/ProfileMain";
import MobileAdmirerSection from "../mobile/MobileAdmirerSection";
import Screen from "../shell/Screen";
import NoLikesBoost from "../desktop/AdmiersNoLikes";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter()
  function handleOnBoost() {
    router.push("/app/home/myBalances/myboosts")
  }
  return (
    <Screen 
    desktop={<NoLikesBoost onBoost={handleOnBoost} />} 
    mobile={<MobileAdmirerSection fluid onBoost={handleOnBoost} />} />
  );
}
