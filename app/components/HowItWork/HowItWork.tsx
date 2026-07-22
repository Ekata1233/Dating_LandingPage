"use client";

import React, { SVGProps } from "react";

/* ------------------------------------------------------------------ */
/*  Brand colors inline                                                */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#FCF8F4",
  headingDark: "#2B2A28",
  pink: "#C21559",
  pinkDeep: "#B9235C",
  body: "#6B655F",
  cardBorder: "#F3E7EC",
  stepBadgeBg: "#FBE3EC",
  railLine: "#D9CFC8",
  ctaFrom: "#C93B68",
  ctaTo: "#B31E52",
  noteBg: "#FCEDF2",
  noteBorder: "#F5D9E3",
};

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */
const Icon = {
  UserPlus: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  ),
  ShieldCheck: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9.5 12l2 2 3.5-4" />
    </svg>
  ),
  Heart: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5 8.6 5 10 6.5 12 8c2-1.5 3.4-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21z" />
    </svg>
  ),
  Users: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5" />
      <path d="M17 5.2a3.5 3.5 0 0 1 0 6.6M18.5 15c2.2.7 3.5 2.3 3.5 5" />
    </svg>
  ),
  Check: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  ShieldSolid: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9.5 12l2 2 3.5-4" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Steps data (bold parts JSX me hain)                                */
/* ------------------------------------------------------------------ */
const STEPS: {
  step: string;
  title: string;
  icon: React.ReactNode;
  points: React.ReactNode[];
}[] = [
  {
    step: "Step 1",
    title: "Join the waitlist",
    icon: <Icon.UserPlus />,
    points: [
      <>
        Reserve your <strong>founding spot</strong> with your number and a quick
        profile
      </>,
      <>
        We open <strong>city by city</strong> — join early, get in sooner
      </>,
    ],
  },
  {
    step: "Step 2",
    title: "Match only verified people",
    icon: <Icon.ShieldCheck />,
    points: [
      <>
        Every profile clears real checks — <strong>ID &amp; live video</strong>
      </>,
      <>
        <strong>Income &amp; background</strong> checks for serious daters
      </>,
      <>
        No fakes, <strong>no hidden pasts</strong>
      </>,
    ],
  },
  {
    step: "Step 3",
    title: "Lock in real intentions",
    icon: <Icon.Heart />,
    points: [
      <>
        <strong>Commitment Mode</strong> makes both people state what they truly
        want — out loud
      </>,
      <>
        No games, <strong>no wasted months</strong>
      </>,
    ],
  },
  {
    step: "Step 4",
    title: "Meet a partner you can trust",
    icon: <Icon.Users />,
    points: [
      <>
        Meet safely at <strong>curated, verified events</strong>
      </>,
      <>
        Build toward a marriage your <strong>whole family can trust</strong>
      </>,
    ],
  },
];

function HowItWork() {
  return (
    <section
    id="how-it-works"
     style={{ backgroundColor: C.bg }} className="w-full py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* -------------------- Header -------------------- */}
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="text-[15px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: C.pink }}
          >
            How it works
          </span>

          <h2
            className="mt-3 text-3xl leading-tight sm:text-4xl lg:text-[2.5rem]"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: C.headingDark,
            }}
          >
            A safer way to find
            <br />
            the person you&apos;ll marry.
          </h2>

          <p
            className="mx-auto mt-5 max-w-xl text-[14.5px] leading-relaxed"
            style={{ color: C.body }}
          >
            Too many families learn the truth about a partner far too late —
            after the wedding, when it&apos;s hardest to walk away. Welvors
            flips that. You know who someone really is{" "}
            <strong style={{ color: C.headingDark }}>before</strong> your heart,
            or your family, is on the line.
          </p>
        </div>

        {/* -------------------- Steps timeline -------------------- */}
        <div className="mt-12 space-y-5">
          {STEPS.map((s, i) => {
            const isLast = i === STEPS.length - 1;
            return (
              <div key={s.step} className="flex gap-3 sm:gap-4">
                {/* Rail: icon circle + connecting line */}
                <div className="relative flex w-9 flex-none justify-center">
                  {!isLast && (
                    <span
                      className="absolute left-1/2 top-8 -translate-x-1/2"
                      style={{
                        width: "1.5px",
                        bottom: "-1.25rem", // bridge space-y-5 gap
                        backgroundColor: C.railLine,
                      }}
                    />
                  )}
                  <span
                    className="relative z-10 mt-2 flex h-9 w-9 flex-none items-center justify-center rounded-full text-white"
                    style={{
                      background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.pinkDeep})`,
                    }}
                  >
                    {s.icon}
                  </span>
                </div>

                {/* Card */}
                <div
                  className="flex-1 rounded-2xl border bg-white p-5 shadow-[0_4px_18px_rgba(43,42,40,0.04)]"
                  style={{ borderColor: C.cardBorder }}
                >
                  {/* Title row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-md px-2 py-0.5 text-[11px] font-bold"
                      style={{
                        backgroundColor: C.stepBadgeBg,
                        color: C.pink,
                      }}
                    >
                      {s.step}
                    </span>
                    <h3
                      className="text-[16px] font-bold"
                      style={{ color: C.headingDark }}
                    >
                      {s.title}
                    </h3>
                  </div>

                  {/* Points */}
                  <ul className="mt-3 space-y-2">
                    {s.points.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span
                          className="mt-0.5 flex-none"
                          style={{ color: C.pink }}
                        >
                          <Icon.Check />
                        </span>
                        <span
                          className="text-[13.5px] leading-relaxed"
                          style={{ color: C.body }}
                        >
                          {p}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* -------------------- Safety note -------------------- */}
        <div
          className="mt-6 flex items-start gap-4 rounded-2xl border p-5"
          style={{
            backgroundColor: C.noteBg,
            borderColor: C.noteBorder,
          }}
        >
          <span
            className="flex h-11 w-11 flex-none items-center justify-center rounded-xl text-white"
            style={{
              background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.pinkDeep})`,
            }}
          >
            <Icon.ShieldSolid />
          </span>
          <p
            className="text-[13.5px] leading-relaxed"
            style={{ color: C.body }}
          >
            <strong style={{ color: C.headingDark }}>
              Safety isn&apos;t a feature here — it&apos;s the whole point.
            </strong>{" "}
            For every woman and every man, Welvors is built so you meet a
            genuine, verified, safe life partner. Nothing less.
          </p>
        </div>

        {/* -------------------- CTA -------------------- */}
        <div className="mt-10 text-center">
          <a
            href="#waitlist"
            className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-[15px] font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})`,
              boxShadow: "0 12px 24px rgba(179,30,82,0.24)",
            }}
          >
            Join the waitlist
          </a>
          <p className="mt-3 text-[12.5px]" style={{ color: C.body }}>
            Reserve your founding spot · No spam
          </p>
        </div>
      </div>
    </section>
  );
}

export default HowItWork;