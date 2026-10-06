"use client";

import React from "react";
import { useSectionBack } from "../../config/useSectionBack";
import Screen from "../../shell/Screen";
import DeleteAccountMain from "../../desktop/DeleteAccountMain";
import { useAccountSettings } from "@/app/context/AccountSettingsContext";
import { useRouter } from "next/navigation";
import { deleteSession } from "@/lib/sessions";
import { toast } from "sonner";

export default function Page() {
    /* The screen draws its own back row, so the top bar's chevron is not the only
       way out of here. */
    const { deleteAccount, deleteLoading, deleteError } = useAccountSettings();
    const onBack = useSectionBack();
    const router = useRouter();
    function handleDeleteAccount() {
        deleteAccount().then(async (response) => {
            if (response?.success) {
                toast.success(response.message || "Account deleted successfully.");
                await deleteSession();
                router.push("/");
            }
            else {
                toast.error(response?.message || "Failed to delete account.");
            }

        }
        );
    }
    return (
        <Screen
            desktop={<DeleteAccountMain onBack={onBack} onContinue={() => { router.push("/app/home") }} onDeleteAccount={handleDeleteAccount} />}
            mobile={<DeleteAccountMain fluid showBack={false} onContinue={() => { router.push("/app/home") }} onBack={onBack} onDeleteAccount={handleDeleteAccount} />}
        />
    );
}
