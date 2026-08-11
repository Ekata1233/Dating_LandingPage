"use client";

import React from "react";
import { C, Icon, LOCKED_IN, Plan } from "../waitlistConfig";

interface Props {
  plan: Plan;
  fullName: string;
  phone: string;
  city: string;
  spotNumber: number | null;
  userId?: string;
  onClose: () => void;
}

export default function StepDone({
  plan,
  fullName,
  phone,
  city,
  spotNumber,
  userId,
}: Props) {
  return (
    <div className="py-2">
      {/* Green check */}
      <div className="flex justify-center">
        <span
          className="flex h-[70px] w-[70px] items-center justify-center rounded-full"
          style={{ backgroundColor: "#E4F2E9" }}
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3F8F5B"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
      </div>

      <h2
        className="mt-5 text-center text-[24px] leading-tight sm:text-[26px]"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: C.headingDark,
        }}
      >
        You&apos;re in{fullName ? `, ${fullName}` : ""}!
      </h2>

      {plan === "founding" && (
        <div className="mt-3 flex justify-center">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-bold"
            style={{ backgroundColor: "#F0B429", color: "#4A3208" }}
          >
            ★ Founding Member
          </span>
        </div>
      )}

      <p
        className="mt-4 text-center text-[13.5px] leading-relaxed"
        style={{ color: C.body }}
      >
        {plan === "founding" ? (
          <>
            Founding spot{" "}
            <strong style={{ color: C.headingDark }}>#{spotNumber ?? "—"}</strong>{" "}
            reserved. A confirmation SMS is on its way to{" "}
            <strong style={{ color: C.headingDark }}>+91 {phone}</strong>. See you
            at launch. 💛
          </>
        ) : (
          <>
            You&apos;re on the waitlist. A confirmation SMS is on its way to{" "}
            <strong style={{ color: C.headingDark }}>+91 {phone}</strong>.
            We&apos;ll invite you when Welvors opens in {city || "your city"}. 💛
          </>
        )}
      </p>

      {/* ---- Account details ---- */}
      <div
        className="mt-5 rounded-xl border px-5 py-4"
        style={{ borderColor: "#EDE4DC" }}
      >
        <p
          className="text-[11.5px] font-bold uppercase tracking-[0.12em]"
          style={{ color: C.body }}
        >
          Your details
        </p>
        <div className="mt-3 space-y-2 text-[13px]">
          {[
            { k: "Name", v: fullName },
            { k: "Phone", v: phone ? `+91 ${phone}` : "" },
            { k: "City", v: city },
            { k: "Account ID", v: userId || "" },
          ]
            .filter((r) => r.v)
            .map((r) => (
              <div key={r.k} className="flex items-center justify-between gap-3">
                <span style={{ color: C.label }}>{r.k}</span>
                <span
                  className="max-w-[60%] truncate text-right font-semibold"
                  style={{ color: C.headingDark }}
                >
                  {r.v}
                </span>
              </div>
            ))}
        </div>
      </div>

      {plan === "founding" && (
        <div className="mt-5 rounded-xl px-5 py-4" style={{ backgroundColor: "#F5EFE7" }}>
          <p
            className="text-[11.5px] font-bold uppercase tracking-[0.12em]"
            style={{ color: C.body }}
          >
            What you just locked in
          </p>
          <ul className="mt-3 space-y-2.5">
            {LOCKED_IN.map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex-none" style={{ color: "#3F8F5B" }}>
                  <Icon.Check />
                </span>
                <span
                  className="text-[13.5px] leading-relaxed"
                  style={{ color: C.headingDark }}
                >
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* <PrimaryButton onClick={onClose} className="mt-5">
        Done
      </PrimaryButton> */}
    </div>
  );
}