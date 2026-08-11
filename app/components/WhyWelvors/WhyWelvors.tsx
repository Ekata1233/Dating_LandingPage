"use client";

import React, { SVGProps } from "react";

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
};

/* ------------------------------------------------------------------ */
/*  Feature cards data                                                 */
/* ------------------------------------------------------------------ */
const FEATURES = [
  {
    title: "Verified profiles only",
    body: "A four-tier ladder that checks phone & email, government ID, selfie and live-video, education, profession, and — for Elite — income and Background check via verified third-party partner. A near-zero fake-profile environment.",
    icon: <Icon.Shield />,
    iconBg: "#E4F5EA",
    iconColor: "#3F8F5B",
  },
  {
    title: "SafeFace privacy",
    body: "Avatar-first identity, built especially for women. Reveal your real photo on your terms — after a match, after chatting, or by manual approval.",
    icon: <Icon.EyeOff />,
    iconBg: "#FBE8EF",
    iconColor: "#C21559",
  },
  {
    title: "AI matchmaking",
    body: "Behaviour-driven compatibility, not just photos — predictive scoring, AI ice-breakers and a self-learning journey built around you.",
    icon: <Icon.Globe />,
    iconBg: "#E6EDF9",
    iconColor: "#3D6FB4",
  },
  {
    title: "Offline meetups",
    body: "Curated, ticketed events at premium venues with verified attendees only — the fastest path from a match to real, in-person clarity.",
    icon: <Icon.Calendar />,
    iconBg: "#F5ECD8",
    iconColor: "#C99A22",
  },
  {
    title: "Commitment Mode",
    body: "A world-first loyalty engine. Verify intent up front and enter a drama-free zone — no situationship anxiety, just clarity on your terms.",
    icon: <Icon.Star />,
    iconBg: "#E4F5EA",
    iconColor: "#3F8F5B",
  },
  {
    title: "Forever Love reward",
    body: "We grow with you from match to marriage — couples-only features, an anniversary box and a partner-funded in honeymoon on marriage.",
    icon: <Icon.Heart />,
    iconBg: "#FBE8EF",
    iconColor: "#C21559",
  },
];

function WhyWelvors() {
  return (
    <section
      id="why"
      style={{ backgroundColor: C.bg }}
      className="w-full scroll-mt-[50px] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* -------------------- Header -------------------- */}
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="text-[15px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: C.pink }}
          >
            Why Welvors
          </span>

          <h2
            className="mt-3 text-3xl leading-tight sm:text-4xl lg:text-[2.6rem]"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: C.headingDark,
            }}
          >
            Verified trust, AI matchmaking &amp; real-world connection.
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
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border bg-white p-7 shadow-[0_4px_20px_rgba(43,42,40,0.04)] transition-shadow hover:shadow-[0_8px_28px_rgba(43,42,40,0.08)]"
              style={{ borderColor: C.cardBorder }}
            >
              {/* Icon box */}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: f.iconBg, color: f.iconColor }}
              >
                {f.icon}
              </div>

              {/* Title */}
              <h3
                className="mt-5 text-lg font-bold"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  color: C.headingDark,
                }}
              >
                {f.title}
              </h3>

              {/* Body */}
              <p
                className="mt-3 text-[14px] leading-relaxed"
                style={{ color: C.body }}
              >
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