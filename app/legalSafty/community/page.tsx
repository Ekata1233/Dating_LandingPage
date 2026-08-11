"use client";

import Link from "next/link";
import React from "react";

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
  noteBg: "#FCEDF2",
  noteBorder: "#F5D9E3",
  disclaimerBg: "#F2ECE5",
};

/* ------------------------------------------------------------------ */
/*  Meta + contact — yahin update karo                                 */
/* ------------------------------------------------------------------ */
const META = {
  lastUpdated: "11 July 2026",
  effective: "11 July 2026",
  safetyEmail: "infynod@gmail.com",
  appealsEmail: "infynod@gmail.com",
};

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */
const VALUES: [string, string][] = [
  ["Be real", "One genuine person, honest about who you are."],
  ["Be kind", "Treat every member the way you'd want to be treated."],
  ["Be respectful", "Consent and a clear 'no' are non-negotiable."],
  ["Be safe", "Look out for yourself and for others."],
];

const AUTHENTICITY: React.ReactNode[] = [
  <>Use your real name and recent photos that clearly show you.</>,
  <>
    Be honest about your age, relationship intentions, and key details.
  </>,
  <>
    No impersonation, catfishing, fake profiles, or duplicate accounts.
  </>,
  <>No accounts run on behalf of someone else or by a business.</>,
];

const RESPECT: React.ReactNode[] = [
  <>
    Ask before escalating a conversation; respect boundaries immediately.
  </>,
  <>
    Do not pressure anyone for photos, contact details, meetings, or intimacy.
  </>,
  <>
    &ldquo;No&rdquo;, silence, or an unmatch are all answers. Don&apos;t try to
    reach someone who has unmatched you.
  </>,
];

const NEVER_ALLOWED: [string, string][] = [
  [
    "Harassment & hate",
    "threats, bullying, stalking, or attacks based on religion, caste, ethnicity, gender, sexuality, disability, or any protected trait.",
  ],
  [
    "Sexual misconduct",
    "unsolicited sexual content, nudity in profiles, or sexual advances after a 'no'.",
  ],
  [
    "Minors",
    "any content involving anyone under 18 in a romantic or sexual context. Zero tolerance — reported to the authorities.",
  ],
  [
    "Violence",
    "threats of harm, promotion of violence, or extremist content.",
  ],
  [
    "Scams & solicitation",
    "asking for money, gifts, investments or crypto pitches, promoting services, or advertising.",
  ],
  [
    "Illegal activity",
    "drugs, weapons, trafficking, or anything else unlawful.",
  ],
  [
    "Private information",
    "sharing someone else's photos, contact details, or private data without consent.",
  ],
  [
    "Spam & manipulation",
    "mass messaging, bots, or gaming the system.",
  ],
];

const PHOTO_STANDARDS: React.ReactNode[] = [
  <>At least one clear photo of your face; it must be you.</>,
  <>No nudity, sexual content, or graphic violence.</>,
  <>
    No photos of children as your main image; no group-only photos that hide who
    you are.
  </>,
  <>
    No copyrighted images you don&apos;t have the right to use, and no
    contact details or ads in your profile.
  </>,
];

const ENFORCEMENT: React.ReactNode[] = [
  <>Remove the offending content and send a warning.</>,
  <>Limit features or visibility for a period.</>,
  <>Suspend the account while we investigate.</>,
  <>Permanently ban the account and the person behind it.</>,
  <>Report to law enforcement where there is a risk to safety or a crime.</>,
];

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

function DefList({ items }: { items: [string, string][] }) {
  return (
    <ul className="mt-3 space-y-2.5">
      {items.map(([term, desc]) => (
        <li key={term} className="flex items-start gap-2.5">
          <span
            className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
            style={{ backgroundColor: C.pink }}
          />
          <span
            className="text-[13.5px] leading-relaxed"
            style={{ color: C.body }}
          >
            <strong style={{ color: C.headingDark }}>{term}</strong> — {desc}
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
export default function CommunityGuidelinesPage() {
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
              › <span>Legal</span> › <span>Community Guidelines</span>
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
              Respect · Safety
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
            Community Guidelines
          </h1>

          <p className="mt-3 max-w-xl text-[14px]" style={{ color: C.body }}>
            How we behave on Welvors — and what we do to keep it safe for
            everyone.
          </p>

          <p className="mt-3 text-[11.5px]" style={{ color: C.label }}>
            <strong style={{ color: C.body }}>Last updated:</strong>{" "}
            {META.lastUpdated} ·{" "}
            <strong style={{ color: C.body }}>Effective:</strong>{" "}
            {META.effective}
          </p>
        </div>
      </div>

      {/* ==================== Body ==================== */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Intro */}
        <p
          className="text-[13.5px] leading-relaxed"
          style={{ color: C.body }}
        >
          Welvors only works because people show up as their real, kind
          selves. These Community Guidelines describe what we expect from
          everyone and what will get an account removed. They apply
          everywhere on Welvors — profiles, photos, messages, and reports.
          Breaking them has real consequences.
        </p>

        {/* 1 */}
        <div className="mt-10">
          <SectionHeading id="our-values">1. Our values</SectionHeading>
          <DefList items={VALUES} />
        </div>

        {/* 2 */}
        <div className="mt-10">
          <SectionHeading id="authenticity">2. Authenticity</SectionHeading>
          <BulletList items={AUTHENTICITY} />
        </div>

        {/* 3 */}
        <div className="mt-10">
          <SectionHeading id="respect-consent">
            3. Respect &amp; consent
          </SectionHeading>
          <BulletList items={RESPECT} />
        </div>

        {/* 4 */}
        <div className="mt-10">
          <SectionHeading id="never-allowed">
            4. What is never allowed
          </SectionHeading>
          <Para>
            The following lead to content removal and often an immediate
            permanent ban:
          </Para>
          <DefList items={NEVER_ALLOWED} />
        </div>

        {/* 5 */}
        <div className="mt-10">
          <SectionHeading id="photo-standards">
            5. Photo &amp; profile standards
          </SectionHeading>
          <BulletList items={PHOTO_STANDARDS} />
        </div>

        {/* 6 */}
        <div className="mt-10">
          <SectionHeading id="reporting">
            6. Reporting &amp; blocking
          </SectionHeading>
          <Para>
            If something feels wrong, trust that instinct. You can{" "}
            <strong style={{ color: C.pink }}>block</strong> anyone to stop
            contact, and <strong style={{ color: C.pink }}>report</strong> a
            profile or message in two taps. Reports are confidential — the
            other person is not told who reported them. Our moderation team
            reviews every report, usually within 24 hours.
          </Para>

          {/* Reporting note card */}
          <div
            className="mt-6 rounded-xl border p-5"
            style={{
              backgroundColor: C.noteBg,
              borderColor: C.noteBorder,
            }}
          >
            <p
              className="text-[13px] font-bold"
              style={{ color: C.pink }}
            >
              ⓘ You won&apos;t get in trouble for reporting
            </p>
            <p
              className="mt-2 text-[12.5px] leading-relaxed"
              style={{ color: C.body }}
            >
              Reporting in good faith never counts against you, even if we
              ultimately take no action. When in doubt, report.
            </p>
          </div>
        </div>

        {/* 7 */}
        <div className="mt-10">
          <SectionHeading id="enforcement">
            7. How we enforce
          </SectionHeading>
          <Para>
            Depending on severity and history, we may:
          </Para>
          <BulletList items={ENFORCEMENT} />
          <Para>
            Serious violations skip straight to a permanent ban. We may
            remove anyone whose behaviour puts the community at risk, even
            if a specific rule isn&apos;t listed here.
          </Para>
        </div>

        {/* 8 */}
        <div className="mt-10">
          <SectionHeading id="appeals">8. Appeals</SectionHeading>
          <Para>
            If you believe we got it wrong, you can appeal by writing to{" "}
            <MailLink email={META.appealsEmail} />. We&apos;ll review your
            case and respond. Bans for the most serious violations — such as
            anything involving minors or violence — are final.
          </Para>
        </div>

        {/* 9 */}
        <div className="mt-10">
          <SectionHeading id="contact">9. Contact</SectionHeading>

          <div
            className="mt-5 rounded-xl border bg-white p-5"
            style={{ borderColor: C.border }}
          >
            <dl className="space-y-2 text-[13.5px]">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-bold" style={{ color: C.headingDark }}>
                  Report / safety:
                </dt>
                <dd>
                  <MailLink email={META.safetyEmail} />
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-bold" style={{ color: C.headingDark }}>
                  Appeals:
                </dt>
                <dd>
                  <MailLink email={META.appealsEmail} />
                </dd>
              </div>
            </dl>
          </div>

          
        </div>
      </div>
    </main>
  );
}