"use client";

import React from "react";

import ChatMain from "../desktop/ChatMain";
import MobileChatSection from "../mobile/MobileChatSection";
import Screen from "../shell/Screen";

export default function Page() {
  return <Screen desktop={<ChatMain />} mobile={<MobileChatSection />} />;
}
