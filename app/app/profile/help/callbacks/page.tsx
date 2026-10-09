"use client";

import React from "react";
import { useSectionBack } from "../../../config/useSectionBack";
import Screen from "../../../shell/Screen";
import DeleteAccountMain from "../../../desktop/DeleteAccountMain";
import { CallBackPayLoad, useAccountSettings } from "@/app/context/AccountSettingsContext";
import { useRouter } from "next/navigation";
import { deleteSession } from "@/lib/sessions";
import { toast } from "sonner";
import CallbackMain, { CallbackBooking, formatDate } from "../../../desktop/CallBackMain";

export default function Page() {
    /* The screen draws its own back row, so the top bar's chevron is not the only
       way out of here. */
    const { deleteAccount, deleteLoading, deleteError, callbackHistory,requestCallbackError,requestCallback } = useAccountSettings();
    const onBack = useSectionBack();
    const router = useRouter();
    async function handleConfirmCallback(data: CallbackBooking) {
        const payload: CallBackPayLoad = {
            callbackDate:
                data.day === "today" ? formatDate(new Date())
                    : data.day === "tomorrow" ? formatDate(new Date(Date.now() + 864e5))
                        : data.dayLabel,
            timeWindow: data.timeWindow,
            topic: data.topic
        }
        const response  = await requestCallback(payload)
        if(response?.success){
            toast.success(response.message || "Callback Requested Successfully")
        }
        else{
            toast.error(requestCallbackError || "Couldn't request callback")
        }

    }
    return (
        <Screen
            desktop={<CallbackMain onBack={onBack} history={callbackHistory} onHelp={() => { router.push("/app/profile/help") }} onConfirm={handleConfirmCallback} />}
            mobile={<CallbackMain fluid history={callbackHistory} onHelp={() => { router.push("/app/profile/help") }} onBack={onBack} onConfirm={handleConfirmCallback} />}
        />
    );
}
