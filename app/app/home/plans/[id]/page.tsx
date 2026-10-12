"use client";

import React from "react";
import Screen from "@/app/app/shell/Screen";
import { OnBoardingDataProvider } from "@/app/context/OnBoardingDataContext";
import { useRouter } from "next/navigation";
import { MembershipPlanDetails } from "@/app/app/desktop/PlansMain";

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
                desktop={<MembershipPlanDetails  onBack={onBack}  />}
                mobile={<MembershipPlanDetails fluid  onBack={onBackMobile}  />}
            />
        </OnBoardingDataProvider>
    );
}
