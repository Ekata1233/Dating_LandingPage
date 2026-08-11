"use client";

import React, { SVGProps } from "react";

/* ------------------------------------------------------------------ */
/*  Brand colors inline                                                */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#FCF8F4",
  headingDark: "#2B2A28",
  pink: "#C21559",
  body: "#6B655F",
  check: "#3F8F5B",
};

// Per-tier accent palettes
const ACCENT = {
  pink: {
    main: "#C21559",
    line: "#C21559",
    tint: "#FBE8EF",
    badgeBg: "#FBE8EF",
    badgeText: "#C21559",
    track: "#EFE3DF",
    cardBorder: "#F0E8E1",
  },
  amber: {
    main: "#C9962A",
    line: "#C9962A",
    tint: "#F7EFD9",
    badgeBg: "#F4EAD2",
    badgeText: "#A87A12",
    track: "#EEE6D5",
    cardBorder: "#E8D6A8",
  },
} as const;

type AccentKey = keyof typeof ACCENT;

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */
const Icon = {
  Phone: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  ),
  IdCard: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="2" y="5" width="20" height="14" rx="2.5" />
      <circle cx="8" cy="12" r="2" />
      <path d="M13 10h5M13 14h4" />
    </svg>
  ),
  Video: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="2" y="6" width="13" height="12" rx="2.5" />
      <path d="M15 10l6-3v10l-6-3z" />
    </svg>
  ),
  Star: (p: SVGProps<SVGSVGElement>) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <polygon points="12 2 15 9 22 9.3 17 14 18.5 21 12 17.3 5.5 21 7 14 2 9.3 9 9" />
    </svg>
  ),
  Check: (p: SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  Bulb: (p: SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2h6c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z" />
    </svg>
  ),

  /* ---- "What this means for you" section icons ---- */
  ShieldTick: (p: SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9.5 12l2 2 3.5-4" />
    </svg>
  ),
  Clock: (p: SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  CheckMark: (p: SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  HeartOutline: (p: SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5 8.6 5 10 6.5 12 8c2-1.5 3.4-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21z" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Tier data                                                          */
/* ------------------------------------------------------------------ */
const TIERS: {
  n: number;
  name: string;
  tier: string;
  subtitle: string;
  icon: React.ReactNode;
  progress: number;
  checks: string[];
  note: string;
  accent: AccentKey;
}[] = [
  {
    n: 1,
    name: "Basic",
    tier: "TIER 1",
    subtitle: "Entry level",
    icon: <Icon.Phone />,
    progress: 25,
    checks: ["Mobile number", "Email verified", "Location verified"],
    note: "Stops mass fake signups",
    accent: "pink",
  },
  {
    n: 2,
    name: "Verified",
    tier: "TIER 2",
    subtitle: "Identity confirmed",
    icon: <Icon.IdCard />,
    progress: 52,
    checks: ["Government ID", "Face / selfie", "Live video check"],
    note: "Blocks catfish & stolen photos",
    accent: "pink",
  },
  {
    n: 3,
    name: "Trusted",
    tier: "TIER 3",
    subtitle: "Verified in person",
    icon: <Icon.Video />,
    progress: 78,
    checks: ["Education verified", "Profession verified"],
    note: "Rules out identity & resume liars",
    accent: "pink",
  },
  {
    n: 4,
    name: "Elite",
    tier: "TIER 4",
    subtitle: "Fully vetted",
    icon: <Icon.Star />,
    progress: 100,
    checks: [
      "Income verified",
      "Background check via verified third-party partner",
    ],
    note: "Designed to filter out scammers",
    accent: "amber",
  },
];

/* ------------------------------------------------------------------ */
/*  "What this means for you" benefits                                 */
/* ------------------------------------------------------------------ */
const BENEFITS = [
  {
    title: "Real, verified profiles",
    body: "Every profile completes verification before it reaches you — built to keep bots and catfish out.",
    icon: <Icon.ShieldTick />,
  },
  {
    title: "Save your time",
    body: "Skip the endless screening — trust is confirmed before you ever chat.",
    icon: <Icon.Clock />,
  },
  {
    title: "Honest by design",
    body: "Age, job and background are checked — what you read is what's real.",
    icon: <Icon.CheckMark />,
  },
  {
    title: "Date with peace of mind",
    body: "Meet with more confidence — verified details, genuine intent.",
    icon: <Icon.HeartOutline />,
  },
];

function VerifiedCommunity() {
  return (
    <section style={{ backgroundColor: C.bg }} className="w-full py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* -------------------- Header -------------------- */}
        <div className="mx-auto max-w-4xl text-center">
          <span
            className="text-[15px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: C.pink }}
          >
            Verified Community
          </span>

          <h2
            className="mt-3 text-3xl leading-tight sm:text-4xl lg:text-[2.6rem]"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: C.headingDark,
            }}
          >
            Every member clears verification
            <br />
            before entering the community.
          </h2>

          <p
            className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed"
            style={{ color: C.body }}
          >
            On Welvors, no one gets in without proving they&apos;re real. Every
            profile clears a multi-step verification ladder before it ever
            reaches you — built to keep fakes, catfish and scammers out.
            Genuine, verified people looking for the same thing you are.
          </p>
        </div>

        {/* -------------------- Timeline + cards -------------------- */}
        <div className="mt-12 space-y-6">
          {TIERS.map((t, i) => {
            const a = ACCENT[t.accent];
            const isLast = i === TIERS.length - 1;
            return (
              <div key={t.n} className="flex gap-3 sm:gap-5">
                {/* Rail: number circle + connecting line */}
                <div className="relative flex w-8 flex-none justify-center">
                  {/* Vertical line (behind circle) */}
                  {!isLast && (
                    <span
                      className="absolute left-1/2 top-6 -translate-x-1/2"
                      style={{
                        width: "2px",
                        bottom: "-1.5rem", // bridge the gap-6 to next circle
                        backgroundColor: a.line,
                        opacity: 0.85,
                      }}
                    />
                  )}
                  {/* Number circle */}
                  <span
                    className="relative z-10 mt-3 flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 bg-white text-[13px] font-semibold"
                    style={{ borderColor: a.main, color: a.main }}
                  >
                    {t.n}
                  </span>
                </div>

                {/* Card */}
                <div
                  className="flex-1 rounded-2xl border bg-white p-5 shadow-[0_4px_20px_rgba(43,42,40,0.04)] sm:p-6"
                  style={{ borderColor: a.cardBorder }}
                >
                  {/* Title row */}
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 flex-none items-center justify-center rounded-xl"
                      style={{ backgroundColor: a.tint, color: a.main }}
                    >
                      {t.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3
                          className="text-lg font-bold"
                          style={{
                            fontFamily: 'Georgia, "Times New Roman", serif',
                            color: C.headingDark,
                          }}
                        >
                          {t.name}
                        </h3>
                        <span
                          className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: a.badgeBg, color: a.badgeText }}
                        >
                          {t.tier}
                        </span>
                      </div>
                      <p className="text-[13px]" style={{ color: C.body }}>
                        {t.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="mt-4 h-2 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: a.track }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${t.progress}%`, backgroundColor: a.main }}
                    />
                  </div>

                  {/* Checklist */}
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {t.checks.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1.5 text-[13px]"
                        style={{ color: C.headingDark }}
                      >
                        <span style={{ color: C.check }}>
                          <Icon.Check />
                        </span>
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Note pill */}
                  <div
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold"
                    style={{ backgroundColor: a.tint, color: a.main }}
                  >
                    <Icon.Bulb />
                    {t.note}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* -------------------- What this means for you -------------------- */}
        <div className="mt-16">
          <p
            className="text-center text-[13px] font-bold uppercase tracking-[0.16em]"
            style={{ color: C.pink }}
          >
            What this means for you
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="flex items-start gap-3 rounded-2xl border bg-white p-5 shadow-[0_4px_20px_rgba(43,42,40,0.04)]"
                style={{ borderColor: "#F2E3E8" }}
              >
                <span className="mt-0.5 flex-none" style={{ color: C.pink }}>
                  {b.icon}
                </span>
                <div>
                  <h4
                    className="text-[15px] font-bold"
                    style={{ color: C.headingDark }}
                  >
                    {b.title}
                  </h4>
                  <p
                    className="mt-1 text-[13.5px] leading-relaxed"
                    style={{ color: C.body }}
                  >
                    {b.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default VerifiedCommunity;