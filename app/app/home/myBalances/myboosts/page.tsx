"use client";

import React from "react";
import Screen from "@/app/app/shell/Screen";
import { useRouter } from "next/navigation";
import BoostStore from "@/app/app/desktop/MyBoostsMain";

export default function Page() {
    const router = useRouter()
    const onBack = ()=>{
        router.push("/app/home")
    };
    const onBackMobile = ()=>{
        router.push("/app/profile")
    };
    return (
            <Screen
                desktop={<BoostStore  onBack={onBack}  />}
                mobile={<BoostStore fluid  onBack={onBackMobile}  />}
            />
    );
}
