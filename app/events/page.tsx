"use client"
import { useEffect, useState } from "react";
import { MapPin, ChevronDown, Ticket, ArrowRight, Home, PlayCircle, Heart, MessageSquare, Calendar, Sparkles } from "lucide-react";
import EventCard from "../components/ui/EventCard";
import { Event, useEventData } from "../context/EventContext";
import { MoonLoader } from "react-spinners";
import Link from "next/link";
import { formattedDate } from "../components/eventSection/eventSection";

/* ------------------------------------------------------------------ */
/*  Brand colors inline rakhe hain (Tailwind theme pe depend nahi)     */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#FCF8F4",
  headingDark: "#2B2A28",
  pink: "#C21559",
  body: "#6B655F",
  chipBorder: "#EADFD8",
  ctaFrom: "#C93B68",
  ctaTo: "#B31E52",
  badgeBg: "#FBE8EF",
  stripBg: "#EFE8E2",
  black: "#000000",
  lightPink: "#FFF0F3",
  gradientPink: `linear-gradient(135deg, #F26FA6 0%, #E11D63 100%)`,
};


export default function EventsFeed() {
  const [activeFilter, setActiveFilter] = useState("Today");
  const { events, loading, error } = useEventData();
  if (loading) {
    return <div
      className="bg-white h-screen flex justify-center items-center">
      <MoonLoader color="#C21559" speedMultiplier={2} />
    </div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!events.length) {
    return <div>No events available.</div>;
  }
  return (
    <div className="flex font-sans flex-col gap-4 bg-white min-h-screen px-8 py-24 text-black">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-[28px] font-poppins" >Events near Pune</h1>
        <span className="flex items-center gap-1 border border-gray-400 px-2.5 py-1 rounded-full cursor-pointer">
          <MapPin size={16} className="text-pink-400" />
          Pune
          <ChevronDown size={16} className="" />
        </span>
      </div>
      <div className="w-[180px] ">
      </div>
      <div className="flex gap-6 pt-8 border-t border-stone-300 overscroll-x-none overflow-x-auto scrollbar-hide scroll-smooth">
        {events.map((event, i) => (
          <Link href={`/events/${event.id}`} key={event.id} >
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
  );
}
