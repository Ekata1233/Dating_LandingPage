import React, { useState } from 'react'

import {
    DATE_AVAILABILITY_OPTIONS,
    DATE_TYPE_OPTIONS,
    DEFAULT_AVAILABILITY,
    DEFAULT_DATE_TYPE,
} from '../shared/mockData'
import type { DateAvailability, DateType } from '../shared/types'

const C = {
    pinkText: '#e0355f',
    ink: '#17151a',
}

const chip = (isActive: boolean) =>
    `text-[4.054cqw] font-semibold px-[4.054cqw] py-[0.444cqh] rounded-full cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
        isActive
            ? 'bg-pink-400 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-pink-400 hover:text-white'
    }`

const hideScrollbar = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

export interface DateNowSidebarProps {
    /** Uncontrolled default. */
    defaultAvailability?: DateAvailability
    defaultDateType?: DateType
    /** Controlled values. Supply these to lift the filter state into the parent. */
    availability?: DateAvailability
    dateType?: DateType
    onAvailabilityChange?: (value: DateAvailability) => void
    onDateTypeChange?: (value: DateType) => void
    /** Hides the "Date Plans" heading when the top bar already shows it. */
    showHeader?: boolean
    /** "stacked" = desktop sidebar. "inline" = single scrollable row (mobile). */
    layout?: 'stacked' | 'inline'
    className?: string
}

function DateNowSidebar({
    defaultAvailability = DEFAULT_AVAILABILITY,
    defaultDateType = DEFAULT_DATE_TYPE,
    availability,
    dateType,
    onAvailabilityChange,
    onDateTypeChange,
    showHeader = true,
    layout = 'stacked',
    className = '',
}: DateNowSidebarProps) {
    const [internalAvailability, setInternalAvailability] =
        useState<DateAvailability>(defaultAvailability)
    const [internalDateType, setInternalDateType] =
        useState<DateType>(defaultDateType)

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

    const isInline = layout === 'inline'

    const availabilityChips = DATE_AVAILABILITY_OPTIONS.map((option) => (
        <button
            key={option.value}
            type="button"
            onClick={() => selectAvailability(option.value)}
            className={chip(activeAvailability === option.value)}
        >
            {option.label}
        </button>
    ))

    const dateTypeChips = DATE_TYPE_OPTIONS.map((option) => (
        <button
            key={option.value}
            type="button"
            onClick={() => selectDateType(option.value)}
            className={chip(activeDateType === option.value)}
        >
            {option.label}
        </button>
    ))

    return (
        // Root fills the height its parent gives it. Header never scrolls; only the filters area does.
        <div
            className={`flex h-full min-h-0 w-full ${
                isInline ? 'flex-col md:flex-row md:items-center' : 'flex-col'
            } ${className}`}
        >
            {/* Fixed header */}
            {showHeader && (
                <header
                    className={`shrink-0 bg-slate-50 ${
                        isInline
                            ? 'px-[6.757cqw] pt-[1.333cqh] pb-[0.444cqh] md:py-[1.333cqh] md:pr-[2.703cqw]'
                            : 'px-[5.405cqw] py-[1.778cqh] border-b border-gray-100'
                    }`}
                >
                    <h1
                        className="m-0 text-[7.432cqw] font-extrabold leading-tight"
                        style={{ letterSpacing: '-0.01em' }}
                    >
                        <span style={{ color: C.ink }}>Date </span>
                        <span style={{ color: C.pinkText }}>Plans</span>
                    </h1>
                </header>
            )}

            {/* Scrollable filters */}
            {isInline ? (
                <div
                    className={`flex min-w-0 flex-1 flex-col gap-[2.703cqw] py-[0.889cqh] md:flex-row md:items-center md:gap-[6.757cqw] md:overflow-x-auto ${hideScrollbar}`}
                >
                    {/* Mobile: each row scrolls horizontally on its own, stacked one below the other */}
                    <div
                        className={`flex items-center gap-[2.703cqw] overflow-x-auto px-[6.757cqw] md:shrink-0 md:overflow-visible md:px-0 ${hideScrollbar}`}
                    >
                        {availabilityChips}
                    </div>
                    <div
                        className={`flex items-center gap-[2.703cqw] overflow-x-auto px-[6.757cqw] md:shrink-0 md:overflow-visible md:px-0 ${hideScrollbar}`}
                    >
                        {dateTypeChips}
                    </div>
                </div>
            ) : (
                <div
                    className={`min-h-0 flex-1 overflow-y-auto px-[5.405cqw] py-[1.778cqh] flex flex-col gap-[6.757cqw] ${hideScrollbar}`}
                >
                    <section className="flex flex-col gap-[2.703cqw] text-black">
                        <div className="font-bold">Availability</div>
                        <div className="flex flex-wrap gap-[2.703cqw]">
                            {availabilityChips}
                        </div>
                    </section>

                    <section className="flex flex-col gap-[2.703cqw] text-black">
                        <div className="font-bold">Date Type</div>
                        <div className="flex flex-wrap gap-[2.703cqw]">
                            {dateTypeChips}
                        </div>
                    </section>
                </div>
            )}
        </div>
    )
}

export default DateNowSidebar
