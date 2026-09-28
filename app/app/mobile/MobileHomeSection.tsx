"use client";

import React from "react";

import HomeMain from "../HomeMain";
import type { Profile } from "../shared/types";

/* -------------------------------------------------------------------------- */
/*  Home – the discovery card at full bleed with its floating action row.       */
/*  The Wallet / Plans panel lives in the shell's bottom sheet, reached from    */
/*  the top-bar pill.                                                          */
/* -------------------------------------------------------------------------- */

export interface MobileHomeSectionProps {
  /** Leave unset to use the live discover feed. */
  profiles?: Profile[];
  onSwipe?: (profileId: string, direction: "left" | "right" | "up") => void;
  onBoost?: () => void;
}

const MobileHomeSection: React.FC<MobileHomeSectionProps> = ({
  profiles,
  onSwipe,
  onBoost,
}) => (
  <HomeMain fluid profiles={profiles} onSwipe={onSwipe} onBoost={onBoost} />
);

export default MobileHomeSection;
