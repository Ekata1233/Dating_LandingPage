"use client";

import React, { type ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*  The two halves of one screen.                                             */
/*                                                                            */
/*  Every route renders a desktop view and a mobile view of the same section.  */
/*  Both are mounted once, in the same DOM position, and the breakpoint is    */
/*  decided purely by CSS — so resizing swaps views without remounting.        */
/*                                                                            */
/*  The wrappers reproduce the slots the two shells used to provide:           */
/*    · desktop — the flex item that sits beside the rail in the shell's row   */
/*    · mobile  — the scrolling slot below the top bar, above the bottom nav   */
/* -------------------------------------------------------------------------- */

export interface ScreenProps {
  /** Wide-viewport view. */
  desktop: ReactNode;
  /** Narrow-viewport view. */
  mobile: ReactNode;
}

const Screen: React.FC<ScreenProps> = ({ desktop, mobile }) => {
  return (
    <>
      <div className="hidden md:flex flex-1">{desktop}</div>
      <div className="flex-1 min-h-0 relative overflow-hidden md:hidden">
        {mobile}
      </div>
    </>
  );
};

export default Screen;
