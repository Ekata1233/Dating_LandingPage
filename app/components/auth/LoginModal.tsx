"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  C,
  Icon,
  MOCK_MODE,
  OTP_LENGTH,
  RESEND_SECONDS,
  LOGIN_SEND_OTP,
  LOGIN_VERIFY_OTP,
  Status,
} from "./authConfig";
import LoginPhone from "../endpoints/steps/LoginPhone";
import LoginOtp from "../endpoints/steps/LoginOtp";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  /** verify hone ke baad — e.g. redirect to /launch */
  onSuccess?: () => void;
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Portal ke liye — SSR-safe
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => phoneRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) return;
    setStep(1);
    setPhone("");
    setOtp(Array(OTP_LENGTH).fill(""));
    setSecondsLeft(0);
    setStatus("idle");
    setErrorMsg("");
  }, [open]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  if (!open || !mounted) return null;

  const fail = (msg: string) => {
    setStatus("error");
    setErrorMsg(msg);
  };

  const sendOtp = async (isResend = false) => {
    if (phone.length !== 10)
      return fail("Please enter a valid 10-digit mobile number.");

    setStatus("sending");
    setErrorMsg("");

    const onOk = () => {
      setStatus("idle");
      setStep(2);
      setSecondsLeft(RESEND_SECONDS);
      if (isResend) setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => otpRefs.current[0]?.focus(), 60);
    };

    if (MOCK_MODE) return void setTimeout(onOk, 400);

    try {
      const res = await fetch(LOGIN_SEND_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // backend "phoneNumber" key expect karta hai. +91 backend khud lagata hai.
        body: JSON.stringify({ phoneNumber: phone }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok)
        return fail(
          data?.message || "Couldn't send the code. Please try again."
        );

      onOk();
    } catch {
      fail("Network error — couldn't reach the server. Please try again.");
    }
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH)
      return fail("Please enter the full 6-digit code.");

    setStatus("sending");
    setErrorMsg("");

    if (MOCK_MODE) {
      return void setTimeout(() => {
        setStatus("idle");
        onSuccess?.();
        onClose();
      }, 400);
    }

    try {
      const res = await fetch(LOGIN_VERIFY_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, otp: code }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok)
        return fail(data?.error || data?.message || "That code didn't match. Please try again.");

      // Backend token top-level me deta hai: { success, message, token }
      const token = data?.token;
      if (token) localStorage.setItem("welvors_token", token);
 if (data?.user) localStorage.setItem("welvors_user", JSON.stringify(data.user));
      setStatus("idle");
      onSuccess?.();
      onClose();
    } catch {
      fail("Network error — couldn't reach the server. Please try again.");
    }
  };

  const changeNumber = () => {
    setStep(1);
    setOtp(Array(OTP_LENGTH).fill(""));
    setSecondsLeft(0);
    setStatus("idle");
    setErrorMsg("");
    setTimeout(() => phoneRef.current?.focus(), 50);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Log in"
    >
      <div
        className="fixed inset-0 bg-[#2B2A28]/35 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative my-auto w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(43,42,40,0.25)]">
        {/* Top bar — sirf close */}
        <div
          className="flex items-center justify-start border-b px-6 py-4"
          style={{ borderColor: C.border }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-[#FCF8F4]"
            style={{ borderColor: C.border, color: C.headingDark }}
          >
            <Icon.Close />
          </button>

          {MOCK_MODE && (
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: "#FDE8C8", color: "#8A5A00" }}
            >
              Demo mode
            </span>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-6 sm:px-8 sm:py-7">
          {step === 1 ? (
            <LoginPhone
              phone={phone}
              setPhone={setPhone}
              status={status}
              errorMsg={errorMsg}
              onSendOtp={() => sendOtp()}
              phoneRef={phoneRef}
            />
          ) : (
            <LoginOtp
              phone={phone}
              otp={otp}
              setOtp={setOtp}
              secondsLeft={secondsLeft}
              status={status}
              errorMsg={errorMsg}
              onVerify={verifyOtp}
              onResend={() => sendOtp(true)}
              onChangeNumber={changeNumber}
              otpRefs={otpRefs}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}