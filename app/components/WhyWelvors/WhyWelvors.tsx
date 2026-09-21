"use client";

import React, { SVGProps, useCallback, useEffect, useRef, useState } from "react";
import { useScrollReveal } from "../useScrollReveal";

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

// How long the hover-style animation stays on after a tap (ms)
const TAP_ACTIVE_MS = 1200;

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/*  - .wf-reveal : each card rises bottom → top when it scrolls in     */
/*  - .wf-card   : hover animation. Same look via .is-active, which is */
/*                 set by mouse hover on desktop and by tap on mobile  */
/* ------------------------------------------------------------------ */
const CardStyles = () => (
  <style>{`
    /* ---------- Entrance (per card) ---------- */
    .wf-reveal {
      opacity: 0;
      transform: translateY(48px);
      transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                  transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
      will-change: opacity, transform;
    }
    .wf-reveal.is-in {
      opacity: 1;
      transform: translateY(0);
    }
    /* Stagger only when cards sit side by side */
    @media (min-width: 768px) {
      .wf-reveal { transition-delay: var(--wf-delay, 0ms); }
    }

    /* ---------- Card base ---------- */
    .wf-card {
      box-shadow: 0 6px 24px rgba(43, 42, 40, 0.08);
      transition: transform 0.3s ease-out, box-shadow 0.4s ease-out;
    }
    .wf-line {
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.5s ease-out;
    }
    .wf-glow {
      opacity: 0;
      transition: opacity 0.5s ease-out;
      box-shadow: 0 0 0 1px rgba(214, 28, 114, 0.25), 0 10px 30px rgba(214, 28, 114, 0.12);
    }
    .wf-icon {
      transition: transform 0.5s ease-out, box-shadow 0.5s ease-out;
    }
    .wf-icon-fill {
      opacity: 0;
      transition: opacity 0.5s ease-out;
    }
    .wf-icon-glyph {
      color: #d61c72;
      transition: color 0.5s ease-out;
    }

    /* ---------- Active state (hover on desktop, tap on mobile) ---------- */
    .wf-card.is-active {
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(214, 28, 114, 0.14);
    }
    .wf-card.is-active .wf-line { transform: scaleX(1); }
    .wf-card.is-active .wf-glow { opacity: 1; }
    .wf-card.is-active .wf-icon {
      transform: scale(1.1) rotate(3deg);
      box-shadow: 0 10px 26px rgba(214, 28, 114, 0.35);
    }
    .wf-card.is-active .wf-icon-fill { opacity: 1; }
    .wf-card.is-active .wf-icon-glyph { color: #ffffff; }

    @media (prefers-reduced-motion: reduce) {
      .wf-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
      .wf-card, .wf-line, .wf-glow, .wf-icon, .wf-icon-fill, .wf-icon-glyph { transition: none !important; }
    }
  `}</style>
);

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
    <svg width="24" height="24" viewBox="0 -960 960 960" fill="currentColor" {...p}>
      <path d="M485-240Zm26 80H160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440v80q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32h245q4 21 10.5 41t15.5 39Zm209 80q-73-18-116.5-80T560-298v-102l160-80 160 80v102q0 76-43.5 138T720-80Zm0-84q38-18 59-55t21-79v-52l-80-40-80 40v52q0 42 21 79t59 55ZM367-527q-47-47-47-113t47-113q47-47 113-47t113 47q47 47 47 113t-47 113q-47 47-113 47t-113-47Zm169.5-56.5Q560-607 560-640t-23.5-56.5Q513-720 480-720t-56.5 23.5Q400-673 400-640t23.5 56.5Q447-560 480-560t56.5-23.5ZM480-640Zm240 363Z" />
    </svg>
  ),
  Clock: (p: SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
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

/* ------------------------------------------------------------------ */
/*  Single feature card                                                */
/* ------------------------------------------------------------------ */
function FeatureCard({ feature, index }: { feature: (typeof FEATURES)[number]; index: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerType = useRef<string>("mouse");
  const [inView, setInView] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Rise up once, the first time THIS card scrolls into view
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (tapTimeout.current) clearTimeout(tapTimeout.current);
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerType.current = e.pointerType;
  }, []);

  // Mouse: hover on / off
  const handlePointerEnter = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setIsActive(true);
  }, []);
  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setIsActive(false);
  }, []);

  // Touch / pen: tap plays the same animation, then settles back
  const handleClick = useCallback(() => {
    if (pointerType.current === "mouse") return;
    setIsActive(true);
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => setIsActive(false), TAP_ACTIVE_MS);
  }, []);

  return (
    // Outer wrapper: scroll-in rise-up (transform #1)
    <div
      ref={wrapRef}
      className={`wf-reveal h-full ${inView ? "is-in" : ""}`}
      style={{ ["--wf-delay" as string]: `${(index % 3) * 100}ms` }}
    >
      {/* Inner card: hover / tap animation (transform #2) */}
      <div
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        className={`wf-card relative h-full font-brand overflow-hidden rounded-2xl border bg-white p-7 flex flex-col items-center text-center cursor-pointer ${
          isActive ? "is-active" : ""
        }`}
        style={{ borderColor: "rgba(214,40,116,0.12)" }}
      >
        {/* Top highlight line — grows in when active */}
        <div
          className="wf-line absolute top-0 left-0 h-[3px] w-full"
          style={{
            background: "linear-gradient(90deg, #ff4d8d, #d61c72, #b0146a)",
          }}
        />

        {/* Soft pink glow ring when active */}
        <div className="wf-glow pointer-events-none absolute inset-0 rounded-2xl" />

        {/* Icon box */}
        <div
          className="wf-icon relative flex h-14 w-14 mx-auto text-center items-center justify-center rounded-2xl"
          style={{
            background: "linear-gradient(145deg, #ffe1ec 0%, #ffc2d9 100%)",
          }}
        >
          {/* Gradient overlay that fades in when active */}
          <div
            className="wf-icon-fill absolute inset-0 rounded-2xl"
            style={{
              background: "linear-gradient(145deg, #ff5e9c 0%, #d61c72 55%, #a4105f 100%)",
            }}
          />

          {/* Icon — dark pink at rest, white when active */}
          <span className="wf-icon-glyph relative z-10">{feature.icon}</span>
        </div>

        {/* Title */}
        <h3
          className="relative text-center mt-5 text-lg font-bold text-[#231f20]"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          {feature.title}
        </h3>

        {/* Body */}
        <p
          className="relative mt-3 text-[14px] leading-relaxed text-gray-800 text-center"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          {feature.body}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */
function WhyWelvors() {
  const [sectionRef, sectionVisible] = useScrollReveal();

  return (
    <section
      id="why"
      ref={sectionRef}
      style={{
        background:
          "linear-gradient(to top, #FFD0DC 0%, #FFE0E8 35%, #FFF0F4 75%, #FFF8FA 88%, #FFFBFC 100%)",
      }}
      className="w-full scroll-mt-[50px] py-12 sm:py-12"
    >
      <CardStyles />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* -------------------- Header -------------------- */}
        <div
          className={`mx-auto max-w-2xl text-center ${
            sectionVisible ? "wv-reveal is-visible" : "wv-reveal"
          }`}
        >
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
            Built for Genuine{" "}
            <span
              className="wv-gradient-animated italic"
              style={{ WebkitTextFillColor: "transparent" }}
            >
              Connections
            </span>
          </h2>

          <p
            className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed"
            style={{ color: C.body }}
          >
            Welvors isn&apos;t another swipe app. It&apos;s a trust-first ecosystem where every
            profile is verified, every match is intentional, and every connection can become a real
            relationship.
          </p>
        </div>

        {/* -------------------- Cards grid -------------------- */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyWelvors;
