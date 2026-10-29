"use client";

import React from "react";
import Screen from "@/app/app/shell/Screen";
import { useRouter } from "next/navigation";
import DatePlansStore from "@/app/app/desktop/DatePlansMain";
// Date Plans Store to purchase the Date Plans -> razor pay api integrated

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
                desktop={<DatePlansStore  onBack={onBack}  />}
                mobile={<DatePlansStore fluid  onBack={onBackMobile}  />}
            />
    );
}
