"use client";

import React from "react";

import type { ActiveSection } from "@/app/context/ActiveSectionContext";
import type { NavItem, NavSlot } from "../config/sections";
import { navSlotFor } from "../config/sections";

/* -------------------------------------------------------------------------- */
/*  The pink navigation strip.                                                 */
/*                                                                            */
/*  This is the same component the desktop sidebar renders at the TOP. On the   */
/*  mobile shell it is rendered at the BOTTOM as a fixed bottom navigation bar.  */
/*  Keeping one component for both is what stops the two from drifting apart.  */
/* -------------------------------------------------------------------------- */

/* Theme tokens for the strip. Move these into ../shared/theme if you want
   them shared with the rest of the app. */
const STRIP = {
  /** Same gradient as the rest of the app theme. */
  gradient: "linear-gradient(135deg, #F26FA6 0%, #E11D63 100%)",
  /** Icon / label colour on the white "active" pill. #E11D63 on white is ~4.6:1. */
  activeText: "#E11D63",
  /** Icon / label colour on the gradient. */
  inactiveText: "#FFFFFF",
} as const;

export interface SidebarHeaderStripProps {
  /** "top" = desktop sidebar header. "bottom" = mobile fixed bottom nav. */
  variant: "top" | "bottom";
  items: NavItem[];
  /** Which slot is currently active. */
  activeNav: NavSlot;
  onSelect: (section: ActiveSection) => void;
  profileAvatar: string;
  /** Safe-area padding for the bottom variant. Defaults to true. */
  safeArea?: boolean;
  /** Merged onto the root element, so the shell can hide one variant. */
  className?: string;
}

const SidebarHeaderStrip: React.FC<SidebarHeaderStripProps> = ({
  variant,
  items,
  activeNav,
  onSelect,
  profileAvatar,
  safeArea = true,
  className = "",
}) => {
  const isBottom = variant === "bottom";

  /* A nav item points at an ActiveSection, but the highlight is driven by a
     NavSlot. The two agree for most items and differ for the profile avatar
     (section "profile" -> slot "you"), so always compare slots. */
  const isItemActive = (item: NavItem) => navSlotFor(item.section) === activeNav;

  /* Shared focus ring so keyboard users can see where they are on the gradient. */
  const focusRing =
    "outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#E11D63]";

  /* ------------------------------------------------------------------ */
  /* Top (desktop sidebar header) – unchanged layout                    */
  /* ------------------------------------------------------------------ */
  if (!isBottom) {
    const avatarItem = items.find((item) => item.kind === "avatar");
    const iconItems = items.filter((item) => item.kind === "icon");

    return (
      <div
        className={`flex flex-row items-center justify-between px-2 shrink-0 h-[10vh] ${className}`}
        style={{ containerType: "size", background: STRIP.gradient }}
      >
        {avatarItem && (
          <button
            type="button"
            onClick={() => onSelect(avatarItem.section)}
            aria-current={isItemActive(avatarItem) ? "page" : undefined}
            className={`
              px-1.5 py-1
              flex gap-2 items-center
              rounded-full
              cursor-pointer
              transition
              ${focusRing}
              ${
                isItemActive(avatarItem)
                  ? "bg-white shadow-sm"
                  : "text-white hover:bg-white/20"
              }
            `}
            style={
              isItemActive(avatarItem) ? { color: STRIP.activeText } : undefined
            }
          >
            <img
              src={profileAvatar}
              alt="Profile"
              className="object-cover w-[47cqh] h-[47cqh] rounded-full"
            />

            <span className="text-[20cqh] font-semibold">You</span>
          </button>
        )}

        <div className="flex gap-0.5">
          {iconItems.map((item) => {
            if (item.kind !== "icon") return null;
            const active = isItemActive(item);

            return (
              <button
                key={item.section}
                type="button"
                onClick={() => onSelect(item.section)}
                title={item.label}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={`
                  p-2
                  rounded-full
                  cursor-pointer
                  transition
                  [&_svg]:w-[33cqh] [&_svg]:h-[33cqh]
                  ${focusRing}
                  ${active ? "bg-white shadow-sm" : "text-white hover:bg-white/20"}
                `}
                style={active ? { color: STRIP.activeText } : undefined}
              >
                {item.icon}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Bottom (mobile fixed bottom navigation)                              */
  /*                                                                   */
  /* Every slot is `flex-1`, so all five slots are exactly the same      */
  /* width and the gaps between them are identical no matter how large   */
  /* the icon or label inside each one renders.                          */
  /* ------------------------------------------------------------------ */
  return (
    <div
      className={`flex items-stretch w-full border-t border-white/25 shadow-[0_-4px_16px_rgba(225,29,99,0.25)] ${
        safeArea ? "pb-[env(safe-area-inset-bottom)]" : ""
      } ${className}`}
      style={{ background: STRIP.gradient }}
    >
      {items.map((item) => {
        const isActive = isItemActive(item);

        return (
          <button
            key={item.section}
            type="button"
            onClick={() => onSelect(item.section)}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1 min-h-[60px] py-1.5 cursor-pointer ${focusRing}`}
          >
            {/* Icon / avatar sits in a fixed-size pill so every slot is
                visually identical regardless of its content. */}
            <span
              className={`flex items-center justify-center h-8 w-8 rounded-full transition ${
                isActive ? "bg-white shadow-sm" : "bg-transparent"
              }`}
              style={{ color: isActive ? STRIP.activeText : STRIP.inactiveText }}
            >
              {item.kind === "avatar" ? (
                <img
                  src={profileAvatar}
                  alt=""
                  className={`object-cover w-6 h-6 rounded-full ${
                    isActive ? "" : "ring-1 ring-white/70"
                  }`}
                />
              ) : (
                item.icon
              )}
            </span>

            {/* Full-white labels: white/75 on the light end of the gradient
                (#F26FA6) is too faint to read. Weight marks the active slot. */}
            <span
              className={`text-[10px] leading-none truncate max-w-full px-1 text-white ${
                isActive ? "font-bold" : "font-medium text-white/90"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SidebarHeaderStrip;
