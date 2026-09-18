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


export default function EventsFeed() {
  const [activeFilter, setActiveFilter] = useState("Today");

  return (
    <div className="flex font-sans flex-col gap-4 bg-white min-h-screen px-8 py-20 text-black">
      <h1 className="font-brand font-bold text-[28px]">Events in Pune</h1>
    </div>
  );
}
