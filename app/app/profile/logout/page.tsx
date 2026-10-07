"use client";

import React from "react";

import LogoutMain from "../../desktop/LogoutMain";
import { useSectionBack } from "../../config/useSectionBack";
import Screen from "../../shell/Screen";
import { deleteSession } from "@/lib/sessions";
import { useRouter } from "next/navigation";
// function handleLogOut() {
//   deleteSession();
// }
export default function Page() {
  const onBack = useSectionBack();
  const router = useRouter()
  const handleLogout = async () => {
    await deleteSession();
    router.push("/");
  };
  return (
    <Screen
      desktop={<LogoutMain onLogout={handleLogout} onStay={() => router.push("/app")} />}
      mobile={<LogoutMain fluid showBack={false} onLogout={handleLogout} onBack={onBack} onStay={() => router.push("/app")} />}
    />
  );
}
