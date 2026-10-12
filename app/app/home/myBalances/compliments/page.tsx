"use client";

import React from "react";
import Screen from "@/app/app/shell/Screen";
import { OnBoardingDataProvider } from "@/app/context/OnBoardingDataContext";
import { useRouter } from "next/navigation";
import ComplimentsStore from "@/app/app/desktop/ComplimentsMain";

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
                desktop={<ComplimentsStore  onBack={onBack}  />}
                mobile={<ComplimentsStore fluid  onBack={onBackMobile}  />}
            />
        </OnBoardingDataProvider>
    );
}
