"use client";

import React, { SVGProps, useEffect, useState } from "react";
import { useScrollReveal } from "../useScrollReveal";

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
  black: "#000000",
  lightPink: "#FFF0F3"
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
  MapPin: (p: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  ),
  Sparkles: (p: SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  ),
  Phone: (p: SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </svg>),
};


const STRIP = [
  { label: "Every profile verified", icon: <Icon.Shield /> },
  { label: "Privacy first", icon: <Icon.Lock /> },
  { label: "Real intentions only", icon: <Icon.User /> },
  { label: "Meaningful Matches", icon: <Icon.Heart /> },
  { label: "Discover people nearby", icon: <Icon.MapPin /> },
  { label: "No endless swiping", icon: <Icon.Sparkles /> },

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
  const [headerRef, headerVisible] = useScrollReveal({ threshold: 0.05 });

  const handleDiscover = () => {
    if (typeof document === "undefined") return;
    const loginBtn = document.querySelector<HTMLElement>("[data-login-trigger]");
    loginBtn?.click();
  };

  const handleDownloadApp = () => {
    if (typeof document === "undefined") return;
    const downloadSection = document.getElementById("download-app");
    if (downloadSection) {
      downloadSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const BASE = 515;
    const ANCHOR = new Date("2026-07-22T00:00:00+05:30").getTime();

    const perHour = (h: number) => {
      const x = Math.sin(h * 9973) * 10000;
      return 1 + Math.floor((x - Math.floor(x)) * 20);
    };

    const compute = () => {
      const hours = Math.max(0, Math.floor((Date.now() - ANCHOR) / 3600000));
      let total = BASE;
      for (let h = 0; h < hours; h++) total += perHour(h);
      setWaitlistCount(total);
    };

    compute();
    const id = setInterval(compute, 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      ref={headerRef}
      style={{
        background: "linear-gradient(to left, #FFB3C7, #FFD1DD, #FFF9FA)",
      }} className="relative w-full  overflow-hidden px-10 pt-20"
    >

      {/* Soft pink glow top-right */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[550px] w-[520px] rounded-full opacity-60 blur-3xl "
        style={{
          background:
            "radial-gradient(circle, rgba(233, 151, 182, 0.17) 0%, rgba(247,241,236,0) 70%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-4 px-4 sm:px-6 lg:grid-cols-2 lg:gap-4 lg:px-10 lg:py-15">
        {/*
          COPY WRAPPER
          - Mobile: `contents` => badge (order-1) aur copy (order-3) direct grid items ban jaate hain
          - Desktop: `lg:block` => badge + copy ek hi column me stack (normal 2-col layout, pehle jaisa)
        */}
        <div className="contents lg:block lg:max-w-xl">
          {/* Launch badge — MOBILE ORDER 1 */}
          <div
            className={`order-1 mb-7 inline-flex w-full max-w-md items-center gap-2 rounded-full border px-4 py-2 lg:order-none ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
            style={{
              backgroundColor: C.badgeBg,
              borderColor: C.ctaFrom,
              animationDelay: "0ms",
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
              className={`text-4xl leading-[1.08] sm:text-5xl lg:text-[3.4rem] ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: C.headingDark,
                animationDelay: "100ms",
              }}
            >
              We&apos;re not building another dating app. We&apos;re building{" "}
              <span className="wv-gradient-animated italic" style={{ WebkitTextFillColor: "transparent" }}>
                trust.
              </span>
            </h1>



            {/* Body */}
            <p
              className={`mt-4 text-[15px] leading-relaxed ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
              style={{ color: C.body, animationDelay: "300ms" }}
            >
              Built for people who want something genuine. verified profiles,
              safety built in, and matches who want the same things you do. No
              biodata. No family pressure. Just you, on your own timeline.
            </p>




            {/* ---- CTA ---- */}
            <div className={`mt-4 flex flex-col sm:flex-row  items-center mb-10 gap-3 ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`} style={{ animationDelay: "800ms" }} >
              <div className={`flex flex-col items-start gap-3 ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`} style={{ animationDelay: "800ms" }}>
                <button
                  type="button"
                  onClick={handleDiscover}
                  className="cm-cta group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-[13px] font-bold text-white shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_36px_rgba(194,21,89,0.4)] active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #F26FA6 0%, #E11D63 100%)",
                    backgroundSize: "200% 200%",
                    boxShadow: `0 8px 28px ${C.pink}35`,
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon.Heart className="transition-transform duration-300 group-hover:scale-125" />
                    Discover Welvors
                  </span>
                  <span className="cm-shimmer pointer-events-none absolute inset-0" />
                </button>
              </div>
              <div className={`flex flex-col items-start gap-3 ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`} style={{ animationDelay: "800ms" }}>
                <button
                  type="button"
                  onClick={handleDownloadApp}
                  className="cm-cta group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-2.5 text-[13px] font-bold shadow-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_36px_rgba(43,42,40,0.25)] active:scale-95 border-1"
                  style={{
                    color: C.headingDark,
                    backgroundColor: "white",
                    borderColor: C.headingDark,
                    backgroundSize: "200% 200%",
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon.Phone className="transition-transform duration-300 group-hover:scale-125" />
                    Download App
                  </span>
                  <span className="cm-shimmer pointer-events-none absolute inset-0" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------- HERO IMAGE — MOBILE ORDER 2 -------------------- */}
        <div className="order-2 relative flex justify-center lg:order-none lg:justify-end">
          <div className={`relative ${headerVisible ? "wv-reveal-scale is-visible" : "wv-reveal-scale"}`} style={{ animationDelay: "200ms" }}>

            {/* Hero image with continuous animation */}
            <div className="hero-image-float">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero_image.png"
                alt="Welvors App Preview"
                className="w-[280px] sm:w-[320px] lg:w-[380px] rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.2),0_8px_24px_rgba(194,21,89,0.15)] transition-all duration-500 hover:shadow-[0_30px_80px_rgba(0,0,0,0.25),0_12px_32px_rgba(194,21,89,0.2)] hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </div>


    </header>
  );
}

export default Header;