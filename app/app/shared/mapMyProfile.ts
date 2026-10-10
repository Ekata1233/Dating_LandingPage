/* -------------------------------------------------------------------------- */
/*  My profile — API -> view model                                             */
/*                                                                            */
/*  `GET /api/user/onboarding-details` (implemented in `OnBoardingDataContext`) */
/*  returns the signed-in user's own profile, grouped by the flow that owns    */
/*  each field. This is the one place that turns those `flows.*` groups into   */
/*  the `Profile` the /app screens render, so `ProfileMain` and `ProfileSidebar` */
/*  never have to know the wire format.                                       */
/*                                                                            */
/*  Same rules as `mapUser.ts`:                                                */
/*   - Nothing is invented. A field the payload does not carry comes back as   */
/*     an empty string (or an empty array) and the row is hidden.              */
/*   - `image` and `gallery` always agree — the primary photo is the cover and */
/*     is also the first gallery entry.                                        */
/* -------------------------------------------------------------------------- */

import type {
  OnboardingAnswerApi,
  OnboardingDetailsApi,
  OnboardingPhotoApi,
} from "@/app/context/OnBoardingDataContext";

import { formatHeight, formatLocation, humanizeEnum, iconForQuestion } from "./mapUser";
import { FALLBACK_AVATAR } from "./mockData";
import type { MyProfile, Profile, ProfileFact } from "./types";

/* ------------------------------- primitives ------------------------------- */

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * The career / location groups store their dropdown answers as the option row
 * the save endpoint was given, so the same field can arrive as a plain string
 * or as an object carrying the label under one of several keys. Read whichever
 * one is present rather than guessing a single shape.
 */
function labelOf(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;

  for (const key of ["name", "label", "option", "title", "value", "city", "area"]) {
    const found = str(record[key]);
    if (found) return found;
  }

  return "";
}

/** `dateOfBirth` -> whole years old today. `0` when it cannot be parsed. */
export function ageFromDateOfBirth(dateOfBirth: unknown): number {
  const text = str(dateOfBirth);
  if (!text) return 0;

  const birth = new Date(text);
  if (Number.isNaN(birth.getTime())) return 0;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hadBirthday =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());

  if (!hadBirthday) age -= 1;

  return age > 0 ? age : 0;
}

/** `"2002-09-15T00:00:00.000Z"` -> `"15 Sep 2002"`. Empty when unparsable. */
function formatBirthDate(value: unknown): string {
  const text = str(value);
  if (!text) return "";

  const birth = new Date(text);
  if (Number.isNaN(birth.getTime())) return "";

  return birth.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* --------------------------------- photos --------------------------------- */

/** Primary photo first, then server order. Never empty — a card must render. */
function toGallery(photos: OnboardingPhotoApi[] | undefined): string[] {
  const urls = (photos ?? [])
    .filter((photo) => Boolean(photo?.mediaUrl) && photo.mediaType !== "VIDEO")
    .slice()
    .sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return (a.order ?? 0) - (b.order ?? 0);
    })
    .map((photo) => photo.mediaUrl);

  return urls.length ? urls : [FALLBACK_AVATAR];
}

/* ---------------------------------- facts --------------------------------- */

/** One saved lifestyle / interest answer -> a fact row. */
function answerToFact(answer: OnboardingAnswerApi, fallbackIcon: string): ProfileFact {
  const question = str(answer?.question?.title);
  const value = str(answer?.option?.label) || str(answer?.option?.value);

  const fact: ProfileFact = {
    label: question || "Answer",
    icon: iconForQuestion(question, fallbackIcon),
    value,
  };

  const description = str(answer?.description);
  if (description) fact.description = description;

  return fact;
}

function answersToFacts(
  answers: OnboardingAnswerApi[] | undefined,
  fallbackIcon: string
): ProfileFact[] {
  if (!Array.isArray(answers)) return [];

  return answers
    .filter((answer) => Boolean(str(answer?.option?.label) || str(answer?.option?.value)))
    .map((answer) => answerToFact(answer, fallbackIcon));
}

/**
 * `CAREER_AMBITION` is untyped on the wire, so every row is read through
 * `labelOf` and dropped when nothing readable comes back.
 */
function buildCareer(flow: Record<string, unknown> | undefined): ProfileFact[] {
  if (!flow) return [];

  const facts: ProfileFact[] = [];

  const profession = labelOf(flow.profession);
  if (profession) facts.push({ label: "Profession", icon: "Briefcase", value: profession });

  const company = str(flow.companyName);
  if (company) facts.push({ label: "Company", icon: "Building2", value: company });

  const employment = labelOf(flow.employmentType);
  if (employment) {
    facts.push({
      label: "Employment",
      icon: "UserCheck",
      value: humanizeEnum(employment) || employment,
    });
  }

  const experience = labelOf(flow.experience);
  if (experience) {
    facts.push({ label: "Experience", icon: "Clock", value: humanizeEnum(experience) || experience });
  }

  const degree = str(flow.degree) || humanizeEnum(str(flow.highestEducation));
  const graduation = Number(flow.graduationYear);
  if (degree) {
    facts.push({
      label: "Education",
      icon: "GraduationCap",
      value: Number.isFinite(graduation) && graduation > 0 ? `${degree} (${graduation})` : degree,
    });
  }

  const college = str(flow.collegeName);
  if (college) facts.push({ label: "College", icon: "School", value: college });

  const salary = labelOf(flow.salaryRange);
  if (salary) facts.push({ label: "Salary", icon: "Wallet", value: humanizeEnum(salary) || salary });

  const ambition = labelOf(flow.ambition);
  if (ambition) facts.push({ label: "Ambition", icon: "Target", value: humanizeEnum(ambition) || ambition });

  /* `ProfileDetailSections` pulls this one out of the grid and renders it as
     its own "BIG DREAM" line, so the label has to stay exactly this. */
  const bigDreams = str(flow.bigDreams);
  if (bigDreams) facts.push({ label: "Big dreams", icon: "Sparkles", value: bigDreams });

  return facts;
}

/* --------------------------------- prompts -------------------------------- */

/**
 * `PROMPT` is untyped. Read the two spellings the save endpoint uses and skip
 * anything without an answer so the section stays empty rather than wrong.
 */
function buildPrompts(raw: unknown): ProfileFact[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => {
      const record = (entry ?? {}) as Record<string, unknown>;

      return {
        label: str(record.question) || str(record.promptQuestion) || "Prompt",
        value: str(record.answer) || str(record.response),
      };
    })
    .filter((prompt) => Boolean(prompt.value))
    .map((prompt) => ({ ...prompt, icon: "MessageSquareQuote" }));
}

/* --------------------------------- mapper --------------------------------- */

/**
 * The signed-in user's own profile, shaped like a discover-feed `Profile` so
 * `ProfileMain` can render it with the same card as `HomeMain`.
 */
export function mapMyProfile(details: OnboardingDetailsApi | null): Profile {
  const flows = details?.flows ?? {};
  const basic = flows.BASIC_INFO;
  const location = flows.LOCATION;

  const gallery = toGallery(flows.PHOTOS);
  const locationLine = formatLocation(
    labelOf(location?.city) || str(location?.city),
    labelOf(location?.state) || str(location?.state),
    labelOf(location?.country) || str(location?.country)
  );

  const career = buildCareer(flows.CAREER_AMBITION);
  const profession = career.find((fact) => fact.label === "Profession")?.value ?? "";
  const education = career.find((fact) => fact.label === "Education")?.value ?? "";

  /* The card overlay takes a one-liner; the ABOUT block takes the real bio. */
  const overlay = [str(basic?.genderOption), locationLine].filter(Boolean).join(" · ");
  const area = str(location?.area);

  return {
    id: details?.userId ?? "",
    name: str(basic?.fullName),
    age: ageFromDateOfBirth(basic?.dateOfBirth),
    image: gallery[0],
    gallery,

    /* There is no "distance from you" on your own profile. */
    distance: "",
    birth_date: formatBirthDate(basic?.dateOfBirth),
    height: formatHeight(basic?.height),
    location: [area, locationLine].filter(Boolean).join(", "),
    lookingFor: str(flows.LOOKING_FOR?.intention?.option),
    religion: "",
    occupation: profession,
    education,
    bio: overlay,
    about: str(flows.STORY?.bio),

    interests: answersToFacts(flows.INTEREST, "Sparkles"),
    career,
    lifestyle: answersToFacts(flows.LIFESTYLE, "Heart"),

    /* Not carried by this endpoint. */
    prompts: buildPrompts(flows.PROMPT),
    family: [],
    networking: [],

    gender: humanizeEnum(str(basic?.gender)),
    community: str(basic?.genderOption),
    interestedIn: humanizeEnum(str(flows.INTERESTED_IN?.interestedIn)),
    /* True because this mapping only ever runs on a resolved payload. */
    detailsLoaded: true,
  };
}

/* ----------------------------- sidebar summary ---------------------------- */

/** Progress bar input. Anything unusable becomes `0`, never `NaN`. */
function clampPercent(value: unknown): number {
  const percent = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(percent)) return 0;

  return Math.min(100, Math.max(0, Math.round(percent)));
}

/**
 * The handful of fields `ProfileSidebar` draws. Everything it shows has to come
 * from the same payload as the card, so the two can never disagree.
 */
export function mapMyProfileSummary(
  details: OnboardingDetailsApi | null,
  profile: Profile
): MyProfile {
  const flows = details?.flows ?? {};

  return {
    avatarUrl: profile.image,
    name: profile.name,
    age: profile.age,
    verified: Boolean(flows.VERIFY_PHONE?.isPhoneVerified),
    location: profile.location,
    /* Neither plan tier nor trust score is part of this endpoint yet. */
    isPlatinumMember: false,
    trustScore: 0,
    completionPercent: clampPercent(flows.REVIEW_FINISH?.profileCompletion),
  };
}