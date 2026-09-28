import React, { useState } from 'react'

import {
    DATE_AVAILABILITY_OPTIONS,
    DATE_TYPE_OPTIONS,
    DEFAULT_AVAILABILITY,
    DEFAULT_DATE_TYPE,
} from './shared/mockData'
import type { DateAvailability, DateType } from './shared/types'

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

const chip = (isActive: boolean) =>
    `text-[12px] font-semibold px-3 py-1 rounded-full cursor-pointer whitespace-nowrap shrink-0 hover:bg-pink-400 hover:text-white ${isActive ? "bg-pink-400 text-white" : "bg-gray-200 text-gray-700"}`;

export interface DateNowSidebarProps {
    /** Uncontrolled default. */
    defaultAvailability?: DateAvailability;
    defaultDateType?: DateType;
    /** Controlled values. Supply these to lift the filter state into the parent. */
    availability?: DateAvailability;
    dateType?: DateType;
    onAvailabilityChange?: (value: DateAvailability) => void;
    onDateTypeChange?: (value: DateType) => void;
    /** Hides the "Date Plans" heading when the top bar already shows it. */
    showHeader?: boolean;
    /** "stacked" = desktop sidebar. "inline" = single scrollable row (mobile). */
    layout?: "stacked" | "inline";
    className?: string;
}

function DateNowSidebar({
    defaultAvailability = DEFAULT_AVAILABILITY,
    defaultDateType = DEFAULT_DATE_TYPE,
    availability,
    dateType,
    onAvailabilityChange,
    onDateTypeChange,
    showHeader = true,
    layout = "stacked",
    className = "",
}: DateNowSidebarProps) {
    const [internalAvailability, setInternalAvailability] = useState<DateAvailability>(defaultAvailability)
    const [internalDateType, setInternalDateType] = useState<DateType>(defaultDateType)

    const activeAvailability = availability ?? internalAvailability
    const activeDateType = dateType ?? internalDateType

    const selectAvailability = (value: DateAvailability) => {
        if (availability === undefined) setInternalAvailability(value)
        onAvailabilityChange?.(value)
    }

    const selectDateType = (value: DateType) => {
        if (dateType === undefined) setInternalDateType(value)
        onDateTypeChange?.(value)
    }

    const isInline = layout === "inline"

    return (
        <div className={isInline ? `flex flex-row items-center gap-3 ${className}` : `px-3 py-4 flex flex-col gap-4 ${className}`}>
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
                        <span style={{ color: C.ink }}>Date{" "}</span>
                        <span style={{ color: C.pinkText }}>Plans</span>
                    </h1>
                </header>
            )}

            {/* Date wise Filter */}
            <div className={isInline ? "flex items-center gap-2 shrink-0" : "flex flex-col gap-2 py-2 px-1 text-black"}>
                {!isInline && <div className='font-bold'>Availability</div>}
                <div className={isInline ? "flex gap-2 overflow-x-auto" : "flex gap-3 flex-wrap"} style={isInline ? { scrollbarWidth: "none", msOverflowStyle: "none" } : undefined}>
                    {DATE_AVAILABILITY_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => selectAvailability(option.value)}
                            className={chip(activeAvailability === option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Date Type Filter */}
            <div className={isInline ? "flex items-center gap-2 shrink-0" : "flex flex-col gap-2 py-2 px-1 text-black"}>
                {!isInline && <div className='font-bold'>Date Type</div>}
                <div className={isInline ? "flex gap-2 overflow-x-auto" : "flex gap-3 flex-wrap"} style={isInline ? { scrollbarWidth: "none", msOverflowStyle: "none" } : undefined}>
                    {DATE_TYPE_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => selectDateType(option.value)}
                            className={chip(activeDateType === option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default DateNowSidebar
