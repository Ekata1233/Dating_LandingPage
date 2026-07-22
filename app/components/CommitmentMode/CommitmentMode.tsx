"use client";

import React, { SVGProps } from "react";

/* ------------------------------------------------------------------ */
/*  Brand colors inline                                                */
/* ------------------------------------------------------------------ */
const C = {
  headingDark: "#2B2A28",
  pink: "#C21559",
  pinkSoft: "#D6336C",
  body: "#5F5A55",
  amber: "#B8860B",
  ctaFrom: "#C93B68",
  ctaTo: "#B31E52",
};

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */
const Icon = {
  Shield: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9.5 12l2 2 3.5-4" />
    </svg>
  ),
  Heart: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5 8.6 5 10 6.5 12 8c2-1.5 3.4-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21z" />
    </svg>
  ),
  Clock: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  UserPlus: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  ),
  Star: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <polygon points="12 2 15 9 22 9.3 17 14 18.5 21 12 17.3 5.5 21 7 14 2 9.3 9 9" />
    </svg>
  ),
  Gift: (p:  SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M3 12h18M12 8v13" />
      <path d="M12 8S10.5 3 8 3a2.5 2.5 0 0 0 0 5h4zM12 8s1.5-5 4-5a2.5 2.5 0 0 1 0 5h-4z" />
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
    title: "Confidence, not anxiety",
    body: "Both partners opt in publicly — you feel secure knowing exactly where you stand.",
    icon: <Icon.Shield />,
  },
  {
    title: "Less heartbreak",
    body: "Verified faithfulness keeps games, ghosting and dishonesty out of the picture.",
    icon: <Icon.Heart />,
  },
  {
    title: "Save your time",
    body: "Instantly filter the serious from the casual — no more months spent on maybes.",
    icon: <Icon.Clock />,
  },
  {
    title: "Deeper connections",
    body: "When intentions are clear, relationships get to grow on trust from day one.",
    icon: <Icon.UserPlus />,
  },
];

function CommitmentMode() {
  return (
  <section
  id="commitment"
  className="w-full overflow-hidden py-16 sm:py-20 lg:py-24"
  style={{
    background:
      "linear-gradient(135deg, #fdf8f8 0%, #fbe7ecd7 35%, #f7dfe4e8 65%, #efe3f0ea 100%)",
    borderTop: "1px solid #e6e6e6",
    borderBottom: "1px solid #e6e6e6",
  }}
>
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        {/* ==================== LEFT: copy ==================== */}
        <div>
          {/* Pill badge */}
          <div className="inline-flex items-center rounded-full border border-white bg-white/70 px-4 py-2">
            <span
              className="text-[15px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: C.pink }}
            >
              World-first · Commitment Mode
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
            Stop guessing.{" "}
            <span className="italic" style={{ color: C.pinkSoft }}>
              Start knowing.
            </span>
          </h2>

          {/* Body */}
          <p
            className="mt-6 max-w-lg text-[16px] leading-relaxed"
            style={{ color: C.body }}
          >
            The endless &ldquo;what are we?&rdquo; ends here. Commitment Mode
            lets two people lock in their intentions out loud — so you skip the
            situationship limbo and go straight to something real.
          </p>

          {/* Quote */}
          <blockquote
            className="mt-7 max-w-lg border-l-2 pl-4 text-[16px] italic leading-relaxed"
            style={{
              borderColor: C.pinkSoft,
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: C.pinkSoft,
            }}
          >
            &ldquo;Saaf iraade, solid commitment. No confusion, no anxiety —
            just clarity, on your terms.&rdquo;
          </blockquote>

          {/* Loyalty reward card */}
          <div
            className="mt-8 flex max-w-lg items-start gap-4 rounded-2xl border p-5"
            style={{
              background: "linear-gradient(135deg, #FBEFD3 0%, #F9E9CC 100%)",
              borderColor: "#EBD8A8",
            }}
          >
            <span
              className="flex h-12 w-12 flex-none items-center justify-center rounded-xl text-white"
              style={{
                background: "linear-gradient(135deg, #F0C244 0%, #E0A519 100%)",
              }}
            >
              <Icon.Gift />
            </span>
            <div>
              <h3 className="text-[16px] font-bold" style={{ color: C.amber }}>
                ₹5,00,000 Loyalty Reward
              </h3>
              <p
                className="mt-1 text-[14px] leading-relaxed"
                style={{ color: "#6B5C3A" }}
              >
                Stay committed with your Welvors match for 3 years and marry
                after — we gift you ₹5 lakh to start your new life together.
              </p>
            </div>
          </div>

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

        {/* ==================== RIGHT: benefit cards ==================== */}
        <div className="lg:pt-8">
          {/* Section label */}
          <div className="flex items-center gap-2">
            <span style={{ color: C.amber }}>
              <Icon.Star />
            </span>
            <span
              className="text-[12px] font-bold uppercase tracking-[0.14em]"
              style={{ color: C.amber }}
            >
              Why members love it
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
                  style={{ backgroundColor: "#FBE0EA", color: C.pink }}
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
      </div>
    </section>
  );
}

export default CommitmentMode;