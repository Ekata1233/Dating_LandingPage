"use client";

import React from "react";
import AdmirerReciveCard from "../cards/AdmirerReciveCard";
import AdmirerSentCard from "../cards/AdmirerSentCard";

import {
    useUserProfileData,
    type Admirer,
} from "@/app/context/UserProfileDataContext";
import {
    useAdmirersTab,
    type AdmirersTab,
} from "@/app/context/AdmirersTabContext";
import type { AdmirerReceived, AdmirerSent } from "../shared/types";
import { Loader, Notice } from "../shared/Loader";

export type { AdmirersTab };

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

/* Hides the scrollbar in Firefox, old Edge/IE and Chrome/Safari while keeping
   the container scrollable (wheel, touch, keyboard). */
const NO_SCROLLBAR =
    "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

export interface AdmiererSidebarProps {
    received?: AdmirerReceived[];
    sent?: AdmirerSent[];
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

/* -------------------------------------------------------------------------- */
/*  API → card mapping.                                                        */
/*                                                                            */
/*  The context keeps the whole `/api/user/admirers` response (so screens can   */
/*  also read `isLocked` / `isPackageActive` / `count`), while the cards want    */
/*  their own flat props. This is the one place the two shapes meet.            */
/* -------------------------------------------------------------------------- */

function formatDistance(distanceKm: number): string {
    if (!Number.isFinite(distanceKm) || distanceKm <= 0) return "Nearby";
    if (distanceKm < 1) return "Nearby";
    return `${Math.round(distanceKm)} km`;
}

function toReceivedCard(admirer: Admirer, revealed: boolean): AdmirerReceived {
    return {
        imageUrl: admirer.user.profileImage,
        name: admirer.user.name,
        age: admirer.user.age,
        matchPercent: Math.round(admirer.user.matchScore ?? 0),
        distance: formatDistance(admirer.user.distanceKm),
        revealed,
    };
}

function toSentCard(admirer: Admirer): AdmirerSent {
    return {
        avatarUrl: admirer.user.profileImage,
        name: admirer.user.name,
        age: admirer.user.age,
        id: admirer.user.id,
        gender: admirer.user.gender,
        matchPercent: Math.round(admirer.user.matchScore ?? 0),
        location: formatDistance(admirer.user.distanceKm),
        matchedAgo: admirer.timeAgo,
        likeStatus: admirer.likeStatus,
        status: admirer.likeStatus.matched
            ? "matched"
            : admirer.likeStatus.seen
                ? "seen"
                : "sent",
    };
}

function AdmiererSidebar({
    received,
    sent,
    tab,
    onTabChange,
    showHeader = true,
    onReject,
    onLike,
    onSendRose,
    className = "",
}: AdmiererSidebarProps) {
    const { tab: sharedTab, setTab, selectAdmirer, selectedId } = useAdmirersTab();
    const activeTab = tab ?? sharedTab;

    const {
        admirersReceived,
        admirersReceivedLoading,
        admirersReceivedError,
        refetchAdmirersReceived,
        admirersSent,
        admirersSentLoading,
        admirersSentError,
        refetchAdmirersSent,
        sendRose,
    } = useUserProfileData();

    const select = (next: AdmirersTab) => {
        if (tab === undefined) setTab(next);
        onTabChange?.(next);
    };

    /* Received likes are blurred until the user owns an active package (or the
       list isn't locked at all). */
    const receivedRevealed = !!admirersReceived
        ? admirersReceived.isPackageActive || !admirersReceived.isLocked
        : false;

    /* Keep the source admirer's id alongside each card so a tap can tell the
       main pane which profile to open. */
    type CardItem<T> = { key: string; card: T; id?: string };

    const receivedItems: CardItem<AdmirerReceived>[] = received
        ? received.map((card, index) => ({ key: card.imageUrl + index, card }))
        : (admirersReceived?.data ?? []).map((a, index) => ({
              key: a.user.id + index,
              card: toReceivedCard(a, receivedRevealed),
              id: a.user.id,
          }));

    const sentItems: CardItem<AdmirerSent>[] = sent
        ? sent.map((card, index) => ({ key: card.avatarUrl + index, card }))
        : (admirersSent?.data ?? []).map((a, index) => ({
              key: a.user.id + index,
              card: toSentCard(a),
              id: a.user.id,
          }));

    return (
        <div className={`flex flex-col px-[4.054cqw] py-[1.778cqh] w-full h-full min-h-0 ${className}`}>
            {showHeader && (
                <header className='px-[2.703cqw]'
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <h1 className='text-[7.432cqw]'
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
                <button onClick={() => select("received")} className={`flex-1 cursor-pointer text-[4.73cqw] py-[1.333cqh] text-center border-b-2 font-semibold  ${activeTab === "received" ? "border-[#C21559] text-[#C21559]" : "border-slate-50 text-black"}`}>
                    Received
                </button>
                <button onClick={() => select("sent")} className={`cursor-pointer flex-1 text-[4.73cqw] py-[1.333cqh]  text-center font-semibold border-b-2 ${activeTab === "sent" ? "border-[#C21559] text-[#C21559]" : "border-slate-50 text-black"}`}>
                    Sent
                </button>
            </div>

            {/* Matches Section */}
            {activeTab === "received" ? (
                admirersReceivedLoading && !receivedItems.length ? (
                    <Loader label="Loading admirers…" className="flex-1 min-h-0" />
                ) : admirersReceivedError && !receivedItems.length ? (
                    <Notice
                        title="Couldn't load admirers"
                        detail={admirersReceivedError}
                        actionLabel="Try again"
                        onAction={refetchAdmirersReceived}
                        className="flex-1 min-h-0"
                    />
                ) : receivedItems.length ? (
                    <div
                        className={`grid grid-cols-2 auto-rows-min content-start items-start gap-[2.703cqw] px-[2.703cqw] pt-[1.778cqh] pb-[2.703cqw] w-full flex-1 min-h-0 overflow-y-auto ${NO_SCROLLBAR}`}
                    >
                        {receivedItems.map((item) => (
                            /* The wrapper owns the card's size (4:5 portrait). Whatever
                               height the card sets for itself is overridden to fill the
                               wrapper, so cards can never grow into the row below. */
                            <div
                                key={item.key}
                                className="relative w-full min-w-0 shrink-0 aspect-[4/5] [&>*]:!h-full [&>*]:!w-full [&>*]:!max-h-full"
                            >
                                <AdmirerReciveCard
                                    {...item.card}
                                    className={
                                        item.id && item.id === selectedId
                                            ? "ring-2 ring-inset ring-[#C21559]"
                                            : ""
                                    }
                                    onOpenProfile={
                                        item.id ? () => selectAdmirer(item.id!) : undefined
                                    }
                                    onReject={() => onReject?.(item.card)}
                                    onLike={() => onLike?.(item.card)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="flex-1 min-h-0 flex items-center justify-center px-4 text-center text-sm text-gray-400">
                        No admirers yet. When someone likes you, they&apos;ll appear here.
                    </p>
                )
            ) : admirersSentLoading && !sentItems.length ? (
                <Loader label="Loading likes…" className="flex-1 min-h-0" />
            ) : admirersSentError && !sentItems.length ? (
                <Notice
                    title="Couldn't load your likes"
                    detail={admirersSentError}
                    actionLabel="Try again"
                    onAction={refetchAdmirersSent}
                    className="flex-1 min-h-0"
                />
            ) : sentItems.length ? (
                <div
                    className={`grid grid-cols-1 content-start gap-[2.703cqw] auto-rows-[47.297cqw] px-[2.703cqw] pt-[1.778cqh] pb-[2.703cqw] w-full flex-1 min-h-0 overflow-y-auto ${NO_SCROLLBAR}`}
                >
                    {sentItems.map((item) => (
                        <AdmirerSentCard
                            key={item.key}
                            {...item.card}
                            className={
                                item.id && item.id === selectedId
                                    ? "rounded-[7cqw] ring-2 ring-inset ring-[#C21559]"
                                    : ""
                            }
                            onOpenProfile={
                                item.id ? () => selectAdmirer(item.id!) : undefined
                            }
                            onSendRose={() => {
                                if (item.id) void sendRose(item.id);
                                else onSendRose?.(item.card);
                            }}
                        />
                    ))}
                </div>
            ) : (
                <p className="flex-1 min-h-0 flex items-center justify-center px-4 text-center text-sm text-gray-400">
                    No likes sent yet. Profiles you like will show up here.
                </p>
            )}
        </div>
    )
}

export default AdmiererSidebar
