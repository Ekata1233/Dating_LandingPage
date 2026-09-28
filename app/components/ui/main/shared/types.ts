/* -------------------------------------------------------------------------- */
/*  Shared domain types for the /app experience.                              */
/*                                                                            */
/*  Everything the UI needs to render is described here so that mock data and  */
/*  future API payloads are interchangeable. Components accept these shapes    */
/*  through props; no component reaches for a global store.                   */
/* -------------------------------------------------------------------------- */

import type { AdmirerReciveCardProps } from "@/app/components/ui/AdmirerReciveCard";
import type { AdmirerSentCardProps } from "@/app/components/ui/AdmirerSentCard";
import type {
  Conversation,
  FilterTab,
} from "@/app/components/ui/main/ChatSideBar";
import type {
  ChatMessage,
  ChatTab,
} from "@/app/components/ui/main/ChatMain";

/* --------------------------------- profile --------------------------------- */

/** A single label / icon / value fact shown in the profile detail panels. */
export interface ProfileFact {
  label: string;
  icon: string;
  value: string;
  /** Optional second line, used by the lifestyle / interest answers. */
  description?: string;
}

/**
 * A person shown on a card. The same shape backs the discovery feed and the
 * logged-in user's own profile, so both screens can share one renderer.
 */
export interface Profile {
  id: string;
  name: string;
  age: number;
  image: string;
  gallery: string[];
  distance: string;
  birth_date:string;
  height: string;
  location: string;
  lookingFor: string;
  religion: string;
  occupation: string;
  education: string;
  bio: string;
  about: string;
  interests: ProfileFact[];
  career: ProfileFact[];
  lifestyle: ProfileFact[];

  /* ------------------------------------------------------------------ */
  /* Live-feed signals. Populated from the discover API; optional so the */
  /* seeded mocks do not have to invent values for them.                  */
  /* ------------------------------------------------------------------ */
  isOnline?: boolean;
  /** Human-readable presence, e.g. "Inactive" / "Active 2h ago". */
  lastSeen?: string;
  /** e.g. "5 m reply" */
  replyTime?: string;
  /** 0-100 trust score. */
  trust?: number;
  matchScore?: number;
  compatibilityScore?: number;
  isBoosted?: boolean;

  /* ------------------------------------------------------------------ */
  /* Deep-profile signals. Only present once                              */
  /* `GET /api/user/feed/details/:userId` has resolved for this user, so    */
  /* every scalar here is optional.                                        */
  /* ------------------------------------------------------------------ */
  gender?: string;
  community?: string;
  motherTongue?: string;
  area?: string;
  zodiac?: string;
  communicationStyle?: string;
  loveLanguage?: string;
  /** Sub-line under `lookingFor`, e.g. "Ready to settle down…". */
  lookingForSubtitle?: string;
  /** Free-text Q&A the profile owner filled in. */
  prompts: ProfileFact[];
  family: ProfileFact[];
  networking: ProfileFact[];
  /** True once the details request has resolved for this user. */
  detailsLoaded?: boolean;
}

/* ---------------------------------- wallet --------------------------------- */

export interface BalanceItem {
  label: string;
  value: string;
  bg: string;
  emoji: string;
}

export interface DatePlansSummary {
  /** Card title, e.g. "Date Plans" */
  title: string;
  /** Subtitle / description line */
  subtitle: string;
  /** The count shown on the right, e.g. 93 */
  count: number;
  /** Label under the count, e.g. "left" */
  countLabel?: string;
}

/* ---------------------------------- plans ---------------------------------- */

/**
 * A subscription tier. The three plan cards differ only in their accent
 * colours, so the visual treatment stays in the card and the content lives here.
 */
export interface Plan {
  /** Stable key used for analytics / checkout calls. */
  id: "premium-plus" | "vip" | "vip-elite";
  name: string;
  price: string;
  period: string;
  /** Small pill next to the name, e.g. "POPULAR" / "INVITE". */
  badge?: string;
  features: string[];
  /** Label of the call-to-action button. */
  cta: string;
  /** "light" cards are white, "dark" cards are near-black. */
  theme: "light" | "dark";
}

/* --------------------------------- admirers -------------------------------- */

/** A person who liked the logged-in user. Revealed entries cost coins. */
export type AdmirerReceived = AdmirerReciveCardProps;

/** A person the logged-in user liked, tracked through the match funnel. */
export type AdmirerSent = AdmirerSentCardProps;

/* ------------------------------- date plans -------------------------------- */

export type DateAvailability = "today" | "tomorrow" | "weekend";

export type DateType = "all-events" | "coffee" | "dinner" | "drinks";

export interface FilterOption<T extends string> {
  value: T;
  label: string;
}

/* ---------------------------------- chat ----------------------------------- */

export type { Conversation, FilterTab, ChatMessage, ChatTab };

/* --------------------------------- profile --------------------------------- */

/** The logged-in user's own profile summary. */
export interface MyProfile {
  avatarUrl: string;
  name: string;
  age: number;
  verified: boolean;
  location: string;
  isPlatinumMember: boolean;
  trustScore: number;
  completionPercent: number;
}

/* ---------------------------------- misc ----------------------------------- */

/**
 * Every action a card can raise. Keeping them as one bag makes it easy to hand
 * the whole surface to a mutation layer later without touching the JSX.
 */
export interface SwipeHandlers {
  onSwipe?: (profileId: string, direction: "left" | "right" | "up") => void;
  onRewind?: () => void;
  onOpenProfile?: (profileId: string) => void;
}
