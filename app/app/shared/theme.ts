/* -------------------------------------------------------------------------- */
/*  Brand tokens.                                                              */
/*                                                                            */
/*  These are the exact hex values already used across the /app screens. The    */
/*  mobile shell imports them so the new UI cannot drift away from the palette  */
/*  the desktop shell renders.                                                 */
/* -------------------------------------------------------------------------- */

export const BRAND = {
  /** Navigation strip / primary surface */
  pink: "#E7477D",
  /** Primary text + CTAs on light backgrounds */
  pinkDeep: "#C21559",
  /** In-code equivalent of pinkDeep used by the cqw components */
  pinkText: "#e0355f",
  /** Secondary pink used for accents and glows */
  pinkAccent: "#e23a6a",
  /** Tinted background behind primary text */
  pinkSoft: "#FDEEF1",
  /** Border for pink-tinted elements */
  pinkBorder: "#F7D3DD",

  /** Body text */
  ink: "#1F1F24",
  /** Muted / secondary text */
  muted: "#8A8790",
  /** Very light text and dividers */
  border: "#ECECEC",
  /** Page background */
  surface: "#FFFFFF",
  /** Subtle page background (sidebar wash) */
  surfaceMuted: "#F8F8F8",

  /** Card action colours */
  like: "#1F9254",
  likeSoft: "#E7F7EE",
  nope: "#FF4444",
  rewind: "#FFAA00",
  boost: "#4A9EFF",
  gold: "#E0B168",

  white: "#FFFFFF",
  black: "#141317",
} as const;

/** Active state of the relocated header strip (white pill on pink). */
export const STRIP_ACTIVE = {
  bg: BRAND.white,
  text: "#374151",
} as const;
