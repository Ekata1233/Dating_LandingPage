"use client";

import React from "react";
import { useSectionBack } from "../../config/useSectionBack";
import Screen from "../../shell/Screen";
import { useAccountSettings } from "@/app/context/AccountSettingsContext";
import { OnBoardingDataProvider } from "@/app/context/OnBoardingDataContext";
import { useRouter } from "next/navigation";
import { deleteSession } from "@/lib/sessions";
import { toast } from "sonner";
import AccountStatusMain from "../../desktop/AccountStatusMain";

export default function Page() {
    /* The screen draws its own back row, so the top bar's chevron is not the only
       way out of here. */
    const { deleteAccount, deleteLoading, deleteError } = useAccountSettings();
    const onBack = useSectionBack();
    return (
        <OnBoardingDataProvider>
            <Screen
                desktop={<AccountStatusMain  onBack={onBack}  />}
                mobile={<AccountStatusMain fluid  onBack={onBack}  />}
            />
        </OnBoardingDataProvider>
    );
}
