"use client";

import React from "react";
import AnimatedBorder from "./AnimatedBorder";

/**
 * Wrapper that places an AnimatedBorder at the boundary between two sections.
 * Use between DownloadAppFeature ↔ WhyWelvors and VerifiedCommunity ↔ WhatMembersSee.
 */
export default function SectionBorder({ seed }: { seed: number }) {
  return (
    <div className="relative w-full h-0 z-10">
      <AnimatedBorder seed={seed} count={12} />
    </div>
  );
}
