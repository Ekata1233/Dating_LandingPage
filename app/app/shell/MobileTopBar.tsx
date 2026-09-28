"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";

import { BRAND } from "../shared/theme";

/* -------------------------------------------------------------------------- */
/*  Mobile top bar.                                                            */
/*                                                                            */
/*  The section title, an optional back chevron and one contextual action. The  */
/*  wordmark takes the left slot on Home so the bar matches the desktop header  */
/*  rhythm.                                                                    */
/* -------------------------------------------------------------------------- */

export interface MobileTopBarProps {
  /** Omitted on Home, where the wordmark is shown instead. */
  title?: string;
  /** Renders a back chevron that calls onBack. */
  onBack?: () => void;
  /** Extra buttons rendered at the far right. */
  actions?: React.ReactNode;
  /** Merged onto the root element, so the shell can hide it on desktop. */
  className?: string;
}

const MobileTopBar: React.FC<MobileTopBarProps> = ({
  title,
  onBack,
  actions,
  className = "",
}) => {
  return (
    <header
      className={`shrink-0 z-30 bg-white/95 backdrop-blur-md border-b ${className}`}
      style={{ borderColor: BRAND.border }}
    >
      <div
        className="flex items-center gap-2 h-12 px-3"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="shrink-0 -ml-1 w-9 h-9 flex items-center justify-center rounded-full active:bg-black/5"
            style={{ color: BRAND.ink }}
          >
            <ChevronLeft size={22} />
          </button>
        ) : (
          <div></div>
        )}

        <h1
          className="flex-1 min-w-0 text-[17px] font-extrabold truncate"
          style={{ color: BRAND.ink }}
        >
          {title}
        </h1>

        <div className="shrink-0 flex items-center gap-1">{actions}</div>
      </div>
    </header>
  );
};

export default MobileTopBar;
