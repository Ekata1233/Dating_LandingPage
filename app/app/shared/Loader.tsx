"use client";

import React from "react";
import { MoonLoader } from "react-spinners";

import { BRAND } from "./theme";

/* -------------------------------------------------------------------------- */
/*  Loading / empty states.                                                     */
/*                                                                            */
/*  The /app screens used to fall back to seeded mock profiles so a frame was   */
/*  never blank. That hid two different problems behind one happy path — a slow */
/*  request and an empty result — so the profile surfaces now say which of the  */
/*  two they are in.                                                           */
/*                                                                            */
/*  The spinner is `react-spinners`, matching the one already used on /events.  */
/* -------------------------------------------------------------------------- */

export interface LoaderProps {
  /** Headline, e.g. "Loading your profile…". */
  label?: string;
  /** Supporting line under the headline. */
  hint?: string;
  className?: string;
}

/** Spinner plus a caption. Used while a request is in flight. */
export const Loader: React.FC<LoaderProps> = ({
  label = "Loading…",
  hint,
  className = "",
}) => (
  <div
    className={`flex h-full w-full flex-col items-center justify-center gap-3 px-8 text-center ${className}`}
  >
    <MoonLoader
      color={BRAND.pinkDeep}
      size={25}
      speedMultiplier={1}
      aria-label={label}
    />
    <div>
      <p className="text-[14px] font-semibold" style={{ color: BRAND.ink }}>
        {label}
      </p>
      {hint && (
        <p className="mt-1 text-[12px]" style={{ color: BRAND.muted }}>
          {hint}
        </p>
      )}
    </div>
  </div>
);

export interface NoticeProps {
  title: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Terminal state: the request failed, or came back with nothing to show. The
 * retry is optional because an empty feed has nothing to retry.
 */
export const Notice: React.FC<NoticeProps> = ({
  title,
  detail,
  actionLabel,
  onAction,
  className = "",
}) => (
  <div
    className={`flex h-full w-full flex-col items-center justify-center gap-3 px-8 text-center ${className}`}
  >
    <div>
      <p className="text-[15px] font-semibold" style={{ color: BRAND.ink }}>
        {title}
      </p>
      {detail && (
        <p className="mt-1 text-[12px]" style={{ color: BRAND.muted }}>
          {detail}
        </p>
      )}
    </div>

    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="rounded-full px-5 py-2 text-[13px] font-bold active:opacity-80"
        style={{ background: BRAND.pinkSoft, color: BRAND.pinkDeep }}
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export interface SkeletonProps {
  className?: string;
}

/** One rounded placeholder block. Compose these to sketch a layout. */
export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-xl bg-[#F1EFEC] ${className}`}
    aria-hidden
  />
);
