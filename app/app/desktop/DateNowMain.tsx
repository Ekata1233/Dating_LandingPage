import React from 'react'
import DateNowCard from '../cards/DateNowCard'

export interface DateNowMainProps {
    /** Fill the parent and scroll one card at a time (mobile). */
    fluid?: boolean;
    /** How many plan cards to render. */
    count?: number;
}

function DateNowMain({ fluid = false, count = 2 }: DateNowMainProps) {
    return (
        <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
            {/* Card container – fills remaining height */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Plan list */}
                <div
                    className={
                        fluid
                            ? "flex flex-col w-full h-full overflow-y-auto snap-y snap-mandatory py-3 px-3 gap-4"
                            : "flex flex-col mt-2 w-[320px] sm:w-[300px] h-[520px] sm:h-[520px] rounded-2xl overflow-y-auto shadow-2xl transition-all duration-500 ease-out py-3 px-2 gap-4 "
                    }
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}>
                    {Array.from({ length: count }, (_, index) => (
                        <DateNowCard key={index} className={fluid ? "shrink-0 snap-start snap-always" : 'shrink-0'} />
                    ))}
                </div>
            </div>
        </main>
    )
}
export default DateNowMain
