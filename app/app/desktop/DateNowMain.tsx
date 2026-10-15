'use client';

import React, { useEffect, useRef, useState } from 'react';
import DateNowCard from '../cards/DateNowCard';
import { useDatePlans } from '@/app/context/DateNowContext';
import OpenInAppModal from '@/components/ui/OpenInAppModal';
import { Loader } from '../shared/Loader';

// Replace with your real deep link / store links

export interface DateNowMainProps {
    /** Fill the parent and scroll one card at a time (mobile). */
    fluid?: boolean;
    /** Optional cap on how many plan cards to render. Renders all if omitted. */
    count?: number;
}

function DateNowMain({ fluid = false, count }: DateNowMainProps) {
    const { filter, datePlans, loading, error, refetch } = useDatePlans();
    const [selectedPlanId, setSelectedPlanId] = useState<string | number | null>(null);
    const listRef = useRef<HTMLDivElement>(null);

    /* The card list owns its own scroll, so scrolling the window did nothing.
       Reset the list to the top whenever the sidebar applies a new filter. */
    useEffect(() => {
        listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [filter]);
    const isModalOpen = selectedPlanId !== null;
    const plans = (datePlans ?? []).slice(0, count);
    const cardClass = fluid ? 'shrink-0 snap-start snap-always' : 'shrink-0';

    return (
        <main className={`flex-1 flex flex-col relative ${fluid ? 'h-full w-full' : 'h-screen'}`}>
            <OpenInAppModal
                open={isModalOpen}
                onClose={() => setSelectedPlanId(null)}
                featureName="request this date"
                appUrl="https://play.google.com/store/apps/details?id=com.infynod.welvors&pcampaignid=web_share"
            />

            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                <div
                    ref={listRef}

                    className={
                        fluid
                            ? 'flex flex-col w-full h-full overflow-y-auto snap-y snap-mandatory py-3 px-3 gap-5 [&::-webkit-scrollbar]:hidden'
                            : 'flex flex-col h-full aspect-[300/520] max-w-full rounded-2xl overflow-y-auto shadow-2xl transition-all duration-500 ease-out py-5 px-3.5 gap-5 [&::-webkit-scrollbar]:hidden'
                    }
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {loading && (
                        <Loader
                            label="Finding date plans…"
                            hint="This only takes a moment."
                        />
                    )}

                    {!loading && error && (
                        <div className="m-auto flex flex-col items-center gap-3 text-center">
                            <p className="text-sm">Something went wrong loading plans.</p>
                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="px-4 py-2 rounded-lg border text-sm"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {!loading && !error && plans.length === 0 && (
                        <p className="m-auto text-sm opacity-70">No date plans found.</p>
                    )}

                    {!loading &&
                        !error &&
                        plans.map((d) => (
                            <DateNowCard
                                key={d.id}
                                image={d.activityIcon}
                                category={d.activity}
                                date={d.eventDate}
                                liveLabel={d.venueName}
                                host={d.host}
                                matchPercent={d.matchScore.percentage}
                                trustPercent={d.host.trustScore}
                                time={d.eventTime}
                                description={d.note}
                                duration={d.duration}
                                whoPays={d.whoPays}
                                className={cardClass}
                                onRequest={() => setSelectedPlanId(d.id)}
                            />
                        ))}
                </div>
            </div>
        </main>
    );
}

export default DateNowMain;