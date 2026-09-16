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
  cardBg: "#FFFFFF",
  cardBorder: "#F0E8E1",
  lightPink: "#FFFFFF",
  accentBg: "#FEF6F0",
};

const Icon = {
  Zap: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Send: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  ),
  Wallet: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <circle cx="17" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  MessageCircle: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  MapPin: (p: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  ),
  Heart: (p: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5 8.6 5 10 6.5 12 8c2-1.5 3.4-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21z" />
    </svg>
  ),
  Arrow: (p: SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  Phone: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  ),
  Sparkles: (p: SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  ),
  Check: (p: SVGProps<SVGSVGElement>) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6L9 17l-5-5" />
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
  Clock: (p: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  Filter: (p: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  ),
};

const HOW_STEPS = [
  {
    num: "01",
    icon: <Icon.Send />,
    title: "Post a Plan",
    desc: "Share where you want to go. pick an activity, venue, bill preference, group size, and who can request to join.",
  },
  {
    num: "02",
    icon: <Icon.Users />,
    title: "Browse & Request",
    desc: "Others see your plan and request to join. You review their profile and decide who gets in.",
  },
  {
    num: "03",
    icon: <Icon.MessageCircle />,
    title: "Date Confirmed",
    desc: "Once approved, an auto date-card lands in your chat with time, place, and location.",
  },
];

const WALLET_FEATURES = [
  "Date Plan Wallet — separate balance for posting plans",
  "₹100 per plan from your wallet",
  "Tabs: My Plans, Today, Tomorrow, Weekend",
  "Full control over who joins your plan",
];

function DateNow() {
  const [headerRef, headerVisible] = useScrollReveal({ threshold: 0.05 });

  const handleDiscover = () => {
    if (typeof document === "undefined") return;
    const loginBtn = document.querySelector<HTMLElement>("[data-login-trigger]");
    loginBtn?.click();
  };


  return (
    <section
      id="date-now"
      ref={headerRef}
      className="relative w-full overflow-hidden px-2 py-20 sm:px-8"
      style={{
        background: "radial-gradient(ellipse 130% 100% at 0% 50%, #B8A0E0 0%, #D0C4EE 22%, #E6DAF5 45%, #F2ECF8 65%, #FAF6FC 85%, #FCF8F4 100%)",
      }}
    >
      {/* Warm accent glow — top-left */}
      <div
        className="pointer-events-none absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full opacity-50 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(253,236,226,0.7) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-1 sm:px-4 lg:px-8">

        {/* ---- TOP: IMAGE (MOBILE FIRST) + TEXT ---- */}
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-10">

          {/* IMAGE — MOBILE ORDER 1 */}
          <div className="order-1 lg:order-2 relative flex justify-center lg:justify-end">
            <div
              className={`relative ${headerVisible ? "wv-reveal-scale is-visible" : "wv-reveal-scale"}`}
              style={{ animationDelay: "200ms" }}
            >
              <div className="hero-image-float">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/couple_images.png"
                  alt="Date Now — Post a plan and meet real people"
                  className="w-[380px] sm:w-[360px] lg:w-[380px] rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.15),0_8px_24px_rgba(194,21,89,0.10)] transition-all duration-500 hover:shadow-[0_30px_80px_rgba(0,0,0,0.2),0_12px_32px_rgba(194,21,89,0.15)] hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

          {/* TEXT — frosted glass card — MOBILE ORDER 2 */}
          <div
            className={`order-2 lg:order-1 flex flex-col gap-4 lg:max-w-lg rounded-2xl p-5 sm:p-6 wv-glass-float wv-shimmer-slide relative ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
            style={{
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              backgroundColor: "rgba(255,255,255,0.45)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
              animationDelay: "0ms",
            }}
          >

            {/* Badge */}
            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
              style={{
                borderColor: C.cardBorder,
                backgroundColor: C.lightPink,
                animationDelay: "0ms",
              }}
            >
              <Icon.Zap style={{ color: C.pink, width: 14, height: 14 }} />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: C.pink }}
              >
                Date Now on Welvors
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
              Have a Plan? Make It a {" "}
              <span
                className="wv-gradient-animated italic"
                style={{ WebkitTextFillColor: "transparent" }}
              >
                Date
              </span>
            </h2>

            {/* Body */}
            <p
              className={`text-[15px] leading-relaxed ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
              style={{ color: C.body, animationDelay: "250ms" }}
            >
              Post a plan for tonight, whether it's coffee, dinner, or a weekend event with your preferred time and place. Interested locals send a request to join, leaving you in complete control of who you approve.
            </p>

            {/* CTAs */}
            <div
              className={`mt-2 flex flex-col sm:flex-row items-start gap-3 ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
              style={{ animationDelay: "500ms" }}
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
                  <Icon.Heart className="transition-transform duration-300 group-hover:scale-125" />
                  Try Date Now
                </span>
                <span className="cm-shimmer pointer-events-none absolute inset-0" />
              </button>
            </div>
          </div>
        </div>

        {/* ---- STEP CARDS ---- */}
        <div
          className={`mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3 wv-stagger-children ${headerVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
          style={{ animationDelay: "400ms" }}
        >
          {HOW_STEPS.map((step, i) => (
            <div
              key={i}
              className="group relative flex flex-col gap-3 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 wv-border-glow"
              style={{
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                backgroundColor: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.65)",
              }}
            >
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: C.label }}
              >
                Step {step.num}
              </span>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: C.lightPink, color: C.pink }}
                >
                  {step.icon}
                </span>
                <h3
                  className="text-[15px] font-semibold"
                  style={{ color: C.headingDark }}
                >
                  {step.title}
                </h3>
              </div>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: C.body }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default DateNow;
