/* -------------------------------------------------------------------------- */
/*  /app — route configuration                                                  */
/*                                                                            */
/*  Single source of truth for the navigation strip (which is rendered at the   */
/*  top of the desktop sidebar and at the bottom of the mobile shell) and for  */
/*  the per-section chrome of the mobile top bar.                               */
/* -------------------------------------------------------------------------- */

import type { ReactNode } from "react";
import { CirclePlay, Heart, House, MessageSquare } from "lucide-react";

import type { ActiveSection } from "../context/ActiveSectionContext";

/* ------------------------------- navigation -------------------------------- */

/** The five bottom-nav slots. "you" always renders the profile avatar. */
export type NavSlot = "you" | "home" | "date-now" | "admirer" | "chat";

interface NavItemBase {
  section: ActiveSection;
  label: string;
}

export interface NavIconItem extends NavItemBase {
  kind: "icon";
  icon: ReactNode;
}

export interface NavAvatarItem extends NavItemBase {
  kind: "avatar";
}

export type NavItem = NavIconItem | NavAvatarItem;

/**
 * Order matters: the strip is laid out as five equal slots, so the avatar
 * leads and the four feature tabs follow.
 */
export const NAV_ITEMS: NavItem[] = [
  { kind: "avatar", section: "profile", label: "You" },
  { kind: "icon", section: "home", label: "Home", icon: <House size={18} /> },
  {
    kind: "icon",
    section: "date-now",
    label: "Date Now",
    icon: <CirclePlay size={20} />,
  },
  {
    kind: "icon",
    section: "admirer",
    label: "Admirers",
    icon: <Heart size={20} />,
  },
  {
    kind: "icon",
    section: "chat",
    label: "Chats",
    icon: <MessageSquare size={18} />,
  },
];

export const NAV_SLOT_BY_SECTION: Record<ActiveSection, NavSlot> = {
  home: "home",
  "date-now": "date-now",
  admirer: "admirer",
  chat: "chat",
  plans: "home",
  profile: "you",
  "edit-profile": "you",
  "refer-earn": "you",
  help: "you",
  logout: "you",
};

/** Which slot lights up for a given section. */
export const navSlotFor = (section: ActiveSection): NavSlot =>
  NAV_SLOT_BY_SECTION[section];

/* ------------------------------ section chrome ----------------------------- */

/** Buttons that can appear on the right of the mobile top bar. */
export type TopAction = "wallet" | "menu" | "none";

export interface SectionMeta {
  /** Omitted on Home, where the wordmark takes the left slot instead. */
  title?: string;
  /** Slot that stays highlighted in the bottom nav. */
  navSlot: NavSlot;
  /** Renders a back chevron that navigates to this section. */
  backTo?: ActiveSection;
  topAction: TopAction;
}

export const SECTION_META: Record<ActiveSection, SectionMeta> = {
  home: { navSlot: "home", topAction: "none" },
  "date-now": { title: "Date Plans", navSlot: "date-now", topAction: "none" },
  admirer: { title: "Admirers", navSlot: "admirer", topAction: "none" },
  plans: { title: "Plans", navSlot: "home", backTo: "home", topAction: "none" },
  chat: { title: "Chats", navSlot: "chat", topAction: "none" },
  /* The account sheet this used to open is gone — profile is a full page now. */
  profile: { title: "My Profile", navSlot: "you", topAction: "none" },
  "edit-profile": {
    title: "Edit Profile",
    navSlot: "you",
    backTo: "profile",
    topAction: "none",
  },
  "refer-earn": {
    title: "Refer & Earn",
    navSlot: "you",
    backTo: "profile",
    topAction: "none",
  },
  help: {
    title: "Help & Support",
    navSlot: "you",
    backTo: "profile",
    topAction: "none",
  },
  logout: {
    title: "Log out",
    navSlot: "you",
    backTo: "profile",
    topAction: "none",
  },
};
