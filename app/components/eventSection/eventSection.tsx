"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useScrollReveal } from "../useScrollReveal";
import { useEventData } from "@/app/context/EventContext";
import { Event_Type } from "@/app/context/EventContext";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import EventCard from "../ui/EventCard";

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

/** Date Formatter */
export function formattedDate(date: Date) {
    return date.toLocaleDateString("en-US", {
        weekday: "short", // "Fri"
        month: "short", // "Sep"
        day: "numeric", // "18"
    });
}

// Events (Static for now, needs to be dynamic)
const EventsFallback: Event_Type[] = [
    {
        id: "1",
        title: "New Year Party",
        city: "Pune",
        eventDate: "2026-09-17",
        fullAddress: "Kothrud, Pune",
        bookedCount: 25,
        heroImage: "https://ik.imagekit.io/aezmcynwbe/welvors/party.jpg?updatedAt=1789705931343",
    },
    {
        id: "2",
        title: "Live Music Night",
        city: "Pune",
        eventDate: "2026-09-19",
        fullAddress: "Koregaon Park, Pune",
        bookedCount: 42,
        heroImage: "https://ik.imagekit.io/aezmcynwbe/welvors/concert.jpg?updatedAt=1789705931443",
    },
    {
        id: "3",
        title: "Comedy Night",
        eventDate: "2026-09-20",
        city: "Pune",
        fullAddress: "Baner, Pune",
        bookedCount: 68,
        heroImage: "https://ik.imagekit.io/aezmcynwbe/welvors/comedy.jpg?updatedAt=1789705931333",
    },
];

// Accent aur Deegree ke liye array
const EventUI = [
    { accent: "#F6D6E4", degree: "355deg" },
    { accent: "#DCC4F7", degree: "5deg" },
    { accent: "#BFE8D7", degree: "355deg" },
    { accent: "#C9EFD8", degree: "5deg" },
    { accent: "#CFC3F5", degree: "355deg" },
];

// How long the tap animation plays on touch devices before navigating (ms)
const TAP_NAVIGATE_DELAY = 450;

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/*  - .ev-reveal : mobile bottom → top entrance when card is in view   */
/*  - .ev-card   : hover effect (real mouse only) + same effect on tap */
/* ------------------------------------------------------------------ */
const CardStyles = () => (
    <style>{`
    /* ---------- Mobile entrance ---------- */
    @media (max-width: 767px) {
      .ev-reveal {
        opacity: 0;
        transform: translateY(48px);
        transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        will-change: opacity, transform;
      }
      .ev-reveal.is-in {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ---------- Card base ---------- */
    .ev-card {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
                  box-shadow 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .ev-card .ev-img {
      transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .ev-card .ev-cta {
      transition: box-shadow 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    }

    /* ---------- Shared "active" look ---------- */
    .ev-card.is-tapped {
      transform: translateY(-10px);
      box-shadow: 0 22px 50px rgba(0, 0, 0, 0.18);
    }
    .ev-card.is-tapped .ev-img { transform: scale(1.1); }
    .ev-card.is-tapped .ev-cta { box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15); transform: scale(1.04); }

    /* ---------- Desktop hover (only devices that really hover) ---------- */
    @media (hover: hover) and (pointer: fine) {
      .ev-card:hover {
        transform: translateY(-10px);
        box-shadow: 0 22px 50px rgba(0, 0, 0, 0.18);
      }
      .ev-card:hover .ev-img { transform: scale(1.1); }
      .ev-card:hover .ev-cta { box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15); transform: scale(1.04); }
    }

    @media (prefers-reduced-motion: reduce) {
      .ev-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
      .ev-card, .ev-card .ev-img, .ev-card .ev-cta { transition: none !important; }
    }
  `}</style>
);

/* ------------------------------------------------------------------ */
/*  Single event card                                                  */
/* ------------------------------------------------------------------ */


/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */
function EventCards() {
    const [headerRef, headerVisible] = useScrollReveal();
    const [tiersRef, tiersVisible] = useScrollReveal({ threshold: 0.05 });
    const { events: contextEvents } = useEventData();

    // Derive events from context, falling back only when context has none.
    const [events, setEvents] = useState<Event_Type[]>(() =>
        contextEvents && contextEvents.length > 0 ? contextEvents : EventsFallback
    );
    const limitedEvents = events.slice(0, 5);

    // Keep local events synced whenever context data changes (e.g. arrives after fetch)
    useEffect(() => {
        setEvents(contextEvents && contextEvents.length > 0 ? contextEvents : EventsFallback);
    }, [contextEvents]);

    return (
        <section
            id="events"
            style={{
                background:
                    "radial-gradient(ellipse 125% 95% at 50% 100%, #E0C0E8 0%, #ECD2F0 18%, #F4E2F6 38%, #F8EAF2 55%, #FAF0F0 72%, #FCF4F0 88%, #FCF8F4 100%)",
            }}
            className="w-full py-16 sm:py-20 lg:pl-12"
        >
            <CardStyles />

            <div className="mx-auto max-w-7xl pl-4 sm:pl-6">
                {/* -------------------- Header -------------------- */}
                <div
                    ref={headerRef}
                    className={`mx-auto max-w-4xl text-center wv-section-divider ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"
                        }`}
                >
                    <h2
                        className="mt-3 text-3xl leading-tight sm:text-4xl lg:text-[2.6rem]"
                        style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            color: C.headingDark,
                        }}
                    >
                        Trending Events{" "}
                        <span
                            className="wv-gradient-animated italic"
                            style={{ WebkitTextFillColor: "transparent" }}
                        ></span>
                    </h2>
                </div>

                {/* -------------------- Cards -------------------- */}
                <div
                    ref={tiersRef}
                    className={`mt-12 ${tiersVisible ? "wv-reveal-scale is-visible" : "wv-reveal-scale"}`}
                >
                    {/* Horizontal scroller. Vertical padding gives the lifted card and its shadow room. */}
                    <div className=" py-4 gap-10 relative overscroll-x-none overflow-x-auto scrollbar-hide scroll-smooth flex">
                        {limitedEvents.map((event, i) => (
                            <Link href={event.id.length > 2 ? `/events/${event.id}` : `/events`} key={event.id} >
                                <EventCard
                                    image={event.heroImage}
                                    date={formattedDate(new Date(event.eventDate))}
                                    startTime={event.startTime}
                                    endTime={event.endTime}
                                    title={event.title}
                                    venue={event.fullAddress}
                                    interested={event.bookedCount}
                                    price={event.menEntryPrice}
                                // onClick={() => router.push(`/events/${event.id}`)}
                                />
                            </Link>
                        ))}

                    </div>
                </div>
                <div className="w-full text-black flex flex-col items-center p-5 ">

                    <Link href={"/events"}>
                        <button className="flex  items-center gap-2 font-semibold cursor-pointer bg-white px-4 py-2.5 rounded-full hover:scale-[1.02]"
                            style={{
                                background: "linear-gradient(135deg, #F26FA6 0%, #E11D63 100%)",
                                color: "white",
                            }}
                        >
                            More Events
                            <ArrowRight size={16} />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default EventCards;
