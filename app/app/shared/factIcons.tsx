/* -------------------------------------------------------------------------- */
/*  Fact icon registry                                                         */
/*                                                                            */
/*  `ProfileFact.icon` is a string so the mappers (`mapUser.ts`, `mockData.ts`) */
/*  stay free of JSX. This module is the one place that turns that string into  */
/*  a rendered glyph, so a fact never loses its icon because a lookup table     */
/*  forgot an entry.                                                           */
/*                                                                            */
/*  Adding a fact:  1. add the lucide import below                             */
/*                  2. add `Name: Name,` to ICONS                              */
/*                  3. use it: `icon: "Name"` in the mapper                     */
/*  Names that are still unknown fall back to a neutral dot rather than        */
/*  collapsing the row's layout, so a missing entry is visible, not silent.     */
/* -------------------------------------------------------------------------- */

import React from "react";
import {
  Activity,
  Bike,
  BookOpen,
  Briefcase,
  Building2,
  Cigarette,
  Clock,
  Coffee,
  Compass,
  Dog,
  Dumbbell,
  Film,
  Fish,
  Gamepad2,
  Globe,
  GraduationCap,
  Heart,
  Home,
  Leaf,
  MapPin,
  MessageCircle,
  MessageSquare,
  MessageSquareQuote,
  Moon,
  Mountain,
  Music,
  Network,
  Palette,
  PawPrint,
  Plane,
  Quote,
  Ruler,
  Sailboat,
  School,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
  Tent,
  Trophy,
  User,
  UserCheck,
  Users,
  Utensils,
  Wallet,
  Wine,
  type LucideIcon,
} from "lucide-react";

/** Every icon name a `ProfileFact` may carry, in one lookup. */
const ICONS: Record<string, LucideIcon> = {
  /* ----------------------------- lifestyle ------------------------------- */
  Activity,
  Bike,
  Cigarette,
  Coffee,
  Compass,
  Dog,
  Dumbbell,
  Leaf,
  MessageCircle,
  Moon,
  Mountain,
  PawPrint,
  Plane,
  Quote,
  Sun,
  Tent,
  Trophy,
  Utensils,
  Wine,

  /* ----------------------------- interests ------------------------------ */
  BookOpen,
  Film,
  Fish,
  Gamepad2,
  Globe,
  Music,
  Palette,
  Sailboat,

  /* ------------------------------ career -------------------------------- */
  Briefcase,
  Building2,
  Clock,
  GraduationCap,
  MapPin,
  Ruler,
  School,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  Wallet,

  /* ------------------------- family / networking ------------------------ */
  Heart,
  Home,
  Network,
  User,
  Users,

  /* ------------------------------ prompts ------------------------------- */
  MessageSquare,
  MessageSquareQuote,
  Star,
};

/** Shown for any name that is not registered above. */
const FALLBACK_ICON: LucideIcon = Star;

/**
 * Resolves a fact's icon name to a component, or `null` when the name is blank
 * (so a fact with no icon at all renders without a reserved gap).
 */
export function getFactIcon(name: string | null | undefined): LucideIcon | null {
  if (!name) return null;
  return ICONS[name] ?? FALLBACK_ICON;
}

export interface FactIconProps {
  /** `ProfileFact.icon`. Unregistered names fall back to a neutral glyph. */
  name: string;
  className?: string;
  size?: number;
}

/** Renders a fact icon, or nothing at all when `name` is empty. */
export function FactIcon({ name, className, size = 12 }: FactIconProps) {
  if (!name) return null;
  const Icon = ICONS[name] ?? FALLBACK_ICON;
  return <Icon size={size} className={className} aria-hidden />;
}

export default FactIcon;
