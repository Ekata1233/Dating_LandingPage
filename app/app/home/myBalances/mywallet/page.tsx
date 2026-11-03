"use client";

import React from "react";
import Screen from "@/app/app/shell/Screen";
import { useRouter } from "next/navigation";
import MyWallet from "@/app/app/desktop/MyWalletMain";
//Shows current wallet balance and allow add and withdraw money
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
                desktop={<MyWallet  onBack={onBack}  />}
                mobile={<MyWallet fluid  onBack={onBackMobile}  />}
            />
    );
}
