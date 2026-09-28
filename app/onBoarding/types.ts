/* -------------------------------------------------------------------------- */
/*  Onboarding form shape.                                                      */
/*                                                                            */
/*  This is deliberately NOT `UserProfile` from `UsersContext`. That type       */
/*  describes a *discover-feed card* (a person you are browsing) and carries    */
/*  server-computed fields like `matchScore` and `trust`, which a form cannot   */
/*  set and does not own.                                                       */
/*                                                                            */
/*  What lives here is what the signed-in person is allowed to write. Two      */
/*  rules keep the state honest:                                               */
/*                                                                            */
/*    1. Every scalar is a `string`. Text inputs hand back strings, and "" is   */
/*       the one unambiguous "not answered yet" value — `null` would make      */
/*       `value={...}` and `value.length` need a guard at every call site.     */
/*    2. Fields the API types as numbers (`age`, `height`, `graduationYear`)   */
/*       stay strings here and are parsed once, at the submit boundary. Doing  */
/*       it per keystroke would make the caret jump in a numeric input.         */
/* -------------------------------------------------------------------------- */

import type { DetailAnswer } from "@/app/context/UsersContext";

/* --------------------------------- photos ---------------------------------- */

export interface OnboardingPhoto {
  id?: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

/* --------------------------------- prompts --------------------------------- */

export interface OnboardingPrompt {
  id?: string;
  question: string;
  answer: string;
  description: string | null;
  displayOrder?: number;
}

/* ---------------------------------- career --------------------------------- */

/** Mirrors `DetailCareer` in `UsersContext`, minus the `null`s (see rule 1). */
export interface OnboardingCareer {
  highestEducation: string;
  degree: string;
  collegeName: string;
  /** Free-text so the field can hold "2019" while it is being typed. */
  graduationYear: string;
  profession: string;
  companyName: string;
  employmentType: string;
  experience: string;
  ambition: string;
  salaryRange: string;
  bigDreams: string;
}

/* ---------------------------------- family --------------------------------- */

/** Mirrors `DetailFamily` in `UsersContext`, minus the `null`s. */
export interface OnboardingFamily {
  familyStatus: string;
  familyType: string;
  fatherOccupation: string;
  fatherOrganisation: string;
  motherOccupation: string;
  motherOrganisation: string;
  familyHome: string;
  nativePlace: string;
  familyIncome: string;
  /** Free-text is fine here: the API only ever sends a count. */
  siblings: string[];
}

/* ---------------------------------- the form ------------------------------- */

export interface ProfileFormData {
  /* identity */
  userId: string;
  fullName: string;
  age: string;
  gender: string;
  phone_number: string;

  /* about */
  bio: string;

  /* what they want */
  lookingFor: string;
  lookingFor_subtitle: string;
  religion: string;
  community: string;
  motherTongue: string;

  /* where they are */
  height: string;
  city: string;
  state: string;
  country: string;
  area: string;

  /* traits */
  zodiac: string;
  communicationStyle: string;
  loveLanguage: string;

  /* groups */
  photos: OnboardingPhoto[];
  prompts: OnboardingPrompt[];
  career: OnboardingCareer;
  lifestyle: DetailAnswer[];
  interests: DetailAnswer[];
  networkingAnswers: DetailAnswer[];
  family: OnboardingFamily;
}

/** The two groups `updateNested` knows how to merge into. */
export type NestedFormGroup = "career" | "family";
