"use client";

import { useEffect, useState } from "react";
import { TicketCheck } from "lucide-react";
import EventCard from "../components/ui/EventCard";
import { Event_Type, useEventData } from "../context/EventContext";
import { MoonLoader } from "react-spinners";
import Link from "next/link";
import { formattedDate } from "../components/eventSection/eventSection";
import { getClientToken } from "@/utils/token";

import IconMGlowingStar from "react-fluentui-emoji/icons/modern/IconMGlowingStar";
import IconMPeopleHugging from "react-fluentui-emoji/icons/modern/IconMPeopleHugging";
import IconMNightWithStars from "react-fluentui-emoji/icons/modern/IconMNightWithStars";
import IconMRevolvingHearts from "react-fluentui-emoji/icons/modern/IconMRevolvingHearts";
import IconMForkAndKnifeWithPlate from "react-fluentui-emoji/icons/modern/IconMForkAndKnifeWithPlate";
import IconMOpenBook from "react-fluentui-emoji/icons/modern/IconMOpenBook";
import IconMVideoGame from "react-fluentui-emoji/icons/modern/IconMVideoGame";
import IconMBasketball from "react-fluentui-emoji/icons/modern/IconMBasketball";
import IconMMountain from "react-fluentui-emoji/icons/modern/IconMMountain";
import IconMGemStone from "react-fluentui-emoji/icons/modern/IconMGemStone";
import IconMBriefcase from "react-fluentui-emoji/icons/modern/IconMBriefcase";
import IconMRedHeart from "react-fluentui-emoji/icons/modern/IconMRedHeart";
import FilterCard from "../components/ui/filterCard";
import { CityDropdown } from "@/components/ui/CityDropdown";

const eventFilters = [
  { type: "ALL", label: "All Events", icon: IconMGlowingStar, img: "https://ik.imagekit.io/aezmcynwbe/welvors/all_events.jpeg?updatedAt=1790594692140" }, { type: "SINGLES_MIXER", label: "Singles Mixer", icon: IconMPeopleHugging, img: "https://ik.imagekit.io/aezmcynwbe/welvors/singles_mixer.jpeg" }, { type: "SPEED_DATES", label: "Speed Dates", icon: IconMRevolvingHearts, img: "https://ik.imagekit.io/aezmcynwbe/welvors/speed_dates.jpeg" }, { type: "SINGLES_NIGHT", label: "Singles Night", icon: IconMNightWithStars, img: "https://ik.imagekit.io/aezmcynwbe/welvors/singles_night.jpeg" }, { type: "DINNER_DATES", label: "Dinner Dates", icon: IconMForkAndKnifeWithPlate, img: "https://ik.imagekit.io/aezmcynwbe/welvors/dinner_date.jpeg" }, { type: "ACTIVITY_MATCH", label: "Activity Match", icon: IconMOpenBook, img: "https://ik.imagekit.io/aezmcynwbe/welvors/activity.jpeg" }, { type: "PLAY_AND_MATCH", label: "Play & Match", icon: IconMVideoGame, img: "https://ik.imagekit.io/aezmcynwbe/welvors/play.jpeg" }, { type: "TRAVEL_DATES", label: "Travel Dates", icon: IconMBasketball, img: "https://ik.imagekit.io/aezmcynwbe/welvors/travel.jpeg" }, { type: "TREK_DATES", label: "Trek Dates", icon: IconMMountain, img: "https://ik.imagekit.io/aezmcynwbe/welvors/trekking.jpeg" }, { type: "THE_RESERVE", label: "The Reserve", icon: IconMGemStone, img: "https://ik.imagekit.io/aezmcynwbe/welvors/reserve.jpeg" }, { type: "PROFESSIONALS_MEET", label: "Professionals Meet", icon: IconMBriefcase, img: "https://ik.imagekit.io/aezmcynwbe/welvors/newpro.jpeg" }, { type: "OTHER_DATES", label: "Other Dates", icon: IconMRedHeart, img: "https://ik.imagekit.io/aezmcynwbe/welvors/other.jpeg" },];



/** Client auth flag — mirrors the pattern in app/events/[id]/page.tsx. */
function useLoggedIn(): boolean {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const sync = () => setLoggedIn(getClientToken() !== null);
    sync();
    window.addEventListener("welvors-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("welvors-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return loggedIn;
}

export default function EventsFeed() {
  const { events, loading, error, filter, setFilter } = useEventData();
  const loggedIn = useLoggedIn();

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedCity, setSelectedCity] = useState("Pune");

  // Filter events by selected city
  const filteredEvents = events.filter(
    (event) => event.city === selectedCity
  );

  function handleFilterClick(filterType: string) {
    setActiveFilter(filterType);
    setFilter(filterType);
  }

  // CityDropdown closes itself after a selection, so we only update state here
  function handleCitySelect(city: string) {
    setSelectedCity(city);
  }

  return (
    <div className="flex min-h-screen mx-auto max-w-7xl flex-col gap-2 bg-white py-24 font-sans text-black ">

      {/* HEADER */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center px-4 sm:justify-between">
        <h1 className="font-poppins px-0 text-[28px] font-bold lg:px-5">
          Events near {selectedCity}
        </h1>

        {/* CITY DROPDOWN + MY TICKETS */}
        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-fit">
          <CityDropdown
            selectedCity={selectedCity}
            onSelect={handleCitySelect}
          />

          {/* MY TICKETS — members only */}
          {loggedIn && (
            <Link
              href="/events/myTickets"
              className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-pink-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-pink-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-1"
            >
              <TicketCheck size={16} />
              My Tickets
            </Link>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div
        className="
          grid w-full px-2 grid-flow-col auto-cols-[180px]
          grid-rows-2 gap-4 overflow-x-auto pb-5
          text-center text-[12px]
          scroll-smooth touch-pan-x
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
          sm:place-items-start
          lg:grid-flow-row lg:grid-cols-6 lg:grid-rows-2
          lg:auto-cols-auto lg:place-items-center lg:overflow-visible
        "
      >
        {eventFilters.map((filter) => {
          const Icon = filter.icon;

          return (
            <FilterCard
              key={filter.label}
              title={filter.label}
              isActive={activeFilter === filter.type}
              imageSrc={filter.img}
              onClick={() => handleFilterClick(filter.type)}
            />
          );
        })}
      </div>

      {/* DIVIDER */}
      <div className="border-t border-stone-300 pb-5" />

      {/* EVENTS */}
      {loading ? (
        <div className="flex items-center justify-center">
          <MoonLoader
            color="#C21559"
            size={20}
            speedMultiplier={1}
          />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center text-pink-400">
          Something Went Wrong
        </div>
      ) : events.length === 0 ? (
        <div className="flex items-center justify-center text-pink-400">
          No Events Found
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex items-center justify-center text-pink-400">
          No Events Found
        </div>
      ) : (
        <div
          className={`grid gap-6 place-items-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
            }`}
        >
          {filteredEvents.map((event) => (
            <Link
              href={`/events/${event.id}`}
              key={event.id}
            >
              <EventCard
                image={event.heroImage}
                date={formattedDate(
                  new Date(event.eventDate)
                )}
                startTime={event.startTime}
                endTime={event.endTime}
                title={event.title}
                venue={event.fullAddress}
                interested={event.bookedCount}
                price={event.menEntryPrice}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
