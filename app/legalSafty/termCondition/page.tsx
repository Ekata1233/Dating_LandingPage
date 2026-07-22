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
  noteBg: "#FFFFFF",
  disclaimerBg: "#F2ECE5",
};

/* ------------------------------------------------------------------ */
/*  Terms meta + contact — yahin update karo                           */
/* ------------------------------------------------------------------ */
const TERMS_META = {
  lastUpdated: "11 July 2026",
  effective: "11 July 2026",
  company: "Welvors Technologies Pvt. Ltd.",
  address: "Welvors Technologies Pvt. Ltd., Bengaluru, Karnataka, India",
  supportEmail: "help@welvors.com",
  legalEmail: "legal@welvors.com",
  jurisdiction: "Bengaluru, Karnataka",
};

/* ------------------------------------------------------------------ */
/*  "On this page" nav                                                 */
/* ------------------------------------------------------------------ */
const TOC = [
  { label: "Accepting these terms", id: "accepting" },
  { label: "Eligibility", id: "eligibility" },
  { label: "Your account", id: "your-account" },
  { label: "How you agree to behave", id: "behaviour" },
  { label: "Memberships & features", id: "memberships" },
  { label: "Payments & renewals", id: "payments" },
  { label: "Content you share", id: "content" },
  { label: "Our intellectual property", id: "ip" },
  { label: "Suspension & termination", id: "termination" },
  { label: "Disclaimers", id: "disclaimers" },
  { label: "Limitation of liability", id: "liability" },
  { label: "Governing law & disputes", id: "governing-law" },
  { label: "Changes to these terms", id: "changes" },
  { label: "Contact", id: "contact" },
];
const TOC_IDS = TOC.map((t) => t.id);

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */
const ELIGIBILITY: React.ReactNode[] = [
  <>
    You must be <strong style={{ color: C.pink }}>18 years or older</strong>.
  </>,
  <>
    You must be legally able to form a binding contract and not barred from
    using such services under applicable law.
  </>,
  <>You must never have been convicted of a serious violent or sexual offence.</>,
  <>One person may hold <strong>one account</strong> only.</>,
];

const BEHAVIOUR: React.ReactNode[] = [
  <>Impersonate anyone, create fake profiles, or misrepresent your age or identity.</>,
  <>Harass, threaten, abuse, or harm another member.</>,
  <>Post unlawful, hateful, sexually explicit, or violent content.</>,
  <>
    Solicit money, advertise, promote other services, or send spam.
  </>,
  <>
    Use Welvors for anything illegal — including sex work, fraud, or human
    trafficking.
  </>,
  <>
    Collect other members&apos; information, or use bots, scrapers, or automated
    access.
  </>,
  <>
    Attempt to reverse-engineer, hack, disrupt, or overload the service.
  </>,
];

const CONTENT_POINTS: React.ReactNode[] = [
  <>
    Photos and content you upload remain{" "}
    <strong style={{ color: C.pink }}>yours</strong>. We do not claim ownership.
  </>,
  <>
    Payments are processed by{" "}
    <strong style={{ color: C.pink }}>third-party payment providers</strong>; by
    paying, you also accept their terms.
  </>,
  <>
    If a subscription renews and you delete the content in your account, we may
    still hold limited records where the law requires it.
  </>,
  <>
    We may change pricing going forward; changes never affect a period
    you&apos;ve already paid for.
  </>,
];

const DISCLAIMER_POINTS: React.ReactNode[] = [
  <>
    Welvors is a platform to meet people.{" "}
    <strong style={{ color: C.pink }}>
      We do not conduct criminal background checks on members
    </strong>{" "}
    beyond the verification steps described in the app, and we cannot guarantee
    anyone&apos;s identity, intentions, or conduct.
  </>,
  <>
    We don&apos;t promise matches or outcomes, and we provide the service
    &ldquo;as is&rdquo;.
  </>,
  <>
    Always use your judgement and follow our{" "}
    <Link
      href="/safety"
      className="underline hover:opacity-70"
      style={{ color: C.pink }}
    >
      Safety &amp; Trust
    </Link>{" "}
    guidance when meeting someone in person.
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
export default function TermsPage() {
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
              › <span>Legal</span> › <span>Terms &amp; Conditions</span>
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
              Legal · Terms
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
            Terms &amp; Conditions
          </h1>

          <p className="mt-3 max-w-xl text-[14px]" style={{ color: C.body }}>
            The agreement between you and Welvors — your rights, your
            responsibilities, and ours.
          </p>

          <p className="mt-3 text-[11.5px]" style={{ color: C.label }}>
            <strong style={{ color: C.body }}>Last updated:</strong>{" "}
            {TERMS_META.lastUpdated} ·{" "}
            <strong style={{ color: C.body }}>Effective:</strong>{" "}
            {TERMS_META.effective}
          </p>
        </div>
      </div>

      {/* ==================== Body + TOC ==================== */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-14"> */}
        <div className="flex justify-center">
          {/* -------------------- Main content -------------------- */}
          <div className="max-w-7xl">
            {/* Intro */}
            <p
              className="text-[13.5px] leading-relaxed"
              style={{ color: C.body }}
            >
              These Terms &amp; Conditions are the agreement between you and
              Welvors. By creating an account, joining the waitlist, or using the
              app in any way, you agree to them. Please read them carefully —
              they set out your rights, your responsibilities, and ours.
            </p>

            {/* 1 */}
            <div className="mt-10">
              <SectionHeading id="accepting">
                1. Accepting these terms
              </SectionHeading>
              <Para>
                By accessing or using Welvors, you confirm you have read,
                understood, and agree to be bound by these Terms and our{" "}
                <Link
                  href="/privacy"
                  className="underline hover:opacity-70"
                  style={{ color: C.pink }}
                >
                  Privacy Policy
                </Link>
                ,{" "}
                <Link
                  href="/guidelines"
                  className="underline hover:opacity-70"
                  style={{ color: C.pink }}
                >
                  Community Guidelines
                </Link>
                , and the other policies referenced here. If you don&apos;t agree,
                please don&apos;t use Welvors.
              </Para>
            </div>

            {/* 2 */}
            <div className="mt-10">
              <SectionHeading id="eligibility">2. Eligibility</SectionHeading>
              <BulletList items={ELIGIBILITY} />
            </div>

            {/* 3 */}
            <div className="mt-10">
              <SectionHeading id="your-account">3. Your account</SectionHeading>
              <Para>
                You register with your mobile number and verify it with a
                one-time code. You are responsible for all activity on your
                account, so take care to keep your number and device secure.
                Tell us immediately if you suspect unauthorised use. Everything
                you add to your profile must be truthful, current, and yours.
              </Para>
            </div>

            {/* 4 */}
            <div className="mt-10">
              <SectionHeading id="behaviour">
                4. How you agree to behave
              </SectionHeading>
              <Para>When using Welvors, you agree that you will not:</Para>
              <BulletList items={BEHAVIOUR} />
              <Para>
                Full behavioural rules are in our{" "}
                <Link
                  href="/guidelines"
                  className="underline hover:opacity-70"
                  style={{ color: C.pink }}
                >
                  Community Guidelines
                </Link>
                , which form part of these Terms.
              </Para>
            </div>

            {/* 5 */}
            <div className="mt-10">
              <SectionHeading id="memberships">
                5. Memberships &amp; features
              </SectionHeading>
              <Para>
                Welvors offers different membership tiers — currently{" "}
                <strong style={{ color: C.pink }}>Free</strong>,{" "}
                <strong style={{ color: C.pink }}>Premium</strong>,{" "}
                <strong style={{ color: C.pink }}>VIP</strong>, and{" "}
                <strong style={{ color: C.pink }}>VIP Elite</strong>. Each plan
                has its own set of features, which are described in the app.
                Features may vary by tier and may be improved, changed, or
                retired over time to keep the service safe and useful.
              </Para>

              {/* Waitlist & launch offers card */}
              <div
                className="mt-6 rounded-xl border p-5"
                style={{ backgroundColor: C.noteBg, borderColor: C.border }}
              >
                <p
                  className="text-[13px] font-bold"
                  style={{ color: C.headingDark }}
                >
                  Waitlist &amp; launch offers
                </p>
                <p
                  className="mt-2 text-[12.5px] leading-relaxed"
                  style={{ color: C.body }}
                >
                  If you join the waitlist or a launch offer, the perks and
                  prices shown at purchase apply to you as described in the
                  offer. Refund terms for these are set out in our{" "}
                  <Link
                    href="/refund"
                    className="underline hover:opacity-70"
                    style={{ color: C.pink }}
                  >
                    Refund &amp; Cancellation Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* 6 */}
            <div className="mt-10">
              <SectionHeading id="payments">
                6. Payments &amp; renewals
              </SectionHeading>
              <BulletList items={CONTENT_POINTS} />
            </div>

            {/* 7 */}
            <div className="mt-10">
              <SectionHeading id="content">7. Content you share</SectionHeading>
              <Para>
                You keep ownership of the photos and content you post. By posting,
                you grant Welvors a limited, worldwide, royalty-free licence to
                host, display, and distribute that content{" "}
                <strong style={{ color: C.pink }}>
                  solely to operate the service
                </strong>{" "}
                (for example, showing your profile to matches). This licence ends
                when you delete the content or your account, except for copies
                retained for legal or safety reasons or in normal backups. You are
                responsible for having the right to post what you share.
              </Para>
            </div>

            {/* 8 */}
            <div className="mt-10">
              <SectionHeading id="ip">
                8. Our intellectual property
              </SectionHeading>
              <Para>
                The Welvors name, logo, app, design, and software are owned by
                Welvors and protected by law. We grant you a personal,
                non-transferable, revocable licence to use the app for its
                intended purpose. You may not copy, modify, or reproduce any part
                of it without our permission.
              </Para>
            </div>

            {/* 9 */}
            <div className="mt-10">
              <SectionHeading id="termination">
                9. Suspension &amp; termination
              </SectionHeading>
              <Para>
                You may stop using Welvors and delete your account at any time.
                We may suspend, limit, or terminate your account if you break
                these Terms, put others at risk, or if required by law. Where
                safe and lawful, we&apos;ll tell you why. Some obligations — like
                conduct, disclaimers, and dispute terms — survive termination.
              </Para>
            </div>

            {/* 10 */}
            <div className="mt-10">
              <SectionHeading id="disclaimers">10. Disclaimers</SectionHeading>
              <BulletList items={DISCLAIMER_POINTS} />
            </div>

            {/* 11 */}
            <div className="mt-10">
              <SectionHeading id="liability">
                11. Limitation of liability
              </SectionHeading>
              <Para>
                To the maximum extent permitted by law, Welvors is not liable for
                indirect or consequential losses, or for the conduct of any
                member online or offline. Where liability cannot be excluded, it
                is limited to the amount you paid us in the{" "}
                <strong style={{ color: C.pink }}>12 months</strong> before the
                claim. Nothing here limits rights that cannot be limited by law.
              </Para>
            </div>

            {/* 12 */}
            <div className="mt-10">
              <SectionHeading id="governing-law">
                12. Governing law &amp; disputes
              </SectionHeading>
              <Para>
                These Terms are governed by the laws of India. Subject to
                applicable law, the courts at{" "}
                <strong style={{ color: C.pink }}>
                  {TERMS_META.jurisdiction}
                </strong>{" "}
                have exclusive jurisdiction. We encourage you to contact us
                first — most issues can be resolved quickly and without formal
                proceedings.
              </Para>
            </div>

            {/* 13 */}
            <div className="mt-10">
              <SectionHeading id="changes">
                13. Changes to these terms
              </SectionHeading>
              <Para>
                We may update these Terms from time to time. We&apos;ll update
                the date above and notify you of material changes. If you keep
                using Welvors after changes take effect, you accept the updated
                Terms.
              </Para>
            </div>

            {/* 14 */}
            <div className="mt-10">
              <SectionHeading id="contact">14. Contact</SectionHeading>

              <div
                className="mt-5 rounded-xl border bg-white p-5"
                style={{ borderColor: C.border }}
              >
                <dl className="space-y-2 text-[13.5px]">
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-bold" style={{ color: C.headingDark }}>
                      Support:
                    </dt>
                    <dd>
                      <MailLink email={TERMS_META.supportEmail} />
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-bold" style={{ color: C.headingDark }}>
                      Legal:
                    </dt>
                    <dd>
                      <MailLink email={TERMS_META.legalEmail} />
                    </dd>
                  </div>
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="font-bold" style={{ color: C.headingDark }}>
                      Address:
                    </dt>
                    <dd style={{ color: C.body }}>{TERMS_META.address}</dd>
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
                  These terms are a template provided in good faith and do not
                  constitute legal advice. Please have them reviewed by qualified
                  counsel before launch.
                </p>
              </div>
            </div>
          </div>

          {/* -------------------- On this page (TOC) -------------------- */}
          {/* <aside className="order-first lg:order-none">
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
          </aside> */}
        </div>
      </div>
    </main>
  );
}