// WaitlistModal.tsx (updated — step 4 & 5 removed)
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  C,
  Icon,
  TOTAL_STEPS,
} from "./waitlistConfig";
import StepVerify from "./steps/StepVerify";
import StepProfile from "./steps/StepProfile";
import StepPlan from "./steps/StepPlan";
// ⬅ REMOVED: StepPayment, StepDone imports
import { useWaitlist, WaitlistProvider } from "../context/WaitlistContext";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
}

function WaitlistModalContent({ open, onClose }: WaitlistModalProps) {
  const {
    step,
    setStep,
    status,
    errorMsg,
    resetAll,
    phoneRef,
    profile,
    plan,
    setPlan,
    onConfirmPlan,
    // ⬅ REMOVED: payMethod/upiId/card/spotNumber/onPayNow etc. (ab use nahi hote)
  } = useWaitlist();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => cancelAnimationFrame(id);
  }, []);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      resetAll();
    }
  }, [open, resetAll]);

  // Keyboard and body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => phoneRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [open, onClose, phoneRef]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Join the waitlist"
    >
      <div
        className="fixed inset-0 bg-[#2B2A28]/35 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative my-auto w-full max-w-[520px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_rgba(43,42,40,0.25)]">
        {/* --- Top bar --- */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: C.border }}
        >
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const isDone = i < step;
              return (
                <span
                  key={i}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: isDone ? 26 : 6,
                    backgroundColor: isDone ? C.pink : C.dotIdle,
                  }}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full border transition-colors hover:bg-[#FCF8F4]"
              style={{ borderColor: C.border, color: C.headingDark }}
            >
              <Icon.Close />
            </button>
          </div>
        </div>

        {/* --- Body --- */}
        <div className="px-6 py-6 sm:px-8 sm:py-7">
          {step === 1 && <StepVerify />}

          {step === 2 && <StepProfile />}

          {step === 3 && (
            <StepPlan
              fullName={profile.fullName}
              plan={plan}
              setPlan={setPlan}
              status={status}
              errorMsg={errorMsg}
              onBack={() => setStep(2)}
              onConfirm={onConfirmPlan}
            />
          )}
          {/* ⬅ REMOVED: step === 4 (StepPayment) aur step >= 5 (StepDone) blocks */}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  return (
    <WaitlistProvider>
      <WaitlistModalContent open={open} onClose={onClose} />
    </WaitlistProvider>
  );
}