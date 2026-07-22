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
  disclaimerBg: "#F2ECE5",
};

/* ------------------------------------------------------------------ */
/*  Policy numbers — ye tere actual payment flow se match hone chahiye */
/*  (Razorpay onboarding me yahi URL submit hota hai)                  */
/* ------------------------------------------------------------------ */
const POLICY = {
  lastUpdated: "12 July 2026",
  effective: "12 July 2026",
  refundWindowDays: "7 days",
  acknowledgeWithin: "48 hours",
  processingTime: "5–7 business days",
  billingEmail: "billing@welvors.com",
  supportEmail: "help@welvors.com",
  grievanceOfficer: "Ms. Aarohi Menon",
  grievanceEmail: "grievance@welvors.com",
};

/* ------------------------------------------------------------------ */
/*  "On this page" nav                                                 */
/* ------------------------------------------------------------------ */
const TOC = [
  { label: "1. Paid plans", id: "paid-plans" },
  { label: "2. Cancelling your membership", id: "cancelling" },
  { label: "3. When you're entitled to a refund", id: "entitled" },
  { label: "4. When refunds don't apply", id: "not-apply" },
  { label: "5. How to request a refund", id: "how-to-request" },
  { label: "6. How refunds are processed", id: "processed" },
  { label: "7. App-store purchases", id: "app-store" },
  { label: "8. Changes to this policy", id: "changes" },
  { label: "9. Contact", id: "contact" },
];
const TOC_IDS = TOC.map((t) => t.id);

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */
const CANCELLING: React.ReactNode[] = [
  <>
    Cancel anytime from <strong>Settings › Membership › Cancel plan</strong>.
  </>,
  <>
    You&apos;ll keep your paid features until the{" "}
    <strong style={{ color: C.pink }}>end of the period you&apos;ve already paid for</strong>.
  </>,
  <>
    If auto-renewal is on, cancelling before the renewal date stops the next
    charge.
  </>,
  <>
    Cancelling stops future billing. It does not, by itself, trigger a refund for
    the current period.
  </>,
];

const REFUND_TABLE: [string, string][] = [
  [
    "Waitlist / launch offer, before service launches to you",
    "Full refund if requested within {WINDOW} of payment and before you've been given access.",
  ],
  ["Duplicate or accidental charge", "Full refund of the extra charge."],
  ["Charged after you cancelled", "Full refund of the erroneous charge."],
  [
    "Technical fault that stopped you using what you paid for",
    "Refund or free extension once verified.",
  ],
  [
    "Active membership, features already available",
    "Generally non-refundable for the current period.",
  ],
];

const NOT_APPLY: React.ReactNode[] = [
  <>Change of mind after you&apos;ve started using a paid feature for the current period.</>,
  <>Account suspended or banned for breaking our Terms or Community Guidelines.</>,
  <>
    Partial periods — we don&apos;t pro-rate unused days of an active period
    unless the law requires it.
  </>,
  <>
    Dissatisfaction with matches or outcomes — Welvors provides the platform, not
    guaranteed results.
  </>,
];

const PROCESSED: React.ReactNode[] = [
  <>Approved refunds go back to your original payment method.</>,
  <>
    Refunds are typically completed within{" "}
    <strong style={{ color: C.pink }}>{POLICY.processingTime}</strong> after
    approval, though your bank may take longer to reflect them.
  </>,
  <>
    If your card or UPI details changed, we may need extra details to complete
    the refund.
  </>,
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
export default function RefundPolicyPage() {
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
              › <span>Legal</span> › <span>Refund &amp; Cancellation</span>
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
              Billing
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
            Refund &amp; Cancellation
          </h1>

          <p className="mt-3 max-w-xl text-[14px]" style={{ color: C.body }}>
            How memberships are billed, how to cancel, and when you get a refund.
          </p>

          <p className="mt-3 text-[11.5px]" style={{ color: C.label }}>
            <strong style={{ color: C.body }}>Last updated:</strong>{" "}
            {POLICY.lastUpdated} ·{" "}
            <strong style={{ color: C.body }}>Effective:</strong>{" "}
            {POLICY.effective}
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
              Clear, fair, and no fine-print traps. This Refund &amp;
              Cancellation Policy explains how memberships are billed, how to
              cancel, and when you&apos;re entitled to a refund. It applies to
              all paid plans and waitlist offers on Welvors.
            </p>

            {/* 1 */}
            <div className="mt-10">
              <SectionHeading id="paid-plans">1. Paid plans</SectionHeading>
              <Para>
                Welvors offers{" "}
                <strong style={{ color: C.pink }}>Premium</strong>,{" "}
                <strong style={{ color: C.pink }}>VIP</strong>, and{" "}
                <strong style={{ color: C.pink }}>VIP Elite</strong> memberships
                in addition to the Free plan. Each paid plan unlocks a specific
                set of features shown at checkout. Prices are in Indian Rupees
                and include applicable taxes unless stated otherwise.
              </Para>
            </div>

            {/* 2 */}
            <div className="mt-10">
              <SectionHeading id="cancelling">
                2. Cancelling your membership
              </SectionHeading>
              <BulletList items={CANCELLING} />
            </div>

            {/* 3 */}
            <div className="mt-10">
              <SectionHeading id="entitled">
                3. When you&apos;re entitled to a refund
              </SectionHeading>

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
                        Situation
                      </th>
                      <th
                        className="border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                        style={{ borderColor: C.border, color: C.label }}
                      >
                        Refund
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {REFUND_TABLE.map(([situation, refund]) => (
                      <tr key={situation}>
                        <td
                          className="border px-4 py-3 align-top text-[13px] font-bold"
                          style={{
                            borderColor: C.border,
                            color: C.headingDark,
                          }}
                        >
                          {situation}
                        </td>
                        <td
                          className="border px-4 py-3 align-top text-[13px] leading-relaxed"
                          style={{ borderColor: C.border }}
                        >
                          {refund.replace("{WINDOW}", POLICY.refundWindowDays)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4 */}
            <div className="mt-10">
              <SectionHeading id="not-apply">
                4. When refunds don&apos;t apply
              </SectionHeading>
              <BulletList items={NOT_APPLY} />
            </div>

            {/* 5 */}
            <div className="mt-10">
              <SectionHeading id="how-to-request">
                5. How to request a refund
              </SectionHeading>
              <Para>
                Email <MailLink email={POLICY.billingEmail} /> from your
                registered contact, or use{" "}
                <strong>Settings › Membership › Help with a charge</strong>.
                Include your registered mobile number, the plan, and the
                transaction date or reference. We&apos;ll acknowledge within{" "}
                <strong style={{ color: C.pink }}>
                  {POLICY.acknowledgeWithin}
                </strong>
                .
              </Para>
            </div>

            {/* 6 */}
            <div className="mt-10">
              <SectionHeading id="processed">
                6. How refunds are processed
              </SectionHeading>
              <BulletList items={PROCESSED} />
            </div>

            {/* 7 */}
            <div className="mt-10">
              <SectionHeading id="app-store">
                7. App-store purchases
              </SectionHeading>
              <Para>
                If you subscribed through the Apple App Store or Google Play,
                their refund and cancellation rules also apply, and some claims
                may need to be requested directly through them. We&apos;ll help
                you where we can.
              </Para>
            </div>

            {/* 8 */}
            <div className="mt-10">
              <SectionHeading id="changes">
                8. Changes to this policy
              </SectionHeading>
              <Para>
                We may update this policy; changes never affect a period
                you&apos;ve already paid for. The &ldquo;Last updated&rdquo; date
                reflects the current version.
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
                      Billing &amp; refunds:
                    </dt>
                    <dd>
                      <MailLink email={POLICY.billingEmail} />
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-bold" style={{ color: C.headingDark }}>
                      Support:
                    </dt>
                    <dd>
                      <MailLink email={POLICY.supportEmail} />
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-bold" style={{ color: C.headingDark }}>
                      Grievance Officer:
                    </dt>
                    <dd style={{ color: C.body }}>
                      {POLICY.grievanceOfficer} ·{" "}
                      <MailLink email={POLICY.grievanceEmail} />
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
                  constitute legal advice. Please align it with your payment
                  gateway and app-store agreements before launch.
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