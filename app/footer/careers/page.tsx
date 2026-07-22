"use client";

import Link from "next/link";
import React, {  useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Brand colors inline                                                */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#FCF8F4",
  headingDark: "#2B2A28",
  pink: "#C21559",
  body: "#6B655F",
  label: "#9C948C",
  border: "#EDE4DC",
  tableHeadBg: "#F5EEE7",
};

/* ------------------------------------------------------------------ */
/*  Careers config — LOCATIONS / EMAIL yahin badlo                     */
/* ------------------------------------------------------------------ */
const CAREERS_INFO = {
  hub: "Bengaluru",
  email: "careers@welvors.com",
};


/* ------------------------------------------------------------------ */
/*  "On this page" nav                                                 */
/* ------------------------------------------------------------------ */
const TOC = [
  { label: "Why Welvors", id: "why-welvors" },
  { label: "How we work", id: "how-we-work" },
  { label: "Open roles", id: "open-roles" },
  { label: "Benefits", id: "benefits" },
  { label: "Our hiring process", id: "hiring-process" },
  { label: "How to apply", id: "how-to-apply" },
];
const TOC_IDS = TOC.map((t) => t.id);

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */
const WHY: React.ReactNode[] = [
  <>
    <strong style={{ color: C.pink }}>Real impact.</strong> Your work directly
    affects whether someone feels safe enough to meet a stranger.
  </>,
  <>
    <strong style={{ color: C.pink }}>Early and senior.</strong> Join early, own
    big surface, and shape the product from the ground up.
  </>,
  <>
    <strong style={{ color: C.pink }}>Trust-and-safety first.</strong> We invest
    in the unglamorous work most apps ignore.
  </>,
];

const HOW_WE_WORK: React.ReactNode[] = [
  <>
    <strong style={{ color: C.pink }}>Small teams, high ownership</strong> —
    you&apos;ll ship, not sit in meetings.
  </>,
  <>
    <strong style={{ color: C.pink }}>Craft matters</strong> — we sweat details
    users may never consciously notice.
  </>,
  <>
    <strong style={{ color: C.pink }}>Honest by default</strong> — with our
    users and with each other.
  </>,
  <>
    <strong style={{ color: C.pink }}>Hybrid</strong> — {CAREERS_INFO.hub} hub,
    with remote flexibility for the right people.
  </>,
];

const ROLES = [
  {
    role: "Senior Flutter Engineer",
    team: "Mobile",
    location: `${CAREERS_INFO.hub} / Remote`,
  },
  {
    role: "Backend Engineer (Node.js)",
    team: "Platform",
    location: `${CAREERS_INFO.hub} / Remote`,
  },
  {
    role: "Trust & Safety Lead",
    team: "Operations",
    location: CAREERS_INFO.hub,
  },
  {
    role: "Product Designer",
    team: "Design",
    location: `${CAREERS_INFO.hub} / Remote`,
  },
  {
    role: "Community & Events Manager",
    team: "Growth",
    location: `${CAREERS_INFO.hub} · Pune · Mumbai`,
  },
];

const BENEFITS = [
  "Competitive salary and meaningful early-stage equity.",
  "Comprehensive health cover for you and your family.",
  "Flexible hours and generous leave.",
  "A real say in a product you'll be proud of.",
];

const HIRING: React.ReactNode[] = [
  <>
    <strong style={{ color: C.pink }}>1. Intro chat</strong> — a relaxed
    conversation about you and us.
  </>,
  <>
    <strong style={{ color: C.pink }}>2. Craft round</strong> — a practical
    discussion or task in your area.
  </>,
  <>
    <strong style={{ color: C.pink }}>3. Team &amp; values</strong> — meet the
    people you&apos;ll work with.
  </>,
  <>
    <strong style={{ color: C.pink }}>4. Offer</strong> — usually within a week
    of the final round.
  </>,
];


/* ------------------------------------------------------------------ */
/*  Scroll spy — konsa section viewport me hai                          */
/* ------------------------------------------------------------------ */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -55% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */
function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-[90px] text-xl font-bold sm:text-2xl"
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: C.pink,
      }}
    >
      {children}
    </h2>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((b, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span
            className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
            style={{ backgroundColor: C.pink }}
          />
          <span
            className="text-[15px] leading-relaxed"
            style={{ color: C.body }}
          >
            {b}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
function CareersPage() {
  const active = useActiveSection(TOC_IDS);

  return (
    <main style={{ backgroundColor: C.bg }} className="w-full py-10 sm:py-15">
      {/* ==================== Hero ==================== */}
      <div className="w-full border-b" style={{ borderColor: C.border }}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11.5px]" style={{ color: C.label }}>
              <Link href="/" className="hover:opacity-70">
                Welvors
              </Link>{" "}
              › <span>Company</span> › <span>Careers</span>
            </p>

            <Link
              href="/"
              className="text-[12px] font-medium transition-opacity hover:opacity-70"
              style={{ color: C.pink }}
            >
              ← Back to Welvors
            </Link>
          </div>

          {/* Badge */}
          <div
            className="mt-4 inline-flex items-center rounded-full border px-3 py-1"
            style={{ borderColor: "#F0CFDC", backgroundColor: "#FCEDF2" }}
          >
            <span
              className="text-[10.5px] font-bold uppercase tracking-[0.16em]"
              style={{ color: C.pink }}
            >
              Join us
            </span>
          </div>

          {/* Heading */}
          <h1
            className="mt-5 text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: C.headingDark,
            }}
          >
            Help us make dating
            <br />
            honest again.
          </h1>

          <p
            className="mt-5 max-w-2xl text-[15px] leading-relaxed"
            style={{ color: C.pink }}
          >
            We&apos;re a small team solving a genuinely hard problem — trust
            between strangers. If that excites you, we&apos;d love to talk.
          </p>
        </div>
      </div>

      {/* ==================== Body + TOC ==================== */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-14">
          {/* -------------------- Main content -------------------- */}
          <div className="max-w-3xl">
            {/* Intro */}
            <p className="text-[15px] leading-relaxed" style={{ color: C.body }}>
              Building a trust-first dating platform means every decision — from
              verification to moderation — has real consequences for real
              people. We&apos;re looking for people who care about that
              responsibility as much as we do.
            </p>

            {/* ---- Why Welvors ---- */}
            <div className="mt-12">
              <SectionHeading id="why-welvors">Why Welvors</SectionHeading>
              <BulletList items={WHY} />
            </div>

            {/* ---- How we work ---- */}
            <div className="mt-12">
              <SectionHeading id="how-we-work">How we work</SectionHeading>
              <BulletList items={HOW_WE_WORK} />
            </div>

            {/* ---- Open roles ---- */}
            <div className="mt-12">
              <SectionHeading id="open-roles">Open roles</SectionHeading>

              <div className="mt-5 overflow-x-auto">
                <table
                  className="w-full min-w-[560px] border-collapse text-left"
                  style={{ color: C.body }}
                >
                  <thead>
                    <tr style={{ backgroundColor: C.tableHeadBg }}>
                      {["Role", "Team", "Location"].map((h, i) => (
                        <th
                          key={h}
                          className={`border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em] ${
                            i === 0 ? "w-1/2" : "w-1/4"
                          }`}
                          style={{ borderColor: C.border, color: C.label }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ROLES.map((r) => (
                      <tr key={r.role}>
                        <td
                          className="border px-4 py-3 align-top text-[13.5px] font-bold"
                          style={{
                            borderColor: C.border,
                            color: C.headingDark,
                          }}
                        >
                          {r.role}
                        </td>
                        <td
                          className="border px-4 py-3 align-top text-[13.5px]"
                          style={{ borderColor: C.border }}
                        >
                          {r.team}
                        </td>
                        <td
                          className="border px-4 py-3 align-top text-[13.5px]"
                          style={{ borderColor: C.border }}
                        >
                          {r.location}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Don't see your role card */}
              <div
                className="mt-6 rounded-xl border bg-white p-5"
                style={{ borderColor: C.border }}
              >
                <p
                  className="text-[13.5px] font-bold"
                  style={{ color: C.headingDark }}
                >
                  Don&apos;t see your role?
                </p>
                <p
                  className="mt-1.5 text-[13.5px] leading-relaxed"
                  style={{ color: C.body }}
                >
                  We&apos;re always happy to meet exceptional people. Write to
                  us and tell us what you&apos;d want to build.
                </p>
              </div>
            </div>

            {/* ---- Benefits ---- */}
            <div className="mt-12">
              <SectionHeading id="benefits">Benefits</SectionHeading>
              <BulletList items={BENEFITS} />
            </div>

            {/* ---- Hiring process ---- */}
            <div className="mt-12">
              <SectionHeading id="hiring-process">
                Our hiring process
              </SectionHeading>
              <BulletList items={HIRING} />
            </div>

            {/* ---- How to apply ---- */}
            <div className="mt-12">
              <SectionHeading id="how-to-apply">How to apply</SectionHeading>
              <div
                className="mt-5 rounded-xl border bg-white p-5"
                style={{ borderColor: C.border }}
              >
                <dl className="space-y-2 text-[13.5px]">
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-bold" style={{ color: C.headingDark }}>
                      Email:
                    </dt>
                    <dd>
                      <a
                        href={`mailto:${CAREERS_INFO.email}`}
                        className="hover:opacity-70"
                        style={{ color: C.pink }}
                      >
                        {CAREERS_INFO.email}
                      </a>
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-bold" style={{ color: C.headingDark }}>
                      Include:
                    </dt>
                    <dd style={{ color: C.body }}>
                      the role, a short note on why, and a link to your work or
                      CV.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

          
          </div>

          {/* -------------------- On this page (TOC) -------------------- */}
          <aside className="order-first lg:order-none">
            {/* sticky — parent chain me kahin overflow-hidden nahi hona chahiye */}
            <div className="lg:sticky lg:top-[90px] lg:self-start">
              <p
                className="text-[10.5px] font-bold uppercase tracking-[0.16em]"
                style={{ color: C.label }}
              >
                On this page
              </p>
              <ul className="mt-3 space-y-1">
                {TOC.map((t) => {
                  const isActive = active === t.id;
                  return (
                    <li key={t.id}>
                      <a
                        href={`#${t.id}`}
                        className="block border-l-2 py-1 pl-3 text-[13px] transition-colors hover:text-[#C21559]"
                        style={{
                          borderColor: isActive ? C.pink : "transparent",
                          color: isActive ? C.pink : C.body,
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {t.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default CareersPage;