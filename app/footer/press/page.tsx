"use client";

import Link from "next/link";
import React, { SVGProps, useEffect, useState } from "react";

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
  boilerBg: "#FCEDF2",
  boilerBorder: "#F5D9E3",
};

/* ------------------------------------------------------------------ */
/*  Press info — ENTITY / HQ / EMAIL yahin badlo                       */
/* ------------------------------------------------------------------ */
const PRESS_INFO = {
  company: "InfyNod Technologies Pvt. Ltd.",
  hq: "Hadpsar, Pune, Maharashtra, India",
  hqShort: "Bengaluru, India",
  email: "press@welvors.com",
  responseTime: "within 2 business days",
};

const BOILERPLATE =
  "Welvors is a trust-first dating app for career-focused Indian professionals who want something real. With multi-level verification, privacy tools, and safety built into every step, Welvors is designed so every profile is a real, verified person.";

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */
const Icon = {
  Plus: (p: SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Copy: (p: SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  ),
  Check: (p: SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  "On this page" nav                                                 */
/* ------------------------------------------------------------------ */
const TOC = [
  { label: "About Welvors", id: "about-welvors" },
  { label: "Facts at a glance", id: "facts" },
  { label: "Brand & press kit", id: "press-kit" },
  { label: "Story angles", id: "story-angles" },
  { label: "Media contact", id: "media-contact" },
];
const TOC_IDS = TOC.map((t) => t.id);

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */
const FACTS: [string, string][] = [
  ["Company", PRESS_INFO.company],
  ["Category", "Serious-relationship dating (not matrimony)"],
  ["Audience", "Career-focused Indian professionals, 18+"],
  ["Headquarters", PRESS_INFO.hq],
  ["Status", "Launching soon · waitlist open"],
  [
    "Signature features",
    "Multi-level verification, SafeFace, Commitment Mode, Forever Love reward",
  ],
];

const PRESS_KIT = [
  "Logo & wordmark (SVG / PNG, light and dark)",
  "Brand colours and usage guidelines",
  "Product screenshots",
  "Founder bios and photos",
];

const STORY_ANGLES = [
  "How verification and trust are reshaping online dating in India.",
  "Safety-first dating — especially for women meeting strangers.",
  "The shift from swipe-culture and matrimony to intentional dating.",
  "Building offline, real-life connection safely through brand events.",
];


/* ------------------------------------------------------------------ */
/*  Scroll spy                                                         */
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
/*  Helpers                                                            */
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
        color: C.headingDark,
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
          <span className="text-[14.5px] leading-relaxed" style={{ color: C.body }}>
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
export default function PressPage() {
  const active = useActiveSection(TOC_IDS);
  const [copied, setCopied] = useState(false);

  const copyBoilerplate = async () => {
    try {
      await navigator.clipboard.writeText(BOILERPLATE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — user select karke copy kar sakta hai */
    }
  };

  return (
    <main style={{ backgroundColor: C.bg }} className="w-full py-10 sm:py-15">
      {/* ==================== Hero ==================== */}
      <div className="w-full border-b" style={{ borderColor: C.border }}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 my-5">
          {/* Breadcrumb */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11.5px]" style={{ color: C.label }}>
              <Link href="/" className="hover:opacity-70">
                Welvors
              </Link>{" "}
              › <span>Company</span> › <span>Press</span>
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
              Press &amp; media
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
            Press &amp; media
          </h1>

          <p
            className="mt-4 max-w-xl text-[14.5px] leading-relaxed"
            style={{ color: C.body }}
          >
            Everything you need to write about{" "}
            <span style={{ color: C.pink }}>Welvors</span> — our story, our
            facts, and how to reach us.
          </p>
        </div>
      </div>

      {/* ==================== Body + TOC ==================== */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-14">
          {/* -------------------- Main content -------------------- */}
          <div className="max-w-3xl">
            {/* Intro */}
            <p className="text-[14.5px] leading-relaxed" style={{ color: C.body }}>
              Welvors is a trust-first, serious-relationship dating platform for
              career-focused Indian professionals. If you&apos;re a journalist or
              creator covering dating, safety, or technology, this page has the
              essentials — and our media team is happy to help with more.
            </p>

            {/* ---- About Welvors ---- */}
            <div className="mt-12">
              <SectionHeading id="about-welvors">About Welvors</SectionHeading>
              <p
                className="mt-4 text-[14.5px] leading-relaxed"
                style={{ color: C.body }}
              >
                Welvors is a dating platform built around one idea: trust between
                strangers. Through multi-level verification, SafeFace privacy,
                verified-only pools, and safety-first offline events, Welvors
                helps people meet genuine, verified matches — without the games
                of swipe apps or the pressure of matrimony sites. Welvors is
                operated by {PRESS_INFO.company}, headquartered in{" "}
                {PRESS_INFO.hqShort}.
              </p>

              {/* Boilerplate card */}
              <div
                className="mt-6 rounded-xl border p-5"
                style={{
                  backgroundColor: C.boilerBg,
                  borderColor: C.boilerBorder,
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p
                    className="text-[13.5px] font-bold"
                    style={{ color: C.headingDark }}
                  >
                    Boilerplate (copy-ready)
                  </p>

                  <button
                    type="button"
                    onClick={copyBoilerplate}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1 text-[11.5px] font-semibold transition-opacity hover:opacity-80"
                    style={{ borderColor: C.boilerBorder, color: C.pink }}
                  >
                    {copied ? <Icon.Check /> : <Icon.Copy />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <p
                  className="mt-2 text-[13px] italic leading-relaxed"
                  style={{ color: C.body }}
                >
                  &ldquo;{BOILERPLATE}&rdquo;
                </p>
              </div>
            </div>

            {/* ---- Facts at a glance ---- */}
            <div className="mt-12">
              <SectionHeading id="facts">Facts at a glance</SectionHeading>

              <div className="mt-5 overflow-x-auto">
                <table
                  className="w-full min-w-[520px] border-collapse text-left"
                  style={{ color: C.body }}
                >
                  <thead>
                    <tr style={{ backgroundColor: C.tableHeadBg }}>
                      <th
                        className="w-[30%] border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                        style={{ borderColor: C.border, color: C.label }}
                      >
                        Detail
                      </th>
                      <th
                        className="border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                        style={{ borderColor: C.border, color: C.label }}
                      >
                        Info
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FACTS.map(([k, v]) => (
                      <tr key={k}>
                        <td
                          className="border px-4 py-3 align-top text-[13.5px] font-bold"
                          style={{
                            borderColor: C.border,
                            color: C.headingDark,
                          }}
                        >
                          {k}
                        </td>
                        <td
                          className="border px-4 py-3 align-top text-[13.5px]"
                          style={{ borderColor: C.border }}
                        >
                          {v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ---- Brand & press kit ---- */}
            <div className="mt-12">
              <SectionHeading id="press-kit">Brand &amp; press kit</SectionHeading>
              <p
                className="mt-4 text-[14.5px] leading-relaxed"
                style={{ color: C.body }}
              >
                Our press kit includes the Welvors logo, wordmark, colour
                palette, app screenshots, and founder headshots. To keep
                everything current, we share it on request — email us and
                we&apos;ll send the latest pack.
              </p>
              <BulletList items={PRESS_KIT} />
            </div>

            {/* ---- Story angles ---- */}
            <div className="mt-12">
              <SectionHeading id="story-angles">
                Story angles we can help with
              </SectionHeading>
              <BulletList items={STORY_ANGLES} />
            </div>

            {/* ---- Media contact ---- */}
            <div className="mt-12">
              <SectionHeading id="media-contact">Media contact</SectionHeading>
              <div
                className="mt-5 rounded-xl border bg-white p-5"
                style={{ borderColor: C.border }}
              >
                <dl className="space-y-2 text-[13.5px]">
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-bold" style={{ color: C.headingDark }}>
                      Press &amp; media:
                    </dt>
                    <dd>
                      <a
                        href={`mailto:${PRESS_INFO.email}`}
                        className="hover:opacity-70"
                        style={{ color: C.pink }}
                      >
                        {PRESS_INFO.email}
                      </a>
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-bold" style={{ color: C.headingDark }}>
                      Response time:
                    </dt>
                    <dd style={{ color: C.body }}>{PRESS_INFO.responseTime}</dd>
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