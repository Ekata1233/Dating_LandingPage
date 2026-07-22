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
  warnBg: "#FCEDF2",
  warnBorder: "#F5D9E3",
  greenBg: "#E9F6EE",
  greenBorder: "#C8E6D4",
  green: "#2E7D52",
  disclaimerBg: "#F2ECE5",
};

/* ------------------------------------------------------------------ */
/*  Meta + contacts — yahin update karo                                */
/*  NOTE: helplines verified — 112 (ERSS), 181 (women), 1930 (cyber)   */
/* ------------------------------------------------------------------ */
const META = {
  lastUpdated: "11 July 2026",
  effective: "11 July 2026",
  safetyEmail: "safety@welvors.com",
  supportEmail: "help@welvors.com",
};

const RESOURCES: { label: string; value: string; href?: string }[] = [
  { label: "Emergency (India)", value: "112", href: "tel:112" },
  { label: "Women's Helpline (India)", value: "181", href: "tel:181" },
  {
    label: "Cyber Crime Helpline (India)",
    value: "1930 · cybercrime.gov.in",
    href: "tel:1930",
  },
  {
    label: "Welvors Safety Team",
    value: META.safetyEmail,
    href: `mailto:${META.safetyEmail}`,
  },
];

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */
const WHAT_WE_DO: [string, string][] = [
  [
    "Mobile verification",
    "for every member, so each profile is tied to a real number.",
  ],
  [
    "Photo & profile review",
    "to keep out fakes, duplicates, and inappropriate content.",
  ],
  [
    "Separate all member pools",
    "you only ever appear to, and interact with, verified members in your own community pool — never anyone outside it.",
  ],
  ["24/7 moderation", "and rapid action on reports."],
  ["Proactive detection", "of scam, match patterns, and abusive behaviour."],
  ["Easy block & report", "tools on every profile and chat."],
];

const CHATTING: [string, string][] = [
  [
    "Keep chats on Welvors",
    "until you're comfortable — don't rush to other apps or share your number early.",
  ],
  [
    "Protect personal info",
    "don't share your home or work address, financial details, or daily routine.",
  ],
  [
    "Watch for red flags",
    "someone who quickly professes strong feelings, avoids video calls, has a story that keeps changing, or seems talk toward money.",
  ],
  [
    "Never send codes or OTPs",
    "to anyone, and don't click suspicious links.",
  ],
];

const MEETING: [string, string][] = [
  [
    "Video call first",
    "so you know they match their profile.",
  ],
  [
    "Meet in a busy public place",
    "a café, not a home or isolated spot — for the first few dates.",
  ],
  [
    "Tell a friend or family member",
    "where you're going, who with, and when you expect to be back.",
  ],
  [
    "Arrange your own transport",
    "both ways, so you can leave whenever you want.",
  ],
  [
    "Stay sober enough to stay in control",
    "and keep your drinks in sight.",
  ],
  [
    "Trust your gut",
    "if anything feels off, it's completely fine to leave.",
  ],
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
export default function SafetyTrustPage() {
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
              › <span>Legal</span> › <span>Safety &amp; Trust</span>
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
              Care · Trust
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
            Safety &amp; Trust
          </h1>

          <p className="mt-3 max-w-xl text-[14px]" style={{ color: C.body }}>
            How we protect you behind the scenes, and how to protect yourself
            online and in person.
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
          <strong style={{ color: C.pink }}>
            Meeting someone new should feel exciting, not risky.
          </strong>{" "}
          Safety is built into how Welvors works — and this guide shows what
          we do behind the scenes, plus simple steps that keep you in control
          online and in person.
        </p>

        {/* 1 */}
        <div className="mt-10">
          <SectionHeading id="what-we-do">
            1. What we do to keep Welvors safe
          </SectionHeading>
          <DefList items={WHAT_WE_DO} />
        </div>

        {/* 2 */}
        <div className="mt-10">
          <SectionHeading id="chatting">
            2. Staying safe while chatting
          </SectionHeading>
          <DefList items={CHATTING} />
        </div>

        {/* 3 */}
        <div className="mt-10">
          <SectionHeading id="scams">
            3. Romance scams &amp; money
          </SectionHeading>

          <div
            className="mt-5 rounded-xl border p-5"
            style={{
              backgroundColor: C.warnBg,
              borderColor: C.warnBorder,
            }}
          >
            <p className="text-[13px] font-bold" style={{ color: C.pink }}>
              ▶ Never send money to someone you met online
            </p>
            <p
              className="mt-2 text-[12.5px] leading-relaxed"
              style={{ color: C.body }}
            >
              No genuine match will ask you for money, gift cards, crypto, or
              &ldquo;investment&rdquo; help — no matter how convincing the
              story (emergency, travel, customs fees). Report the moment you
              see it. If it&apos;s a scam, report them immediately.
            </p>
          </div>
        </div>

        {/* 4 */}
        <div className="mt-10">
          <SectionHeading id="meeting">4. Meeting in person</SectionHeading>
          <DefList items={MEETING} />
        </div>

        {/* 5 */}
        <div className="mt-10">
          <SectionHeading id="consent">5. Consent matters</SectionHeading>
          <Para>
            Consent is essential, every time. It must be freely given,
            enthusiastic, and can be withdrawn at any moment. Silence or a
            date not having responded is never consent to anything. Respect a
            &ldquo;no&rdquo; instantly.
          </Para>
        </div>

        {/* 6 */}
        <div className="mt-10">
          <SectionHeading id="goes-wrong">
            6. If something goes wrong
          </SectionHeading>
          <Para>
            You can <strong style={{ color: C.pink }}>block</strong> or{" "}
            <strong style={{ color: C.pink }}>report</strong> anyone from
            their profile or your chat in a few taps. Reports are
            confidential. If you feel unsafe, act first and tell us after.
          </Para>

          <div
            className="mt-5 rounded-xl border p-5"
            style={{
              backgroundColor: C.greenBg,
              borderColor: C.greenBorder,
            }}
          >
            <p
              className="text-[13px] font-bold"
              style={{ color: C.green }}
            >
              ⚠ In immediate danger
            </p>
            <p
              className="mt-2 text-[12.5px] leading-relaxed"
              style={{ color: C.body }}
            >
              Contact local emergency services first — dial{" "}
              <a
                href="tel:112"
                className="font-bold underline"
                style={{ color: C.green }}
              >
                112
              </a>{" "}
              in India. Then report the incident to us at{" "}
              <MailLink email={META.safetyEmail} />. Our safety team responds
              around the clock and cooperates with lawful requests from the
              authorities.
            </p>
          </div>
        </div>

        {/* 7 */}
        <div className="mt-10">
          <SectionHeading id="resources">
            7. Support resources
          </SectionHeading>
          <ul className="mt-3 space-y-2.5">
            {RESOURCES.map((r) => (
              <li key={r.label} className="flex items-start gap-2.5">
                <span
                  className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
                  style={{ backgroundColor: C.pink }}
                />
                <span
                  className="text-[13.5px] leading-relaxed"
                  style={{ color: C.body }}
                >
                  <strong style={{ color: C.headingDark }}>
                    {r.label}:
                  </strong>{" "}
                  {r.href ? (
                    <a
                      href={r.href}
                      className="hover:opacity-70"
                      style={{ color: C.pink }}
                    >
                      {r.value}
                    </a>
                  ) : (
                    r.value
                  )}
                </span>
              </li>
            ))}
          </ul>
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
                  Safety team:
                </dt>
                <dd>
                  <MailLink email={META.safetyEmail} />
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-bold" style={{ color: C.headingDark }}>
                  Support:
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
              This guidance helps you stay safer but cannot remove all risk.
              Welvors does not run criminal background checks and cannot
              guarantee any member&apos;s conduct. Please trust your instincts
              and always contact the authorities in an emergency.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}