"use client";

import React from "react";
import Screen from "@/app/app/shell/Screen";
import { useRouter } from "next/navigation";
import ComplimentsStore from "@/app/app/desktop/ComplimentsMain";
// Complement Store to purchase the complements -> razor pay api integrated
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
                desktop={<ComplimentsStore  onBack={onBack}  />}
                mobile={<ComplimentsStore fluid  onBack={onBackMobile}  />}
            />
    );
}
