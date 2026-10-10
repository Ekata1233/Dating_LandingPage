"use client";

/* -------------------------------------------------------------------------- */
/*  The frame every step body sits in.                                          */
/*                                                                            */
/*  Eyebrow / heading / blurb, a scrolling body, and a pinned footer. Because   */
/*  the card is a fixed 4:5, the middle has to be the only thing that scrolls  */
/*  — otherwise a long step pushes the Continue button off the bottom.         */
/* -------------------------------------------------------------------------- */

import { cn } from "cn";
import * as React from "react";

export function StepShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-2">
        {eyebrow && (
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        )}

        <div className="mt-5 space-y-4 pb-2">{children}</div>
      </div>

      {footer && <div className="shrink-0">{footer}</div>}
    </div>
  );
}
