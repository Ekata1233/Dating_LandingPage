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
  tableHeadBg: "#F5EEE7",
  greenBg: "#E9F6EE",
  greenBorder: "#C8E6D4",
  green: "#2E7D52",
  disclaimerBg: "#F2ECE5",
};

/* ------------------------------------------------------------------ */
/*  Policy meta — yahin update karo                                    */
/* ------------------------------------------------------------------ */
const POLICY_META = {
  lastUpdated: "12 July 2026",
  effective: "12 July 2026",
  privacyEmail: "privacy@welvors.com",
  supportEmail: "help@welvors.com",
};

/* ------------------------------------------------------------------ */
/*  Cookie categories table                                            */
/* ------------------------------------------------------------------ */
const COOKIE_TYPES: { category: string; does: string; optOut: string }[] = [
  {
    category: "Strictly necessary",
    does: "Keep you logged in, secure your session, prevent fraud, and remember essential state. Welvors won't work without these.",
    optOut: "No — these are required",
  },
  {
    category: "Preferences",
    does: "Remember settings like language, discovery filters, and notification choices.",
    optOut: "Yes",
  },
  {
    category: "Analytics",
    does: "Help us see which features are used and where the app breaks, always in aggregate.",
    optOut: "Yes",
  },
  {
    category: "Performance",
    does: "Measure load times and reliability so we can improve speed.",
    optOut: "Yes",
  },
];

/* ------------------------------------------------------------------ */
/*  Manage cookies bullets                                             */
/* ------------------------------------------------------------------ */
const MANAGE: React.ReactNode[] = [
  <>
    <strong style={{ color: C.pink }}>In Welvors:</strong> go to{" "}
    <strong>Settings › Privacy › Cookies &amp; Tracking</strong> to accept or
    decline non-essential categories.
  </>,
  <>
    <strong style={{ color: C.pink }}>In your browser:</strong> most browsers
    let you block or delete cookies in their settings.
  </>,
  <>
    <strong style={{ color: C.pink }}>On your device:</strong> you can reset or
    limit your advertising identifier in your phone&apos;s privacy settings.
  </>,
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
export default function CookiePolicyPage() {
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
              › <span>Legal</span> › <span>Cookie Policy</span>
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
              Tracking
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
            Cookie Policy
          </h1>

          <p className="mt-3 max-w-xl text-[14px]" style={{ color: C.body }}>
            How Welvors uses cookies and similar tools — and how you stay in
            control.
          </p>

          <p className="mt-3 text-[11.5px]" style={{ color: C.label }}>
            <strong style={{ color: C.body }}>Last updated:</strong>{" "}
            {POLICY_META.lastUpdated} ·{" "}
            <strong style={{ color: C.body }}>Effective:</strong>{" "}
            {POLICY_META.effective}
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
          This Cookie Policy explains how Welvors uses cookies and similar
          technologies on our app and website — what they are, which ones we
          use, and how you stay in control. It should be read alongside our{" "}
          <Link
            href="/privacy"
            className="underline hover:opacity-70"
            style={{ color: C.pink }}
          >
            Privacy Policy
          </Link>
          .
        </p>

        {/* 1 */}
        <div className="mt-10">
          <SectionHeading id="what-cookies-are">
            1. What cookies are
          </SectionHeading>
          <Para>
            Cookies are small text files stored on your device when you visit
            a site or use an app. Similar technologies include{" "}
            <strong style={{ color: C.pink }}>SDKs</strong>,{" "}
            <strong style={{ color: C.pink }}>local storage</strong>,{" "}
            <strong style={{ color: C.pink }}>pixels</strong>, and{" "}
            <strong style={{ color: C.pink }}>device identifiers</strong>.
            Together they help us keep you logged in, remember your choices,
            and understand how Welvors is used. In this policy, we refer to
            all of them as &ldquo;cookies&rdquo;.
          </Para>
        </div>

        {/* 2 */}
        <div className="mt-10">
          <SectionHeading id="types">
            2. Types of cookies we use
          </SectionHeading>

          <div className="mt-5 overflow-x-auto">
            <table
              className="w-full min-w-[560px] border-collapse text-left"
              style={{ color: C.body }}
            >
              <thead>
                <tr style={{ backgroundColor: C.tableHeadBg }}>
                  <th
                    className="w-[22%] border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                    style={{ borderColor: C.border, color: C.label }}
                  >
                    Category
                  </th>
                  <th
                    className="border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                    style={{ borderColor: C.border, color: C.label }}
                  >
                    What it does
                  </th>
                  <th
                    className="w-[22%] border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                    style={{ borderColor: C.border, color: C.label }}
                  >
                    Can you turn it off?
                  </th>
                </tr>
              </thead>
              <tbody>
                {COOKIE_TYPES.map((row) => (
                  <tr key={row.category}>
                    <td
                      className="border px-4 py-3 align-top text-[13px] font-bold"
                      style={{
                        borderColor: C.border,
                        color: C.headingDark,
                      }}
                    >
                      {row.category}
                    </td>
                    <td
                      className="border px-4 py-3 align-top text-[13px] leading-relaxed"
                      style={{ borderColor: C.border }}
                    >
                      {row.does}
                    </td>
                    <td
                      className="border px-4 py-3 align-top text-[13px]"
                      style={{ borderColor: C.border }}
                    >
                      {row.optOut}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Green: no advertising profiling */}
          <div
            className="mt-6 rounded-xl border p-5"
            style={{
              backgroundColor: C.greenBg,
              borderColor: C.greenBorder,
            }}
          >
            <p
              className="flex items-center gap-2 text-[13px] font-bold"
              style={{ color: C.green }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              No advertising profiling
            </p>
            <p
              className="mt-2 text-[12.5px] leading-relaxed"
              style={{ color: C.body }}
            >
              We do <strong>not</strong> use cookies to build advertising
              profiles about you or to sell your data to advertisers. We keep
              tracking to what&apos;s needed to run and improve Welvors.
            </p>
          </div>
        </div>

        {/* 3 */}
        <div className="mt-10">
          <SectionHeading id="third-party">
            3. Third-party cookies
          </SectionHeading>
          <Para>
            Some cookies are set by trusted partners who provide services on
            our behalf — for example, analytics and crash-reporting tools, or
            our payment provider during checkout. These partners are
            contractually required to protect your data and use it only for
            the services they provide to us.
          </Para>
        </div>

        {/* 4 */}
        <div className="mt-10">
          <SectionHeading id="manage">
            4. How to manage cookies
          </SectionHeading>
          <BulletList items={MANAGE} />
          <Para>
            Turning off non-essential cookies is fine — some conveniences,
            like remembered preferences, simply won&apos;t carry over.
          </Para>
        </div>

        {/* 5 */}
        <div className="mt-10">
          <SectionHeading id="consent">5. Your consent</SectionHeading>
          <Para>
            When you first use Welvors, we ask for your consent to
            non-essential cookies. Strictly necessary cookies are always on
            because the service can&apos;t function without them. You can
            change your choices at any time, and withdrawing consent
            won&apos;t affect processing that already happened.
          </Para>
        </div>

        {/* 6 */}
        <div className="mt-10">
          <SectionHeading id="changes">
            6. Changes to this policy
          </SectionHeading>
          <Para>
            We may update this Cookie Policy as our technology changes.
            We&apos;ll update the date above and, where required, ask for
            your consent again.
          </Para>
        </div>

        {/* 7 */}
        <div className="mt-10">
          <SectionHeading id="contact">7. Contact</SectionHeading>

          <div
            className="mt-5 rounded-xl border bg-white p-5"
            style={{ borderColor: C.border }}
          >
            <dl className="space-y-2 text-[13.5px]">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-bold" style={{ color: C.headingDark }}>
                  Privacy queries:
                </dt>
                <dd>
                  <MailLink email={POLICY_META.privacyEmail} />
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-bold" style={{ color: C.headingDark }}>
                  Support:
                </dt>
                <dd>
                  <MailLink email={POLICY_META.supportEmail} />
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
              This policy is a template provided in good faith and does not
              replace independent legal advice.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}