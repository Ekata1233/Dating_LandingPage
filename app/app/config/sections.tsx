/* -------------------------------------------------------------------------- */
/*  /app — section ⇄ URL map and navigation configuration                      */
/*                                                                            */
/*  Single source of truth for three things:                                   */
/*    1. SECTION_PATH / sectionFromPathname — the URL of every section, so the  */
/*       address bar and the rendered view can never disagree.                  */
/*    2. NAV_ITEMS / navSlotFor — the five bottom-nav slots rendered at the top */
/*       of the desktop sidebar and at the bottom of the mobile shell.          */
/*    3. SECTION_META — the per-section chrome of the mobile top bar.          */
/* -------------------------------------------------------------------------- */

import type { ReactNode } from "react";
import { CirclePlay, Heart, House, MessageSquare } from "lucide-react";

/* --------------------------------- routing -------------------------------- */

/** Every destination under /app. One folder, one entry. */
export type ActiveSection =
  | "home"
  | "date-now"
  | "admirer"
  | "chat"
  | "profile"
  | "edit-profile"
  | "refer-earn"
  | "help"
  | "pause-account"
  | "delete-account"
  | "resume-account"
  | "logout";

/** The section /app itself redirects to. */
export const APP_ROOT = "/app";

export const DEFAULT_SECTION: ActiveSection = "home";

export const SECTION_PATH: Record<ActiveSection, string> = {
  home: "/app/home",
  "date-now": "/app/date-now",
  admirer: "/app/admirers",
  chat: "/app/chats",
  profile: "/app/profile",
  "edit-profile": "/app/profile/edit",
  "refer-earn": "/app/profile/refer-earn",
  "help": "/app/profile/help",
  "pause-account": "/app/profile/pause-account",
  "delete-account": "/app/profile/delete-account",
  "resume-account": "/app/profile/resume-account",
  logout: "/app/profile/logout",
};

const SECTION_BY_PATH: Record<string, ActiveSection> = Object.fromEntries(
  (
    Object.entries(SECTION_PATH) as [ActiveSection, string][]
  ).map(([section, path]) => [path, section])
);

/**
 * Resolves the section a pathname belongs to. `/app` itself is Home, and any
 * unknown path under /app falls back to Home rather than rendering nothing.
 */
export function sectionFromPathname(pathname: string): ActiveSection {
  const path = pathname.replace(/\/+$/, "") || APP_ROOT;

  return SECTION_BY_PATH[path] ?? DEFAULT_SECTION;
}

/** The URL that renders a section. */
export const pathForSection = (section: ActiveSection): string =>
  SECTION_PATH[section];

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
  profile: "you",
  "edit-profile": "you",
  "refer-earn": "you",
  "help": "you",
  "pause-account": "you",
  "delete-account": "you",
  "resume-account": "you",
  logout: "you",
};

/** Which slot lights up for a given section. */
export const navSlotFor = (section: ActiveSection): NavSlot =>
  NAV_SLOT_BY_SECTION[section];

/* ------------------------------ section chrome ----------------------------- */

/** Per-section chrome of the mobile top bar. */
export interface SectionMeta {
  /** Omitted on Home, where the wordmark takes the left slot instead. */
  title?: string;
  /** Renders a back chevron that navigates to this section. */
  backTo?: ActiveSection;
}

export const SECTION_META: Record<ActiveSection, SectionMeta> = {
  home: {},
  "date-now": { title: "Date Plans" },
  admirer: { title: "Admirers" },
  chat: { title: "Chats" },
  /* The account sheet this used to open is gone — profile is a full page now. */
  profile: { title: "My Profile" },
  "edit-profile": { title: "Edit Profile", backTo: "profile" },
  "refer-earn": { title: "Refer & Earn", backTo: "profile" },
  help: { title: "Help & Support", backTo: "profile" },
  "pause-account": { title: "Pause Account", backTo: "profile" },
  "delete-account": { title: "Delete Account", backTo: "profile" },
  "resume-account": { title: "Resume Account", backTo: "profile" },
  logout: { title: "Log out", backTo: "profile" },
};
