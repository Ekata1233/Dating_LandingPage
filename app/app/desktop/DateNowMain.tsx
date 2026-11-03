
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import DateNowCard from '../cards/DateNowCard';
import { useDatePlans } from '@/app/context/DateNowContext';
import OpenInAppModal from '@/components/ui/OpenInAppModal';
import { Loader } from '../shared/Loader';

const REFERRAL_STORAGE_KEY = 'welvors_referral';

const PLAY_STORE_URL =
    'https://play.google.com/store/apps/details?id=com.infynod.welvors&pcampaignid=web_share';

const getReferralCodeFromUrl = (): string | null => {
    if (typeof window === 'undefined') return null;

    const pathname = window.location.pathname;

    // Example: /refer/QUSIV32R
    const match = pathname.match(/^\/refer\/([^/]+)\/?$/i);

    if (match) {
        try {
            return decodeURIComponent(match[1]).trim() || null;
        } catch {
            return null;
        }
    }

    // Also support query parameters
    const params = new URLSearchParams(window.location.search);

    return (
        params.get('referralCode')?.trim() ||
        params.get('ref')?.trim() ||
        null
    );
};
const buildPlayStoreUrl = (referralCode: string | null): string => {
    if (!referralCode) {
        return PLAY_STORE_URL;
    }

    const url = new URL(PLAY_STORE_URL);

    // URLSearchParams automatically encodes '=' as %3D
    url.searchParams.set(
        'referrer',
        `welvors_referral=${referralCode}`
    );

    return url.toString();
};

export interface DateNowMainProps {
    /** Fill the parent and scroll one card at a time (mobile). */
    fluid?: boolean;

    /** Optional cap on how many plan cards to render. */
    count?: number;
}

function DateNowMain({ fluid = false, count }: DateNowMainProps) {
    const {
        filter,
        datePlans,
        loading,
        error,
        status,
        hasSession,
        refetch,
    } = useDatePlans();

    const [selectedPlanId, setSelectedPlanId] = useState<
        string | number | null
    >(null);

const [referralCode] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
        return null;
    }

    const urlCode = getReferralCodeFromUrl();

    if (urlCode) {
        return urlCode;
    }

    return sessionStorage.getItem(REFERRAL_STORAGE_KEY);
});
    const listRef = useRef<HTMLDivElement>(null);

    // ============================================
    // 1. GET AND SAVE REFERRAL CODE
    // ============================================

 useEffect(() => {
    if (!referralCode) return;

    sessionStorage.setItem(
        REFERRAL_STORAGE_KEY,
        referralCode
    );
}, [referralCode]);

    // ============================================
    // 2. DYNAMIC GOOGLE PLAY STORE LINK
    // ============================================

    const playStoreUrl = useMemo(() => {
        return buildPlayStoreUrl(referralCode);
    }, [referralCode]);

    // ============================================
    // 3. RESET SCROLL WHEN FILTER CHANGES
    // ============================================

    useEffect(() => {
        listRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }, [filter]);

    // ============================================
    // 4. EXISTING DATE PLAN LOGIC
    // ============================================

    const isModalOpen = selectedPlanId !== null;

    const plans = (datePlans ?? []).slice(0, count);

    const cardClass = fluid
        ? 'shrink-0 snap-start snap-always'
        : 'shrink-0';

    const waiting =
        loading && !(status === 'idle' && hasSession === false);

    const empty =
        !waiting && !error && plans.length === 0;

    // ============================================
    // 5. RENDER
    // ============================================

    return (
        <main
            className={`flex-1 flex flex-col relative ${
                fluid ? 'h-full w-full' : 'h-screen'
            }`}
        >
            {/* Dynamic referral Google Play Store link */}
            <OpenInAppModal
                open={isModalOpen}
                onClose={() => setSelectedPlanId(null)}
                featureName="request this date"
                appUrl={playStoreUrl}
            />

            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                <div
                    ref={listRef}
                    className={
                        fluid
                            ? 'flex flex-col w-full h-full overflow-y-auto snap-y snap-mandatory py-3 px-3 gap-5 [&::-webkit-scrollbar]:hidden'
                            : 'flex flex-col h-full aspect-[300/520] max-w-full rounded-2xl overflow-y-auto shadow-2xl transition-all duration-500 ease-out py-5 px-3.5 gap-5 [&::-webkit-scrollbar]:hidden'
                    }
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {/* Loading */}
                    {waiting && (
                        <Loader
                            label="Finding date plans…"
                            hint="This only takes a moment."
                        />
                    )}

                    {/* Error */}
                    {!waiting && error && (
                        <div className="m-auto flex flex-col items-center gap-3 text-center">
                            <p className="text-sm">
                                Something went wrong loading plans.
                            </p>

                            <button
                                type="button"
                                onClick={() => refetch()}
                                className="px-4 py-2 rounded-lg border text-sm"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Empty */}
                    {empty && (
                        <div className="m-auto flex flex-col items-center gap-2 px-6 text-center">
                            <p className="text-sm font-semibold">
                                No date plans found
                            </p>

                            <p className="text-xs opacity-70">
                                {hasSession === false
                                    ? 'Sign in to see plans near you.'
                                    : 'Try another filter or check back shortly.'}
                            </p>
                        </div>
                    )}

                    {/* Date Plan Cards */}
                    {!waiting &&
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
                                onRequest={() =>
                                    setSelectedPlanId(d.id)
                                }
                            />
                        ))}
                </div>
            </div>
        </main>
    );
}

export default DateNowMain;
