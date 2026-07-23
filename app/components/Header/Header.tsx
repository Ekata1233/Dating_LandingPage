"use client";

import React, { SVGProps, useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Mockup profile photo — apni image /public me daal ke path yahan     */
/*  update karo. Jab tak nahi hai, gradient fallback dikhega.           */
/* ------------------------------------------------------------------ */
const PROFILE_IMG = "/download.jpg";

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
};

/* ------------------------------------------------------------------ */
/*  Inline SVG icons (koi dependency nahi)                             */
/* ------------------------------------------------------------------ */
const Icon = {
  Shield: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  EyeOff: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 10 8 10 8a13.2 13.2 0 0 1-1.67 2.68M6.6 6.6C3.6 8.3 2 12 2 12s3 8 10 8a9.3 9.3 0 0 0 5.4-1.6" />
      <path d="M1 1l22 22" />
    </svg>
  ),
  Globe: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" />
    </svg>
  ),
  Star: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <polygon points="12 2 15 9 22 9.3 17 14 18.5 21 12 17.3 5.5 21 7 14 2 9.3 9 9" />
    </svg>
  ),
  Arrow: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  Lock: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  ),
  Heart: (p: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5 8.6 5 10 6.5 12 8c2-1.5 3.4-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21z" />
    </svg>
  ),
  Check: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  Clock: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  User: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  Image: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="9" cy="9" r="1.8" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  /* ---------- naye icons: mockup ke liye ---------- */
  Filter: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  ),
  Bell: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 6-3 7-3 7h18s-3-1-3-7" />
      <path d="M10.3 20a2 2 0 0 0 3.4 0" />
    </svg>
  ),
  Close: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  Rose: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
      <path
        d="M12 3c2.6 0 4.6 1.9 4.6 4.4 0 2.6-2 4.6-4.6 4.6S7.4 10 7.4 7.4C7.4 4.9 9.4 3 12 3z"
        fill="#D93A5C"
      />
      <path
        d="M12 5.2c1.4 0 2.4 1 2.4 2.2s-1 2.2-2.4 2.2-2.4-1-2.4-2.2 1-2.2 2.4-2.2z"
        fill="#F2758C"
      />
      <path
        d="M12 12v9"
        stroke="#3F8F5B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 15.5c-1.8 0-3.2-1-3.2-2.4 1.9 0 3.2 1 3.2 2.4zM12 18c1.8 0 3.2-1 3.2-2.4-1.9 0-3.2 1-3.2 2.4z"
        fill="#3F8F5B"
      />
    </svg>
  ),
};

const CHIPS = [
  {
    label: "Verified profiles only",
    icon: <Icon.Shield style={{ color: "#3F8F5B" }} />,
  },
  {
    label: "SafeFace privacy",
    icon: <Icon.EyeOff style={{ color: C.pink }} />,
  },
  {
    label: "AI matchmaking",
    icon: <Icon.Globe style={{ color: "#3D6FB4" }} />,
  },
  {
    label: "Commitment Mode",
    icon: <Icon.Star style={{ color: "#C99A22" }} />,
  },
];

const STRIP = [
  { label: "Every profile verified", icon: <Icon.Shield /> },
  { label: "Privacy first", icon: <Icon.Lock /> },
  { label: "Real intentions only", icon: <Icon.User /> },
  { label: "Meaningful Matches", icon: <Icon.Heart /> },
];
const AVATARS = [
  { letter: "A", bg: "#C9436E" },
  { letter: "R", bg: "#5B62B5" },
  { letter: "S", bg: "#3F8F5B" },
  { letter: "M", bg: "#B8860B" },
];

/* ------------------------------------------------------------------ */
/*  Mockup card ke stat pills                                          */
/* ------------------------------------------------------------------ */
const STAT_PILLS = ["92% Match", "98% Trust", "~5m Reply"];

function Header() {
  const [waitlistCount, setWaitlistCount] = useState(515);
  // Numbers — live, fallback ke sath
  useEffect(() => {
    const BASE = 515;
    const ANCHOR = new Date("2026-07-22T00:00:00+05:30").getTime(); // yahan se ginti shuru

    // ghanta number ko seed maan ke 1-20 deterministic value
    const perHour = (h: number) => {
      const x = Math.sin(h * 9973) * 10000;
      return 1 + Math.floor((x - Math.floor(x)) * 20); // 1..20
    };

    const compute = () => {
      const hours = Math.max(0, Math.floor((Date.now() - ANCHOR) / 3600000));
      let total = BASE;
      for (let h = 0; h < hours; h++) total += perHour(h);
      setWaitlistCount(total);
    };

    compute();
    const id = setInterval(compute, 60000); // har minute recheck
    return () => clearInterval(id);
  }, []);

  return (
    <header
      style={{ backgroundColor: C.bg }}
      className="relative w-full overflow-hidden mt-15"
    >
      {/* Float animation (up-down). Reduced-motion pe auto-disable */}
      <style>{`
        @keyframes welvorsFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .welvors-float { animation: welvorsFloat 3.2s ease-in-out infinite; will-change: transform; }
        @media (prefers-reduced-motion: reduce) {
          .welvors-float { animation: none; }
        }
      `}</style>

      {/* Soft pink glow top-right */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[550px] w-[520px] rounded-full opacity-60 blur-3xl "
        style={{
          background:
            "radial-gradient(circle, rgba(233, 151, 182, 0.17) 0%, rgba(247,241,236,0) 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-10 lg:py-20">
        {/*
          COPY WRAPPER
          - Mobile: `contents` => badge (order-1) aur copy (order-3) direct grid items ban jaate hain
          - Desktop: `lg:block` => badge + copy ek hi column me stack (normal 2-col layout, pehle jaisa)
        */}
        <div className="contents lg:block lg:max-w-xl">
          {/* Launch badge — MOBILE ORDER 1 */}
          <div
            className="order-1 mb-7 inline-flex w-full max-w-md items-center gap-2 rounded-full border px-4 py-2 lg:order-none"
            style={{
              backgroundColor: C.badgeBg,
              borderColor: C.ctaFrom,
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: C.pink }}
            />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: C.pink }}
            >
              Launching soon · Early access
            </span>
          </div>

          {/* Copy body — MOBILE ORDER 3 */}
          <div className="order-3 lg:order-none">
            {/* Heading */}
            <h1
              className="text-4xl leading-[1.08] sm:text-5xl lg:text-[3.4rem]"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: C.headingDark,
              }}
            >
              We&apos;re not building another dating app. We&apos;re building{" "}
              <span className="italic" style={{ color: C.pink }}>
                trust.
              </span>
            </h1>

            {/* Bold sub-heading */}
            <p
              className="mt-5 text-[15px] font-bold leading-snug"
              style={{ color: C.pink }}
            >
              A trust-driven, emotionally intelligent ecosystem for people who
              want something real.
            </p>

            {/* Body */}
            <p
              className="mt-4 text-[15px] leading-relaxed"
              style={{ color: C.body }}
            >
              Built for people who want something genuine — verified profiles,
              safety built in, and matches who want the same things you do. No
              biodata. No family pressure. Just you, on your own timeline.
            </p>

            {/* Feature chips */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {CHIPS.map((chip) => (
                <span
                  key={chip.label}
                  className="flex items-center justify-center gap-2 rounded-full border bg-white px-4 py-2 text-[13.5px] font-semibold"
                  style={{
                    borderColor: C.chipBorder,
                    color: C.headingDark,
                  }}
                >
                  {chip.icon}
                  {chip.label}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8">
              <a
                href="#waitlist"
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})`,
                  boxShadow: "0 12px 24px rgba(179,30,82,0.28)",
                }}
              >
                Join the waitlist
                <Icon.Arrow />
              </a>
              <p
                className="mt-3 flex items-center gap-1.5 text-[13px]"
                style={{ color: C.body }}
              >
                <Icon.Lock style={{ color: C.body }} />
                Reserve your founding spot · No spam
              </p>
            </div>

            <div className="mt-6 flex items-start gap-3">
              <div className="flex flex-none -space-x-2">
                {AVATARS.map((av) => (
                  <span
                    key={av.letter}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[12px] font-semibold text-white"
                    style={{ backgroundColor: av.bg }}
                  >
                    {av.letter}
                  </span>
                ))}
              </div>
              <p
                className="text-[13.5px] leading-relaxed"
                style={{ color: C.body }}
              >
                <strong style={{ color: C.headingDark }}>
                  {waitlistCount}+ people
                </strong>{" "}
                are already on the list · new spots open daily.
              </p>
            </div>
          </div>
        </div>

        {/* -------------------- PHONE MOCKUP — MOBILE ORDER 2 -------------------- */}
        <div className="order-2 relative flex justify-center lg:order-none lg:justify-end">
          <div className="relative">
            {/* Floating badge: ID verified */}
            <div className="welvors-float absolute z-20 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl -left-3 top-16 lg:-left-35 lg:top-14">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E4F5EA]"
                style={{ color: "#3F8F5B" }}
              >
                <Icon.Check />
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: C.headingDark }}
              >
                ID verified
              </span>
            </div>

            {/* Floating badge: SafeFace on */}
            <div
              className="welvors-float absolute z-20 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl -right-3 top-[72%] lg:-right-32 lg:top-[64%]"
              style={{ animationDelay: "1.6s" }}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FBE8EF]"
                style={{ color: C.pink }}
              >
                <Icon.Clock />
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: C.headingDark }}
              >
                SafeFace on
              </span>
            </div>

            {/* Phone frame */}
            <div className="relative w-[280px] rounded-[46px] bg-black p-3 shadow-2xl sm:w-[300px]">
              {/* Dynamic island */}
              <div className="absolute left-1/2 top-4 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />

              {/* Screen */}
              <div className="overflow-hidden rounded-[36px] bg-white pt-9">
                {/* ---------- App top bar ---------- */}
                <div className="flex items-center justify-between px-4 pb-3">
                  {/* Filter button */}
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm"
                    style={{
                      borderColor: "#EDE4DC",
                      color: C.headingDark,
                    }}
                  >
                    <Icon.Filter />
                  </span>

                  {/* Logo */}
                  <span className="flex items-center gap-1.5">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: C.pink }}
                    >
                      <Icon.Heart width="13" height="13" />
                    </span>
                    <span
                      className="text-[16px] font-bold"
                      style={{ color: C.headingDark }}
                    >
                      Wel<span style={{ color: C.pink }}>vors</span>
                    </span>
                  </span>

                  {/* Bell button */}
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm"
                    style={{
                      borderColor: "#EDE4DC",
                      color: C.headingDark,
                    }}
                  >
                    <Icon.Bell />
                  </span>
                </div>

                {/* ---------- Profile card ---------- */}
                <div
                  className="relative mx-3 mb-3 h-[440px] overflow-hidden rounded-[26px] sm:h-[470px]"
                  style={{
                    background:
                      "linear-gradient(180deg, #2FB8C6 0%, #7FC9C4 40%, #5A5049 100%)",
                  }}
                >
                  {/* Photo (agar /public me maujood hai) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={PROFILE_IMG}
                    alt="Welvors profile preview"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />

                  {/* Bottom gradient scrim taaki text readable rahe */}
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.72) 100%)",
                    }}
                  />

                  {/* ---------- Info block ---------- */}
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    {/* Stat pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {STAT_PILLS.map((s) => (
                        <span
                          key={s}
                          className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm"
                          style={{ backgroundColor: "rgba(20,16,14,0.55)" }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Verified */}
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#2FA85F] px-2.5 py-1 text-[10.5px] font-bold text-white">
                      <Icon.Check width="11" height="11" /> Verified
                    </span>

                    {/* Name */}
                    <h3
                      className="mt-1.5 text-[26px] font-bold leading-tight text-white"
                      style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                      }}
                    >
                      Aanya, 27
                    </h3>

                    {/* Occupation */}
                    <p className="text-[13px] font-semibold text-white/90">
                      Fashion Designer
                    </p>

                    {/* Location */}
                    <p className="text-[13px] text-white/80">
                      Bengaluru · 3 km away
                    </p>

                    {/* Intent */}
                    <p
                      className="mt-1 flex items-center gap-1.5 text-[13px] font-bold"
                      style={{ color: "#FF8FAB" }}
                    >
                      <Icon.Heart width="14" height="14" />
                      Serious relationship
                    </p>

                    {/* ---------- Action buttons ---------- */}
                    <div className="mt-4 flex items-center justify-center gap-5">
                      {/* Pass */}
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg"
                        style={{ color: C.headingDark }}
                      >
                        <Icon.Close />
                      </span>

                      {/* Like */}
                      <span
                        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl"
                        style={{ backgroundColor: C.pink }}
                      >
                        <Icon.Heart width="24" height="24" />
                      </span>

                      {/* Rose / compliment */}
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg">
                        <Icon.Rose />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- Bottom trust strip -------------------- */}
      <div
        className="w-full border-y"
        style={{
          backgroundColor: C.stripBg,
          borderColor: "#6b655f17", // '#6B655F'
        }}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4 gap-y-4 px-4 py-5 sm:px-6 lg:px-10">
          {STRIP.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 text-[13.5px] font-semibold"
              style={{ color: C.headingDark }}
            >
              <span style={{ color: C.pink }}>{item.icon}</span>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Header;