"use client";

import React from "react";

import DateNowMain from "../desktop/DateNowMain";
import DateNowSidebar from "../panels/DateNowSidebar";
import { BRAND } from "../shared/theme";
import type { DateAvailability, DateType } from "../shared/types";

/* -------------------------------------------------------------------------- */
/*  Date Plans – the filter row is pinned above a snap-scrolling card stack.    */
/*  This is the control the desktop sidebar used to own.                        */
/* -------------------------------------------------------------------------- */

export interface MobileDateNowSectionProps {
  /** Leave undefined to let the filter row own its own state. */
  availability?: DateAvailability;
  dateType?: DateType;
  onAvailabilityChange?: (value: DateAvailability) => void;
  onDateTypeChange?: (value: DateType) => void;
  /** How many plan cards to show. */
  count?: number;
}

const MobileDateNowSection: React.FC<MobileDateNowSectionProps> = ({
  availability,
  dateType,
  onAvailabilityChange,
  onDateTypeChange,
  count = 3,
}) => (
  <div className="flex flex-col h-full w-full min-h-0" style={{ background: BRAND.white }}>
    <div
      className="shrink-0 overflow-x-auto"
      style={{
        borderBottom: `1px solid ${BRAND.border}`,
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <DateNowSidebar
        showHeader={true}
        layout="inline"
        availability={availability}
        dateType={dateType}
        onAvailabilityChange={onAvailabilityChange}
        onDateTypeChange={onDateTypeChange}
      />
    </div>

    <div className="flex-1 min-h-0">
      <DateNowMain fluid count={count} />
    </div>
  </div>
);

export default MobileDateNowSection;
