"use client";

import React, { SVGProps } from "react";
import { useScrollReveal, staggerDelay } from "../useScrollReveal";

/* ------------------------------------------------------------------ */
/*  Brand colors inline (Tailwind theme pe depend nahi)                */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#FCF8F4",
  headingDark: "#2B2A28",
  pink: "#C21559",
  body: "#6B655F",
  cardBorder: "#F0E8E1",
};

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */
const Icon = {
  Shield: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9.5 12l2 2 3.5-4" />
    </svg>
  ),
  EyeOff: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 10 8 10 8a13.2 13.2 0 0 1-1.67 2.68M6.6 6.6C3.6 8.3 2 12 2 12s3 8 10 8a9.3 9.3 0 0 0 5.4-1.6" />
      <path d="M1 1l22 22" />
    </svg>
  ),
  Globe: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" />
    </svg>
  ),
  Calendar: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
  Star: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="12 2 15 9 22 9.3 17 14 18.5 21 12 17.3 5.5 21 7 14 2 9.3 9 9" />
    </svg>
  ),
  Heart: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5 8.6 5 10 6.5 12 8c2-1.5 3.4-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21z" />
    </svg>
  ),
  UserShield: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="24"
      height="24"
      viewBox="0 -960 960 960"
      fill="currentColor"
      {...p}
    >
      <path d="M485-240Zm26 80H160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440v80q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32h245q4 21 10.5 41t15.5 39Zm209 80q-73-18-116.5-80T560-298v-102l160-80 160 80v102q0 76-43.5 138T720-80Zm0-84q38-18 59-55t21-79v-52l-80-40-80 40v52q0 42 21 79t59 55ZM367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm169.5-56.5Q560-607 560-640t-23.5-56.5Q513-720 480-720t-56.5 23.5Q400-673 400-640t23.5 56.5Q447-560 480-560t56.5-23.5ZM480-640Zm240 363Z" />
    </svg>
  ),
  Clock: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="24"
      height="24"
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
};

/* ------------------------------------------------------------------ */
/*  Feature cards data                                                 */
/* ------------------------------------------------------------------ */
const FEATURES = [
  {
    title: "Verified profiles only",
    body: "A four-tier ladder that checks phone & email, government ID, selfie and live-video, education, profession, income and Background check.",
    icon: <Icon.Shield />,
    iconBg: "#E4F5EA",
    iconColor: "#3F8F5B",
  },
  {
    title: "SafeFace privacy",
    body: "Avatar-first identity, built especially for women. Reveal your real photo on your terms. after a match, after chatting, or by manual approval.",
    icon: <Icon.UserShield />,
    iconBg: "#FBE8EF",
    iconColor: "#C21559",
  },
    {
    title: "Date Now",
    body: "Plans-first dating, built for real connections. Post your plans, choose who can join, and turn everyday moments into meaningful dates.",
    icon: <Icon.Clock />,
    iconBg: "#FBE8EF",
    iconColor: "#C21559",
  },
  {
    title: "Offline meetups",
    body: "Curated, ticketed events at premium venues with verified attendees only. The fastest path from a match to real, in-person clarity.",
    icon: <Icon.Calendar />,
    iconBg: "#F5ECD8",
    iconColor: "#C99A22",
  },
  {
  title: "AI matchmaking",
  body: "Behaviour-driven compatibility, not just photos. predictive scoring, AI ice-breakers and a self-learning journey built around you.",
  icon: <Icon.Globe />,
  iconBg: "#E6EDF9",
  iconColor: "#3D6FB4",
},
  {
    title: "Commitment Mode",
    body: "A world-first loyalty engine. Verify intent up front and enter a drama-free zone.A partner-funded in honeymoon on marriage",
    icon: <Icon.Star />,
    iconBg: "#E4F5EA",
    iconColor: "#3F8F5B",
  },
];

function WhyWelvors() {
  const [sectionRef, sectionVisible] = useScrollReveal();
  const [cardsRef, cardsVisible] = useScrollReveal({ threshold: 0.05 });

  return (
    <section
      id="why"
      ref={sectionRef}
      style={{
        background: "radial-gradient(ellipse 120% 90% at 50% 100%, #FFB3C7 0%, #FFD1DD 25%, #FFE8EE 45%, #FFF0F3 65%, #FFF9FA 85%)",
      }} className="w-full scroll-mt-[50px] py-8 sm:py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* -------------------- Header -------------------- */}
        <div className={`mx-auto max-w-2xl text-center ${sectionVisible ? "wv-reveal is-visible" : "wv-reveal"}`}>
          <span
            className="text-[15px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: C.pink }}
          >
            Why Welvors
          </span>

          <h2
            className="mt-3 text-3xl leading-tight sm:text-3xl lg:text-[2.6rem]"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: C.headingDark,
            }}
          >
            Built for Genuine {" "}
              <span className="wv-gradient-animated italic" style={{ WebkitTextFillColor: "transparent" }}>
                Connections
              </span>
          </h2>

          <p
            className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed"
            style={{ color: C.body }}
          >
            Welvors isn&apos;t another swipe app. It&apos;s a trust-first
            ecosystem where every profile is verified, every match is
            intentional, and every connection can become a real relationship.
          </p>
        </div>

        {/* -------------------- Cards grid -------------------- */}
        <div ref={cardsRef} className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`group relative overflow-hidden rounded-2xl border bg-white p-7 transition-all duration-300 ease-out hover:-translate-y-1 shadow-[0_4px_20px_rgba(43,42,40,0.04)] ${cardsVisible ? "wv-reveal is-visible" : "wv-reveal"
                }`}
              style={{
                borderColor: "rgba(214,40,116,0.12)",
                ...staggerDelay(i, 100),
              }}
            >
              {/* Top highlight line — grows in on hover */}
              <div
                className="absolute top-0 left-0 h-[3px] w-full origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
                style={{
                  background: "linear-gradient(90deg, #ff4d8d, #d61c72, #b0146a)",
                }}
              />

              {/* Soft pink glow ring on hover */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                style={{
                  boxShadow: "0 0 0 1px rgba(214,28,114,0.25), 0 10px 30px rgba(214,28,114,0.12)",
                }}
              />

              {/* Icon box */}
              <div
                className="relative flex h-14 w-14 items-center justify-center rounded-2xl
          transition-all duration-500 ease-out
          group-hover:scale-110
          group-hover:rotate-3
          group-hover:shadow-[0_10px_26px_rgba(214,28,114,0.35)]"
                style={{
                  background: "linear-gradient(145deg, #ffe1ec 0%, #ffc2d9 100%)",
                }}
              >
                {/* Gradient overlay that fades in on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(145deg, #ff5e9c 0%, #d61c72 55%, #a4105f 100%)",
                  }}
                />

                {/* Icon — dark pink at rest, white on hover */}
                <span className="relative z-10 text-[#d61c72] transition-colors duration-500 ease-out group-hover:text-white">
                  {f.icon}
                </span>
              </div>

              {/* Title */}
              <h3
                className="relative mt-5 text-lg font-bold text-[#231f20]"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                {f.title}
              </h3>

              {/* Body */}
              <p className="relative mt-3 text-[14px] leading-relaxed text-slate-500">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyWelvors;