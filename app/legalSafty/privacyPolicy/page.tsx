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
  noteBg: "#FCEDF2",
  noteBorder: "#F5D9E3",
  disclaimerBg: "#F2ECE5",
};

/* ------------------------------------------------------------------ */
/*  Policy meta + contact — yahin update karo                          */
/*  NOTE: Grievance Officer ka naam & contact real hona chahiye         */
/*  (IT Rules 2021 + DPDP). Ye legal advice nahi hai.                   */
/* ------------------------------------------------------------------ */
const POLICY_META = {
  lastUpdated: "11 July 2026",
  effective: "11 July 2026",
  company: "Welvors Technologies Pvt. Ltd.",
  address: "Welvors Technologies Pvt. Ltd., Bengaluru, Karnataka, India",
  officer: "Ms. Aarohi Menon",
  privacyEmail: "privacy@welvors.com",
  supportEmail: "help@welvors.com",
};

/* ------------------------------------------------------------------ */
/*  Content data                                                       */
/* ------------------------------------------------------------------ */
const COLLECT_GIVEN: [string, string][] = [
  [
    "Account & identity",
    "mobile number, name, date of birth (to confirm you are 18+), gender and the gender(s) you're interested in.",
  ],
  [
    "Profile",
    "photos, bio, prompts, interests, height, location city, and any other details you choose to add.",
  ],
  [
    "Verification",
    "the real-time media you submit and — where required — a selfie or a live-video stream to confirm you are a real person.",
  ],
  [
    "Payments",
    "plan chosen and transaction records. Card and UPI details are handled by our payment partners; we do not store full card numbers.",
  ],
  [
    "Support & reports",
    "messages you send us, and content or conduct you submit when you report someone.",
  ],
];

const COLLECT_USAGE: [string, string][] = [
  ["Activity", "likes, passes, matches, and the messages you exchange with matches."],
  ["Preferences", "filters, discovery settings, and notification choices."],
];

const COLLECT_AUTO: [string, string][] = [
  [
    "Device & technical",
    "device model, operating system, app version, IP address, and crash diagnostics.",
  ],
  [
    "Approximate location",
    "derived from your device or IP, used to show nearby people — only with your permission.",
  ],
  ["Cookies & identifiers", "as described in our Cookie Policy."],
];

const USE_TABLE: [string, string][] = [
  [
    "Run the service",
    "create your account, build your profile, show you compatible people, deliver matches and messages.",
  ],
  [
    "Verify & protect",
    "confirm you are real and 18+, detect fake profiles, spam, fraud and abuse.",
  ],
  [
    "Safety & moderation",
    "review reports, enforce our Community Guidelines, and investigate safety incidents.",
  ],
  [
    "Payments",
    "process memberships, process payments, prevent fraud, and issue receipts.",
  ],
  [
    "Improve Welvors",
    "understand which features help, find bugs, and improve matching — using aggregated insights.",
  ],
  [
    "Communicate",
    "send you service messages, security alerts, and — only if you opt in — updates and offers.",
  ],
];

const SHARE_LIST: [string, string][] = [
  [
    "With other members",
    "your profile is visible to verified members within your own membership pool. Please enable your own control over what you share.",
  ],
  [
    "With service providers (Data Processors)",
    "cloud hosting, payment gateways, KYC/OTP delivery, analytics and moderation tools — bound by contract to protect your data and act only for us.",
  ],
  [
    "For safety & law",
    "when required by valid legal process, or to protect the rights, safety and security of members and the public.",
  ],
  [
    "Business transfers",
    "if Welvors is involved in a merger or acquisition, data may transfer under the same conditions, and we will notify you.",
  ],
];

const RIGHTS: [string, string][] = [
  ["Access", "the personal data we hold about you."],
  ["Correct", "anything inaccurate or incomplete."],
  ["Download", "a copy of your data (portability)."],
  ["Delete", "your account and data (see retention below)."],
  ["Withdraw consent", "for optional processing, such as marketing or location."],
  [
    "Nominate",
    "another individual to exercise your rights in case of death or incapacity, as provided under the DPDP Act.",
  ],
  ["Complain", "to us or to our Grievance Officer, and to the Data Protection Board of India."],
];

const PROTECT_LIST = [
  "Encryption of data in transit and at rest.",
  "Strict access controls — only staff who need data to do their job can reach it.",
  "Continuous monitoring for suspicious activity and logged security reviews.",
  "A defined process to notify you and the authorities in the unlikely event of a personal data breach.",
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

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mt-5 text-[13px] font-bold"
      style={{ color: C.headingDark }}
    >
      {children}
    </p>
  );
}

/** Bullet list jisme har item "Label — text" format me hai */
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
            <strong style={{ color: C.headingDark }}>{term}:</strong> {desc}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PlainList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2.5">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2.5">
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

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-[13.5px] leading-relaxed" style={{ color: C.body }}>
      {children}
    </p>
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
export default function PrivacyPolicyPage() {
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
              › <span>Legal</span> › <span>Privacy Policy</span>
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
              Legal · Privacy
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
            Privacy Policy
          </h1>

          <p className="mt-3 text-[14px]" style={{ color: C.body }}>
            What we collect, why, and the control you have over your personal
            data.
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
          At Welvors, your trust is the entire product. This Privacy Policy
          explains what personal information we collect, why we collect it,
          how we protect it, and the rights you have over it. We&apos;ve
          tried to keep it plain — if anything is unclear, write to{" "}
          <MailLink email={POLICY_META.privacyEmail} /> and we&apos;ll
          explain it.
        </p>

        {/* 1. Who we are */}
        <div className="mt-10">
          <SectionHeading id="who-we-are">1. Who we are</SectionHeading>
          <Para>
            Welvors is operated by {POLICY_META.company}, a company
            registered in India. For the purposes of India&apos;s Digital
            Personal Data Protection Act, 2023 (DPDP Act) and other
            applicable law, we are the <strong>Data Fiduciary</strong>{" "}
            responsible for your data. If you are in a region with other
            data laws, we honour the protections that apply to you.
          </Para>
        </div>

        {/* 2. Information we collect */}
        <div className="mt-10">
          <SectionHeading id="information-we-collect">
            2. Information we collect
          </SectionHeading>

          <SubHeading>Information you give us</SubHeading>
          <DefList items={COLLECT_GIVEN} />

          <SubHeading>Information created when you use Welvors</SubHeading>
          <DefList items={COLLECT_USAGE} />

          <SubHeading>Information collected automatically</SubHeading>
          <DefList items={COLLECT_AUTO} />
        </div>

        {/* 3. How we use your information */}
        <div className="mt-10">
          <SectionHeading id="how-we-use">
            3. How we use your information
          </SectionHeading>

          <div className="mt-5 overflow-x-auto">
            <table
              className="w-full min-w-[520px] border-collapse text-left"
              style={{ color: C.body }}
            >
              <thead>
                <tr style={{ backgroundColor: C.tableHeadBg }}>
                  <th
                    className="w-[28%] border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                    style={{ borderColor: C.border, color: C.label }}
                  >
                    Purpose
                  </th>
                  <th
                    className="border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                    style={{ borderColor: C.border, color: C.label }}
                  >
                    Examples
                  </th>
                </tr>
              </thead>
              <tbody>
                {USE_TABLE.map(([p, e]) => (
                  <tr key={p}>
                    <td
                      className="border px-4 py-3 align-top text-[13px] font-bold"
                      style={{
                        borderColor: C.border,
                        color: C.headingDark,
                      }}
                    >
                      {p}
                    </td>
                    <td
                      className="border px-4 py-3 align-top text-[13px] leading-relaxed"
                      style={{ borderColor: C.border }}
                    >
                      {e}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Our legal bases */}
        <div className="mt-10">
          <SectionHeading id="legal-bases">4. Our legal bases</SectionHeading>
          <Para>
            We process your data on the basis of your{" "}
            <strong style={{ color: C.pink }}>consent</strong> (which you can
            withdraw), the{" "}
            <strong style={{ color: C.pink }}>
              performance of our contract
            </strong>{" "}
            with you (to provide the service you signed up for), our{" "}
            <strong style={{ color: C.pink }}>legitimate interests</strong>{" "}
            in keeping Welvors safe and improving it, and{" "}
            <strong style={{ color: C.pink }}>legal obligations</strong> we
            must meet. Where consent is the basis, you may withdraw it at any
            time without affecting past processing.
          </Para>
        </div>

        {/* 5. When we share information */}
        <div className="mt-10">
          <SectionHeading id="when-we-share">
            5. When we share information
          </SectionHeading>
          <Para>We share your data only when necessary, and never sell it. Specifically:</Para>
          <DefList items={SHARE_LIST} />

          {/* Never-do card */}
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
              ♡ What we will never do
            </p>
            <p
              className="mt-2 text-[12.5px] leading-relaxed"
              style={{ color: C.body }}
            >
              We do not sell your personal data. We do not pass on messages
              as ours. We do not hand your private photos to advertisers. We
              do not show you to people outside your membership pool.
            </p>
          </div>
        </div>

        {/* 6. Your rights & choices */}
        <div className="mt-10">
          <SectionHeading id="your-rights">
            6. Your rights &amp; choices
          </SectionHeading>
          <Para>
            You are in control. From <strong>Settings → Privacy</strong>, or
            by contacting us, you can:
          </Para>
          <DefList items={RIGHTS} />
        </div>

        {/* 7. How long we keep your data */}
        <div className="mt-10">
          <SectionHeading id="data-retention">
            7. How long we keep your data
          </SectionHeading>
          <Para>
            We keep your data while your account is active. When you delete
            your account, your profile is removed from discovery{" "}
            <strong>immediately</strong>, and your personal data is erased
            within <strong>30 days</strong> — except limited records we must
            retain for legal, security, or fraud-prevention reasons, or to
            prevent someone we have removed from returning. Records are kept
            only as long as required.
          </Para>
        </div>

        {/* 8. How we protect your data */}
        <div className="mt-10">
          <SectionHeading id="how-we-protect">
            8. How we protect your data
          </SectionHeading>
          <PlainList items={PROTECT_LIST} />
        </div>

        {/* 9. Age restriction */}
        <div className="mt-10">
          <SectionHeading id="age-restriction">
            9. Age restriction
          </SectionHeading>
          <Para>
            Welvors is strictly for adults{" "}
            <strong style={{ color: C.pink }}>18 and older</strong>. We do
            not knowingly collect data from minors. If we learn an account
            belongs to someone under 18, we remove it immediately.
          </Para>
        </div>

        {/* 10. International transfers */}
        <div className="mt-10">
          <SectionHeading id="international-transfers">
            10. International transfers
          </SectionHeading>
          <Para>
            Your data is primarily stored and processed in India. If any
            processing occurs elsewhere, we ensure comparable safeguards and
            comply with applicable transfer rules.
          </Para>
        </div>

        {/* 11. Changes to this policy */}
        <div className="mt-10">
          <SectionHeading id="changes">
            11. Changes to this policy
          </SectionHeading>
          <Para>
            We may update this policy as Welvors evolves or the law changes.
            We&apos;ll revise the &ldquo;Last updated&rdquo; date and, for
            material changes, notify you in-app or by message. Continuing to
            use Welvors after an update means you accept the current version.
          </Para>
        </div>

        {/* 12. Contact us */}
        <div className="mt-10">
          <SectionHeading id="contact">12. Contact us</SectionHeading>

          <div
            className="mt-5 rounded-xl border bg-white p-5"
            style={{ borderColor: C.border }}
          >
            <dl className="space-y-2 text-[13.5px]">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-bold" style={{ color: C.headingDark }}>
                  Data Protection / Grievance Officer:
                </dt>
                <dd style={{ color: C.body }}>{POLICY_META.officer}</dd>
              </div>
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
                  General support:
                </dt>
                <dd>
                  <MailLink email={POLICY_META.supportEmail} />
                </dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-bold" style={{ color: C.headingDark }}>
                  Address:
                </dt>
                <dd style={{ color: C.body }}>{POLICY_META.address}</dd>
              </div>
            </dl>
          </div>

          {/* Disclaimer strip */}
          <div
            className="mt-6 rounded-xl p-5"
            style={{ backgroundColor: C.disclaimerBg }}
          >
            <p
              className="text-[12.5px] leading-relaxed"
              style={{ color: C.label }}
            >
              This policy is provided in good faith and reviewed
              periodically. It is a template and does not replace independent
              legal advice for your specific circumstances.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}