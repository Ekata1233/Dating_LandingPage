"use client";

import React, { SVGProps, useState } from "react";
import { useScrollReveal, staggerDelay } from "../useScrollReveal";
import { setLoggedIn } from "../authState";
import LoginModal from "../auth/LoginModal";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Brand colors                                                       */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#FCF8F4",
  headingDark: "#2B2A28",
  pink: "#C21559",
  body: "#6B655F",
  label: "#9C948C",
  ctaFrom: "#C93B68",
  ctaTo: "#B31E52",
  lightPink: "#FFF0F3"
};

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */
const Icon = {
  Gift: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8v13M3 12h18M7.5 8a2.5 2.5 0 0 1 0-5C9 3 12 8 12 8M16.5 8a2.5 2.5 0 0 0 0-5C15 3 12 8 12 8" />
    </svg>
  ),
  Sparkles: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M18 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
      <path d="M5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17z" />
    </svg>
  ),
  Calendar: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
      <circle cx="12" cy="15" r="2" />
    </svg>
  ),
  MessageCircle: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M7.9 20A10 10 0 1 1 21 12c0 5.52-4.48 10-10 10Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  ),
  Zap: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  ShieldCheck: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  LockBadge: (p: SVGProps<SVGSVGElement>) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" {...p}>
      <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#lockBadgeBg)" />
      <rect x="7" y="11" width="10" height="8" rx="1.5" fill="white" opacity="0.95" />
      <path d="M9.5 11V9a2.5 2.5 0 0 1 5 0v2" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.95" />
      <circle cx="12" cy="14.5" r="1.2" fill="url(#lockBadgeBg)" />
      <defs>
        <linearGradient id="lockBadgeBg" x1="2" y1="2" x2="22" y2="22">
          <stop offset="0%" stopColor="#D6336C" />
          <stop offset="100%" stopColor="#A0104A" />
        </linearGradient>
      </defs>
    </svg>
  ),
  ArrowRight: (p: SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Feature cards data — Row 1 (visible)                               */
/* ------------------------------------------------------------------ */
const VISIBLE_FEATURES = [
  {
    num: "01",
    title: "Smart Matches",
    body: "See compatible profiles daily",
    icon: <Icon.Sparkles />,
    color: "#3F8F5B",
  },
  {
    num: "02",
    title: "Safe Face",
    body: "Protect your identity with secure avatars",
    icon: <Icon.ShieldCheck />,
    color: "#00838F",
  },
  {
    num: "03",
    title: "Gift & Roses",
    body: "Send meaningful gifts, roses & compliments",
    icon: <Icon.Gift />,
    color: "#C21559",
  },
  {
    num: "04",
    title: "Offline Events",
    body: "Meet singles at curated offline dating events",
    icon: <Icon.Calendar />,
    color: "#C99A22",
  },
  {
    num: "05",
    title: "Chat & Connect",
    body: "Chat, share, and build deeper connections",
    icon: <Icon.MessageCircle />,
    color: "#3D6FB4",
  },
  {
    num: "06",
    title: "Profile Boost",
    body: "Get seen first in your city",
    icon: <Icon.Zap />,
    color: "#8E24AA",
  },

];

/* ------------------------------------------------------------------ */
/*  Feature cards data — Row 2 (locked/blurred)                        */
/* ------------------------------------------------------------------ */
const LOCKED_FEATURES = [
  {
    num: "07",
    title: "Video Dates",
    body: "Face-to-face virtual dates before meeting",
    icon: <Icon.Sparkles />,
    color: "#C21559",
  },
  {
    num: "08",
    title: "Interest Groups",
    body: "Join communities based on your passions",
    icon: <Icon.Calendar />,
    color: "#3F8F5B",
  },
  {
    num: "09",
    title: "Date Planning",
    body: "AI-powered date venue suggestions",
    icon: <Icon.MessageCircle />,
    color: "#C99A22",
  },
];

/* ------------------------------------------------------------------ */
/*  Blur levels for each locked card (increasing downward)             */
/* ------------------------------------------------------------------ */
const BLUR_LEVELS = ["blur(24px)", "blur(32px)", "blur(40px)"];
const OPACITY_LEVELS = [0.8, 0.2, 0.08];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
function WhatMembersSee() {
  const [sectionRef, sectionVisible] = useScrollReveal();
  const [row1Ref, row1Visible] = useScrollReveal({ threshold: 0.05 });
  const [row2Ref, row2Visible] = useScrollReveal({ threshold: 0.05 });
  const [loginOpen, setLoginOpen] = useState(false);
  const router = useRouter();

  const handleLoginSuccess = () => {
    setLoggedIn(true);
    setLoginOpen(false);
    router.push("/lauch");
  };

  return (
    <section
      id="members-see"
      ref={sectionRef}
      style={{
        background: "linear-gradient(to right, #FFF9FA, #FFF0F3, #FFE8EE, #FFD1DD, #FFB3C7)",
      }} className="w-full scroll-mt-[50px] py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* -------------------- Header -------------------- */}
        <div
          className={`mx-auto max-w-2xl text-center mb-14 ${sectionVisible ? "wv-reveal is-visible" : "wv-reveal"
            }`}
        >
          <span
            className="text-[14px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: C.pink }}
          >
            What Members See
          </span>
          <h2
            className="mt-3 text-3xl leading-tight sm:text-4xl lg:text-[2.6rem]"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: C.headingDark,
            }}
          >
            Features that make Welvors{" "}
            <span className="wv-gradient-animated">different</span>.
          </h2>
          <p
            className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed"
            style={{ color: C.body }}
          >
            From thoughtful gifts to AI-powered matching — every feature is
            designed to help you find real, meaningful connections.
          </p>
        </div>

        {/* -------------------- Row 1: Visible Features -------------------- */}
        <div
          ref={row1Ref}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {VISIBLE_FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`group relative rounded-2xl border border-transparent bg-white/60 p-5 pl-6 transition-all duration-300 ease-out hover:bg-white hover:border-[rgba(194,21,89,0.12)] hover:shadow-[0_8px_30px_rgba(43,42,40,0.06)] ${row1Visible ? "wv-reveal is-visible" : "wv-reveal"
                }`}
              style={staggerDelay(i, 70)}
            >
              {/* Left accent bar */}
              <div
                className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full transition-all duration-400 ease-out group-hover:top-3 group-hover:bottom-3"
                style={{ backgroundColor: f.color, opacity: 0.5 }}
              />

              <div className="flex items-start gap-4">
                {/* Number badge */}
                <span
                  className="flex-shrink-0 text-[13px] font-bold tabular-nums transition-colors duration-300"
                  style={{
                    fontFamily: "Geist Mono, monospace",
                    color: f.color,
                    opacity: 0.6,
                  }}
                >
                  {f.num}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="transition-transform duration-300 ease-out group-hover:scale-110"
                      style={{ color: f.color }}
                    >
                      {f.icon}
                    </span>
                    <h3
                      className="text-[16px] font-bold leading-tight"
                      style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        color: C.headingDark,
                      }}
                    >
                      {f.title}
                    </h3>
                  </div>
                  <p
                    className="mt-1.5 text-[13.5px] leading-relaxed"
                    style={{ color: C.body }}
                  >
                    {f.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login Modal — same as Navbar */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </section>
  );
}

export default WhatMembersSee;
