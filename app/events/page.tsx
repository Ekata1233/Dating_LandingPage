"use client"
import { useState } from "react";
import { MapPin, ChevronDown, Ticket, ArrowRight, Home, PlayCircle, Heart, MessageSquare, Calendar, Sparkles } from "lucide-react";

const categories = [
  { label: "All events", bg: "#fadde3", border: true, seed: "allevents" },
  { label: "Speed Dates", bg: "#dbe9f5", seed: "speeddate" },
  { label: "Dinner Dates", bg: "#fadde3", seed: "dinnerdate" },
  { label: "Singles Mixer", bg: "#cfd9e6", seed: "mixer" },
  { label: "Singles Night", bg: "#efe6d3", seed: "singlesnight" },
  { label: "Activity Dates", bg: "#f6e6b8", seed: "activity" },
];

const filters = ["Today", "This Weekend", "This Month", "Free"];

export default function EventsFeed() {
  const [activeFilter, setActiveFilter] = useState("Today");

  return (
    <div className="min-h-screen bg-neutral-200 flex justify-center font-sans">
      <div className="w-full max-w-md bg-orange-50 min-h-screen relative pb-24">

        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 px-5 pt-6 pb-2">
          <button className="flex items-center gap-2 border border-neutral-300 rounded-full px-4 py-2.5 bg-white font-semibold text-sm">
            <MapPin size={16} className="text-rose-600 shrink-0" />
            Mumbai
            <ChevronDown size={12} className="text-neutral-400" />
          </button>
          <button className="flex items-center gap-2 rounded-full px-4 py-3 font-bold text-sm text-white shrink-0 shadow-lg shadow-rose-200"
            style={{ background: "linear-gradient(135deg, #ff5677 0%, #e8395e 100%)" }}>
            <Ticket size={16} />
            My Ticket
          </button>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-extrabold tracking-tight px-5 mt-3 mb-3">
          What's hot in Mumbai
        </h1>

        {/* Category scroller */}
        <div
          className="grid grid-flow-col gap-2.5 overflow-x-auto px-5 pb-1 scrollbar-hide"
          style={{ gridTemplateRows: "repeat(2, 1fr)", gridAutoColumns: "78%" }}
        >
          {categories.map((cat) => (
            <a
              key={cat.label}
              href="#"
              className="relative flex items-center h-24 rounded-2xl px-3.5 font-bold text-sm leading-tight overflow-hidden"
              style={{
                background: cat.bg,
                border: cat.border ? "2px solid #ff5677" : "none",
              }}
            >
              <span className="w-1/2 relative z-10">{cat.label}</span>
              <span
                className="absolute right-0 top-0 bottom-0 w-3/5 bg-cover bg-center"
                style={{
                  backgroundImage: `url(https://picsum.photos/seed/${cat.seed}/300/200)`,
                  WebkitMaskImage: "linear-gradient(to right, transparent, black 28%)",
                  maskImage: "linear-gradient(to right, transparent, black 28%)",
                }}
              />
            </a>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2.5 overflow-x-auto px-5 py-4 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold border ${
                activeFilter === f
                  ? "bg-neutral-900 border-neutral-900 text-white"
                  : "bg-white border-neutral-300 text-neutral-900"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Feed */}
        <div className="flex flex-col gap-5 px-5">

          {/* Featured card */}
          <div
            className="rounded-3xl p-5 text-white relative overflow-hidden"
            style={{
              background:
                "#0d0d10 radial-gradient(circle at 75% 20%, rgba(90,130,255,0.55), transparent 55%), radial-gradient(circle at 20% 80%, rgba(255,90,150,0.25), transparent 50%)",
            }}
          >
            <span className="inline-flex items-center gap-1 bg-amber-200 text-amber-900 text-xs font-extrabold tracking-wide px-3 py-1.5 rounded-full mb-3.5">
              <Sparkles size={12} /> FEATURED
            </span>
            <div className="text-sm text-neutral-300 mb-1.5">
              Sat, Oct 17 · 6:00 PM · Skyline Rooftop
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-1.5">
              Sunset Soiree for Singles
            </h2>
            <div className="text-sm text-neutral-400 mb-4">
              50 singles · SINGLES NIGHT
            </div>
            <button className="inline-flex items-center gap-2 bg-white text-neutral-900 rounded-full px-4 py-2.5 font-bold text-sm">
              View details
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Trek banner */}
          <div
            className="rounded-3xl relative overflow-hidden flex flex-col p-4 aspect-[4/3] bg-cover bg-center"
            style={{ backgroundImage: "url(https://picsum.photos/seed/sunrisetrail/700/560)" }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.35), transparent 45%)" }}
            />
            <div className="flex justify-between items-start relative z-10">
              <span className="bg-white text-rose-600 font-extrabold text-xs tracking-wide px-3.5 py-1.5 rounded-full">
                TREK DATES
              </span>
              <span
                className="text-white font-bold text-sm px-5 py-2 rounded-full"
                style={{ background: "linear-gradient(135deg, #ff5677 0%, #e8395e 100%)" }}
              >
                Free
              </span>
            </div>
            <div className="mt-auto text-center text-white relative z-10">
              <div className="italic font-serif text-3xl" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.35)" }}>
                Sunrise Trails
              </div>
              <div
                className="italic font-serif text-3xl text-amber-400"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.35)" }}
              >
                New Connections
              </div>
              <div className="text-xs font-bold tracking-widest mt-1.5" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>
                HIKE · MEET · EXPLORE · BELONG
              </div>
            </div>
          </div>

        </div>

        {/* Bottom nav */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-neutral-200 flex items-center justify-between px-6 py-3.5">
          <Home size={24} className="text-neutral-700" />
          <PlayCircle size={24} className="text-neutral-700" />
          <Heart size={24} className="text-neutral-700" />
          <MessageSquare size={24} className="text-neutral-700" />
          <button
            className="flex items-center gap-2 text-white rounded-full px-5 py-2.5 font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #ff5677 0%, #e8395e 100%)" }}
          >
            <Calendar size={16} />
            Events
          </button>
        </div>

      </div>
    </div>
  );
}
