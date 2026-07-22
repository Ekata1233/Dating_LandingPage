// StepProfile.tsx (updated to use context)
"use client";

import React, { useState } from "react";

import {
  C,
  GENDER_OPTIONS,
  ORIENTATION_OPTIONS,
  HEIGHT_OPTIONS,
  calcAge,
  Status,
  StepLabel,
  StepTitle,
  FootNote,
  PrimaryButton,
  ErrorNote,
  labelClass,
  fieldClass,
  fieldStyle,
} from "../waitlistConfig";
import { useWaitlist } from "@/app/context/WaitlistContext";

/* Chevron ke sath select — native, styled */
const selectCls =
  "mt-2 w-full appearance-none rounded-xl border bg-white px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-[#E8A2BE]";
const selectWrapStyle: React.CSSProperties = { position: "relative" };
const chevron = (
  <span
    style={{
      position: "absolute",
      right: 14,
      top: "50%",
      transform: "translateY(-30%)",
      pointerEvents: "none",
      color: "#9C948C",
    }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  </span>
);

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 83 }, (_, i) => String(CURRENT_YEAR - 18 - i));

export default function StepProfile() {
  const {
    phone,
    profile,
    setProfile,
    status,
    errorMsg,
    onSubmitProfile,
  } = useWaitlist();

  const [orientationSheet, setOrientationSheet] = useState(false);

  return (
    <>
      <StepLabel>Step 2 · Quick profile</StepLabel>

      <StepTitle>Tell us about you.</StepTitle>

      <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: C.body }}>
        Registering with{" "}
        <strong style={{ color: C.headingDark }}>+91 {phone}</strong>. Just the
        basics — you&apos;ll finish your profile inside the app.
      </p>

      {/* Full name */}
      <label className={labelClass} style={{ color: C.headingDark }}>
        Full name
      </label>
      <input
        type="text"
        autoComplete="name"
        placeholder="Your full name"
        value={profile.fullName}
        onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
        className={fieldClass}
        style={fieldStyle}
      />

      {/* Email */}
      <label className={labelClass} style={{ color: C.headingDark }}>
        Email address
      </label>
      <input
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={profile.email}
        onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
        className={fieldClass}
        style={fieldStyle}
      />

      {/* Date of birth */}
      <label className={labelClass} style={{ color: C.headingDark }}>
        Date of birth
      </label>
      <div className="mt-2 grid grid-cols-3 gap-2.5">
        {[
          { key: "dobDay" as const, ph: "DD", opts: DAYS },
          { key: "dobMonth" as const, ph: "MM", opts: MONTHS },
          { key: "dobYear" as const, ph: "YYYY", opts: YEARS },
        ].map((f) => (
          <div key={f.key} style={selectWrapStyle}>
            <select
              value={profile[f.key]}
              onChange={(e) =>
                setProfile((p) => ({ ...p, [f.key]: e.target.value }))
              }
              className={selectCls}
              style={{ borderColor: "#EDE4DC", color: profile[f.key] ? C.headingDark : C.label }}
            >
              <option value="" disabled>
                {f.ph}
              </option>
              {f.opts.map((o) => (
                <option key={o} value={o} style={{ color: C.headingDark }}>
                  {o}
                </option>
              ))}
            </select>
            {chevron}
          </div>
        ))}
      </div>
      {(() => {
        const age = calcAge(profile.dobDay, profile.dobMonth, profile.dobYear);
        if (age === null) return null;
        return (
          <p
            className="mt-2 text-[12px]"
            style={{ color: age < 18 ? C.pink : C.label }}
          >
            {age < 18 ? (
              <>You must be 18 or older to join.</>
            ) : (
              <>
                You&apos;ll appear as{" "}
                <strong style={{ color: C.headingDark }}>{age}</strong> on your
                profile.
              </>
            )}
          </p>
        );
      })()}

      {/* Height */}
      <label className={labelClass} style={{ color: C.headingDark }}>
        Height
      </label>
      <div style={selectWrapStyle}>
        <select
          value={profile.height}
          onChange={(e) => setProfile((p) => ({ ...p, height: e.target.value }))}
          className={selectCls}
          style={{ borderColor: "#EDE4DC", color: profile.height ? C.headingDark : C.label }}
        >
          <option value="" disabled>
            Select your height
          </option>
          {HEIGHT_OPTIONS.map((h) => (
            <option key={h.value} value={h.value} style={{ color: C.headingDark }}>
              {h.label}
            </option>
          ))}
        </select>
        {chevron}
      </div>

      {/* Gender */}
      <label className={labelClass} style={{ color: C.headingDark }}>
        Gender
      </label>
      <div style={selectWrapStyle}>
        <select
          value={profile.gender}
          onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}
          className={selectCls}
          style={{ borderColor: "#EDE4DC", color: profile.gender ? C.headingDark : C.label }}
        >
          <option value="" disabled>
            Select
          </option>
          {GENDER_OPTIONS.map((g) => (
            <option key={g} value={g} style={{ color: C.headingDark }}>
              {g}
            </option>
          ))}
        </select>
        {chevron}
      </div>

      {/* Sexual orientation */}
      <div className="mt-4 flex items-center gap-2">
        <label className="text-[12.5px] font-bold" style={{ color: C.headingDark }}>
          Sexual orientation
        </label>
        <span
          className="rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: "#FBE0E9", color: C.pink }}
        >
          Optional
        </span>
      </div>
      <div style={selectWrapStyle}>
        <button
          type="button"
          onClick={() => setOrientationSheet(true)}
          className="mt-2 flex w-full items-center rounded-xl border bg-white px-4 py-3.5 text-left text-[15px] outline-none transition-colors focus:border-[#E8A2BE]"
          style={{
            borderColor: "#EDE4DC",
            color: profile.orientation ? C.headingDark : C.label,
          }}
        >
          {profile.orientation || "Select"}
        </button>
        {chevron}
      </div>
      <p className="mt-2 flex items-center gap-1.5 text-[12px]" style={{ color: C.label }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        Private — this is never shown on your profile to other people.
      </p>

      <ErrorNote message={status === "error" ? errorMsg : ""} />

      <PrimaryButton
        onClick={onSubmitProfile}
        disabled={status === "sending"}
        className="mt-5"
      >
        {status === "sending" ? "Saving…" : "Continue"}
      </PrimaryButton>

      <FootNote>Your details stay private until you match · verified only</FootNote>

      {/* ---- Orientation bottom sheet ---- */}
      {orientationSheet && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center">
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-[#2B2A28]/40"
            onClick={() => setOrientationSheet(false)}
          />

          <div className="relative w-full max-w-[520px] max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white px-5 pb-6 pt-5 shadow-[0_-8px_40px_rgba(43,42,40,0.2)] sm:rounded-2xl">
            {/* header */}
            <div className="flex items-center justify-between">
              <h3
                className="text-[18px] font-bold"
                style={{
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  color: C.headingDark,
                }}
              >
                Sexual orientation
              </h3>
              <button
                type="button"
                onClick={() => setOrientationSheet(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#F5EFE9]"
                style={{ backgroundColor: "#F5EFE9", color: C.headingDark }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* privacy note */}
            <div
              className="mt-4 flex items-start gap-2 rounded-xl px-4 py-3"
              style={{ backgroundColor: "#F5EFE7" }}
            >
              <span className="mt-0.5 flex-none" style={{ color: C.label }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </span>
              <p className="text-[12.5px] leading-relaxed" style={{ color: C.body }}>
                Private — never shown on your profile to other people.
              </p>
            </div>

            {/* options */}
            <div className="mt-4 space-y-2.5">
              {ORIENTATION_OPTIONS.map((o) => {
                const isSel = profile.orientation === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => {
                      setProfile((p) => ({ ...p, orientation: o.value }));
                      setOrientationSheet(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors"
                    style={{
                      borderColor: isSel ? C.pink : "#EDE4DC",
                      backgroundColor: isSel ? "#FCEDF2" : "#FFFFFF",
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-[15px] font-bold"
                        style={{ color: isSel ? C.pink : C.headingDark }}
                      >
                        {o.value}
                      </p>
                      <p
                        className="mt-0.5 text-[12.5px] leading-relaxed"
                        style={{ color: isSel ? C.pink : C.body }}
                      >
                        {o.desc}
                      </p>
                    </div>
                    {isSel && (
                      <span className="flex-none" style={{ color: C.pink }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}