import React, { useState } from 'react'
import AdmirerReciveCard from '../AdmirerReciveCard'
import AdmirerSentCard from '../AdmirerSentCard'

import { MOCK_ADMIRERS_RECEIVED, MOCK_ADMIRERS_SENT } from './shared/mockData'
import type { AdmirerReceived, AdmirerSent } from './shared/types'

const C = {
    pink: "#e23a6a",
    pinkText: "#e0355f",
    pinkSoft: "#fdeef1",
    green: "#1f9254",
    greenSoft: "#e7f7ee",
    greenBadge: "#22b56b",
    ink: "#17151a",
    grey: "#8a8790",
    greyLight: "#b8b5bc",
    border: "#ececec",
    track: "#e7e5e9",
    white: "#ffffff",
};

export type AdmirersTab = "received" | "sent";

export interface AdmiererSidebarProps {
    received?: AdmirerReceived[];
    sent?: AdmirerSent[];
    /** Uncontrolled default tab. */
    defaultTab?: AdmirersTab;
    /** Controlled tab. Supply this to lift the tab state into the parent. */
    tab?: AdmirersTab;
    onTabChange?: (tab: AdmirersTab) => void;
    /** Hides the "Admirers" heading when the top bar already shows it. */
    showHeader?: boolean;
    onReject?: (admirer: AdmirerReceived) => void;
    onLike?: (admirer: AdmirerReceived) => void;
    onSendRose?: (admirer: AdmirerSent) => void;
    className?: string;
}

function AdmiererSidebar({
    received = MOCK_ADMIRERS_RECEIVED,
    sent = MOCK_ADMIRERS_SENT,
    defaultTab = "received",
    tab,
    onTabChange,
    showHeader = true,
    onReject,
    onLike,
    onSendRose,
    className = "",
}: AdmiererSidebarProps) {
    const [internalTab, setInternalTab] = useState<AdmirersTab>(defaultTab)
    const activeTab = tab ?? internalTab

    const select = (next: AdmirersTab) => {
        if (tab === undefined) setInternalTab(next)
        onTabChange?.(next)
    }

    return (
        <div className={`flex flex-col px-3 py-4 w-full h-full min-h-0 ${className}`}>
            {showHeader && (
                <header
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <h1 className='text-[22px]'
                        style={{
                            margin: 0,
                            fontWeight: 800,
                            letterSpacing: "-0.01em",
                        }}
                    >
                        <span style={{ color: C.ink }}>Admi</span>
                        <span style={{ color: C.pinkText }}>rers</span>
                    </h1>
                </header>
            )}
            {/* Tabs */}
            <div className="flex shrink-0">
                <button onClick={() => select("received")} className={`flex-1 cursor-pointer text-[14px] py-3 text-center border-b-2 font-semibold  ${activeTab === "received" ? "border-[#C21559] text-[#C21559]" : "border-slate-50 text-black"}`}>
                    Received
                </button>
                <button onClick={() => select("sent")} className={`cursor-pointer flex-1 text-[14px] py-3  text-center font-semibold border-b-2 ${activeTab === "sent" ? "border-[#C21559] text-[#C21559]" : "border-slate-50 text-black"}`}>
                    Sent
                </button>
            </div>

            {/* Matches Section */}
            {activeTab === "received" ?
                <div className="grid grid-cols-2 auto-rows-fr gap-2 pt-4 p-2 overflow-y-auto w-full flex-1 min-h-0">
                    {received.map((admirer, index) => (
                        <AdmirerReciveCard
                            key={admirer.imageUrl + index}
                            {...admirer}
                            onReject={() => onReject?.(admirer)}
                            onLike={() => onLike?.(admirer)}
                        />
                    ))}
                </div> : <div className="grid grid-cols-1 auto-rows-[140px] gap-2 p-2 overflow-y-auto w-full flex-1 min-h-0">
                    {sent.map((admirer, index) => (
                        <AdmirerSentCard
                            key={admirer.avatarUrl + index}
                            {...admirer}
                            onSendRose={() => onSendRose?.(admirer)}
                        />
                    ))}
                </div>
            }

        </div>
    )
}

export default AdmiererSidebar
