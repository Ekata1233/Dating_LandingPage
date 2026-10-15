"use client";

import React from "react";
import Screen from "@/app/app/shell/Screen";
import { useRouter } from "next/navigation";
import RosesStore from "@/app/app/desktop/RosesMain";

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
                desktop={<RosesStore  onBack={onBack}  />}
                mobile={<RosesStore fluid  onBack={onBackMobile}  />}
            />
    );
}
