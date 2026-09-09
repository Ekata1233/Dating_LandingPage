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
};

const FLOW = [
  { step: "01", label: "Request", icon: <Icon.Send />, desc: "Express your commitment" },
  { step: "02", label: "Approve", icon: <Icon.Check />, desc: "Both partners agree" },
  { step: "03", label: "Committed", icon: <Icon.Heart />, desc: "Lock in your journey" },
];

const PERKS = [
  { icon: <Icon.Crown />, title: "Mutual Tag", desc: "Both partners opt in — visible in chat & profiles", color: "#D4A853" },
  { icon: <Icon.Ring />, title: "Forever Love", desc: "3 years of documented love, tracked month-on-month", color: "#C21559" },
  { icon: <Icon.Gift />, title: "₹5 Lakh Gift", desc: "Verified marriage = honeymoon trip on us", color: "#E8B4D8" },
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
      className="w-full overflow-hidden p-5"
      style={{
        background: "linear-gradient(135deg, #1a0a1f 0%, #2d1240 25%, #4a1942 50%, #6b2350 75%, #8b2a50 100%)",
      }}
    >
      {/* ---- Hero Area: Split Layout ---- */}
      <div className="relative min-h-[80vh] flex flex-col lg:flex-row">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #C21559 0%, transparent 70%)", filter: "blur(80px)" }} />
          <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)", filter: "blur(80px)" }} />
          <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #D4A853 0%, transparent 70%)", filter: "blur(60px)" }} />
        </div>

        {/* Left: Content */}
        <div className="relative flex flex-col justify-center px-8 py-16 sm:px-12 lg:px-20 lg:w-1/2">
          <div
            ref={headRef}
            className={`${headVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
              <Icon.Sparkles style={{ color: "#D4A853", width: 14, height: 14 }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "#D4A853" }}>
                World's first
              </span>
            </div>

            <h2
              className="mt-8 text-4xl leading-[1.1] sm:text-5xl lg:text-6xl"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: "white" }}
            >
              Stop guessing.{" "}
              <span className="italic" style={{ color: "#D4A853" }}>Start knowing.</span>
            </h2>

            <p className="mt-6 max-w-md text-[16px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              The endless &ldquo;what are we?&rdquo; ends here. Both partners lock in
              their intentions out loud — no confusion, just clarity.
            </p>

            {/* Flow Steps - Horizontal */}
            <div className="mt-12 flex items-center gap-4">
              {FLOW.map((f, i) => (
                <React.Fragment key={f.step}>
                  <div
                    className={`flex items-center gap-3 ${headVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
                    style={{ animationDelay: `${400 + i * 150}ms` }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 backdrop-blur-sm">
                      {f.icon}
                    </div>
                    <div className="hidden sm:block">
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
            <div className="mt-12">
              <button
                type="button"
                onClick={handleJoin}
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-8 py-4 text-[15px] font-bold text-white transition-all duration-500 hover:scale-105 hover:shadow-[0_20px_60px_rgba(212,168,83,0.3)] active:scale-95 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #D4A853, #C9962A)" }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Icon.Zap />
                  Learn More
                  <Icon.Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
              <p className="mt-4 text-[12px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                Programme terms & eligibility apply
              </p>
            </div>
          </div>
        </div>

        {/* Right: Premium Visual */}
        <div className="relative flex items-center justify-center px-8 py-16 lg:w-1/2 lg:py-0">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[500px] w-[500px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(212,168,83,0.4) 0%, transparent 70%)", animation: "breathe 6s ease-in-out infinite" }} />
          </div>

          {/* Reward Card */}
          <div
            ref={bentoRef}
            className={`relative w-full max-w-md ${bentoVisible ? "wv-reveal-scale is-visible" : "wv-reveal-scale"}`}
            style={{ animationDelay: "300ms" }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-xl sm:p-10">
              {/* Card glow */}
              <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-50" style={{ background: "radial-gradient(circle, rgba(212,168,83,0.6) 0%, transparent 70%)" }} />
              
              <div className="relative">
                {/* Icon */}
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4A853] to-[#C9962A] shadow-[0_8px_32px_rgba(212,168,83,0.4)]">
                  <Icon.Gift style={{ color: "white" }} />
                </div>

                <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(212,168,83,0.8)" }}>
                  Forever Love Reward
                </p>

                <p
                  className="mt-4 text-6xl font-bold text-white sm:text-7xl"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif', textShadow: "0 4px 30px rgba(212,168,83,0.3)" }}
                >
                  ₹5 Lakh
                </p>

                <p className="mt-3 text-[15px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                  honeymoon trip on verified marriage
                </p>

                {/* Tags */}
                <div className="mt-8 flex flex-wrap gap-2">
                  {["Mutual Tag", "3-year commitment", "Month tracking"].map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium backdrop-blur-sm"
                      style={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      <Icon.Check width="10" height="10" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <style jsx>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}

export default CommitmentMode;
