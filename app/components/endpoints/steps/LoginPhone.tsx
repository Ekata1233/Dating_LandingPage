"use client";

import React from "react";
import { C, Icon, OTP_LENGTH, Status } from "../../auth/authConfig";

interface Props {
  phone: string;
  setPhone: (v: string) => void;
  status: Status;
  errorMsg: string;
  onSendOtp: (isResend?: boolean) => void;
  phoneRef: React.RefObject<HTMLInputElement | null>;
  // inline-OTP ke liye — two-step flow me use nahi ho rahe, isliye optional
  otp?: string[];
  setOtp?: React.Dispatch<React.SetStateAction<string[]>>;
  otpSent?: boolean;
  secondsLeft?: number;
  onVerify?: () => void;
  onChangeNumber?: () => void;
  otpRefs?: React.MutableRefObject<Array<HTMLInputElement | null>>;
}

export default function LoginPhone({
  phone,
  setPhone,
  otp = [],
  setOtp,
  otpSent = false,
  secondsLeft = 0,
  status,
  errorMsg,
  onSendOtp,
  onVerify,
  onChangeNumber,
  phoneRef,
  otpRefs,
}: Props) {
  const focusOtp = (i: number) => otpRefs?.current[i]?.focus();

  const handleOtpChange = (i: number, raw: string) => {
    if (!setOtp) return;
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
      for (let k = 0; k < digits.length && i + k < OTP_LENGTH; k++)
        next[i + k] = digits[k];
      return next;
    });
    focusOtp(Math.min(i + digits.length, OTP_LENGTH - 1));
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      e.preventDefault();
      setOtp?.((prev) => {
        const next = [...prev];
        next[i - 1] = "";
        return next;
      });
      focusOtp(i - 1);
    }
    if (e.key === "ArrowLeft" && i > 0) focusOtp(i - 1);
    if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) focusOtp(i + 1);
    if (e.key === "Enter") onVerify?.();
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!setOtp) return;
    const digits = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;
    e.preventDefault();
    setOtp(Array.from({ length: OTP_LENGTH }, (_, k) => digits[k] ?? ""));
    focusOtp(Math.min(digits.length, OTP_LENGTH - 1));
  };

  return (
    <>
      <p
        className="text-[11.5px] font-bold uppercase tracking-[0.16em]"
        style={{ color: C.pink }}
      >
        Log in
      </p>

      <h2
        className="mt-3 text-[27px] leading-tight sm:text-[29px]"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: C.headingDark,
        }}
      >
        Welcome back.
      </h2>

      <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: C.body }}>
        Enter your registered mobile number — we&apos;ll send a one-time code to
        log you in.
      </p>

      {/* Mobile number */}
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
        <span className="my-2 w-px flex-none" style={{ backgroundColor: C.divider }} />
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

      {/* OTP block — inline, same screen */}
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
                  if (otpRefs) otpRefs.current[i] = el;
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
        </>
      )}

      {status === "error" && errorMsg && (
        <p className="mt-3 text-center text-[12.5px]" style={{ color: C.pink }}>
          {errorMsg}
        </p>
      )}

      <button
        type="button"
        onClick={() => (otpSent ? onVerify?.() : onSendOtp())}
        disabled={status === "sending"}
        className="mt-4 w-full rounded-xl px-6 py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: C.ctaPink }}
      >
        {status === "sending"
          ? otpSent
            ? "Verifying…"
            : "Sending…"
          : otpSent
          ? "Verify & continue"
          : "Send OTP"}
      </button>

      <p
        className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px]"
        style={{ color: C.label }}
      >
        <Icon.Lock />
        Your number stays private · verified users only
      </p>
    </>
  );
}