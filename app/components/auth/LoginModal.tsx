
"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  isValidPhoneNumber,
} from "react-phone-number-input";

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

import { createSession } from "@/lib/sessions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// =====================================================
// PROPS
// =====================================================

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  redirectTo?: string | null;
}

// =====================================================
// COMPONENT
// =====================================================

export default function LoginModal({
  open,
  onClose,
  onSuccess,
  redirectTo,
}: LoginModalProps) {
  const router = useRouter();

  // =====================================================
  // STATES
  // =====================================================

  const [step, setStep] = useState<1 | 2>(1);

  // Full international phone number:
  // +918888911479, +355691234567, etc.
  const [phone, setPhone] = useState("");

  const [otp, setOtp] = useState<string[]>(
    Array(OTP_LENGTH).fill(""),
  );

  const [secondsLeft, setSecondsLeft] =
    useState(0);

  const [status, setStatus] =
    useState<Status>("idle");

  const [errorMsg, setErrorMsg] =
    useState("");

  const [mounted, setMounted] =
    useState(false);

  const phoneRef =
    useRef<HTMLInputElement>(null);

  const otpRefs =
    useRef<Array<HTMLInputElement | null>>([]);

  const requestInProgress = useRef(false);

  // =====================================================
  // CLIENT MOUNT
  // =====================================================

  useEffect(() => {
    setMounted(true);
  }, []);

  // =====================================================
  // MODAL KEYBOARD + SCROLL
  // =====================================================

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      onKey,
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const focusTimer = setTimeout(() => {
      phoneRef.current?.focus();
    }, 50);

    return () => {
      document.removeEventListener(
        "keydown",
        onKey,
      );

      document.body.style.overflow =
        previousOverflow;

      clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  // =====================================================
  // RESET WHEN MODAL CLOSES
  // =====================================================

  useEffect(() => {
    if (open) return;

    setStep(1);
    setPhone("");
    setOtp(Array(OTP_LENGTH).fill(""));
    setSecondsLeft(0);
    setStatus("idle");
    setErrorMsg("");
  }, [open]);

  // =====================================================
  // RESEND COUNTDOWN
  // =====================================================

  useEffect(() => {
    if (!open || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((previous) =>
        Math.max(0, previous - 1),
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [open, secondsLeft]);

  // =====================================================
  // ERROR HANDLER
  // =====================================================

  const fail = (message: string) => {
    setStatus("error");
    setErrorMsg(message);
  };

  // =====================================================
  // VALIDATE INTERNATIONAL PHONE
  // =====================================================

  const validatePhone = (): boolean => {
    if (!phone) {
      fail(
        "Please enter your mobile number.",
      );
      return false;
    }

    if (!isValidPhoneNumber(phone)) {
      fail(
        "Please enter a valid mobile number with country code.",
      );
      return false;
    }

    return true;
  };

  // =====================================================
  // SEND OTP / RESEND OTP
  // =====================================================

  const sendOtp = async (
    isResend = false,
  ) => {
    if (requestInProgress.current) return;

    if (!validatePhone()) return;

    if (
      isResend &&
      secondsLeft > 0
    ) {
      return;
    }

    requestInProgress.current = true;

    setStatus("sending");
    setErrorMsg("");

    const onOk = () => {
      setStatus("idle");
      setStep(2);
      setSecondsLeft(RESEND_SECONDS);

      if (isResend) {
        setOtp(
          Array(OTP_LENGTH).fill(""),
        );
      }

      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 60);
    };

    if (MOCK_MODE) {
      setTimeout(() => {
        onOk();
        requestInProgress.current = false;
      }, 400);

      return;
    }

    try {
      // Backend expects complete international number
      const response = await fetch(
        LOGIN_SEND_OTP,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            phoneNumber: phone,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (
        !response.ok ||
        data?.success === false
      ) {
        const message =
          data?.message ||
          "Couldn't send OTP. Please try again.";

        toast.error(message);
        fail(message);
        return;
      }

      toast.success(
        data?.message ||
        "OTP sent successfully!",
      );

      onOk();
    } catch (error) {
      console.error(
        "Send OTP Error:",
        error,
      );

      const message =
        "Network error. Unable to send OTP.";

      toast.error(message);
      fail(message);
    } finally {
      requestInProgress.current = false;
    }
  };

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const verifyOtp = async () => {
    if (requestInProgress.current) return;

    const code = otp.join("");

    if (
      code.length !== OTP_LENGTH ||
      !/^\d+$/.test(code)
    ) {
      fail(
        `Please enter the full ${OTP_LENGTH}-digit OTP.`,
      );
      return;
    }

    if (!validatePhone()) return;

    requestInProgress.current = true;

    setStatus("sending");
    setErrorMsg("");

    if (MOCK_MODE) {
      setTimeout(() => {
        requestInProgress.current = false;
        setStatus("idle");
        onSuccess?.();
        onClose();
      }, 400);

      return;
    }

    try {
      const response = await fetch(
        LOGIN_VERIFY_OTP,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            phoneNumber: phone,
            otp: code,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => ({}));

      // =====================================
      // API ERROR
      // =====================================

      if (
        !response.ok ||
        data?.success === false
      ) {
        const message =
          data?.message ||
          data?.error ||
          "OTP verification failed.";

        toast.error(message);
        fail(message);
        return;
      }

      // =====================================
      // EXTRACT RESPONSE
      // =====================================

      const result = data?.data;

      const token = result?.token;

      const isRegister =
        result?.is_register === true;

      // =====================================
      // TOKEN VALIDATION
      // =====================================

      if (
        !token ||
        typeof token !== "string"
      ) {
        const message =
          "Login failed. Authentication token missing.";

        toast.error(message);
        fail(message);
        return;
      }

      // =====================================
      // CREATE SESSION
      // =====================================

      await createSession(token);

      toast.success(
        data?.message ||
        "Logged in successfully!",
      );

      // =====================================
      // REDIRECT
      // =====================================

      if (isRegister) {
        router.push("/onBoarding");
      } else if (
        redirectTo &&
        redirectTo.startsWith("/app") &&
        !redirectTo.startsWith("//")
      ) {
        router.push(redirectTo);
      } else {
        router.push("/app");
      }

      setStatus("idle");

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(
        "Verify OTP Error:",
        error,
      );

      const message =
        "Unable to complete login. Please try again.";

      toast.error(message);
      fail(message);
    } finally {
      requestInProgress.current = false;
    }
  };

  // =====================================================
  // CHANGE PHONE NUMBER
  // =====================================================

  const changeNumber = () => {
    if (requestInProgress.current) return;

    setStep(1);

    setOtp(
      Array(OTP_LENGTH).fill(""),
    );

    setSecondsLeft(0);
    setStatus("idle");
    setErrorMsg("");

    setTimeout(() => {
      phoneRef.current?.focus();
    }, 50);
  };

  // =====================================================
  // PORTAL GUARD
  // =====================================================

  if (!open || !mounted) {
    return null;
  }

  // =====================================================
  // JSX
  // =====================================================

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4 text-[10px]"
      role="dialog"
      aria-modal="true"
      aria-label="Log in"
    >
      {/* BACKDROP */}

      <div
        className="fixed inset-0 bg-[#2B2A28]/35 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* MODAL */}

      <div
        className="relative my-auto w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(43,42,40,0.25)]"
      >
        {/* HEADER */}

        <div
          className="flex items-center justify-between px-10 pt-8"
          style={{
            borderColor: C.border,
          }}
        >
          {/* LOGO */}

          <div className="flex flex-row items-center justify-center gap-2">
            <span className="h-8">
              <img
                src="/logo2.png"
                alt="Welvors"
                className="h-full w-full object-cover"
              />
            </span>
          </div>

          {/* CLOSE */}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-colors hover:bg-[#FCF8F4]"
            style={{
              borderColor: C.border,
              color: C.headingDark,
            }}
          >
            <Icon.Close />
          </button>

          {/* MOCK MODE */}

          {MOCK_MODE && (
            <span
              className="rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: "#FDE8C8",
                color: "#8A5A00",
              }}
            >
              Demo mode
            </span>
          )}
        </div>

        {/* BODY */}

        <div className="px-6 py-6 sm:px-8 sm:py-7">
          {step === 1 ? (
            <LoginPhone
              phone={phone}
              setPhone={setPhone}
              status={status}
              errorMsg={errorMsg}
              onSendOtp={sendOtp}
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
              onResend={() =>
                sendOtp(true)
              }
              onChangeNumber={changeNumber}
              otpRefs={otpRefs}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
