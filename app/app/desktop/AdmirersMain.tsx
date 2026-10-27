"use client";

import React, { useMemo, useState } from "react";
import { CirclePoundSterling, Lock } from "lucide-react";

import ProfileMain from "./ProfileMain";
import NoLikesBoost from "./AdmiersNoLikes";
import { Loader, Notice } from "../shared/Loader";
import { FALLBACK_AVATAR } from "../shared/mockData";
import { formatDistance } from "../shared/mapUser";
import type { Profile } from "../shared/types";
import {
    useUserProfileData,
    type Admirer,
} from "@/app/context/UserProfileDataContext";
import { useAdmirersTab } from "@/app/context/AdmirersTabContext";

/* -------------------------------------------------------------------------- */
/*  Desktop Admirers screen.                                                  */
/*                                                                            */
/*  The rail lists everyone; this slot shows the full profile of the person    */
/*  picked there (falling back to the first in the tab). The deep sections are */
/*  filled in by `ProfileMain` exactly like the profile page                   */
/*  (`GET /api/user/feed/details/:id`).                                        */
/*                                                                            */
/*  Received likes add the deck controls (`Reject` / `Accept`) and, while the  */
/*  list is locked behind a package, hide the profile behind a blur with the   */
/*  coin unlock. When the active tab has nobody, the Boost nudge takes over.   */
/* -------------------------------------------------------------------------- */

export interface AdmirersMainProps {
    /** Forwarded to the empty state's Boost CTA. */
    onBoost?: () => void;
    /** Forwarded to the empty state's "improve profile" link. */
    onImproveProfile?: () => void;
    /** Accept the shown received admirer (e.g. like them back). */
    onAccept?: (admirer: Admirer) => void;
    /** Reject the shown received admirer (e.g. pass). */
    onReject?: (admirer: Admirer) => void;
    /** Coins charged by the unlock button on a locked profile. */
    revealCost?: number;
    /** Fill the wrapper's height/width instead of a 100vh frame (mobile slot). */
    fluid?: boolean;
}

/**
 * A received/sent admirer only carries a handful of fields. Widen it into the
 * `Profile` the card renders; the details endpoint fills the rest in.
 */
function admirerToProfile(admirer: Admirer): Profile {
    const image = admirer.user.profileImage || FALLBACK_AVATAR;
    const distance = formatDistance(admirer.user.distanceKm);

    return {
        id: admirer.user.id,
        name: admirer.user.name,
        age: admirer.user.age,
        image,
        gallery: admirer.user.profileImage ? [admirer.user.profileImage] : [],
        distance,
        birth_date: "",
        height: "",
        package: { id: "", name: "FREE", startDate: null, endDate: null },
        location: "",
        lookingFor: "",
        religion: "",
        occupation: "",
        education: "",
        bio: distance,
        about: "",
        interests: [],
        career: [],
        lifestyle: [],
        prompts: [],
        family: [],
        networking: [],
        matchScore: admirer.user.matchScore,
    };
}

const AdmirersMain: React.FC<AdmirersMainProps> = ({
    onBoost,
    onImproveProfile,
    onAccept,
    onReject,
    revealCost = 50,
    fluid = false,
}) => {
    const { tab, selectedId, selectAdmirer } = useAdmirersTab();

    const {
        admirersReceived,
        admirersReceivedLoading,
        admirersReceivedError,
        refetchAdmirersReceived,
        admirersSent,
        admirersSentLoading,
        admirersSentError,
        refetchAdmirersSent,
    } = useUserProfileData();

    const isReceived = tab === "received";
    const response = isReceived ? admirersReceived : admirersSent;
    const loading = isReceived ? admirersReceivedLoading : admirersSentLoading;
    const error = isReceived ? admirersReceivedError : admirersSentError;
    const refetch = isReceived ? refetchAdmirersReceived : refetchAdmirersSent;

    const data = response?.data ?? [];
    /* The admirer picked in the rail, else the first one in the tab. */
    const target =
        (selectedId ? data.find((a) => a.user.id === selectedId) : undefined) ??
        data[0] ??
        null;

    const profile = useMemo(() => (target ? admirerToProfile(target) : null), [target]);

    /* Ids unlocked with the coin button this session. The lock is a response
       flag, so without a package every profile in the list starts blurred. */
    const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
    const locked =
        isReceived &&
        !!admirersReceived?.isLocked &&
        !admirersReceived?.isPackageActive &&
        !!profile &&
        !unlockedIds.includes(profile.id);

    /* Move the rail selection onward so Accept / Reject feel like a deck. */
    const goNext = () => {
        if (!target || data.length < 2) return;
        const index = data.findIndex((a) => a.user.id === target.user.id);
        const next = data[(index + 1) % data.length];
        if (next) selectAdmirer(next.user.id);
    };

    const handleAccept = () => {
        if (!target) return;
        onAccept?.(target);
        goNext();
    };

    const handleReject = () => {
        if (!target) return;
        onReject?.(target);
        goNext();
    };

    if (profile && locked) {
        return (
            <div className="relative flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 min-h-0 blur-2xl scale-105 pointer-events-none select-none">
                    <ProfileMain profile={profile} fluid={fluid} />
                </div>

                {/* Lock / coin unlock, over the blurred profile */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/50 px-6 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-900/70 text-white backdrop-blur-sm">
                        <Lock className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-white">This profile is locked</p>
                        <p className="text-sm text-white/75">Unlock to see who liked you</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setUnlockedIds((ids) => [...ids, profile.id])}
                        aria-label={`Unlock for ${revealCost} coins`}
                        className="flex items-center cursor-pointer gap-2 px-5 py-2.5 rounded-full bg-amber-400 text-amber-800 font-semibold text-base shadow-md active:scale-95 transition"
                    >
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600 border border-amber-700/40">
                            <CirclePoundSterling className="w-4 h-4 text-amber-800" />
                        </span>
                        {revealCost} coins to unlock
                    </button>
                </div>
            </div>
        );
    }

    if (profile) {
        return (
            <div className="relative flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 min-h-0">
                    <ProfileMain profile={profile} fluid={fluid} />
                </div>

                {/* Received likes get deck controls, bottom-centre, drawn from
                    the same treatment as `HomeMain`. */}
                {isReceived && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 sm:gap-6 z-20">
                        <button
                            type="button"
                            onClick={handleReject}
                            aria-label="Reject"
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-transparent border border-white/30 backdrop-blur-sm flex items-center justify-center hover:scale-110 hover:border-[#ff4444]/60 hover:shadow-[0_0_20px_rgba(255,68,68,0.3)] transition-all shadow-lg cursor-pointer"
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={handleAccept}
                            aria-label="Accept"
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-transparent border border-white/30 backdrop-blur-sm flex items-center justify-center hover:scale-110 hover:border-[#44ff44]/60 hover:shadow-[0_0_20px_rgba(68,255,68,0.3)] transition-all shadow-lg cursor-pointer"
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="#C21559" stroke="#C21559" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (loading) {
        return (
            <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
                <Loader label="Loading admirers…" hint="Just a moment." />
            </main>
        );
    }

    if (error) {
        return (
            <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
                <Notice
                    title="Couldn't load admirers"
                    detail={error}
                    actionLabel="Try again"
                    onAction={refetch}
                />
            </main>
        );
    }

    return <NoLikesBoost onBoost={onBoost} onImproveProfile={onImproveProfile} />;
};

export default AdmirersMain;
