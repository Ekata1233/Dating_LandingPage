"use client";

import React from "react";

import AdmirersMain from "../desktop/AdmirersMain";
import AdmiererSidebar from "../panels/AdmirersSidebar";
import { useAdmirersTab } from "@/app/context/AdmirersTabContext";

export type AdmirersTab = "received" | "sent";

export interface MobileAdmirerSectionProps {
    onBoost?: () => void;
    className?: string;
    fluid?: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Mobile Admirers screen.                                                    */
/*                                                                            */
/*  Mirrors the desktop pair (list + profile) as a two-step flow: the list is  */
/*  the exact rail component, and picking a card swaps in the same profile     */
/*  screen the desktop main pane shows, with a back button to return.          */
/* -------------------------------------------------------------------------- */

function MobileAdmirerSection({
    onBoost,
    className = "",
    fluid = false,
}: MobileAdmirerSectionProps) {
    const { selectedId, selectAdmirer } = useAdmirersTab();

    if (selectedId) {
        return (
            <div className={`relative w-full h-full min-h-0 ${className}`}>
                <button
                    type="button"
                    onClick={() => selectAdmirer(null)}
                    aria-label="Back to admirers"
                    className="absolute left-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm active:scale-95 transition"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <AdmirersMain fluid={fluid} onBoost={onBoost} />
            </div>
        );
    }

    return (
        <div
            className={`w-full h-full min-h-0 ${className}`}
            style={{ containerType: "size" }}
        >
            <AdmiererSidebar />
        </div>
    );
}

export default MobileAdmirerSection;
