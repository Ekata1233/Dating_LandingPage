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
  inputBorder: "#E4DBD3",
  ctaFrom: "#C93B68",
  ctaTo: "#B31E52",
};

/* API endpoint — ye route banana padega (app/api/partner-applications/route.ts) */
const SUBMIT_ENDPOINT = "/api/partner-applications";



/* ------------------------------------------------------------------ */
/*  "On this page" nav                                                 */
/* ------------------------------------------------------------------ */
const TOC = [
  { label: "Who we partner with", id: "who-we-partner-with" },
  { label: "Why partner with us", id: "why-partner" },
  { label: "How it works", id: "how-it-works" },
  { label: "What we look for", id: "what-we-look-for" },
  { label: "Apply to partner", id: "apply" },
];
const TOC_IDS = TOC.map((t) => t.id);

/* ------------------------------------------------------------------ */
/*  Content                                                            */
/* ------------------------------------------------------------------ */
const WHO: React.ReactNode[] = [
  <>
    <strong style={{ color: C.pink }}>Venue partners</strong> — cafés,
    restaurants, and lounges that can host small, safe gatherings.
  </>,
  <>
    <strong style={{ color: C.pink }}>Event hosts</strong> — experienced hosts
    who can run warm, well-organised singles events.
  </>,
  <>
    <strong style={{ color: C.pink }}>City partners</strong> — local teams who
    own events end-to-end in their city.
  </>,
];

const WHY: React.ReactNode[] = [
  <>
    <strong style={{ color: C.pink }}>A community that shows up</strong> —
    verified, intent-driven members, not walk-ins.
  </>,
  <>
    <strong style={{ color: C.pink }}>Safety handled</strong> — verified guests,
    clear guidelines, and support on the ground.
  </>,
  <>
    <strong style={{ color: C.pink }}>Shared growth</strong> — transparent
    revenue share and repeat events as your city grows.
  </>,
  <>
    <strong style={{ color: C.pink }}>Brand backing</strong> — marketing,
    booking, and check-in all run through Welvors.
  </>,
];

const HOW: React.ReactNode[] = [
  <>
    <strong style={{ color: C.pink }}>1. Apply</strong> — tell us about you and
    your city using the form below.
  </>,
  <>
    <strong style={{ color: C.pink }}>2. Chat</strong> — a quick call to align
    on format, capacity, and safety.
  </>,
  <>
    <strong style={{ color: C.pink }}>3. Onboard</strong> — we set you up with
    the tools, guidelines, and a first event.
  </>,
  <>
    <strong style={{ color: C.pink }}>4. Host &amp; grow</strong> — run events,
    get paid, and scale with demand.
  </>,
];

const LOOK_FOR = [
  "A safe, welcoming space or a track record of running good events.",
  "Reliability — our members trust us, and we extend that trust to you.",
  "A genuine care for creating real connections, not just filling seats.",
];

const PARTNER_TYPES = [
  "Venue partner",
  "Event host",
  "City partner",
  "Something else",
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-[12px] font-bold"
        style={{ color: C.headingDark }}
      >
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border bg-white px-3 py-2.5 text-[13.5px] outline-none transition-colors focus:border-[#C21559]";

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function PartnerPage() {
  const active = useActiveSection(TOC_IDS);

  const [form, setForm] = useState({
    name: "",
    business: "",
    email: "",
    phone: "",
    city: "",
    partnerType: PARTNER_TYPES[0],
    about: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    // basic validation
    if (!form.name.trim() || !form.email.trim() || !form.city.trim()) {
      setStatus("error");
      setErrorMsg("Please fill in your name, email, and city.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch(SUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again or email us.");
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
              › <span>Company</span> › <span>Become a partner</span>
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
              Partnerships
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
            Partner with Welvors.
          </h1>

          <p
            className="mt-4 max-w-xl text-[14.5px] leading-relaxed"
            style={{ color: C.body }}
          >
            Host safe, curated singles events in your city — or bring your venue
            to a community that shows up. Let&apos;s build real-life connection
            together.
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
              Welvors runs verified, safety-first offline events — coffee meets,
              dinners, and curated gatherings for singles who want something
              real. We partner with venues, event hosts, and city partners to
              make those experiences happen. If that&apos;s you, we&apos;d love
              to hear from you.
            </p>

            {/* ---- Who we partner with ---- */}
            <div className="mt-12">
              <SectionHeading id="who-we-partner-with">
                Who we partner with
              </SectionHeading>
              <BulletList items={WHO} />
            </div>

            {/* ---- Why partner with us ---- */}
            <div className="mt-12">
              <SectionHeading id="why-partner">
                Why partner with us
              </SectionHeading>
              <BulletList items={WHY} />
            </div>

            {/* ---- How it works ---- */}
            <div className="mt-12">
              <SectionHeading id="how-it-works">How it works</SectionHeading>
              <BulletList items={HOW} />
            </div>

            {/* ---- What we look for ---- */}
            <div className="mt-12">
              <SectionHeading id="what-we-look-for">
                What we look for
              </SectionHeading>
              <BulletList items={LOOK_FOR} />
            </div>

            {/* ---- Apply form ---- */}
            <div className="mt-12">
              <SectionHeading id="apply">Apply to partner</SectionHeading>

              <div
                className="mt-5 rounded-2xl border bg-white p-5 shadow-[0_4px_20px_rgba(43,42,40,0.04)] sm:p-6"
                style={{ borderColor: C.border }}
              >
                {status === "success" ? (
                  <div className="py-8 text-center">
                    <p
                      className="text-[16px] font-bold"
                      style={{ color: C.pink }}
                    >
                      Application received.
                    </p>
                    <p
                      className="mt-2 text-[13.5px]"
                      style={{ color: C.body }}
                    >
                      Thanks for reaching out — we&apos;ll get back to you
                      shortly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Your name">
                        <input
                          type="text"
                          placeholder="Full name"
                          value={form.name}
                          onChange={update("name")}
                          className={inputClass}
                          style={{
                            borderColor: C.inputBorder,
                            color: C.headingDark,
                          }}
                        />
                      </Field>
                      <Field label="Business / brand name">
                        <input
                          type="text"
                          placeholder="Optional"
                          value={form.business}
                          onChange={update("business")}
                          className={inputClass}
                          style={{
                            borderColor: C.inputBorder,
                            color: C.headingDark,
                          }}
                        />
                      </Field>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Email">
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={form.email}
                          onChange={update("email")}
                          className={inputClass}
                          style={{
                            borderColor: C.inputBorder,
                            color: C.headingDark,
                          }}
                        />
                      </Field>
                      <Field label="Phone">
                        <input
                          type="tel"
                          placeholder="+91"
                          value={form.phone}
                          onChange={update("phone")}
                          className={inputClass}
                          style={{
                            borderColor: C.inputBorder,
                            color: C.headingDark,
                          }}
                        />
                      </Field>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="City">
                        <input
                          type="text"
                          placeholder="e.g. Pune"
                          value={form.city}
                          onChange={update("city")}
                          className={inputClass}
                          style={{
                            borderColor: C.inputBorder,
                            color: C.headingDark,
                          }}
                        />
                      </Field>
                      <Field label="Partner type">
                        <select
                          value={form.partnerType}
                          onChange={update("partnerType")}
                          className={inputClass}
                          style={{
                            borderColor: C.inputBorder,
                            color: C.headingDark,
                          }}
                        >
                          {PARTNER_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    {/* Textarea */}
                    <Field label="Tell us about you">
                      <textarea
                        rows={4}
                        placeholder="Your venue or experience, capacity, and why you'd be a great Welvors partner."
                        value={form.about}
                        onChange={update("about")}
                        className={`${inputClass} resize-y`}
                        style={{
                          borderColor: C.inputBorder,
                          color: C.headingDark,
                        }}
                      />
                    </Field>

                    {/* Error */}
                    {status === "error" && errorMsg && (
                      <p className="text-[12.5px]" style={{ color: C.pink }}>
                        {errorMsg}
                      </p>
                    )}

                    {/* Submit */}
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={status === "sending"}
                      className="w-full rounded-md px-6 py-3 text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                      style={{
                        background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})`,
                      }}
                    >
                      {status === "sending"
                        ? "Sending…"
                        : "Submit application"}
                    </button>

                    {/* Consent note — DPDP ke liye */}
                    <p
                      className="text-center text-[11.5px] leading-relaxed"
                      style={{ color: C.label }}
                    >
                      By submitting, you agree that Welvors may contact you
                      about this application. See our{" "}
                      <Link
                        href="/privacy"
                        className="underline hover:opacity-70"
                        style={{ color: C.pink }}
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </div>
                )}
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