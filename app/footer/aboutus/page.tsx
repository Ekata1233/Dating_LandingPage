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
  promiseBg: "#FCEDF2",
  promiseBorder: "#F5D9E3",
};

/* ------------------------------------------------------------------ */
/*  Company details — LEGAL INFO                                       */
/*  NOTE: yahi jagah hai registered entity / address set karne ki.      */
/* ------------------------------------------------------------------ */
const COMPANY_INFO = {
  name: "Infynod Tech Private Limited (CIN: U62020PN2026PTC258333) ",
  registeredIn: "India",
  headOffice: "Hadpsar, Pune, Maharashtra, India",
  email: "infynod@gmail.com",
};

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */
const Icon = {
  Heart: (p: SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5 8.6 5 10 6.5 12 8c2-1.5 3.4-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21z" />
    </svg>
  ),
  Plus: (p: SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  "On this page" nav                                                 */
/* ------------------------------------------------------------------ */
const TOC = [
  { label: "Our story", id: "our-story" },
  { label: "What we believe", id: "what-we-believe" },
  { label: "How we're different", id: "how-were-different" },
  { label: "Who we serve", id: "who-we-serve" },
  { label: "The people behind Welvors", id: "the-team" },
  { label: "Where we are", id: "where-we-are" },
];

/* ------------------------------------------------------------------ */
/*  Beliefs                                                            */
/* ------------------------------------------------------------------ */
const BELIEFS: React.ReactNode[] = [
  <>
    <strong style={{ color: C.pink }}>Trust is the product.</strong> Everything
    else — matches, chats, events — only matters if you can trust who&apos;s on
    the other side.
  </>,
  <>
    <strong style={{ color: C.pink }}>Real over endless.</strong> A few genuine
    connections beat a thousand hollow swipes.
  </>,
  <>
    <strong style={{ color: C.pink }}>Safety is non-negotiable.</strong>{" "}
    Especially for women. If people don&apos;t feel safe, nothing else counts.
  </>,
  <>
    <strong style={{ color: C.pink }}>Your pace, your choice.</strong> Serious
    doesn&apos;t mean rushed. Marriage is an option, never a default.
  </>,
];

/* ------------------------------------------------------------------ */
/*  Comparison table                                                   */
/* ------------------------------------------------------------------ */
const COMPARISON: { most: string; welvors: React.ReactNode }[] = [
  {
    most: "Anyone can sign up with a fake photo",
    welvors: (
      <>
        <strong>Multi-level verification</strong> — mobile, to face and video
        checks
      </>
    ),
  },
  {
    most: "Optimise for time-on-app",
    welvors: (
      <>
        Optimise for <strong>genuine matches</strong> who want the same thing
      </>
    ),
  },
  {
    most: "Safety bolted on later",
    welvors: (
      <>
        SafeFace privacy, verified-only pools and offline-event safety built in
      </>
    ),
  },
  {
    most: "No accountability after matching",
    welvors: (
      <>
        Commitment Mode and a Forever Love reward that grows with your
        relationship
      </>
    ),
  },
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
      // navbar (70px) ke neeche se lekar viewport ke 55% tak ka band
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
function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
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

const TOC_IDS = TOC.map((t) => t.id);

function AboutUs() {
  const active = useActiveSection(TOC_IDS);

  return (
    <main
      style={{ backgroundColor: C.bg }}
      className="w-full py-10 sm:py-15"
    >
      {/* ==================== Hero ==================== */}
      <div
        className="w-full border-b"
        style={{ borderColor: C.border }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 my-5">
          {/* Breadcrumb */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11.5px]" style={{ color: C.label }}>
              <Link href="/" className="hover:opacity-70">
                Welvors
              </Link>{" "}
              › <span>Company</span> › <span>About us</span>
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
              Our story
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
            We&apos;re building trust,
            <br />
            not another dating app.
          </h1>

          <p
            className="mt-5 max-w-2xl text-[15px] leading-relaxed"
            style={{ color: C.pink }}
          >
            Welvors exists for people who are done with endless swiping and want
            something real — with safety and honesty built into every step.
          </p>
        </div>
      </div>

      {/* ==================== Body + TOC ==================== */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-14">
          {/* -------------------- Main content -------------------- */}
          <div className="max-w-3xl">
            {/* Intro */}
            <p
              className="text-[15px] leading-relaxed"
              style={{ color: C.body }}
            >
              Welvors is a serious-relationship dating platform for
              career-focused Indian professionals. We started with a simple
              frustration: the apps everyone uses are built to keep you swiping,
              not to help you actually meet someone worth your time. So we built
              the opposite.
            </p>

            {/* ---- Our story ---- */}
            <div className="mt-12">
              <SectionHeading id="our-story">Our story</SectionHeading>
              <p
                className="mt-4 text-[15px] leading-relaxed"
                style={{ color: C.body }}
              >
                Welvors began with a question our founders kept hearing from
                friends in their late twenties:{" "}
                <em>&ldquo;Why is it so hard to meet someone genuine?&rdquo;</em>{" "}
                Dating apps felt like a numbers game; matrimony sites felt like a
                spreadsheet of biodata and family pressure, and nothing in
                between respected how modern professionals actually want to date
                — on their own timeline, without games, and safely.
              </p>
              <p
                className="mt-4 text-[15px] leading-relaxed"
                style={{ color: C.body }}
              >
                We set out to build a place where every profile is a real,
                verified person, where safety isn&apos;t an afterthought, and
                where wanting something serious is normal — not something you
                have to apologise for.
              </p>
            </div>

            {/* ---- What we believe ---- */}
            <div className="mt-12">
              <SectionHeading id="what-we-believe">
                What we believe
              </SectionHeading>
              <ul className="mt-4 space-y-3">
                {BELIEFS.map((b, i) => (
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
            </div>

            {/* ---- How we're different ---- */}
            <div className="mt-12">
              <SectionHeading id="how-were-different">
                How we&apos;re different
              </SectionHeading>

              {/* Scrollable on small screens */}
              <div className="mt-5 overflow-x-auto">
                <table
                  className="w-full min-w-[520px] border-collapse text-left"
                  style={{ color: C.body }}
                >
                  <thead>
                    <tr style={{ backgroundColor: C.tableHeadBg }}>
                      <th
                        className="w-1/2 border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                        style={{ borderColor: C.border, color: C.label }}
                      >
                        What most apps do
                      </th>
                      <th
                        className="w-1/2 border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                        style={{ borderColor: C.border, color: C.label }}
                      >
                        What Welvors does
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((row, i) => (
                      <tr key={i}>
                        <td
                          className="border px-4 py-3 align-top text-[13.5px] leading-relaxed"
                          style={{ borderColor: C.border }}
                        >
                          {row.most}
                        </td>
                        <td
                          className="border px-4 py-3 align-top text-[13.5px] leading-relaxed"
                          style={{ borderColor: C.border }}
                        >
                          {row.welvors}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ---- Who we serve ---- */}
            <div className="mt-12">
              <SectionHeading id="who-we-serve">Who we serve</SectionHeading>
              <p
                className="mt-4 text-[15px] leading-relaxed"
                style={{ color: C.body }}
              >
                Welvors is built for adults 18+ who are looking for something
                real — from a meaningful relationship to a life partner.
                We&apos;re proudly <strong>not</strong> a matrimony app: no
                biodata, no family logins, no pressure. Just you, deciding for
                yourself.
              </p>

              {/* Promise card */}
              <div
                className="mt-6 rounded-xl border p-5"
                style={{
                  backgroundColor: C.promiseBg,
                  borderColor: C.promiseBorder,
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: C.pink }}>
                    <Icon.Heart />
                  </span>
                  <span
                    className="text-[13.5px] font-bold"
                    style={{ color: C.pink }}
                  >
                    Our promise
                  </span>
                </div>
                <p
                  className="mt-2 text-[13.5px] leading-relaxed"
                  style={{ color: C.body }}
                >
                  Every person you see on Welvors is a real, verified human. No
                  bots, no catfish, no time-wasters — that&apos;s the whole
                  point.
                </p>
              </div>
            </div>

            {/* ---- The team ---- */}
            <div className="mt-12">
              <SectionHeading id="the-team">
                The people behind Welvors
              </SectionHeading>
              <p
                className="mt-4 text-[15px] leading-relaxed"
                style={{ color: C.body }}
              >
                We&apos;re a small, senior team of product, trust-and-safety,
                and engineering people who&apos;ve built consumer apps used by
                millions — now focused entirely on doing dating honestly. We
                obsess over the details most apps skip: how a report is handled,
                how quickly a fake profile is caught, how safe a first meeting
                feels.
              </p>
            </div>

            {/* ---- Where we are ---- */}
            <div className="mt-12">
              <SectionHeading id="where-we-are">Where we are</SectionHeading>
              <div
                className="mt-5 rounded-xl border bg-white p-5"
                style={{ borderColor: C.border }}
              >
                <dl className="space-y-2 text-[13.5px]">
                  {[
                    ["Company", COMPANY_INFO.name],
                    ["Registered in", COMPANY_INFO.registeredIn],
                    ["Head office", COMPANY_INFO.headOffice],
                  ].map(([k, v]) => (
                    <div key={k} className="flex flex-wrap gap-x-2">
                      <dt className="font-bold" style={{ color: C.headingDark }}>
                        {k}:
                      </dt>
                      <dd style={{ color: C.body }}>{v}</dd>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-bold" style={{ color: C.headingDark }}>
                      General enquiries:
                    </dt>
                    <dd>
                      <a
                        href={`mailto:${COMPANY_INFO.email}`}
                        className="hover:opacity-70"
                        style={{ color: C.pink }}
                      >
                        {COMPANY_INFO.email}
                      </a>
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

export default AboutUs;