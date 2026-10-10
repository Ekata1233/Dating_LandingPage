"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

import { BRAND } from "../shared/theme";

/* -------------------------------------------------------------------------- */
/*  Bottom sheet.                                                              */
/*                                                                            */
/*  Used for the content that lives in the desktop sidebar but has no place in  */
/*  a mobile tab: the Wallet / Plans panel and the profile account rows.        */
/* -------------------------------------------------------------------------- */

export interface MobileSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Merged onto the root element, so the shell can hide it on desktop. */
  className?: string;
}

const MobileSheet: React.FC<MobileSheetProps> = ({
  open,
  onClose,
  title,
  children,
  className = "",
}) => {
  /* Lock the body behind the scrim so the page does not scroll under it. */
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end ${className}`}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-black/45"
      />

      <div
        className="relative w-full bg-white rounded-t-3xl overflow-hidden flex flex-col"
        style={{
          maxHeight: "85dvh",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div
          className="relative shrink-0 flex items-center justify-between px-4 pt-3 pb-2"
          style={{ borderBottom: `1px solid ${BRAND.border}` }}
        >
          <span
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 top-1.5 w-10 h-1 rounded-full"
            style={{ background: BRAND.border }}
          />

          <h2 className="text-[16px] font-extrabold" style={{ color: BRAND.ink }}>
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 -mr-1 flex items-center justify-center rounded-full active:bg-black/5"
            style={{ color: BRAND.muted }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
};

export default MobileSheet;
