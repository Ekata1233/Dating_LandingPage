"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  ChevronDown,
} from "lucide-react";
import EventCard from "../components/ui/EventCard";
import { Event_Type, useEventData } from "../context/EventContext";
import { MoonLoader } from "react-spinners";
import Link from "next/link";
import { formattedDate } from "../components/eventSection/eventSection";

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

const eventFilters = [
  { type: "ALL", label: "All Events", icon: IconMGlowingStar, img: "https://ik.imagekit.io/aezmcynwbe/welvors/all_events.jpeg?updatedAt=1790594692140" }, { type: "SINGLES_MIXER", label: "Singles Mixer", icon: IconMPeopleHugging, img: "https://ik.imagekit.io/aezmcynwbe/welvors/singles_mixer.jpeg" }, { type: "SPEED_DATES", label: "Speed Dates", icon: IconMRevolvingHearts, img: "https://ik.imagekit.io/aezmcynwbe/welvors/speed_dates.jpeg" }, { type: "SINGLES_NIGHT", label: "Singles Night", icon: IconMNightWithStars, img: "https://ik.imagekit.io/aezmcynwbe/welvors/singles_night.jpeg" }, { type: "DINNER_DATES", label: "Dinner Dates", icon: IconMForkAndKnifeWithPlate, img: "https://ik.imagekit.io/aezmcynwbe/welvors/dinner_date.jpeg" }, { type: "ACTIVITY_MATCH", label: "Activity Match", icon: IconMOpenBook, img: "https://ik.imagekit.io/aezmcynwbe/welvors/activity.jpeg" }, { type: "PLAY_AND_MATCH", label: "Play & Match", icon: IconMVideoGame, img: "https://ik.imagekit.io/aezmcynwbe/welvors/play.jpeg" }, { type: "TRAVEL_DATES", label: "Travel Dates", icon: IconMBasketball, img: "https://ik.imagekit.io/aezmcynwbe/welvors/travel.jpeg" }, { type: "TREK_DATES", label: "Trek Dates", icon: IconMMountain, img: "https://ik.imagekit.io/aezmcynwbe/welvors/trekking.jpeg" }, { type: "THE_RESERVE", label: "The Reserve", icon: IconMGemStone, img: "https://ik.imagekit.io/aezmcynwbe/welvors/reserve.jpeg" }, { type: "PROFESSIONALS_MEET", label: "Professionals Meet", icon: IconMBriefcase, img: "https://ik.imagekit.io/aezmcynwbe/welvors/newpro.jpeg" }, { type: "OTHER_DATES", label: "Other Dates", icon: IconMRedHeart, img: "https://ik.imagekit.io/aezmcynwbe/welvors/other.jpeg" },];

const cities = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Chandigarh",
  "Nagpur",
  "Indore",
  "Kochi",
  "Noida",
  "Gurugram",
  "Bhubaneswar",
  "Vadodara",
  "Nashik",
];

export default function EventsFeed() {
  const { events, loading, error, filter, setFilter } = useEventData();

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedCity, setSelectedCity] = useState("Pune");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter events by selected city
  const filteredEvents = events.filter(
    (event) => event.city === selectedCity
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsCityDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleFilterClick(filterType: string) {
    setActiveFilter(filterType);
    setFilter(filterType);
  }

  function handleCitySelect(city: string) {
    setSelectedCity(city);
    setIsCityDropdownOpen(false);
  }

  return (
    <div className="flex min-h-screen flex-col gap-2 bg-white px-3 py-24 font-sans text-black lg:px-12">

      {/* HEADER */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-poppins px-0 text-[28px] font-bold lg:px-5">
          Events near {selectedCity}
        </h1>

        {/* CITY DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() =>
              setIsCityDropdownOpen(!isCityDropdownOpen)
            }
            className="flex cursor-pointer items-center gap-1 rounded-full border border-gray-400 px-2.5 py-1"
          >
            <MapPin size={16} className="text-pink-400" />

            {selectedCity}

            <ChevronDown
              size={16}
              className={`transition-transform ${isCityDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>

          {isCityDropdownOpen && (
            <div className="absolute right-0 z-50 mt-2 max-h-60 w-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-pink-50 ${selectedCity === city
                    ? "bg-pink-100 font-medium text-pink-600"
                    : "text-gray-700"
                    }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div
        className="
          grid w-full grid-flow-col auto-cols-[180px]
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
            size={25}
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