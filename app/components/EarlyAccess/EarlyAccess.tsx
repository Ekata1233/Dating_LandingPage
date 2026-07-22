"use client";

import WaitlistModal from "@/app/waitlist/page";
import React, { SVGProps, useEffect, useState } from "react";
import { useLaunchData } from "@/app/context/launchContext"; // path adjust karo

const C = {
  pageBg: "#FCF8F4",
  headingDark: "#2B2A28",
  pink: "#C21559",
  body: "#6B655F",
  perkBorder: "#F1E6E0",
  check: "#3F8F5B",
  ctaFrom: "#C93B68",
  ctaTo: "#B31E52",
};

const Icon = {
  Check: (p: SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  Arrow: (p: SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
};

const ASSURANCES: React.ReactNode[] = [
  <>Perks <strong>locked in for life</strong></>,
  <><strong>Launch price</strong> locked forever</>,
  <>No spam — <strong>city invite only</strong></>,
];

const AVATARS = [
  { letter: "A", bg: "#C9436E" },
  { letter: "R", bg: "#5B62B5" },
  { letter: "S", bg: "#3F8F5B" },
  { letter: "M", bg: "#B8860B" },
];

function inr(v: string | number) {
  return Number(v || 0).toLocaleString("en-IN");
}

function EarlyAccess() {
  const [modalOpen, setModalOpen] = useState(false);
  const { waitlist } = useLaunchData();
  const [waitlistCount, setWaitlistCount] = useState(515);

  useEffect(() => {
    const BASE = 515;
    const ANCHOR = new Date("2026-07-22T00:00:00+05:30").getTime(); // yahan se ginti shuru

    // ghanta number ko seed maan ke 1-20 deterministic value
    const perHour = (h: number) => {
      const x = Math.sin(h * 9973) * 10000;
      return 1 + Math.floor((x - Math.floor(x)) * 20); // 1..20
    };

    const compute = () => {
      const hours = Math.max(0, Math.floor((Date.now() - ANCHOR) / 3600000));
      let total = BASE;
      for (let h = 0; h < hours; h++) total += perHour(h);
      setWaitlistCount(total);
    };

    compute();
    const id = setInterval(compute, 60000); // har minute recheck
    return () => clearInterval(id);
  }, []);

  // Numbers — sirf API se. Load hone tak dash (crash na ho, koi hardcoded fallback nahi)
  const summary = waitlist
    ? {
        totalValue: `₹${inr(waitlist.totalBenefitsValue)}+`,
        price: `₹${inr(waitlist.finalPrice)}`,
        // savings = original − final (discountAmount reliable nahi)
        savings: `₹${inr(Number(waitlist.originalPrice) - Number(waitlist.finalPrice))}`,
      }
    : { totalValue: "—", price: "—", savings: "—" };

  // Perks — sirf API se (title + subtitle + ₹value). Load hone tak khaali.
  const perks =
    waitlist?.perks && waitlist.perks.length > 0
      ? waitlist.perks.map((p) => ({
          text: (
            <>
              <strong>{p.title.replace(/"/g, "")}</strong>
              {p.subtitle ? ` — ${p.subtitle}` : ""}
            </>
          ),
          tag: p.value ? `₹${inr(p.value)}` : "FREE",
        }))
      : [];

  return (
    <section
      id="waitlist"
      style={{ backgroundColor: C.pageBg }}
      className="w-full px-4 py-16 sm:px-6 sm:py-20"
    >
      <div
        className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] p-6 shadow-[0_18px_50px_rgba(43,42,40,0.08)] sm:p-10 lg:p-12"
        style={{
          background: [
            "radial-gradient(circle at 100% 0%, #F9D3DF 0%, rgba(249,211,223,0.45) 28%, rgba(255,255,255,0) 55%)",
            "radial-gradient(circle at 0% 100%, #FBEEDF 0%, rgba(251,238,223,0.4) 25%, rgba(255,255,255,0) 50%)",
            "linear-gradient(#FFFFFF, #FFFFFF)",
          ].join(", "),
        }}
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          {/* LEFT */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: C.pink }}>
              Early access
            </span>

            <h2 className="mt-3 text-3xl leading-tight sm:text-4xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: C.headingDark }}>
              Be first in line for Welvors.
            </h2>

            <p className="mt-4 max-w-md text-[15px] leading-relaxed" style={{ color: C.body }}>
              Reserve a founding spot for a one-time {summary.price} — lock in everything below.
            </p>

            <div className="mt-6 space-y-3">
              {perks.map((p, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border px-4 py-3"
                  style={{ borderColor: C.perkBorder, background: "linear-gradient(100deg, #FBF3EE 0%, #FCEFF2 100%)" }}
                >
                  <span className="mt-0.5 flex-none" style={{ color: C.pink }}>
                    <Icon.Check />
                  </span>
                  <p className="flex-1 text-[13.5px] leading-relaxed" style={{ color: C.body }}>
                    {p.text}
                  </p>
                  <span className="mt-0.5 flex-none text-[12px] font-semibold" style={{ color: C.pink }}>
                    {p.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="rounded-2xl border px-5 py-4" style={{ backgroundColor: "#FCEDF2", borderColor: "#F6DCE5" }}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[14px]" style={{ color: C.body }}>
                  <strong style={{ color: C.headingDark }}>Total value</strong> of everything above
                </span>
                <span className="text-xl font-bold" style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: C.headingDark }}>
                  {summary.totalValue}
                </span>
              </div>

              <div className="my-3 h-px w-full" style={{ backgroundColor: "#F0D3DD" }} />

              <p className="text-[14px] leading-relaxed" style={{ color: C.body }}>
                All yours for a one-time <strong style={{ color: C.headingDark }}>{summary.price}</strong> —{" "}
                <strong style={{ color: C.pink }}>you save over {summary.savings}</strong>.
              </p>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-[15px] font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})`, boxShadow: "0 12px 24px rgba(179,30,82,0.26)" }}
              >
                Join the waitlist
                <Icon.Arrow />
              </button>
              <p className="mt-3 text-[13px]" style={{ color: C.body }}>
                One-time {summary.price} · No spam.
              </p>
            </div>

            <div className="mt-6 space-y-2.5">
              {ASSURANCES.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex-none" style={{ color: C.check }}>
                    <Icon.Check />
                  </span>
                  <span className="text-[14px] leading-relaxed" style={{ color: C.body }}>
                    {a}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-start gap-3">
              <div className="flex flex-none -space-x-2">
                {AVATARS.map((av) => (
                  <span
                    key={av.letter}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[12px] font-semibold text-white"
                    style={{ backgroundColor: av.bg }}
                  >
                    {av.letter}
                  </span>
                ))}
              </div>
              <p className="text-[13.5px] leading-relaxed" style={{ color: C.body }}>
                <strong style={{ color: C.headingDark }}>{waitlistCount}+ people</strong> are already on the list · new spots open daily.
              </p>
            </div>
          </div>
        </div>
      </div>

      <WaitlistModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}

export default EarlyAccess;