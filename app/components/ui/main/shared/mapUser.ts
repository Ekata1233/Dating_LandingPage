/* -------------------------------------------------------------------------- */
/*  API -> view model                                                           */
/*                                                                            */
/*  The discover feed (`GET /api/user/feed`) returns a fairly rich user record, */
/*  but not in the shape the cards render. This module is the single place      */
/*  that translation happens, so the components stay unaware of the wire format */
/*  and a field rename only has to be fixed here.                               */
/*                                                                            */
/*  Rules of the mapping:                                                       */
/*   - Never invent data. A field the API does not send comes back as an empty */
/*     string (or an empty array) and the UI hides the row.                      */
/*   - `image` and `gallery` always agree: the cover image is the primary photo */
/*     and is also the first gallery entry, so the hero and the strip below it  */
/*     can never show different people.                                         */
/* -------------------------------------------------------------------------- */

import type { DetailAnswer, UserFeedDetails, UserProfile } from "@/app/context/UsersContext";
import type { Profile, ProfileFact } from "./types";
import { FALLBACK_AVATAR } from "./mockData";

/* ------------------------------- formatting -------------------------------- */

/** 170 -> `5'7"`. The API stores height in centimetres. */
export function formatHeight(cm: number | null | undefined): string {
  if (!cm || cm <= 0) return "";

  const totalInches = Math.round((cm / 2.54) * 10) / 10;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);

  /* Rounding 11.6" up to 12" should roll over into the next foot. */
  if (inches === 12) return `${feet + 1}'0"`;

  return `${feet}'${inches}"`;
}

/** 3.78 -> `3.8 km away`, 0 -> `Nearby`. */
export function formatDistance(km: number | null | undefined): string {
  if (km === null || km === undefined || Number.isNaN(km)) return "";
  if (km <= 0) return "Nearby";
  if (km < 1) return `${Math.round(km * 1000)} m away`;

  const rounded = Math.round(km * 10) / 10;
  return `${rounded} km away`;
}

/**
 * "Kondhwa", "Maharashtra" -> "Kondhwa, Maharashtra".
 *
 * Country is deliberately only a fallback: once a city is known the country is
 * noise on a dating card, and the feed already scopes everyone to one region.
 * Repeats are dropped so a city that shares its state's name reads once.
 */
export function formatLocation(
  city: string | null | undefined,
  state: string | null | undefined,
  country: string | null | undefined
): string {
  const parts = [city, state]
    .filter((part): part is string => Boolean(part && part.trim()))
    .map((part) => capitalize(part.trim()))
    .filter((part, index, all) => all.indexOf(part) === index);

  if (parts.length) return parts.join(", ");
  return capitalize((country ?? "").trim());
}

/** "pune" -> "Pune". The feed stores city names inconsistently cased. */
function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** "architect" -> "an architect", "business owner" -> "a business owner". */
function withArticle(noun: string): string {
  return /^[aeiou]/i.test(noun) ? `an ${noun}` : `a ${noun}`;
}

/* --------------------------------- photos ---------------------------------- */

/**
 * Photos ordered by `order`, primary first when several claim to be primary.
 * A user with no photos still has to render a card, so the list is never empty.
 */
function orderPhotos(user: UserProfile): string[] {
  const urls = (user.photos ?? [])
    .filter((photo) => Boolean(photo?.media_url))
    .slice()
    .sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return (a.order ?? 0) - (b.order ?? 0);
    })
    .map((photo) => photo.media_url);

  return urls.length ? urls : [FALLBACK_AVATAR];
}

/* ---------------------------------- facts ---------------------------------- */

/**
 * The API has no `lookingFor` / `religion` / `education` / `interests` yet, so
 * those are left blank and the card hides the corresponding blocks. Everything
 * below is real API data.
 */
function buildCareer(user: UserProfile): ProfileFact[] {
  const facts: ProfileFact[] = [];

  const profession = user.eduWork?.profession?.name;
  if (profession) {
    facts.push({ label: "Profession", icon: "Briefcase", value: profession });
  }

  if (user.height > 0) {
    facts.push({ label: "Height", icon: "Ruler", value: formatHeight(user.height) });
  }

  const location = formatLocation(
    user.profile?.city,
    user.profile?.state,
    user.profile?.country
  );
  if (location) {
    facts.push({ label: "Location", icon: "MapPin", value: location });
  }

  return facts;
}

/** Presence and responsiveness – the only "lifestyle" signals the API has. */
function buildLifestyle(user: UserProfile): ProfileFact[] {
  const facts: ProfileFact[] = [];

  facts.push({
    label: "Activity",
    icon: "Activity",
    value: user.isOnline ? "Online now" : (user.lastSeen ?? "Offline"),
  });

  if (user.replyTime) {
    facts.push({ label: "Responds", icon: "Clock", value: user.replyTime });
  }

  if (typeof user.trust === "number") {
    facts.push({ label: "Trust score", icon: "ShieldCheck", value: `${user.trust}%` });
  }

  return facts;
}

/* ---------------------------------- mapper --------------------------------- */

/** Short one-liner for the card overlay, built only from real fields. */
function buildBio(user: UserProfile): string {
  const profession = user.eduWork?.profession?.name;
  const city = (user.profile?.city ?? "").trim();
  const place = profession || (city ? capitalize(city) : "");
  const distance = formatDistance(user.distanceKm);

  return [place, distance].filter(Boolean).join(" · ");
}

/** Paragraph under ABOUT. Empty when the API has nothing to say yet. */
function buildAbout(user: UserProfile): string {
  const firstName = user.full_name?.split(" ")[0]?.trim();
  const profession = user.eduWork?.profession?.name?.toLowerCase();
  const city = (user.profile?.city ?? "").trim();

  const subject = firstName
    ? profession
      ? `${firstName} is ${withArticle(profession)}`
      : `${firstName} is on welvors`
    : "";

  const clauses: string[] = [];
  if (city) clauses.push(`based in ${capitalize(city)}`);

  const distance = formatDistance(user.distanceKm);
  if (distance && distance !== "Nearby") clauses.push(`${distance} from you`);

  const sentence = [subject, clauses.join(", ")].filter(Boolean).join(" ");
  if (!sentence) return "";

  return capitalize(sentence) + ".";
}

/** Maps one discover-feed user onto the shape the profile cards render. */
export function mapUserToProfile(user: UserProfile): Profile {
  const gallery = orderPhotos(user);
  const location = formatLocation(
    user.profile?.city,
    user.profile?.state,
    user.profile?.country
  );

  return {
    id: user.id,
    name: user.full_name,
    age: user.age,
    image: gallery[0],
    gallery,
    distance: formatDistance(user.distanceKm),
    height: formatHeight(user.height),
    location,
    birth_date:user.birth_date,
    /* Not sent by the API yet. */
    lookingFor: "",
    religion: "",
    occupation: user.eduWork?.profession?.name ?? "",
    education: "",
    bio: buildBio(user),
    about: buildAbout(user),
    /* Not sent by the API yet. */
    interests: [],
    career: buildCareer(user),
    lifestyle: buildLifestyle(user),

    /* Only arrive with the details endpoint. */
    prompts: [],
    family: [],
    networking: [],
    detailsLoaded: false,

    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
    replyTime: user.replyTime,
    trust: user.trust,
    matchScore: user.matchScore,
    compatibilityScore: user.compatibilityScore,
    isBoosted: user.isBoosted,
  };
}

/** Maps a whole feed, dropping malformed records. */
export function mapUsersToProfiles(users: UserProfile[] | null | undefined): Profile[] {
  if (!Array.isArray(users)) return [];

  return users
    .filter((user): user is UserProfile => Boolean(user?.id))
    .map(mapUserToProfile);
}

/* ========================================================================== */
/*  Deep profile — GET /api/user/feed/details/:userId                          */
/* ========================================================================== */

/**
 * The details endpoint sends SCREAMING_SNAKE enums ("WOMEN", "VIRGO",
 * "PHONE_CALLS_OVER_TEXTS"). Turn them into labels rather than showing the raw
 * wire values.
 */
export function humanizeEnum(value: string | null | undefined): string {
  if (!value) return "";

  const words = value.replace(/_/g, " ").trim().toLowerCase();
  return capitalize(words);
}

function firstNonEmpty(...values: (string | null | undefined)[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

/**
 * Keyword -> icon, used to give each lifestyle / interest answer its own glyph
 * instead of stamping one icon across the whole section. Order matters: the
 * first row whose keyword appears in the question wins, so the more specific
 * terms ("non-veg") sit above the broader ones ("food").
 */
const ICON_KEYWORDS: ReadonlyArray<readonly [string, string]> = [
  /* Lifestyle. */
  ["non-veg", "Utensils"],
  ["veg", "Utensils"],
  ["diet", "Utensils"],
  ["eat", "Utensils"],
  ["food", "Utensils"],
  ["cook", "Utensils"],
  ["drink", "Wine"],
  ["alcohol", "Wine"],
  ["smok", "Cigarette"],
  ["tobacco", "Cigarette"],
  ["workout", "Dumbbell"],
  ["gym", "Dumbbell"],
  ["fitness", "Dumbbell"],
  ["exercise", "Dumbbell"],
  ["pet", "PawPrint"],
  ["dog", "Dog"],
  ["cat", "PawPrint"],
  ["sleep", "Moon"],
  ["bed", "Moon"],
  ["night owl", "Moon"],
  ["morning person", "Sun"],
  ["early bird", "Sun"],
  ["coffee", "Coffee"],
  ["tea", "Coffee"],

  /* Interests. */
  ["music", "Music"],
  ["sing", "Music"],
  ["concert", "Music"],
  ["travel", "Plane"],
  ["trip", "Plane"],
  ["flight", "Plane"],
  ["movie", "Film"],
  ["film", "Film"],
  ["cinema", "Film"],
  ["book", "BookOpen"],
  ["read", "BookOpen"],
  ["art", "Palette"],
  ["paint", "Palette"],
  ["design", "Palette"],
  ["photo", "Palette"],
  ["gaming", "Gamepad2"],
  ["game", "Gamepad2"],
  ["sport", "Trophy"],
  ["cricket", "Trophy"],
  ["football", "Trophy"],
  ["badminton", "Trophy"],
  ["gym", "Dumbbell"],
  ["cycling", "Bike"],
  ["bike", "Bike"],
  ["hiking", "Mountain"],
  ["trek", "Mountain"],
  ["nature", "Mountain"],
  ["camp", "Tent"],
  ["water", "Fish"],
  ["swim", "Fish"],
  ["surf", "Sailboat"],
  ["sail", "Sailboat"],
  ["volunteer", "Leaf"],
  ["garden", "Leaf"],
  ["plant", "Leaf"],

  /* Anything phrased as a habit / value statement. */
  ["quote", "Quote"],
  ["language", "Globe"],
  ["travelled", "Globe"],
  ["adventure", "Compass"],
  ["explore", "Compass"],
  ["chat", "MessageCircle"],
  ["texting", "MessageCircle"],
  ["call", "MessageCircle"],
];

/**
 * Picks the icon for a free-text question. Falls back to `fallback` so a
 * question nobody anticipated still renders a sensible glyph.
 */
export function iconForQuestion(
  question: string | null | undefined,
  fallback: string
): string {
  const text = (question ?? "").toLowerCase();
  if (!text) return fallback;

  for (const [keyword, icon] of ICON_KEYWORDS) {
    if (text.includes(keyword)) return icon;
  }

  return fallback;
}

/** `[{ question, answer, description }]` -> label/value facts. */
function answersToFacts(
  answers: DetailAnswer[] | null | undefined,
  icon: string
): ProfileFact[] {
  if (!Array.isArray(answers)) return [];

  return answers
    .filter((item) => firstNonEmpty(item?.question, item?.answer))
    .map((item) => {
      const question = firstNonEmpty(item.question);
      const fact: ProfileFact = {
        label: capitalize(firstNonEmpty(item.question, item.answer)),
        icon: iconForQuestion(question, icon),
        value: firstNonEmpty(item.answer) || "—",
      };

      const description = firstNonEmpty(item.description);
      if (description) fact.description = description;

      return fact;
    });
}

/** Details photos use `url` / `isPrimary`; the feed uses `media_url`. */
function detailPhotos(details: UserFeedDetails): string[] {
  const urls = (details.photos ?? [])
    .filter((photo) => Boolean(photo?.url))
    .slice()
    .sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return (a.order ?? 0) - (b.order ?? 0);
    })
    .map((photo) => photo.url);

  return urls;
}

function buildDetailCareer(details: UserFeedDetails, base: ProfileFact[]): ProfileFact[] {
  const career = details.career;
  if (!career) return base;

  const education = firstNonEmpty(
    career.degree,
    humanizeEnum(career.highestEducation) || undefined
  );
  const college = firstNonEmpty(career.collegeName);
  const graduation = career.graduationYear ? String(career.graduationYear) : "";

  const facts: ProfileFact[] = [];

  /* The feed only knows the profession, so prefer the details value and keep
     the feed's entry as the fallback. */
  const profession = firstNonEmpty(career.profession);
  const feedProfession = base.find((fact) => fact.label === "Profession");
  if (profession || feedProfession) {
    facts.push({
      label: "Profession",
      icon: "Briefcase",
      value: profession || (feedProfession?.value ?? ""),
    });
  }

  if (firstNonEmpty(career.companyName)) {
    facts.push({ label: "Company", icon: "Building2", value: career.companyName!.trim() });
  }

  if (firstNonEmpty(career.employmentType)) {
    facts.push({
      label: "Employment",
      icon: "UserCheck",
      value: humanizeEnum(career.employmentType),
    });
  }

  if (firstNonEmpty(career.experience)) {
    facts.push({ label: "Experience", icon: "Clock", value: career.experience!.trim() });
  }

  if (education) {
    const suffix = graduation ? ` (${graduation})` : "";
    facts.push({ label: "Education", icon: "GraduationCap", value: education + suffix });
  }

  if (college) {
    facts.push({ label: "College", icon: "School", value: college });
  }

  if (firstNonEmpty(career.salaryRange)) {
    facts.push({ label: "Salary", icon: "Wallet", value: career.salaryRange!.trim() });
  }

  if (firstNonEmpty(career.ambition)) {
    facts.push({ label: "Ambition", icon: "Target", value: career.ambition!.trim() });
  }

  if (firstNonEmpty(career.bigDreams)) {
    facts.push({ label: "Big dreams", icon: "Sparkles", value: career.bigDreams!.trim() });
  }

  return facts;
}

function buildFamilyFacts(details: UserFeedDetails): ProfileFact[] {
  const family = details.family;
  if (!family) return [];

  const rows: [string, string | null, string][] = [
    ["Family type", family.familyType, "Users"],
    ["Family status", family.familyStatus, "Heart"],
    ["Father", firstNonEmpty(family.fatherOccupation, family.fatherOrganisation), "User"],
    ["Mother", firstNonEmpty(family.motherOccupation, family.motherOrganisation), "User"],
    ["Home", family.familyHome, "Home"],
    ["Native place", family.nativePlace, "MapPin"],
    ["Family income", family.familyIncome, "Wallet"],
  ];

  const facts = rows
    .filter((row): row is [string, string, string] => Boolean(row[1]))
    .map(([label, value, icon]) => ({
      label,
      icon,
      value:
        label === "Family type" || label === "Family status"
          ? humanizeEnum(value)
          : value.trim(),
    }));

  if (Array.isArray(family.siblings) && family.siblings.length) {
    facts.push({
      label: "Siblings",
      icon: "Users",
      value: String(family.siblings.length),
    });
  }

  return facts;
}

/**
 * Folds the details payload into the feed profile. The feed is the base, so a
 * field the details endpoint omits keeps whatever the feed already had — the
 * card can only get richer, never emptier.
 */
export function mergeUserDetails(base: Profile, details: UserFeedDetails): Profile {
  if (!details) return base;

  const gallery = detailPhotos(details);
  const nextGallery = gallery.length ? gallery : base.gallery;

  /* Only rebuild the location when the payload actually names a city —
     otherwise `base.location` is already "City, State" and appending the state
     again would print "Kondhwa, Maharashtra, Maharashtra". */
  const detailCity = firstNonEmpty(details.city);
  const location = detailCity
    ? formatLocation(detailCity, firstNonEmpty(details.state), details.country)
    : base.location;

  const detailCareer = buildDetailCareer(details, base.career);
  const detailLifestyle = answersToFacts(details.lifestyle, "Heart");
  const detailInterests = answersToFacts(details.interests, "Sparkles");

  const merged: Profile = {
    ...base,

    /* Photos: details wins, it has the full set. */
    gallery: nextGallery,
    image: nextGallery[0] ?? base.image,

    /* Text the feed never had. */
    name: firstNonEmpty(details.fullName) || base.name,
    age: details.age || base.age,
    height: formatHeight(details.height ?? 0) || base.height,
    location: location || base.location,
    about: firstNonEmpty(details.bio) || base.about,
    lookingFor: firstNonEmpty(details.lookingFor) || base.lookingFor,
    lookingForSubtitle: firstNonEmpty(details.lookingFor_subtitle) || base.lookingForSubtitle,
    religion: firstNonEmpty(details.religion) || base.religion,
    occupation: firstNonEmpty(details.career?.profession) || base.occupation,
    education:
      firstNonEmpty(details.career?.degree, humanizeEnum(details.career?.highestEducation)) ||
      base.education,

    /* Match data is only trustworthy at detail level. */
    matchScore: details.matchScore ?? base.matchScore,
    trust: details.trust ?? base.trust,
    replyTime: firstNonEmpty(details.replyTime) || base.replyTime,

    /* Chips. */
    gender: humanizeEnum(details.gender) || base.gender,
    community: firstNonEmpty(details.community) || base.community,
    motherTongue: firstNonEmpty(details.motherTongue) || base.motherTongue,
    area: firstNonEmpty(details.area) || base.area,
    zodiac: humanizeEnum(details.zodiac) || base.zodiac,
    communicationStyle: humanizeEnum(details.communicationStyle) || base.communicationStyle,
    loveLanguage: humanizeEnum(details.loveLanguage) || base.loveLanguage,

    /* Detail-only sections, each falling back to whatever the feed had. */
    career: detailCareer,
    lifestyle: detailLifestyle.length ? detailLifestyle : base.lifestyle,
    interests: detailInterests.length ? detailInterests : base.interests,
    prompts: (details.prompts ?? [])
      .filter((prompt) => firstNonEmpty(prompt?.answer))
      .slice()
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((prompt) => ({
        label: firstNonEmpty(prompt.question) || "Prompt",
        icon: "MessageSquareQuote",
        value: prompt.answer.trim(),
      })),
    family: buildFamilyFacts(details),
    networking: answersToFacts(details.networkingAnswers, "Network"),

    detailsLoaded: true,
  };

  return merged;
}
