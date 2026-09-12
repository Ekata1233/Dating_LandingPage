"use client";

import React, { SVGProps } from "react";
import { useScrollReveal } from "../useScrollReveal";

const C = {
  bg: "#FBF7F3",
  headingDark: "#2B2A28",
  pink: "#C21559",
  body: "#6B655F",
  label: "#9C948C",
  ctaFrom: "#C93B68",
  ctaTo: "#B31E52",
  cardBorder: "#F0E8E1",
  green: "#2EAF6B",
  gold: "#D4A853",
  lightPink: "#FFF0F3",
};

const Icon = {
  Calendar: (p: SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  MapPin: (p: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  ),
  Users: (p: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="7" r="4" />
      <path d="M3 21c0-4 3-6 6-6" />
      <circle cx="17" cy="7" r="3" />
      <path d="M21 21c0-3.5-2.5-5.5-5-5.5" />
    </svg>
  ),
  Heart: (p: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5 8.6 5 10 6.5 12 8c2-1.5 3.4-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21z" />
    </svg>
  ),
  Sparkles: (p: SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  ),
  Arrow: (p: SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  Check: (p: SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  Phone: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  ),
};

const EVENTS_FEATURES = [
  { icon: <Icon.Calendar />, text: "Curated socials, mixers & meetups" },
  { icon: <Icon.MapPin />, text: "Happening in your city" },
  { icon: <Icon.Users />, text: "Meet verified, like-minded people" },
  { icon: <Icon.Heart />, text: "From matches to real conversations" },
];

function Events() {
  const [headerRef, headerVisible] = useScrollReveal({ threshold: 0.05 });

  const handleDiscover = () => {
    if (typeof document === "undefined") return;
    const loginBtn = document.querySelector<HTMLElement>("[data-login-trigger]");
    loginBtn?.click();
  };

  return (
    <section
      id="events"
      ref={headerRef}
      className="relative w-full overflow-hidden py-10 px-6 pt-10 pb-24 sm:px-10"
      style={{
        background: "radial-gradient(ellipse 120% 90% at 50% 0%, #FFB3C7 0%, #FFD1DD 25%, #FFE8EE 45%, #FFF0F3 65%, #FFF9FA 85%)",

      }}
    >
      {/* Subtle decorative accent — right side */}
      <div
        className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(194,21,89,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-10">

        {/* ---- IMAGE COLUMN (LEFT) ---- */}
        <div className="relative flex justify-center lg:justify-start order-2 lg:order-1">
          <div
            className={`relative ${headerVisible ? "wv-reveal-scale is-visible" : "wv-reveal-scale"}`}
            style={{ animationDelay: "200ms" }}
          >
            <div className="wv-drift-tilt">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/events.png"
                alt="Welvors Events — Meet people in real life"
                className="w-[280px] sm:w-[320px] lg:w-[380px] rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15),0_8px_24px_rgba(194,21,89,0.10)] transition-all duration-500 hover:shadow-[0_30px_80px_rgba(0,0,0,0.2),0_12px_32px_rgba(194,21,89,0.15)] hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>

        {/* ---- TEXT COLUMN (RIGHT) ---- */}
        <div className="flex flex-col gap-4 lg:max-w-lg order-1 lg:order-2">

          {/* Section label */}
          <div
            className={`inline-flex mt-10 w-fit items-center gap-2 rounded-full border px-4 py-1.5 ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
            style={{
              borderColor: C.cardBorder,
              backgroundColor: C.lightPink,
              animationDelay: "0ms",
            }}
          >
            <Icon.Sparkles style={{ color: C.pink, width: 14, height: 14 }} />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: C.pink }}
            >
              Events on Welvors
            </span>
          </div>

          {/* Heading */}
          <h2
            className={`text-3xl leading-[1.12] sm:text-4xl lg:text-[2.6rem] ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: C.headingDark,
              animationDelay: "100ms",
            }}
          >
            Real Events.{" "}
            <span
              className="wv-gradient-animated italic"
              style={{ WebkitTextFillColor: "transparent" }}
            >
              Real Connections
            </span>
          </h2>

          {/* Sub-heading */}
          <p
            className={`text-[15px] leading-relaxed ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
            style={{ color: C.body, animationDelay: "250ms" }}
          >
            Welvors brings you offline, Curated events where you meet verified
            people face-to-face. No awkward swiping, no uncertainty. Just real
            moments with real intentions.
          </p>

          {/* Feature bullets */}
          <div
            className={`flex flex-col gap-3 ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
            style={{ animationDelay: "400ms" }}
          >
            {EVENTS_FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: C.lightPink, color: C.pink }}
                >
                  {f.icon}
                </span>
                <span
                  className="text-[14px] font-medium"
                  style={{ color: C.headingDark }}
                >
                  {f.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className={`mt-2 flex flex-col sm:flex-row items-start gap-3 ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
            style={{ animationDelay: "600ms" }}
          >
            <button
              type="button"
              onClick={handleDiscover}
              className="cm-cta group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-[13px] font-bold text-white shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_36px_rgba(194,21,89,0.4)] active:scale-95"
              style={{
                background: "linear-gradient(135deg, #F26FA6 0%, #E11D63 100%)",
                boxShadow: `0 8px 28px ${C.pink}35`,
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Icon.Calendar className="transition-transform duration-300 group-hover:scale-125" />
                Explore Events
              </span>
              <span className="cm-shimmer pointer-events-none absolute inset-0" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Events;
