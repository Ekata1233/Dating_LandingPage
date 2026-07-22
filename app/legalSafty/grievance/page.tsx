"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

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
  officerBg: "#FFFFFF",
  disclaimerBg: "#F2ECE5",
};

/* ------------------------------------------------------------------ */
/*  Grievance Officer — LEGALLY REQUIRED, real details honi chahiye    */
/*  (IT Rules 2021 Rule 3(2) + DPDP Act 2023)                          */
/* ------------------------------------------------------------------ */
const OFFICER = {
  name: "Ms. Aarohi Menon",
  designation: "Grievance Officer & Data Protection Officer",
  email: "grievance@welvors.com",
  company: "Welvors Technologies Pvt. Ltd.",
  address: "Bengaluru, Karnataka, India",
  workingHours: "Monday–Saturday, 10:00–18:00 IST (excluding public holidays)",
};

const META = {
  lastUpdated: "11 July 2026",
  effective: "11 July 2026",
  safetyEmail: "safety@welvors.com",
  supportEmail: "help@welvors.com",
};

/* ------------------------------------------------------------------ */
/*  "On this page" nav                                                 */
/* ------------------------------------------------------------------ */
const TOC = [
  { label: "1. What this covers", id: "what-this-covers" },
  { label: "2. How to raise a grievance", id: "how-to-raise" },
  { label: "3. Our timelines", id: "timelines" },
  { label: "4. Grievance Officer", id: "officer" },
  { label: "5. How we handle your complaint", id: "how-we-handle" },
  { label: "6. If you're not satisfied", id: "not-satisfied" },
  { label: "7. Good-faith use", id: "good-faith" },
  { label: "8. Contact", id: "contact" },
];
const TOC_IDS = TOC.map((t) => t.id);

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */
const HOW_TO_RAISE: React.ReactNode[] = [
  <>
    <strong style={{ color: C.pink }}>In-app:</strong> use{" "}
    <strong>Report</strong> on any profile or message, or{" "}
    <strong>Settings › Help › Raise a complaint</strong>.
  </>,
  <>
    <strong style={{ color: C.pink }}>By email:</strong> write to our Grievance
    Officer at <a href={`mailto:${OFFICER.email}`} style={{ color: C.pink }} className="hover:opacity-70">{OFFICER.email}</a>.
  </>,
  <>
    <strong style={{ color: C.pink }}>Include:</strong> your registered mobile
    number, a description of the issue, and any screenshots, dates, or references
    that help us investigate.
  </>,
];

const TIMELINES: [string, string][] = [
  ["Acknowledgement", "Within 24 hours of receiving your complaint."],
  [
    "Urgent safety content (e.g. non-consensual imagery, minors)",
    "Actioned as priority, typically within 24 hours.",
  ],
  ["Resolution", "Within 15 days of receipt, as required by the IT Rules."],
  [
    "Certain content removal requests",
    "Where legally required, within 36 hours.",
  ],
];

const HANDLING: React.ReactNode[] = [
  <>We acknowledge and assign a reference number.</>,
  <>
    We investigate — which may include reviewing content, activity, and reports.
  </>,
  <>
    We take appropriate action, from content removal to warnings or bans.
  </>,
  <>
    We inform you of the outcome and the reasoning, subject to privacy and safety
    limits.
  </>,
];

const NOT_SATISFIED: React.ReactNode[] = [
  <>Reply to your grievance reference asking for a senior review.</>,
  <>
    For data-protection matters, you may approach the{" "}
    <strong style={{ color: C.pink }}>Data Protection Board of India</strong>.
  </>,
  <>
    For content matters under the IT Rules, you may approach the relevant{" "}
    <strong style={{ color: C.pink }}>Grievance Appellate Committee</strong>.
  </>,
  <>You retain any rights available to you under applicable law.</>,
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
      className="scroll-mt-[90px] text-lg font-bold sm:text-xl"
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: C.pink,
      }}
    >
      {children}
    </h2>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-[13.5px] leading-relaxed" style={{ color: C.body }}>
      {children}
    </p>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mt-3 space-y-2.5">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span
            className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
            style={{ backgroundColor: C.pink }}
          />
          <span
            className="text-[13.5px] leading-relaxed"
            style={{ color: C.body }}
          >
            {t}
          </span>
        </li>
      ))}
    </ul>
  );
}

function MailLink({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="hover:opacity-70"
      style={{ color: C.pink }}
    >
      {email}
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function GrievancePage() {
  const active = useActiveSection(TOC_IDS);

  return (
    <main style={{ backgroundColor: C.bg }} className="w-full mt-5">
      {/* ==================== Hero ==================== */}
      <div className="w-full border-b" style={{ borderColor: C.border }}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 my-5">
          {/* Breadcrumb */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11.5px]" style={{ color: C.label }}>
              <Link href="/" className="hover:opacity-70">
                Welvors
              </Link>{" "}
              › <span>Legal</span> › <span>Grievance Redressal</span>
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
              Accountability
            </span>
          </div>

          {/* Heading */}
          <h1
            className="mt-5 text-3xl leading-tight sm:text-4xl lg:text-[2.6rem]"
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: C.headingDark,
            }}
          >
            Grievance Redressal
          </h1>

          <p className="mt-3 max-w-xl text-[14px]" style={{ color: C.body }}>
            How to raise a concern with Welvors and how quickly we resolve it.
          </p>

          <p className="mt-3 text-[11.5px]" style={{ color: C.label }}>
            <strong style={{ color: C.body }}>Last updated:</strong>{" "}
            {META.lastUpdated} ·{" "}
            <strong style={{ color: C.body }}>Effective:</strong>{" "}
            {META.effective}
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
              className="text-[13.5px] leading-relaxed"
              style={{ color: C.body }}
            >
              If something goes wrong, you deserve a real person and a clear
              timeline. This Grievance Redressal Policy explains how to raise a
              concern with Welvors and how we resolve it — in line with
              India&apos;s Information Technology (Intermediary Guidelines and
              Digital Media Ethics Code) Rules, 2021 and the DPDP Act, 2023.
            </p>

            {/* 1 */}
            <div className="mt-10">
              <SectionHeading id="what-this-covers">
                1. What this covers
              </SectionHeading>
              <Para>
                You can raise a grievance about content that violates our{" "}
                <Link
                  href="/guidelines"
                  className="underline hover:opacity-70"
                  style={{ color: C.pink }}
                >
                  Community Guidelines
                </Link>
                , harassment or safety concerns, misuse of your personal data,
                billing and refund issues, or any other problem with the service.
                This policy sits alongside our{" "}
                <Link
                  href="/privacy"
                  className="underline hover:opacity-70"
                  style={{ color: C.pink }}
                >
                  Privacy Policy
                </Link>
                ,{" "}
                <Link
                  href="/terms"
                  className="underline hover:opacity-70"
                  style={{ color: C.pink }}
                >
                  Terms
                </Link>
                , and Community Guidelines.
              </Para>
            </div>

            {/* 2 */}
            <div className="mt-10">
              <SectionHeading id="how-to-raise">
                2. How to raise a grievance
              </SectionHeading>
              <BulletList items={HOW_TO_RAISE} />
              <Para>
                To protect your privacy, please raise grievances from the contact
                details linked to your account.
              </Para>
            </div>

            {/* 3 */}
            <div className="mt-10">
              <SectionHeading id="timelines">3. Our timelines</SectionHeading>

              <div className="mt-5 overflow-x-auto">
                <table
                  className="w-full min-w-[520px] border-collapse text-left"
                  style={{ color: C.body }}
                >
                  <thead>
                    <tr style={{ backgroundColor: C.tableHeadBg }}>
                      <th
                        className="w-[45%] border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                        style={{ borderColor: C.border, color: C.label }}
                      >
                        Stage
                      </th>
                      <th
                        className="border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                        style={{ borderColor: C.border, color: C.label }}
                      >
                        Timeline
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TIMELINES.map(([stage, timeline]) => (
                      <tr key={stage}>
                        <td
                          className="border px-4 py-3 align-top text-[13px] font-bold"
                          style={{
                            borderColor: C.border,
                            color: C.headingDark,
                          }}
                        >
                          {stage}
                        </td>
                        <td
                          className="border px-4 py-3 align-top text-[13px] leading-relaxed"
                          style={{ borderColor: C.border }}
                        >
                          {timeline}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4 */}
            <div className="mt-10">
              <SectionHeading id="officer">4. Grievance Officer</SectionHeading>
              <Para>
                In accordance with the IT Rules, 2021 and the DPDP Act, 2023, the
                details of our Grievance Officer / Data Protection Officer are:
              </Para>

              <div
                className="mt-5 rounded-xl border p-5"
                style={{
                  backgroundColor: C.officerBg,
                  borderColor: C.border,
                }}
              >
                <dl className="space-y-2 text-[13.5px]">
                  {[
                    ["Name", OFFICER.name],
                    ["Designation", OFFICER.designation],
                    ["Company", OFFICER.company],
                    ["Address", OFFICER.address],
                    ["Working hours", OFFICER.workingHours],
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
                      Email:
                    </dt>
                    <dd>
                      <MailLink email={OFFICER.email} />
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* 5 */}
            <div className="mt-10">
              <SectionHeading id="how-we-handle">
                5. How we handle your complaint
              </SectionHeading>
              <BulletList items={HANDLING} />
            </div>

            {/* 6 */}
            <div className="mt-10">
              <SectionHeading id="not-satisfied">
                6. If you&apos;re not satisfied
              </SectionHeading>
              <Para>If our resolution doesn&apos;t satisfy you, you may escalate:</Para>
              <BulletList items={NOT_SATISFIED} />
            </div>

            {/* 7 */}
            <div className="mt-10">
              <SectionHeading id="good-faith">7. Good-faith use</SectionHeading>
              <Para>
                Please use this process in good faith. Repeated false or
                malicious complaints intended to harass another member may
                constitute a violation of our{" "}
                <Link
                  href="/guidelines"
                  className="underline hover:opacity-70"
                  style={{ color: C.pink }}
                >
                  Community Guidelines
                </Link>
                .
              </Para>
            </div>

            {/* 8 */}
            <div className="mt-10">
              <SectionHeading id="contact">8. Contact</SectionHeading>

              <div
                className="mt-5 rounded-xl border bg-white p-5"
                style={{ borderColor: C.border }}
              >
                <dl className="space-y-2 text-[13.5px]">
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-bold" style={{ color: C.headingDark }}>
                      Grievance Officer:
                    </dt>
                    <dd>
                      <MailLink email={OFFICER.email} />
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-bold" style={{ color: C.headingDark }}>
                      Safety:
                    </dt>
                    <dd>
                      <MailLink email={META.safetyEmail} />
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-bold" style={{ color: C.headingDark }}>
                      General support:
                    </dt>
                    <dd>
                      <MailLink email={META.supportEmail} />
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Disclaimer strip */}
              <div
                className="mt-6 rounded-xl p-5"
                style={{ backgroundColor: C.disclaimerBg }}
              >
                <p
                  className="text-[12px] leading-relaxed"
                  style={{ color: C.label }}
                >
                  This policy is a template provided in good faith to reflect
                  common statutory expectations. Confirm the actual officer,
                  address, and applicable compliance obligations with qualified
                  counsel before launch.
                </p>
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
                        className="block border-l-2 py-1 pl-3 text-[12.5px] transition-colors hover:text-[#C21559]"
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