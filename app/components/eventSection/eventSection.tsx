"use client";

import React, { SVGProps, useCallback, useEffect, useRef, useState } from "react";
import { useScrollReveal, staggerDelay } from "../useScrollReveal";
import { useEventData } from "@/app/context/EventContext";
import { Event } from "@/app/context/EventContext";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
/* ------------------------------------------------------------------ */
/*  Brand colors inline                                                */
/* ------------------------------------------------------------------ */
const C = {
    bg: "#FCF8F4",
    headingDark: "#2B2A28",
    pink: "#C21559",
    body: "#6B655F",
    check: "#3F8F5B",
};

// Per-tier accent palettes — pink → purple → teal → gold
const ACCENT = {
    pink: {
        main: "#C21559",
        line: "#C21559",
        tint: "#FBE8EF",
        badgeBg: "#FBE8EF",
        badgeText: "#C21559",
        track: "#EFE3DF",
        cardBorder: "#F0E8E1",
    },
    purple: {
        main: "#7C3AED",
        line: "#7C3AED",
        tint: "#F1EAFB",
        badgeBg: "#EDE4FA",
        badgeText: "#6D28D9",
        track: "#EAE4F2",
        cardBorder: "#E2D8F0",
    },
    teal: {
        main: "#0E7C86",
        line: "#0E7C86",
        tint: "#E4F2F3",
        badgeBg: "#DDEEEF",
        badgeText: "#0B6570",
        track: "#E0EBEA",
        cardBorder: "#CFE4E3",
    },
    amber: {
        main: "#C9962A",
        line: "#C9962A",
        tint: "#F7EFD9",
        badgeBg: "#F4EAD2",
        badgeText: "#A87A12",
        track: "#EEE6D5",
        cardBorder: "#E8D6A8",
    },
} as const;

type AccentKey = keyof typeof ACCENT;

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */
const Icon = {
    Phone: (p: SVGProps<SVGSVGElement>) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <rect x="6" y="2" width="12" height="20" rx="2.5" />
            <path d="M11 18h2" />
        </svg>
    ),
    IdCard: (p: SVGProps<SVGSVGElement>) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <rect x="2" y="5" width="20" height="14" rx="2.5" />
            <circle cx="8" cy="12" r="2" />
            <path d="M13 10h5M13 14h4" />
        </svg>
    ),
    Video: (p: SVGProps<SVGSVGElement>) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <rect x="2" y="6" width="13" height="12" rx="2.5" />
            <path d="M15 10l6-3v10l-6-3z" />
        </svg>
    ),
    Star: (p: SVGProps<SVGSVGElement>) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <polygon points="12 2 15 9 22 9.3 17 14 18.5 21 12 17.3 5.5 21 7 14 2 9.3 9 9" />
        </svg>
    ),
    Check: (p: SVGProps<SVGSVGElement>) => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M20 6L9 17l-5-5" />
        </svg>
    ),
    Bulb: (p: SVGProps<SVGSVGElement>) => (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M9 18h6M10 22h4" />
            <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2h6c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z" />
        </svg>
    ),
    ChevronLeft: (p: SVGProps<SVGSVGElement>) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M15 18l-6-6 6-6" />
        </svg>
    ),
    ChevronRight: (p: SVGProps<SVGSVGElement>) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M9 18l6-6-6-6" />
        </svg>
    ),

    /* ---- "What this means for you" section icons ---- */
    ShieldTick: (p: SVGProps<SVGSVGElement>) => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9.5 12l2 2 3.5-4" />
        </svg>
    ),
    Clock: (p: SVGProps<SVGSVGElement>) => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
        </svg>
    ),
    CheckMark: (p: SVGProps<SVGSVGElement>) => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M20 6L9 17l-5-5" />
        </svg>
    ),
    HeartOutline: (p: SVGProps<SVGSVGElement>) => (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5 8.6 5 10 6.5 12 8c2-1.5 3.4-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21z" />
        </svg>
    ),
};

/** Date Formatter */
export function formattedDate(date: Date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'short', // "Fri"
        month: 'short',   // "Sep"
        day: 'numeric'    // "18"
    });
}

/* ------------------------------------------------------------------ */
/*  Tier data                                                          */
/* ------------------------------------------------------------------ */
const TIERS: {
    n: number;
    name: string;
    tier: string;
    subtitle: string;
    icon: React.ReactNode;
    progress: number;
    checks: string[];
    note: string;
    accent: AccentKey;
}[] = [
        {
            n: 1,
            name: "Basic",
            tier: "TIER 1",
            subtitle: "Entry level",
            icon: <Icon.Phone />,
            progress: 25,
            checks: ["Mobile number", "Email verified", "Location verified"],
            note: "Stops fake signups",
            accent: "pink",
        },
        {
            n: 2,
            name: "Verified",
            tier: "TIER 2",
            subtitle: "Identity confirmed",
            icon: <Icon.IdCard />,
            progress: 25,
            checks: ["Government ID", "Face / selfie", "Live video check"],
            note: "Blocks catfish & stolen photos",
            accent: "purple",
        },
        {
            n: 3,
            name: "Trusted",
            tier: "TIER 3",
            subtitle: "Verified in person",
            icon: <Icon.Video />,
            progress: 75,
            checks: ["Education verified", "Profession verified", "Income verified"],
            note: "Rules out identity & resume liars",
            accent: "teal",
        },
        {
            n: 4,
            name: "Elite",
            tier: "TIER 4",
            subtitle: "Fully vetted",
            icon: <Icon.Star />,
            progress: 100,
            checks: [
                "Background check via verified third-party partner", "Emergency contact verified"
            ],
            note: "Designed to filter out scammers",
            accent: "amber",
        },
    ];

// Events (Static for now, needs to be dynamic)
const EventsFallback: Event[] = [
    {
        id: "1",
        title: "New Year Party",
        eventDate: "2026-09-17",
        fullAddress: "Kothrud, Pune",
        bookedCount: 25,
        heroImage: "https://ik.imagekit.io/aezmcynwbe/welvors/party.jpg?updatedAt=1789705931343",
    },
    {
        id: "2",
        title: "Live Music Night",
        eventDate: "2026-09-19",
        fullAddress: "Koregaon Park, Pune",
        bookedCount: 42,
        heroImage: "https://ik.imagekit.io/aezmcynwbe/welvors/concert.jpg?updatedAt=1789705931443",
    },
    {
        id: "3",
        title: "Comedy Night",
        eventDate: "2026-09-20",
        fullAddress: "Baner, Pune",
        bookedCount: 68,
        heroImage: "https://ik.imagekit.io/aezmcynwbe/welvors/comedy.jpg?updatedAt=1789705931333",
    },
];

// Accent aur Deegree ke liye array
const EventUI = [
    { accent: "#F9A8D4", degree: "355deg" },
    { accent: "#D8B4FE", degree: "5deg" },
    { accent: "#6EE7B7", degree: "355deg" },
    { accent: "#86EFAC", degree: "5deg" },
    { accent: "#C4B5FD", degree: "355deg" },
];

/* ------------------------------------------------------------------ */
/*  "What this means for you" benefits                                 */
/* ------------------------------------------------------------------ */
const BENEFITS = [
    {
        title: "Real, verified profiles",
        body: "Every profile completes verification before it reaches you — built to keep bots and catfish out.",
        icon: <Icon.ShieldTick />,
    },
    {
        title: "Save your time",
        body: "Skip the endless screening — trust is confirmed before you ever chat.",
        icon: <Icon.Clock />,
    },
    {
        title: "Honest by design",
        body: "Age, job and background are checked — what you read is what's real.",
        icon: <Icon.CheckMark />,
    },
    {
        title: "Date with peace of mind",
        body: "Meet with more confidence — verified details, genuine intent.",
        icon: <Icon.HeartOutline />,
    },
];

function EventCards() {
    const [headerRef, headerVisible] = useScrollReveal();
    const [tiersRef, tiersVisible] = useScrollReveal({ threshold: 0.05 });
    const [benefitsRef, benefitsVisible] = useScrollReveal({ threshold: 0.05 });
    const [activeTier, setActiveTier] = useState(0);
    const { events: contextEvents } = useEventData();

    // Derive events from context, falling back only when context has none.
    const [events, setEvents] = useState<Event[]>(() =>
        contextEvents && contextEvents.length > 0 ? contextEvents : EventsFallback
    );
    const limitedEvents = events.slice(0, 5);

    // Keep local events synced whenever context data changes (e.g. arrives after fetch)
    useEffect(() => {
        setEvents(contextEvents && contextEvents.length > 0 ? contextEvents : EventsFallback);
    }, [contextEvents]);

    // Carousel ticker — independent of event data, runs once on mount
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTier((prev) => (prev === TIERS.length - 1 ? 0 : prev + 1));
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="events" style={{
            background: "radial-gradient(ellipse 125% 95% at 50% 100%, #E0C0E8 0%, #ECD2F0 18%, #F4E2F6 38%, #F8EAF2 55%, #FAF0F0 72%, #FCF4F0 88%, #FCF8F4 100%)"
        }} className="w-full py-16 sm:py-20 lg:pl-12">
            <div className="mx-auto max-w-7xl pl-4 sm:pl-6">
                {/* -------------------- Header -------------------- */}
                <div ref={headerRef} className={`mx-auto max-w-4xl text-center wv-section-divider ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`}>
                    <h2
                        className="mt-3 text-3xl leading-tight sm:text-4xl lg:text-[2.6rem]"
                        style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            color: C.headingDark,
                        }}
                    >
                        Trending Events{" "}
                        <span className="wv-gradient-animated italic" style={{ WebkitTextFillColor: "transparent" }}>
                        </span>
                    </h2>
                </div>

                {/* -------------------- Tiers -------------------- */}
                <div ref={tiersRef} className={`mt-12 ${tiersVisible ? "wv-reveal-scale is-visible" : "wv-reveal-scale"}`}>

                    {/* Desktop: static grid */}
                    <div className="h-[520px] gap-8 relative overscroll-x-none overflow-x-auto scrollbar-hide scroll-smooth flex">
                        {limitedEvents.map((event, i) => (
                            <Link href={event.id.length > 2 ? `/events/${event.id}` : "/events"} key={event.id ?? i}>
                                <div
                                    className="h-full w-[280px] min-w-[280px] text-black flex flex-col gap-8 justify-center items-center p-5 cursor-pointer"
                                    style={{ backgroundColor: EventUI[i % EventUI.length].accent }}
                                >
                                    {/* Event Image */}
                                    <div className="h-1/3 flex flex-col justify-center items-center">
                                        <img
                                            src={event.heroImage}
                                            alt={`${event.title} — Date Now event`}
                                            className="w-[180px]"
                                            style={{ rotate: EventUI[i % EventUI.length].degree }}
                                        />
                                    </div>

                                    {/* Event Details */}
                                    <div className="h-2/3 flex flex-col gap-2 text-center justify-start items-center w-full">

                                        {/* Event Title */}
                                        <h1 className="text-[32px] font-brand font-bold text-wrap">
                                            {event.title}
                                        </h1>

                                        {/* Event Date & Address */}
                                        <p className="text-[17px] font-quicksand font-semibold">
                                            {formattedDate(new Date(event.eventDate))} {" · "}{" "}
                                            {event.fullAddress}
                                        </p>

                                        {/* Bottom Section */}
                                        <div className="mt-auto flex flex-col items-center gap-2">

                                            {/* Interested Count */}
                                            <p className="text-[15px] font-quicksand font-semibold">
                                                {event.bookedCount} Interested
                                            </p>

                                            {/* CTA */}
                                            <button className="font-semibold cursor-pointer bg-white px-4 py-2.5 rounded-full">
                                                Learn More
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        <div
                            className="h-full w-[200px] min-w-[200px] text-black flex flex-col justify-center items-start p-5"

                        >
                            <Link href={"/events"}>
                            <button className="flex items-center gap-2 font-semibold cursor-pointer bg-white px-4 py-2.5 rounded-full">
                                More Events
                                <ArrowRight size={16}/>
                            </button> 
                            </Link>                       
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default EventCards;