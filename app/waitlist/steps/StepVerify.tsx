// StepVerify.tsx (updated to use context)
"use client";

import React from "react";
import {
  C,
  Icon,
  OTP_LENGTH,
 
  StepLabel,
  StepTitle,
  FootNote,
  PrimaryButton,
  ErrorNote,
} from "../waitlistConfig";
import { useWaitlist } from "@/app/context/WaitlistContext";

export default function StepVerify() {
  const {
    phone,
    setPhone,
    otp,
    setOtp,
    otpSent,
    secondsLeft,
    referralOpen,
    setReferralOpen,
    referralCode,
    setReferralCode,
    status,
    errorMsg,
    onSendOtp,
    onVerify,
    onChangeNumber,
    phoneRef,
    otpRefs,
  } = useWaitlist();

  const focusOtp = (i: number) => otpRefs.current[i]?.focus();

  const handleOtpChange = (i: number, raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) {
      setOtp((prev) => {
        const next = [...prev];
        next[i] = "";
        return next;
      });
      return;
    }
    setOtp((prev) => {
      const next = [...prev];
      for (let k = 0; k < digits.length && i + k < OTP_LENGTH; k++) {
        next[i + k] = digits[k];
      }
      return next;
    });
    focusOtp(Math.min(i + digits.length, OTP_LENGTH - 1));
  };

  const handleOtpKeyDown = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      e.preventDefault();
      setOtp((prev) => {
        const next = [...prev];
        next[i - 1] = "";
        return next;
      });
      focusOtp(i - 1);
    }
    if (e.key === "ArrowLeft" && i > 0) focusOtp(i - 1);
    if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) focusOtp(i + 1);
    if (e.key === "Enter") onVerify();
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;
    e.preventDefault();
    setOtp(Array.from({ length: OTP_LENGTH }, (_, k) => digits[k] ?? ""));
    focusOtp(Math.min(digits.length, OTP_LENGTH - 1));
  };

  return (
    <>
      <StepLabel>Step 1 · Verify your number</StepLabel>

      <StepTitle>
        Join with your
        <br />
        mobile number.
      </StepTitle>

      <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: C.body }}>
        We&apos;ll send a one-time code to confirm it&apos;s really you. No spam —
        just your early-access invite.
      </p>

      {/* ---- Mobile number ---- */}
      <label
        className="mt-5 block text-[12.5px] font-bold"
        style={{ color: C.headingDark }}
      >
        Mobile number
      </label>

      <div
        className="mt-2 flex items-stretch overflow-hidden rounded-xl border-2"
        style={{
          borderColor: C.ringSoft,
          boxShadow: `0 0 0 4px ${C.ringSoft}55`,
        }}
      >
        <span
          className="flex items-center px-4 text-[15px] font-semibold"
          style={{ color: C.headingDark }}
        >
          +91
        </span>
        <span
          className="my-2 w-px flex-none"
          style={{ backgroundColor: C.divider }}
        />
        <input
          ref={phoneRef}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          disabled={otpSent}
          placeholder="Enter your mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          onKeyDown={(e) => e.key === "Enter" && !otpSent && onSendOtp()}
          className="w-full px-4 py-3.5 text-[15px] outline-none disabled:cursor-default"
          style={{
            color: C.headingDark,
            backgroundColor: otpSent ? C.filledBg : "transparent",
          }}
        />
      </div>

      {/* ---- OTP block ---- */}
      {otpSent && (
        <>
          <p className="mt-4 text-[13px]" style={{ color: C.body }}>
            Enter the 6-digit code sent to{" "}
            <strong style={{ color: C.headingDark }}>+91 {phone}</strong>.{" "}
            <button
              type="button"
              onClick={onChangeNumber}
              className="font-semibold hover:opacity-70"
              style={{ color: C.pink }}
            >
              Change
            </button>
          </p>

          <div className="mt-3 flex gap-2.5">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  otpRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={d}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={handleOtpPaste}
                onFocus={(e) => e.target.select()}
                aria-label={`Digit ${i + 1}`}
                className="h-[58px] w-full rounded-xl border-2 text-center text-[20px] font-semibold outline-none transition-colors"
                style={{
                  borderColor: d ? C.otpActiveBorder : "transparent",
                  backgroundColor: d ? "#FFFFFF" : C.otpIdleBg,
                  color: C.headingDark,
                }}
              />
            ))}
          </div>

          {/* Resend */}
          <p className="mt-3 text-center text-[12.5px]" style={{ color: C.label }}>
            Didn&apos;t get it?{" "}
            {secondsLeft > 0 ? (
              <strong style={{ color: C.headingDark }}>
                Resend code in {secondsLeft}s
              </strong>
            ) : (
              <button
                type="button"
                onClick={() => onSendOtp(true)}
                className="font-bold hover:opacity-70"
                style={{ color: C.pink }}
              >
                Resend code
              </button>
            )}
          </p>

          {/* ---- Referral code ---- */}
          <div
            className="mt-4 rounded-xl px-4 py-3"
            style={{ backgroundColor: "#F7F1EA" }}
          >
            <button
              type="button"
              onClick={() => setReferralOpen((v) => !v)}
              aria-expanded={referralOpen}
              className="flex w-full items-center gap-2 text-left"
            >
              <span className="text-[14px]">🎁</span>
              <span
                className="text-[13.5px] font-bold"
                style={{ color: C.headingDark }}
              >
                Have a referral code?
              </span>
              <span
                className="rounded px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: "#EDE4DA", color: C.label }}
              >
                Optional
              </span>
              <span
                className="ml-auto transition-transform"
                style={{
                  color: C.label,
                  transform: referralOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <Icon.Chevron />
              </span>
            </button>

            {referralOpen && (
              <input
                type="text"
                placeholder="E.G. ANAY483"
                value={referralCode}
                onChange={(e) =>
                  setReferralCode(
                    e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 12)
                  )
                }
                onKeyDown={(e) => e.key === "Enter" && onVerify()}
                className="mt-3 w-full rounded-lg border bg-white px-4 py-3 text-[14px] tracking-wide outline-none transition-colors focus:border-[#E8A2BE]"
                style={{ borderColor: "#EAE0D6", color: C.headingDark }}
              />
            )}
          </div>
        </>
      )}

      <ErrorNote message={status === "error" ? errorMsg : ""} />

      <PrimaryButton
        onClick={() => (otpSent ? onVerify() : onSendOtp())}
        disabled={status === "sending"}
      >
        {status === "sending"
          ? otpSent
            ? "Verifying…"
            : "Sending…"
          : otpSent
          ? "Verify & continue"
          : "Send OTP"}
      </PrimaryButton>

      <FootNote>Your number stays private · verified users only</FootNote>
    </>
  );
}