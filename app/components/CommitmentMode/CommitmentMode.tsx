"use client";

import React, { SVGProps } from "react";
import { useScrollReveal } from "../useScrollReveal";

const C = {
  bg: "#FCF8F4",
  headingDark: "#2B2A28",
  pink: "#C21559",
  pinkSoft: "#FDE8EE",
  body: "#5F5A55",
  label: "#9C948C",
  ctaFrom: "#C93B68",
  ctaTo: "#B31E52",
  cardBorder: "#F0E8E1",
  green: "#2EAF6B",
  gold: "#D4A853",
};

const Icon = {
  Heart: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5 8.6 5 10 6.5 12 8c2-1.5 3.4-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21z" />
    </svg>
  ),
  Send: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  ),
  Check: (p: SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  Shield: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9.5 12l2 2 3.5-4" />
    </svg>
  ),
  Gift: (p: SVGProps<SVGSVGElement>) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M3 12h18M12 8v13" />
      <path d="M12 8S10.5 3 8 3a2.5 2.5 0 0 0 0 5h4zM12 8s1.5-5 4-5a2.5 2.5 0 0 1 0 5h-4z" />
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
  Crown: (p: SVGProps<SVGSVGElement>) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <path d="M3 20h18" />
    </svg>
  ),
  Ring: (p: SVGProps<SVGSVGElement>) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="14" r="7" />
      <path d="M9.5 7.5L12 3l2.5 4.5" />
      <path d="M8.5 10.5a4.5 4.5 0 0 1 7 0" />
    </svg>
  ),
  Lock: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Infinity: (p: SVGProps<SVGSVGElement>) => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4z" />
    </svg>
  ),
  Zap: (p: SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Tag: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M20.59 13.41 12 22l-8-8V4h10l8.59 8.59a1.99 1.99 0 0 1 0 2.82z" />
      <circle cx="8" cy="8" r="1" />
    </svg>
  ),
  WeddingRing: (p: SVGProps<SVGSVGElement>) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <circle cx="9" cy="14" r="6" />
      <circle cx="15" cy="10" r="6" />
      <path d="M12 3l1.5 2" />
      <path d="M10.5 5 12 3" />
    </svg>
  ),
};

const FLOW = [
  { step: "01", label: "Mutual Tag", icon: <Icon.Tag />, desc: "" },
  { step: "02", label: "Monthly Tracking", icon: <Icon.Check />, desc: "" },
  { step: "03", label: "3 Year Commitment", icon: <Icon.Heart />, desc: "" },
  { step: "04", label: "Verified Marriage", icon: <Icon.WeddingRing />, desc: "" },
];

function CommitmentMode() {
  const [headRef, headVisible] = useScrollReveal();
  const [bentoRef, bentoVisible] = useScrollReveal({ threshold: 0.05 });
  const [perksRef, perksVisible] = useScrollReveal({ threshold: 0.05 });

  const handleJoin = () => {
    if (typeof document === "undefined") return;
    const loginBtn = document.querySelector<HTMLElement>("[data-login-trigger]");
    loginBtn?.click();
  };

  return (
    <section
      id="commitment"
      className="w-full overflow-hidden px-3 py-10 sm:p-5"
      style={{
        background: "linear-gradient(135deg, #1a0a1f 0%, #2d1240 25%, #4a1942 50%, #6b2350 75%, #8b2a50 100%)",
      }}
    >
      {/* ---- Hero Area: Split Layout ---- */}
      <div className="relative flex flex-col lg:min-h-[80vh] lg:flex-row">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #C21559 0%, transparent 70%)", filter: "blur(80px)" }} />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)", filter: "blur(80px)" }} />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #D4A853 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>

        {/* Right: Premium Visual — MOBILE ORDER 1 */}
        <div className="order-1 lg:order-2 relative flex items-center justify-center px-1 py-8 sm:px-8 sm:py-16 lg:w-1/2 lg:py-0">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[300px] w-[300px] rounded-full opacity-30 sm:h-[500px] sm:w-[500px]" style={{ background: "radial-gradient(circle, rgba(212,168,83,0.4) 0%, transparent 70%)", animation: "breathe 6s ease-in-out infinite" }} />
          </div>

          {/* Animated Image */}
          <div
            ref={bentoRef}
            className={`relative w-full max-w-md sm:max-w-sm ${bentoVisible ? "wv-reveal-scale is-visible" : "wv-reveal-scale"}`}
            style={{ animationDelay: "300ms" }}
          >
            {/* Outer glow ring */}
            <div
              className="absolute -inset-3 rounded-[2rem] opacity-40 sm:-inset-4 sm:rounded-[2.5rem]"
              style={{
                background: "linear-gradient(135deg, rgba(212,168,83,0.3), rgba(194,21,89,0.2), rgba(124,58,237,0.2))",
                filter: "blur(20px)",
                animation: "breathe 6s ease-in-out infinite",
              }}
            />

            {/* Image container */}
            <div
              className="relative aspect-square overflow-hidden rounded-2xl sm:rounded-3xl transition-all duration-500 hover:scale-[1.03]"
              style={{
                boxShadow: "0_20px_60px_rgba(0,0,0,0.3), 0_0_40px_rgba(212,168,83,0.15)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/honeymoon.png"
                alt="Forever Love — Commitment Mode on Welvors"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
              />

              {/* Shimmer sweep on hover */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100"
                style={{
                  background: "linear-gradient(135deg, transparent 30%, rgba(212,168,83,0.15) 50%, transparent 70%)",
                  backgroundSize: "200% 200%",
                }}
              />

              {/* Bottom gradient fade */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
                style={{ background: "linear-gradient(to top, rgba(26,10,31,0.7) 0%, transparent 100%)" }}
              />

              {/* Bottom label overlay */}
              <div className="absolute inset-x-0 bottom-0 flex items-end p-4 sm:p-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] sm:text-[11px]" style={{ color: "rgba(212,168,83,0.9)" }}>
                    Forever Love Reward
                  </p>
                  <p
                    className="mt-1 text-2xl font-bold text-white sm:text-3xl"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', textShadow: "0 2px 16px rgba(0,0,0,0.4)" }}
                  >
                    ₹5 Lakh
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left: Content — MOBILE ORDER 2 */}
        <div className="order-2 lg:order-1 relative flex flex-col justify-center px-1 py-8 sm:px-8 sm:py-16 lg:px-20 lg:w-3/5">
          <div
            ref={headRef}
            className={`${headVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
              <Icon.Sparkles style={{ color: "#D4A853", width: 14, height: 14 }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "#D4A853" }}>
                Forever Love Programme
              </span>
            </div>

            <h2
              className="mt-6 text-5xl leading-[1.1] sm:mt-8 sm:text-5xl lg:text-5xl"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: "white" }}
            >
              3 Years Together {" "}
              <span className="italic" style={{ color: "#D4A853" }}>₹5 Lakh Honeymoon</span>
            </h2>

            <p className="mt-5 max-w-md text-[14px] leading-relaxed sm:mt-6 sm:text-[16px]" style={{ color: "rgba(255,255,255,0.6)" }}>
              Ready to make it official? Send a commitment request to become verified partners on Welvors, stay together for 3 years in our Forever Love Programme, and let us gift you your dream ₹5-lakh honeymoon trip when you get married.
            </p>

            {/* Flow Steps — vertical on mobile, horizontal on lg+ */}
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-3 lg:mt-12">
              {FLOW.map((f, i) => (
                <React.Fragment key={f.step}>
                  <div
                    className={`flex items-center gap-3 ${headVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
                    style={{ animationDelay: `${400 + i * 150}ms` }}
                  >
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 backdrop-blur-sm">
                      {f.icon}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-white">{f.label}</p>
                      <p className="text-[11px] text-white/50">{f.desc}</p>
                    </div>
                  </div>
                  {i < FLOW.length - 1 && (
                    <div className="hidden sm:block h-[1px] w-12 bg-gradient-to-r from-white/20 to-transparent" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 sm:mt-10 lg:mt-12">
              <button
                type="button"
                onClick={handleJoin}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 text-[14px] font-bold text-white transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_60px_rgba(212,168,83,0.3)] active:scale-95 cursor-pointer sm:px-8 sm:py-4 sm:text-[15px]"
                style={{ background: "linear-gradient(135deg, #D4A853, #C9962A)" }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Icon.Zap />
                  Start Your Journey
                  <Icon.Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
              <p className="mt-3 text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                Programme terms & eligibility apply
              </p>
            </div>
          </div>
        </div>
      </div>


      <style jsx>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.5; }
        }
        @keyframes shimmer {
          0% { background-position: -200% -200%; }
          100% { background-position: 200% 200%; }
        }
      `}</style>
    </section>
  );
}

export default CommitmentMode;
