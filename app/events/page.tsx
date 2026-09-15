"use client"
import { useState } from "react";
import { MapPin, ChevronDown, Ticket, ArrowRight, Home, PlayCircle, Heart, MessageSquare, Calendar, Sparkles } from "lucide-react";
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
const categories = [
  { id: 1, label: "All events", bg: "#fadde3", image: "hero_image.png", alt: "image", seed: "allevents" },
  { id: 2, label: "Speed Dates", bg: "#dbe9f5", image: "hero_image.png", alt: "image", seed: "speeddate" },
  { id: 3, label: "Dinner Dates", bg: "#fadde3", image: "hero_image.png", alt: "image", seed: "dinnerdate" },
  { id: 4, label: "Singles Mixer", bg: "#cfd9e6", image: "hero_image.png", alt: "image", seed: "mixer" },
  { id: 5, label: "Singles Night", bg: "#efe6d3", image: "hero_image.png", alt: "image", seed: "singlesnight" },
  { id: 6, label: "Activity Dates", bg: "#f6e6b8", image: "hero_image.png", alt: "image", seed: "activity" },
  { id: 7, label: "All events", bg: "#fadde3", image: "hero_image.png", alt: "image", seed: "allevents" },
  { id: 8, label: "Speed Dates", bg: "#dbe9f5", image: "hero_image.png", alt: "image", seed: "speeddate" },
  { id: 9, label: "Dinner Dates", bg: "#fadde3", image: "hero_image.png", alt: "image", seed: "dinnerdate" },
  { id: 10, label: "Singles Mixer", bg: "#cfd9e6", image: "hero_image.png", alt: "image", seed: "mixer" },
  { id: 11, label: "Singles Night", bg: "#efe6d3", image: "hero_image.png", alt: "image", seed: "singlesnight" },
  { id: 12, label: "Activity Dates", bg: "#f6e6b8", image: "hero_image.png", alt: "image", seed: "activity" },
];
const filters = ["Today", "This Weekend", "This Month", "Free"];

export default function EventsFeed() {
  const [activeFilter, setActiveFilter] = useState("Today");

  return (
    <div className="flex font-sans flex-col gap-4 bg-white min-h-screen px-8 py-20 text-black">
      {/* Top header */}
      <div className="h-10 flex text-black justify-between items-center blue">
        <div className="flex border-1 border-gray-400 cursor-pointer gap-1 justify-center items-center px-2 py-1 rounded-full">
          <MapPin size={16} color={C.pink} />
          <span>Mumbai</span>
          <ChevronDown size={14} color="#6B7280 " />
        </div>
        <div className="flex text-white cursor-pointer border-2 border-[linear-gradient(135deg,#F26FA6_0%,#E11D63_100%)] bg-[linear-gradient(135deg,#F26FA6_0%,#E11D63_100%)] gap-1 justify-center items-center px-3 py-1.5 rounded-full">
          <Ticket size={18} />
          <span>My Ticket</span>
        </div>
      </div>

      {/* Type of Events */}
      <span className="text-2xl">What's Hot In Mumbai</span>
      <div className="relative overflow-x-auto w-full scrollbar-hide">
        <div className="grid grid-rows-2 grid-flow-col auto-cols-[12.3rem] gap-1 h-36">          {categories.map((item) => (
          <div
            key={item.id}
              style={{ backgroundColor: item.bg }}
            className="flex text-[12px] text-center items-center justify-center h-full rounded-2xl border-2 border-transparent hover:border-pink-400 cursor-pointer transition-colors duration-200"
          >
            <div className="w-1/2">{item.label}</div>
            <div className="w-1/2 h-full overflow-hidden rounded-r-2xl">
              <img className="w-full h-full" src={item.image} alt={item.alt} />
            </div>
          </div>
        ))}
        </div>
      </div>
      <div className="relative text-[14px] flex justify-start gap-4 items-center h-10 overflow-x-auto w-full scrollbar-hide">
        <div className="border-1 rounded-full px-3 py-1">Today</div>
        <div>This Weekend</div>
        <div>This month</div>
        <div>Free Events</div>
      </div>
    </div>
  );
}
