"use client";

import React, { SVGProps } from "react";

/* ------------------------------------------------------------------ */
/*  Brand colors inline                                                */
/* ------------------------------------------------------------------ */
const C = {
  headingDark: "#2B2A28",
  indigo: "#5B62B5", // heading italic + quote accent
  labelGreen: "#2E8B6B", // "WHY MEMBERS LOVE IT" label
  badgeText: "#3E4680",
  body: "#5F5A55",
  iconTint: "#EAEDFA",
  iconColor: "#5B62B5",
  ctaFrom: "#C93B68",
  ctaTo: "#B31E52",
};

// Right-column label — CommitmentMode me bhi yahi text hai.
// Alag chahiye toh sirf ye line badal do.
const LABEL = "Why members love it";

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */
const Icon = {
  Clock: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  Pin: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  ),
  ShieldCheck: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9.5 12l2 2 3.5-4" />
    </svg>
  ),
  Bolt: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="13 2 4 14 11 14 10 22 20 10 13 10" />
    </svg>
  ),
  Star: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <polygon points="12 2 15 9 22 9.3 17 14 18.5 21 12 17.3 5.5 21 7 14 2 9.3 9 9" />
    </svg>
  ),
  Arrow: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Benefit cards                                                      */
/* ------------------------------------------------------------------ */
const BENEFITS = [
  {
    title: "Meet in real time",
    body: "See verified people near you who are free today — no more endless texting that goes nowhere.",
    icon: <Icon.Clock />,
  },
  {
    title: "Nearby & convenient",
    body: "Match with people in your area and pick a safe public spot — a café, a park, a quick walk.",
    icon: <Icon.Pin />,
  },
  {
    title: "Verified & safe",
    body: "Everyone in Date Now is ID-verified, with location sharing and check-ins built in for peace of mind.",
    icon: <Icon.ShieldCheck />,
  },
  {
    title: "Real chemistry, faster",
    body: "You learn more in one coffee than a month of chats — find out if the spark is real, today.",
    icon: <Icon.Bolt />,
  },
];

function DateNow() {
  return (
    <section
      className="w-full overflow-hidden py-16 sm:py-20 lg:py-24"
      style={{
        background:
          "linear-gradient(135deg, #EFF2FB 0%, #EDEFFA 40%, #EDE7F5 70%, #E9DFF0 100%)",
      }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        {/* ============ LEFT (desktop): benefit cards — mobile order 2 ============ */}
        <div className="order-2 lg:order-1">
          {/* Section label */}
          <div className="flex items-center gap-2">
            <span style={{ color: C.labelGreen }}>
              <Icon.Star />
            </span>
            <span
              className="text-[15px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: C.labelGreen }}
            >
              {LABEL}
            </span>
          </div>

          {/* Cards */}
          <div className="mt-5 space-y-5">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(43,42,40,0.06)]"
              >
                <span
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-xl"
                  style={{ backgroundColor: C.iconTint, color: C.iconColor }}
                >
                  {b.icon}
                </span>
                <div>
                  <h4
                    className="text-[16px] font-bold"
                    style={{ color: C.headingDark }}
                  >
                    {b.title}
                  </h4>
                  <p
                    className="mt-1 text-[14px] leading-relaxed"
                    style={{ color: C.body }}
                  >
                    {b.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============ RIGHT (desktop): copy — mobile order 1 ============ */}
        <div className="order-1 lg:order-2 lg:pt-4">
          {/* Pill badge */}
          <div className="inline-flex items-center rounded-full border border-white bg-white/70 px-4 py-2">
            <span
              className="text-[12px] font-bold uppercase tracking-[0.14em]"
              style={{ color: C.badgeText }}
            >
              Real-world · Date Now
            </span>
          </div>

          {/* Heading */}
          <h2
            className="mt-6 text-4xl leading-[1.12] sm:text-5xl"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: C.headingDark,
            }}
          >
            Skip the small talk.{" "}
            <span className="italic" style={{ color: C.indigo }}>
              Meet today.
            </span>
          </h2>

          {/* Body */}
          <p
            className="mt-6 max-w-lg text-[16px] leading-relaxed"
            style={{ color: C.body }}
          >
            Chatting for weeks and never meeting? Date Now flips it. Turn it on
            and Welvors shows you verified people nearby who are free to meet
            right now — a coffee, a walk, a real first date, today.
          </p>

          {/* Quote */}
          <blockquote
            className="mt-7 max-w-lg border-l-2 pl-4 text-[16px] italic leading-relaxed"
            style={{
              borderColor: C.indigo,
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: C.indigo,
            }}
          >
            &ldquo;Kam baat, zyada mulaqaat. Real connection tab banti hai jab
            aap aamne-saamne baithte ho.&rdquo;
          </blockquote>

          {/* CTA */}
          <div className="mt-8">
            <a
              href="#waitlist"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})`,
                boxShadow: "0 12px 24px rgba(179,30,82,0.28)",
              }}
            >
              Get early access
              <Icon.Arrow />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DateNow;