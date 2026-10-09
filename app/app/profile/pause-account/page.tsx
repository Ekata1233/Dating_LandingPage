"use client";

import React from "react";
import { useSectionBack } from "../../config/useSectionBack";
import Screen from "../../shell/Screen";
import DeleteAccountMain from "../../desktop/DeleteAccountMain";
import { useAccountSettings } from "@/app/context/AccountSettingsContext";
import { useRouter } from "next/navigation";
import { deleteSession } from "@/lib/sessions";
import { toast } from "sonner";
import PauseAccountMain from "../../desktop/PauseAccountMain";
import { useOnBoardingData } from "@/app/context/OnBoardingDataContext";

export default function Page() {
    /* The screen draws its own back row, so the top bar's chevron is not the only
       way out of here. */
    const { pauseAccount, pauseLoading, pauseError } = useAccountSettings();
    const { profileDetails } = useOnBoardingData()
    const onBack = useSectionBack();
    const router = useRouter();
    function handlePauseAccount(data: { reason: string }) {
        pauseAccount(data).then(async (response) => {
            if (response?.success) {
                toast.success(response.message
                    || "Account paused successfully."
                );
                await profileDetails.refetch();

            }
            else {
                toast.error(pauseError
                    || "Failed to pause account."
                );
            }

        }
        );
    }
    return (
        <Screen
            desktop={<PauseAccountMain onBack={onBack} onKeepBrowsing={() => { router.push("/app/home") }} onPauseAccount={handlePauseAccount} />}
            mobile={<PauseAccountMain fluid onBack={onBack} onKeepBrowsing={() => { router.push("/app/home") }} onPauseAccount={handlePauseAccount} />}
        />
    );
}
