"use client";

import React from "react";
import Screen from "@/app/app/shell/Screen";
import { OnBoardingDataProvider } from "@/app/context/OnBoardingDataContext";
import { useRouter } from "next/navigation";
import DatePlansStore from "@/app/app/desktop/DatePlansMain";

export default function Page() {
    const router = useRouter()
    const onBack = ()=>{
        router.push("/app/home")
    };
    const onBackMobile = ()=>{
        router.push("/app/profile")
    };
    return (
        <OnBoardingDataProvider>
            <Screen
                desktop={<DatePlansStore  onBack={onBack}  />}
                mobile={<DatePlansStore fluid  onBack={onBackMobile}  />}
            />
        </OnBoardingDataProvider>
    );
}
