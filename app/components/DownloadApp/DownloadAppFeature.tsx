"use client";

import React, { SVGProps, useState, useEffect } from "react";
import { useScrollReveal } from "../useScrollReveal";

const C = {
  bg: "#FCF8F4",
  headingDark: "#2B2A28",
  pink: "#C21559",
  body: "#6B655F",
  indigo: "#5B62B5",
  indigoSoft: "#EAEDFA",
  ctaFrom: "#C93B68",
  ctaTo: "#B31E52",
  cardBorder: "#F0E8E1",
  green: "#2EAF6B",
  label: "#9C948C",
  stripBg: "#EFE8E2",
  smoothPink: "#FDE8E8",
  mediumPink: "#F9D1D1",
};

const APP_SCREENSHOTS = [
  "/download.jpg",
  "/download2.jpg",
  "/download3.jpg",
  "/download.jpg",
];

const Icon = {
  Apple: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  ),
  PlayStore: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 1.33-3.036 1.759-2.074-2.074 2.808-3.015zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
    </svg>
  ),
  Heart: (p: SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5 8.6 5 10 6.5 12 8c2-1.5 3.4-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21z" />
    </svg>
  ),
  Filter: (p: SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  ),
  Bell: (p: SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M18 8a6 6 0 0 0-12 0c0 6-3 7-3 7h18s-3-1-3-7" />
      <path d="M10.3 20a2 2 0 0 0 3.4 0" />
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
  Shield: (p: SVGProps<SVGSVGElement>) => (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Lock: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  ),
  Calendar: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Brain: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M12 5v14" />
    </svg>
  ),
  Trophy: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  ShieldCheck: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  User: (p: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  Sparkles: (p: SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
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
  Zap: (p: SVGProps<SVGSVGElement>) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
};

const STRIP = [
  { label: "Every profile verified", icon: <Icon.Shield /> },
  { label: "Privacy first", icon: <Icon.Lock /> },
  { label: "Real intentions only", icon: <Icon.User /> },
  { label: "Meaningful Matches", icon: <Icon.Heart /> },
  { label: "Discover people nearby", icon: <Icon.Sparkles /> },
];

const POINTS = [
  { icon: <Icon.Calendar />, text: "Live date events near you — meet face-to-face safely" },
  { icon: <Icon.Brain />, text: "AI-powered matches based on compatibility, not luck" },
  { icon: <Icon.Trophy />, text: "Relationship milestones that reward your journey" },
  { icon: <Icon.ShieldCheck />, text: "Privacy-first design — you control what's visible" },
];


function DownloadAppFeature() {
  const [stripRef, stripVisible] = useScrollReveal({ threshold: 0.1 });
  const [phoneRef, phoneVisible] = useScrollReveal({ threshold: 0.05 });
  const [textRef, textVisible] = useScrollReveal({ threshold: 0.05 });
  const [currentImage, setCurrentImage] = useState(0);

  const goToPrev = () => {
    setCurrentImage((prev) => (prev === 0 ? APP_SCREENSHOTS.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImage((prev) => (prev === APP_SCREENSHOTS.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!phoneVisible) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev === APP_SCREENSHOTS.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [phoneVisible]);

  return (
    <section
      id="download-app"
      className="w-full overflow-hidden py-12"
      style={{ backgroundColor: C.bg }}
    >
      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">

          {/* LEFT: Phone Mockup with Image Carousel */}
          <div ref={phoneRef} className="flex justify-center order-1 lg:order-1">
            <div className={`relative ${phoneVisible ? "wv-reveal-scale is-visible" : "wv-reveal-scale"}`} style={{ animationDelay: "200ms" }}>

              {/* Floating badge: ID verified */}
              <div className="wv-float absolute z-20 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] -left-3 top-16 lg:-left-35 lg:top-14 transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_40px_rgba(63,143,91,0.2)]">
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
                className="wv-float-delayed absolute z-20 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.08)] -right-3 top-[72%] lg:-right-32 lg:top-[64%] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_40px_rgba(194,21,89,0.2)]"
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
              <div className="relative w-[270px] rounded-[42px] bg-black p-3 shadow-[0_20px_60px_rgba(0,0,0,0.15),0_8px_20px_rgba(0,0,0,0.08)] sm:w-[290px] transition-all duration-500 hover:shadow-[0_30px_80px_rgba(91,98,181,0.15)] hover:scale-[1.02]">
                <div className="absolute left-1/2 top-4 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />

                <div className="overflow-hidden rounded-[34px] bg-white pt-9">
                  {/* Top bar */}
                  <div className="flex items-center justify-between px-4 pb-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm" style={{ borderColor: "#EDE4DC", color: C.headingDark }}>
                      <Icon.Filter />
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg text-white" style={{ backgroundColor: C.pink }}>
                        <Icon.Heart width="13" height="13" />
                      </span>
                      <span className="text-[16px] font-bold" style={{ color: C.headingDark }}>
                        Wel<span style={{ color: C.pink }}>vors</span>
                      </span>
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border bg-white shadow-sm" style={{ borderColor: "#EDE4DC", color: C.headingDark }}>
                      <Icon.Bell />
                    </span>
                  </div>

                  {/* App Screenshot Carousel */}
                  <div className="relative px-3 pb-3">
                    <div className="relative overflow-hidden rounded-[20px] border" style={{ borderColor: C.cardBorder }}>
                      <div
                        className="relative flex h-[380px] w-full transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentImage * 100}%)` }}
                      >
                        {APP_SCREENSHOTS.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt={`App screenshot ${i + 1}`}
                            className="h-full w-full flex-none object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                type="button"
                onClick={goToPrev}
                className="absolute left-[-24px] top-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)] active:scale-95 cursor-pointer"
                style={{ transform: "translateY(-50%)" }}
              >
                <Icon.ChevronLeft style={{ color: C.headingDark }} />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-[-24px] top-1/2 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-110 hover:shadow-[0_8px_30px_rgba(0,0,0,0.18)] active:scale-95 cursor-pointer"
                style={{ transform: "translateY(-50%)" }}
              >
                <Icon.ChevronRight style={{ color: C.headingDark }} />
              </button>

              {/* Pagination Dots */}
              <div className="absolute -bottom-10 mb-3 left-1/2 flex items-center gap-2" style={{ transform: "translateX(-50%)" }}>
                {APP_SCREENSHOTS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentImage(i)}
                    className={`rounded-full transition-all duration-300 cursor-pointer ${i === currentImage ? "h-2.5 w-6" : "h-2.5 w-2.5 hover:opacity-70"
                      }`}
                    style={{
                      backgroundColor: i === currentImage ? C.pink : C.mediumPink,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Text content */}
          <div ref={textRef} className="order-2 lg:order-2 text-center lg:text-left">
                          <h3
              className={`text-3xl flex flex-col items-center lg:items-start justify-center leading-tight sm:text-4xl lg:text-[2.4rem] ${textVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: C.headingDark,
                animationDelay: "100ms",
              }}
            ><span>
              
              Meet Your Forever{" "}
            </span>
              <span className="italic" style={{ color: C.pink }}>Anytime. Anywhere.</span>
            </h3>
            <p
              className={`mt-5 text-[15px] leading-relaxed ${textVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
              style={{ color: C.body, animationDelay: "200ms" }}
            >
              Download the Ruxsy app and start creating a love story that stands the test of time. Available free for iOS and Android.
            </p>

            {/* App Store Buttons */}
            <div className={`mt-8 flex flex-wrap justify-center lg:justify-start gap-4 ${textVisible ? "wv-reveal is-visible" : "wv-reveal"}`} style={{ animationDelay: "300ms" }}>
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-xl px-6 py-3.5 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})` }}
              >
                <Icon.Apple />
                <div className="text-left">
                  <p className="text-[10px] leading-none opacity-80">Download on the</p>
                  <p className="text-[14px] font-semibold leading-tight">App Store</p>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-3 rounded-xl px-6 py-3.5 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})` }}
              >
                <Icon.PlayStore />
                <div className="text-left">
                  <p className="text-[10px] leading-none opacity-80">Get it on</p>
                  <p className="text-[14px] font-semibold leading-tight">Google Play</p>
                </div>
              </a>
            </div>

          </div>
        </div>

        {/* Bottom trust strip */}
        {/* <div
          ref={stripRef}
          className={`w-full my-10 border-y overflow-hidden ${stripVisible ? "wv-reveal is-visible" : "wv-reveal"}`}
          style={{
            backgroundColor: C.stripBg,
            borderColor: "#6b655f17",
          }}
        >
          <div className="wv-marquee py-4">
            <div className="wv-marquee-track">
              {[...STRIP, ...STRIP].map((item, i) => (
                <span
                  key={`${item.label}-${i}`}
                  className="wv-marquee-item inline-flex items-center gap-2 text-[13.5px] font-semibold whitespace-nowrap"
                  style={{ color: C.headingDark }}
                >
                  <span style={{ color: C.pink }}>{item.icon}</span>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}

export default DownloadAppFeature;
