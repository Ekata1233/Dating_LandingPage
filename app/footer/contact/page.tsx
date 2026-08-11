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
  inputBorder: "#E4DBD3",
  tableHeadBg: "#F5EEE7",
  ctaFrom: "#C93B68",
  ctaTo: "#B31E52",
};

/* API endpoint — ye route banana padega (app/api/contact/route.ts) */
const SUBMIT_ENDPOINT = "/api/contact";

/* ------------------------------------------------------------------ */
/*  Contact details — GRIEVANCE OFFICER / OFFICE yahin badlo           */
/*  NOTE: IT Rules 2021 ke under Grievance Officer ka naam & contact   */
/*  real aur publicly published hona chahiye.                          */
/* ------------------------------------------------------------------ */
const CONTACT_INFO = {
  supportEmail: "infynod@gmail.com",
  inAppPath: "Profile → Help & Support → Live chat",
  responseTime: "within 24 hours",
  grievance: {
    name: "Mr. Satish Jaywant Kadam",
    email: "infynod@gmail.com",
  },
  office: {
    company: "Infynod Tech Private Limited ",
    address: "Office No. 307, 3rd Floor, Amanora Chamber, Hadapsar–Kharadi Road, Hadapsar, Pune, Maharashtra – 411028, India",
  },
};

/* ------------------------------------------------------------------ */
/*  "On this page" nav                                                 */
/* ------------------------------------------------------------------ */
const TOC = [
  { label: "Member support", id: "member-support" },
  { label: "Reach the right team", id: "right-team" },
  { label: "Grievance officer", id: "grievance-officer" },
  { label: "Office", id: "office" },
  { label: "Send a message", id: "send-message" },
];
const TOC_IDS = TOC.map((t) => t.id);

/* ------------------------------------------------------------------ */
/*  Team emails                                                        */
/* ------------------------------------------------------------------ */
const TEAM_EMAILS: [string, string][] = [
  ["General enquiries", "infynod@gmail.com"],
  ["Member support", "infynod@gmail.com"],
  ["Privacy & data", "infynod@gmail.com"],
  ["Partnerships", "infynod@gmail.com"],
  ["Press & media", "infynod@gmail.com"],
  ["Careers", "infynod@gmail.com"],
];

const TOPICS = [
  "General enquiry",
  "Member support",
  "Privacy & data",
  "Partnerships",
  "Press & media",
  "Careers",
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

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mt-5 rounded-xl border bg-white p-5"
      style={{ borderColor: C.border }}
    >
      <dl className="space-y-2 text-[13.5px]">{children}</dl>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap gap-x-2">
      <dt className="font-bold" style={{ color: C.headingDark }}>
        {label}:
      </dt>
      <dd style={{ color: C.body }}>{children}</dd>
    </div>
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
export default function ContactPage() {
  const active = useActiveSection(TOC_IDS);

  const [form, setForm] = useState({
    name: "",
    email: "",
    topic: TOPICS[0],
    message: "",
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
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus("error");
      setErrorMsg("Please fill in your name, email, and message.");
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
      setErrorMsg(
        "Something went wrong. Please try again or email us directly."
      );
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
              › <span>Company</span> › <span>Contact us</span>
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
              Get in touch
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
            Contact us.
          </h1>

          <p
            className="mt-4 max-w-xl text-[14.5px] leading-relaxed"
            style={{ color: C.body }}
          >
            Questions, feedback, or need a hand? Reach the right team below — we
            read everything.
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
              We&apos;re a small team and we genuinely care about getting back to
              you. Pick the channel that fits, or drop us a message using the
              form below.
            </p>

            {/* ---- Member support ---- */}
            <div className="mt-12">
              <SectionHeading id="member-support">Member support</SectionHeading>
              <InfoCard>
                <Row label="Help &amp; support">
                  <MailLink email={CONTACT_INFO.supportEmail} />
                </Row>
                <Row label="In-app">{CONTACT_INFO.inAppPath}</Row>
                <Row label="Typical response">{CONTACT_INFO.responseTime}</Row>
              </InfoCard>
            </div>

            {/* ---- Reach the right team ---- */}
            <div className="mt-12">
              <SectionHeading id="right-team">
                Reach the right team
              </SectionHeading>

              <div className="mt-5 overflow-x-auto">
                <table
                  className="w-full min-w-[440px] border-collapse text-left"
                  style={{ color: C.body }}
                >
                  <thead>
                    <tr style={{ backgroundColor: C.tableHeadBg }}>
                      <th
                        className="w-[45%] border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                        style={{ borderColor: C.border, color: C.label }}
                      >
                        Topic
                      </th>
                      <th
                        className="border px-4 py-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em]"
                        style={{ borderColor: C.border, color: C.label }}
                      >
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {TEAM_EMAILS.map(([topic, email]) => (
                      <tr key={topic}>
                        <td
                          className="border px-4 py-3 align-top text-[13.5px] font-bold"
                          style={{
                            borderColor: C.border,
                            color: C.headingDark,
                          }}
                        >
                          {topic}
                        </td>
                        <td
                          className="border px-4 py-3 align-top text-[13.5px]"
                          style={{ borderColor: C.border }}
                        >
                          <MailLink email={email} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ---- Grievance officer ---- */}
            <div className="mt-12">
              <SectionHeading id="grievance-officer">
                Grievance officer
              </SectionHeading>
              <p
                className="mt-4 text-[14.5px] leading-relaxed"
                style={{ color: C.body }}
              >
                In line with Indian law, you can reach our Grievance Officer for
                complaints about content, safety, or your data.
              </p>
              <InfoCard>
                <Row label="Grievance Officer">
                  {CONTACT_INFO.grievance.name}
                </Row>
                <Row label="Email">
                  <MailLink email={CONTACT_INFO.grievance.email} />
                </Row>
                <Row label="More">
                  <Link
                    href="/grievance"
                    className="hover:opacity-70"
                    style={{ color: C.pink }}
                  >
                    Grievance Redressal policy
                  </Link>
                </Row>
              </InfoCard>
            </div>

            {/* ---- Office ---- */}
            <div className="mt-12">
              <SectionHeading id="office">Office</SectionHeading>
              <div
                className="mt-5 rounded-xl border bg-white p-5"
                style={{ borderColor: C.border }}
              >
                <p
                  className="text-[13.5px] font-bold"
                  style={{ color: C.headingDark }}
                >
                  {CONTACT_INFO.office.company}
                </p>
                <p className="mt-1 text-[13.5px]" style={{ color: C.body }}>
                  {CONTACT_INFO.office.address}
                </p>
              </div>
            </div>

            {/* ---- Send us a message ---- */}
            <div className="mt-12">
              <SectionHeading id="send-message">Send us a message</SectionHeading>

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
                      Message sent.
                    </p>
                    <p className="mt-2 text-[13.5px]" style={{ color: C.body }}>
                      Thanks for reaching out — we&apos;ll get back to you soon.
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
                    </div>

                    {/* Topic */}
                    <Field label="Topic">
                      <select
                        value={form.topic}
                        onChange={update("topic")}
                        className={inputClass}
                        style={{
                          borderColor: C.inputBorder,
                          color: C.headingDark,
                        }}
                      >
                        {TOPICS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </Field>

                    {/* Message */}
                    <Field label="Message">
                      <textarea
                        rows={4}
                        placeholder="How can we help?"
                        value={form.message}
                        onChange={update("message")}
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
                      {status === "sending" ? "Sending…" : "Send message"}
                    </button>

                    {/* Consent note */}
                    <p
                      className="text-center text-[11.5px] leading-relaxed"
                      style={{ color: C.label }}
                    >
                      By sending, you agree that Welvors may contact you about
                      this message. See our{" "}
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