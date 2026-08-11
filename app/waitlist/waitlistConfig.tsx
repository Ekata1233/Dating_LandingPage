"use client";

import React, { SVGProps } from "react";

/* ------------------------------------------------------------------ */
/*  Brand colors                                                       */
/* ------------------------------------------------------------------ */
export const C = {
  headingDark: "#2B2A28",
  pink: "#C21559",
  ctaPink: "#CE3F63",
  body: "#6B655F",
  label: "#9C948C",
  border: "#F0E4E8",
  ringSoft: "#FBE0E9",
  divider: "#F3C9D8",
  otpIdleBg: "#F5EFE9",
  otpActiveBorder: "#F0BCCF",
  filledBg: "#EFF3FB",
  dotIdle: "#F3D6DF",
  ctaFrom: "#D0405F",
  ctaTo: "#C21559",
};

/* ------------------------------------------------------------------ */
/*  MOCK_MODE — frontend-only development ke liye                      */
/*  API ready hone pe env var se control karo:                         */
/*  process.env.NEXT_PUBLIC_MOCK_AUTH === "true"                       */
/* ------------------------------------------------------------------ */
export const MOCK_MODE = true;

export const TOTAL_STEPS = 3; 
export const OTP_LENGTH = 6;
export const RESEND_SECONDS = 30;

/* API endpoints */
export const SEND_OTP_ENDPOINT = "/api/waitlist/send-otp";
export const VERIFY_OTP_ENDPOINT = "/api/waitlist/verify-otp";
export const SAVE_PROFILE_ENDPOINT = "/api/waitlist/profile";
export const CHECKOUT_ENDPOINT = "/api/waitlist/checkout";

/* ------------------------------------------------------------------ */
/*  PRICING aur PERK_ROWS yahan se hata diye —                         */
/*  ab ye sab live API se aata hai (StepPlan me fetch hota hai).       */
/* ------------------------------------------------------------------ */

export const HIGHLIGHTS = [
  {
    title: "1 month Premium free at launch",
    desc: "Your ₹999 unlocks the full Premium plan — unlimited likes, see who likes you & more",
  },
  {
    title: "Early access",
    desc: "Get in before everyone else — first pick of matches",
  },
];

export const LOCKED_IN = [
  "1 month Premium free at launch",
  "Early access — first pick of matches",
  "₹4,200+ of first-month Premium perks",
  "100 Welcome Coins, one-time bonus",
];

export const GENDERS = ["Woman", "Man", "Other"];
export const GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Other"];
export const ORIENTATION_OPTIONS: { value: string; desc: string }[] = [
  { value: "Prefer not to say", desc: "You can add this later" },
  { value: "Straight", desc: "Attracted to people of the opposite gender" },
  { value: "Gay", desc: "Attracted to people of the same gender" },
  { value: "Lesbian", desc: "A woman attracted to other women" },
  { value: "Bisexual", desc: "Attracted to more than one gender" },
  { value: "Pansexual", desc: "Attracted to people regardless of gender" },
  {
    value: "Asexual",
    desc: "Little or no sexual attraction — may still feel romantic",
  },
];

/* Height options: 4'6" (137cm) -> 7'0" (213cm) */
export const HEIGHT_OPTIONS: { label: string; value: string }[] = (() => {
  const out: { label: string; value: string }[] = [];
  for (let cm = 137; cm <= 213; cm++) {
    const totalInches = Math.round(cm / 2.54);
    const ft = Math.floor(totalInches / 12);
    const inch = totalInches % 12;
    out.push({ label: `${ft}'${inch}" · ${cm} cm`, value: String(cm) });
  }
  return out;
})();

/* Age helper — 18+ gate ke liye */
export function calcAge(day: string, month: string, year: string): number | null {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  if (!d || !m || !y || y < 1900) return null;
  const dob = new Date(y, m - 1, d);
  if (
    dob.getFullYear() !== y ||
    dob.getMonth() !== m - 1 ||
    dob.getDate() !== d
  )
    return null; // invalid date (e.g. 31 Feb)
  const now = new Date();
  let age = now.getFullYear() - y;
  const beforeBirthday =
    now.getMonth() < m - 1 ||
    (now.getMonth() === m - 1 && now.getDate() < d);
  if (beforeBirthday) age--;
  return age;
}
export const LOOKING_FOR = ["Marriage", "Long-term", "New friends", "Figuring out"];

/* ------------------------------------------------------------------ */
/*  Shared types                                                       */
/* ------------------------------------------------------------------ */
export type Status = "idle" | "sending" | "verifying" | "success" | "error";
export type Plan = "founding" | "free";
export type PayMethod = "upi" | "card";

export interface Profile {
  fullName: string;
  email: string;
  gender: string;
  city: string;
  lookingFor: string;
  // Step 2 extra fields
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  height: string;
  orientation: string;
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
export const Icon = {
  Close: (p: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  Lock: (p: SVGProps<SVGSVGElement>) => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  ),
  Chevron: (p: SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
  Check: (p: SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Shared UI bits                                                     */
/* ------------------------------------------------------------------ */
export const labelClass = "mt-4 block text-[12.5px] font-bold";
export const fieldClass =
  "mt-2 w-full rounded-xl px-4 py-3.5 text-[15px] outline-none transition-colors focus:ring-2 focus:ring-[#FBE0E9]";
export const fieldStyle: React.CSSProperties = {
  backgroundColor: "#EFF3FB",
  color: "#2B2A28",
};

export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="rounded-full border bg-white px-4 py-2 text-[13.5px] font-semibold transition-colors"
      style={{
        borderColor: selected ? "#E0709A" : "#E7DFD9",
        color: selected ? "#C21559" : "#2B2A28",
      }}
    >
      {label}
    </button>
  );
}

/** Har step ke neeche wali privacy line */
export function FootNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px]"
      style={{ color: C.label }}
    >
      <Icon.Lock />
      {children}
    </p>
  );
}

/** Primary CTA */
export function PrimaryButton({
  onClick,
  disabled,
  children,
  className = "mt-4",
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${className} w-full rounded-xl px-6 py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60`}
      style={{ backgroundColor: C.ctaPink }}
    >
      {children}
    </button>
  );
}

/** Step heading (serif) */
export function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mt-3 text-[25px] leading-tight sm:text-[27px]"
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        color: C.headingDark,
      }}
    >
      {children}
    </h2>
  );
}

/** Step eyebrow label */
export function StepLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[11.5px] font-bold uppercase tracking-[0.16em]"
      style={{ color: C.pink }}
    >
      {children}
    </p>
  );
}

/** Back link */
export function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 text-[13px] font-medium hover:opacity-70"
      style={{ color: C.headingDark }}
    >
      ← Back
    </button>
  );
}

/** Inline error */
export function ErrorNote({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="mt-3 text-center text-[12.5px]" style={{ color: C.pink }}>
      {message}
    </p>
  );
}