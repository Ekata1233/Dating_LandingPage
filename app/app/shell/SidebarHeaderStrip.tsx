"use client";

import React from "react";

import type { ActiveSection } from "@/app/context/ActiveSectionContext";
import type { NavItem, NavSlot } from "../config/sections";
import { navSlotFor } from "../config/sections";
import { BRAND, STRIP_ACTIVE } from "../shared/theme";

/* -------------------------------------------------------------------------- */
/*  The pink navigation strip.                                                 */
/*                                                                            */
/*  This is the same component the desktop sidebar renders at the TOP. On the   */
/*  mobile shell it is rendered at the BOTTOM as a fixed bottom navigation bar.  */
/*  Keeping one component for both is what stops the two from drifting apart.  */
/* -------------------------------------------------------------------------- */

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

  /* ------------------------------------------------------------------ */
  /* Top (desktop sidebar header) – unchanged layout                    */
  /* ------------------------------------------------------------------ */
  if (!isBottom) {
    const avatarItem = items.find((item) => item.kind === "avatar");
    const iconItems = items.filter((item) => item.kind === "icon");

    return (
      <div className={`flex flex-row items-center justify-between px-2 min-h-[60px] bg-[#E7477D] ${className}`}>
        {avatarItem && (
          <button
            onClick={() => onSelect(avatarItem.section)}
            className={`
              px-1.5 py-1
              flex gap-2 items-center
              rounded-full
              cursor-pointer
              hover:bg-white
              hover:text-gray-600
              transition
              ${isItemActive(avatarItem) ? "bg-white text-gray-600" : ""}
            `}
          >
            <img
              src={profileAvatar}
              alt="Profile"
              className="object-cover w-7 h-7 rounded-full"
            />

            <span className="text-[12px]">You</span>
          </button>
        )}

        <div className="flex gap-0.5">
          {iconItems.map((item) => {
            if (item.kind !== "icon") return null;

            return (
              <button
                key={item.section}
                onClick={() => onSelect(item.section)}
                title={item.label}
                aria-label={item.label}
                aria-current={isItemActive(item) ? "page" : undefined}
                className={`
                  p-2
                  rounded-full
                  cursor-pointer
                  hover:bg-white
                  hover:text-gray-600
                  transition
                  ${isItemActive(item) ? "bg-white text-gray-600" : ""}
                `}
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
      className={`flex items-stretch w-full bg-[#E7477D] ${
        safeArea ? "pb-[env(safe-area-inset-bottom)]" : ""
      } ${className}`}
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
            className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 min-h-[60px] py-1.5 cursor-pointer"
          >
            {/* Icon / avatar sits in a fixed-size pill so every slot is
                visually identical regardless of its content. */}
            <span
              className={`flex items-center justify-center h-8 w-8 rounded-full transition ${
                isActive
                  ? "bg-white shadow-sm"
                  : "bg-transparent"
              }`}
              style={{ color: isActive ? STRIP_ACTIVE.text : BRAND.white }}
            >
              {item.kind === "avatar" ? (
                <img
                  src={profileAvatar}
                  alt=""
                  className="object-cover w-6 h-6 rounded-full"
                />
              ) : (
                item.icon
              )}
            </span>

            <span
              className={`text-[10px] leading-none font-semibold truncate max-w-full px-1 ${
                isActive ? "text-white" : "text-white/75"
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
