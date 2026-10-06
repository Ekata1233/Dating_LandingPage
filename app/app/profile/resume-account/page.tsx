"use client";

import React from "react";
import { useSectionBack } from "../../config/useSectionBack";
import Screen from "../../shell/Screen";
import DeleteAccountMain from "../../desktop/DeleteAccountMain";
import { useAccountSettings } from "@/app/context/AccountSettingsContext";
import { useRouter } from "next/navigation";
import { deleteSession } from "@/lib/sessions";
import { toast } from "sonner";
import ResumeAccountMain from "../../desktop/ResumeAccountMain";

export default function Page() {
    /* The screen draws its own back row, so the top bar's chevron is not the only
       way out of here. */
    const { resumeAccount,resumeLoading,resumeError } = useAccountSettings();
    const onBack = useSectionBack();
    const router = useRouter();
    function handleResumeAccount() {
        resumeAccount().then(async (response) => {
            if (response?.success) {
                toast.success(response.message 
                    // || "Account resumed successfully."
                    );
            }
            else{
                toast.error(response?.message 
                    // || "Failed to resume account."
                );
            }

            }
        );
    }
    return (
        <Screen
            desktop={<ResumeAccountMain onBack={onBack} onStayPaused={() => { router.push("/app/home") }} onResumeAccount={handleResumeAccount} />}
            mobile={<ResumeAccountMain fluid showBack={false} onBack={onBack} onStayPaused={() => { router.push("/app/home") }} onResumeAccount={handleResumeAccount} />}
        />
    );
}
