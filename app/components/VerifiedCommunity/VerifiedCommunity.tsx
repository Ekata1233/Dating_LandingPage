"use client";

import React, { SVGProps, useCallback, useEffect, useRef, useState } from "react";
import { useScrollReveal, staggerDelay } from "../useScrollReveal";

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

/* ------------------------------------------------------------------ */
/*  Horizontal Scroll Timeline Card                                    */
/* ------------------------------------------------------------------ */
function HorizontalTierCard({ tier, isActive }: { tier: (typeof TIERS)[number]; isActive: boolean }) {
  const a = ACCENT[tier.accent];
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`group  wv-glow-card bg-white p-6 transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.08)]"}`}
      style={{
        borderColor: a.cardBorder,
        border: `1px solid ${a.cardBorder}`,
      }}
    >
      {/* Tier badge + icon */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 items-center group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] justify-center rounded-xl"
          style={{ backgroundColor: a.tint, color: a.main }}
        >
          {tier.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3
              className="text-lg font-bold"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: C.headingDark,
              }}
            >
              {tier.name}
            </h3>
            <span
              className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: a.badgeBg, color: a.badgeText }}
            >
              {tier.tier}
            </span>
          </div>
          <p className="text-[13px]" style={{ color: C.body }}>
            {tier.subtitle}
          </p>
        </div>
      </div>

      {/* Checks list */}
      <div className="mt-4 space-y-2.5">
        {tier.checks.map((check, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div
              className="flex h-5 w-5 flex-none items-center justify-center rounded-full"
              style={{ backgroundColor: a.tint, color: a.main }}
            >
              <Icon.Check width="12" height="12" />
            </div>
            <span className="text-[13px] font-medium" style={{ color: C.headingDark }}>
              {check}
            </span>
          </div>
        ))}
      </div>

      {/* Note */}
      <div
        className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2"
        style={{ backgroundColor: a.tint }}
      >
        <Icon.Bulb style={{ color: a.main }} />
        <p className="text-[12px] font-medium" style={{ color: a.badgeText }}>
          {tier.note}
        </p>
      </div>
    </div>
  );
}

function VerifiedCommunity() {
  const [headerRef, headerVisible] = useScrollReveal();
  const [tiersRef, tiersVisible] = useScrollReveal({ threshold: 0.05 });
  const [benefitsRef, benefitsVisible] = useScrollReveal({ threshold: 0.05 });
  const [activeTier, setActiveTier] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTier((prev) => (prev === TIERS.length - 1 ? 0 : prev + 1));
    }, 3500);
    return () => clearInterval(interval);
  }, []);



  return (
    <section style={{ background: "radial-gradient(ellipse 125% 95% at 50% 100%, #E0C0E8 0%, #ECD2F0 18%, #F4E2F6 38%, #F8EAF2 55%, #FAF0F0 72%, #FCF4F0 88%, #FCF8F4 100%)" }} className="w-full py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* -------------------- Header -------------------- */}
        <div ref={headerRef} className={`mx-auto max-w-4xl text-center wv-section-divider ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`}>
          <span
            className="text-[15px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: C.pink }}
          >
            Verified Community
          </span>

          <h2
            className="mt-3 text-3xl leading-tight sm:text-4xl lg:text-[2.6rem]"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: C.headingDark,
            }}
          >
            Strict checks. Zero {" "}
            <span className="wv-gradient-animated italic" style={{ WebkitTextFillColor: "transparent" }}>
              Fake Profiles
            </span>
          </h2>

          <p
            className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed"
            style={{ color: C.body }}
          >
            No fakes, catfish, or bots. Every profile passes a strict multi-step check so you only match with real people seeking genuine connections.
          </p>
        </div>

        {/* -------------------- Tiers -------------------- */}
        <div ref={tiersRef} className={`mt-12 ${tiersVisible ? "wv-reveal-scale is-visible" : "wv-reveal-scale"}`}>

          {/* Desktop: static grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIERS.map((t, i) => (
              <HorizontalTierCard
                key={t.n}
                tier={t}
                isActive={i === activeTier}
              />
            ))}
          </div>

          {/* Mobile: single-card carousel with dots */}
          <div className="md:hidden">
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeTier * 100}%)` }}
              >
                {TIERS.map((t) => (
                  <div key={t.n} className="w-full flex-none px-1">
                    <HorizontalTierCard tier={t} isActive />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation dots */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {TIERS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveTier(i)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${i === activeTier ? "h-2.5 w-6" : "h-2.5 w-2.5 hover:opacity-70"}`}
                  style={{
                    backgroundColor: i === activeTier ? C.pink : "#FFFFFF",
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default VerifiedCommunity;
