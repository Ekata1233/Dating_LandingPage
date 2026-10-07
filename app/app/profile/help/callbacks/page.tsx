"use client";

import React from "react";
import { useSectionBack } from "../../../config/useSectionBack";
import Screen from "../../../shell/Screen";
import DeleteAccountMain from "../../../desktop/DeleteAccountMain";
import { useAccountSettings } from "@/app/context/AccountSettingsContext";
import { useRouter } from "next/navigation";
import { deleteSession } from "@/lib/sessions";
import { toast } from "sonner";
import CallbackMain from "../../../desktop/CallBackMain";

export default function Page() {
    /* The screen draws its own back row, so the top bar's chevron is not the only
       way out of here. */
    const { deleteAccount, deleteLoading, deleteError } = useAccountSettings();
    const onBack = useSectionBack();
    const router = useRouter();
    function handleConfirmCallback() {
        // deleteAccount().then(async (response) => {
        //     if (response?.success) {
        //         toast.success(response.message || "Account deleted successfully.");
        //         await deleteSession();
        //         router.push("/");
        //     }
        //     else {
        //         toast.error(response?.message || "Failed to delete account.");
        //     }

        // }
        // );
    }
    return (
        <Screen
            desktop={<CallbackMain onBack={onBack} onHelp={() => { router.push("/app/profile/help") }} onConfirm={handleConfirmCallback} />}
            mobile={<CallbackMain fluid showBack={false} onHelp={() => { router.push("/app/profile/help") }} onBack={onBack} onConfirm={handleConfirmCallback} />}
        />
    );
}
