"use client"
import { useEffect, useState } from "react";
import { MapPin, ChevronDown, Ticket, ArrowRight, Home, PlayCircle, Heart, MessageSquare, Calendar, Sparkles } from "lucide-react";
import EventCard from "../components/ui/EventCard";
import { Event, useEventData } from "../context/EventContext";
import { MoonLoader } from "react-spinners";
import Link from "next/link";
import { formattedDate } from "../components/eventSection/eventSection";
import IconMGlowingStar from 'react-fluentui-emoji/icons/modern/IconMGlowingStar';
import IconMPeopleHugging from 'react-fluentui-emoji/icons/modern/IconMPeopleHugging';
import IconMNightWithStars from 'react-fluentui-emoji/icons/modern/IconMNightWithStars';
import IconMRevolvingHearts from 'react-fluentui-emoji/icons/modern/IconMRevolvingHearts';
import IconMForkAndKnifeWithPlate from 'react-fluentui-emoji/icons/modern/IconMForkAndKnifeWithPlate';
import IconMOpenBook from 'react-fluentui-emoji/icons/modern/IconMOpenBook';
import IconMVideoGame from 'react-fluentui-emoji/icons/modern/IconMVideoGame';
import IconMBasketball from 'react-fluentui-emoji/icons/modern/IconMBasketball';
import IconMMountain from 'react-fluentui-emoji/icons/modern/IconMMountain';
import IconMGemStone from 'react-fluentui-emoji/icons/modern/IconMGemStone';
import IconMBriefcase from 'react-fluentui-emoji/icons/modern/IconMBriefcase';
import IconMRedHeart from 'react-fluentui-emoji/icons/modern/IconMRedHeart';
import FilterCard from "../components/ui/filterCard";
const eventFilters = [
  {
    type: "ALL",
    label: "All Events",
    icon: IconMGlowingStar,
  },
  {
    type: "SINGLES_MIXER",
    label: "Singles Mixer",
    icon: IconMPeopleHugging,
  },
  {
    type: "SPEED_DATES",
    label: "Speed Dates",
    icon: IconMRevolvingHearts,
  },
  {
    type: "SINGLES_NIGHT",
    label: "Singles Night",
    icon: IconMNightWithStars,
  },
  {
    type: "DINNER_DATES",
    label: "Dinner Dates",
    icon: IconMForkAndKnifeWithPlate,
  },
  {
    type: "ACTIVITY_MATCH",
    label: "Activity Match",
    icon: IconMOpenBook,
  },
  {
    type: "PLAY_AND_MATCH",
    label: "Play & Match",
    icon: IconMVideoGame,
  },
  {
    type: "TRAVEL_DATES",
    label: "Travel Dates",
    icon: IconMBasketball,
  },
  {
    type: "TREK_DATES",
    label: "Trek Dates",
    icon: IconMMountain,
  },
  {
    type: "THE_RESERVE",
    label: "The Reserve",
    icon: IconMGemStone,
  },
  {
    type: "PROFESSIONALS_MEET",
    label: "Professionals Meet",
    icon: IconMBriefcase,
  },
  {
    type: "OTHER_DATES",
    label: "Other Dates",
    icon: IconMRedHeart,
  },
];
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
  const { events, loading, error, filter, setFilter } = useEventData();
  const [activeFilter, setActiveFilter] = useState("ALL");
  function handleFilterClick(filter: string) {
    setActiveFilter(filter);
    setFilter(filter)
  }

  return (
    <div className="flex font-sans flex-col gap-2 bg-white min-h-screen px-3 lg:px-12  py-24 text-black">
      <div className="flex flex-col sm:flex-row gap-2  sm:items-center sm:justify-between">
        <h1 className="font-bold text-[28px] font-poppins lg:px-5" >Events near Pune</h1>
        <div className="flex items-center gap-1 border border-gray-400 px-2.5 py-1 rounded-full cursor-pointer max-w-[90px]">
          <MapPin size={16} className="text-pink-400" />
          Pune
          <ChevronDown size={16} />
        </div>
      </div>
      {/* FILTERS STRIP */}
      <div className="grid w-full pb-5 grid-rows-2 grid-flow-col auto-cols-[180px] gap-4 overflow-x-auto text-[12px] text-center lg:grid-cols-6 lg:grid-rows-2 lg:grid-flow-row lg:auto-cols-auto lg:overflow-visible lg:place-items-center sm:place-items-start scroll-smooth touch-pan-x
[scrollbar-width:none] [&::-webkit-scrollbar]:hidden
">        
{eventFilters.map((filter) => {
        const Icon = filter.icon;
        return (
            <FilterCard onClick={() => handleFilterClick(filter.type)} key={filter.label} title={filter.label} />
        );
      })}
      </div>
      <div className="border-t border-stone-300 pb-5 ">
      </div>
      {loading ?
        <div className="flex items-center justify-center">
          <MoonLoader color="#C21559" size={25} speedMultiplier={1} />
        </div> : error ?
          <div className="flex items-center justify-center text-pink-400">
            Something Went Wrong
          </div> : events.length == 0 ?
            <div className="flex items-center justify-center text-pink-400">
              No Events Found
            </div> : <div className={` grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center `}>
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
      }
    </div>
  );
}
