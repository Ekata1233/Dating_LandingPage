import type {
  BasicInfoRequest,
  BioRequest,
  CareerRequest,
  InterestedInRequest,
  IntentionsRequest,
  InterestsRequest,
  LifestyleRequest,
  PromptsRequest,
  LocationRequest,
  EditBasicInfoRequest,
} from "../context/OnBoardingApiContext";
import type {
  LifestyleQuestion,
  OnboardingAnswerApi,
  OnboardingDetailsApi,
} from "../context/OnBoardingDataContext";
import { isBlank } from "./stepSchemas";

type StepData = Record<string, unknown>;

/**
 * What the photos step keeps in `data.photos`. The `File` is the payload; the
 * preview URL exists only so the grid can render before the upload happens.
 *
 * A photo is posted the moment it is picked, so the entry carries the id the
 * server handed back (`serverId`) — that is what the delete endpoint needs —
 * and `uploading` while the POST is still in flight, which is what keeps the
 * step's controls locked and Continue honest.
 */
export interface PhotoValue {
  name: string;
  size: number;
  type: string;
  /** Local object URL, for the preview only. Never serialised. */
  previewUrl: string;
  file?: File;
  /** Id from the POST response. Absent until the upload settles. */
  serverId?: string;
  /** True from the moment the file is queued until the POST settles. */
  uploading?: boolean;
}

function str(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.length > 0 ? str(value[0]) : "";
  if (value === null || value === undefined) return "";
  return String(value);
}

function num(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(str(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * The gender / interested-in enums are SCREAMING-KEBAB on the wire
 * ("NON-BINARY"). Normalise whatever the stored payload carries — a lone value
 * or a list, snake-cased or not — to that spelling before it is matched against
 * an option value. Without this the preference radio hydrates with nothing
 * selected (the raw `["NON_BINARY"]` matches no option), which is the "who are
 * you interested in" field rendering blank.
 */
function genderEnum(value: unknown): string {
  return str(value).trim().toUpperCase().replace(/_/g, "-");
}

/** An unanswered free-text field goes as `null` rather than an empty string. */
function text(value: unknown): string | null {
  const trimmed = str(value).trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * The career selects store an option id as a string (that is all `FieldOption`
 * holds), while the endpoint wants it as a number. `0` is treated as blank so a
 * cleared select never posts a meaningless id.
 */
function id(value: unknown): number | null {
  const parsed = Number.parseInt(str(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

/** The year field is typed as a date input but only ever holds a 4-digit year. */
function year(value: unknown): number | null {
  const parsed = Number.parseInt(str(value), 10);
  return Number.isInteger(parsed) && parsed >= 1900 && parsed <= 2100 ? parsed : null;
}

export function toBasicInfoRequest(data: StepData): BasicInfoRequest {
  return {
    fullName: str(data.fullName).trim(),
    email: str(data.email).trim(),
    birth_date: str(data.dateOfBirth).trim(),
    height: num(data.height),
    gender: str(data.gender).trim(),
    gender_option: str(data.sexualOrientation).trim(),
  };
}
/**
 * The edit-only extras, PATCHed to `/api/user/edit-profile/basic-info`.
 *
 * Mother tongue is multi, so the stored list is mapped id-by-id — calling
 * `Number()` on the array itself would collapse it to `NaN`. Blank or
 * unparseable ids go as `null` rather than `0`/`NaN`, which is how the
 * endpoint reads "cleared" (`text()` does the same for the enum strings).
 * A caste only travels with the religion that gives it meaning.
 */
export function toEditBasicInfoRequest(data: StepData): EditBasicInfoRequest {
  const tongues = (Array.isArray(data.motherTongue) ? data.motherTongue : [data.motherTongue])
    .map((value) => Number.parseInt(str(value), 10))
    .filter((value) => Number.isInteger(value) && value > 0);

  return {
    religionId: id(data.religion),
    communityId: id(data.religion) ? id(data.caste) : null,
    motherTongueId: tongues.length > 0 ? tongues : null,
    zodiac: text(data.zodiac),
    loveLanguage: text(data.loveLanguage),
    communicationStyle: text(data.communicationStyle),
  };
}
export function toLocationRequest(data: StepData): LocationRequest {
  const parsedData = {
    country: str(data.country).trim(),
    state: str(data.state).trim(),
    city: str(data.city).trim(),
    area: str(data.area),
    longitude: num(data.longitude),
    latitude: num(data.latitude),
    max_distance_km: num(100),
  }
  return parsedData;
}
export function toBioRequest(data: StepData): BioRequest {
  return {
    bio: str(data.bio).trim(),
  };
}

export function toInterestedInRequest(data: StepData): InterestedInRequest {
  return {
    interested_in: str(data.genders).trim(),
    sexual_orientation: str(data.sexualOrientation).trim(),
  };
}

/** The step stores the selected option's uuid under `intention`; only the key changes. */
export function toIntentionsRequest(data: StepData): IntentionsRequest {
  return {
    optionId: str(data.intention).trim(),
  };
}

/**
 * Lifestyle and interests are the same endpoint with the same body, so they
 * share this. One request per answered question, keyed by the question's uuid;
 * the stored values are already option uuids because the chips come from the
 * same response.
 *
 * Questions the user left blank are dropped — the endpoint has no way to
 * express "explicitly cleared".
 */
function toQuestionRequests(
  data: StepData,
  questions: readonly LifestyleQuestion[],
): LifestyleRequest[] {
  return questions
    .map((question) => {
      const raw = data[question.key];

      const optionIds = (
        Array.isArray(raw) ? raw : raw === undefined || raw === null || raw === "" ? [] : [raw]
      )
        .map(String)
        .map((v) => v.trim())
        .filter(Boolean);

      return { questionId: question.id, optionIds };
    })
    .filter((request) => request.optionIds.length > 0);
}

export function toLifestyleRequests(
  data: StepData,
  questions: readonly LifestyleQuestion[],
): LifestyleRequest[] {
  return toQuestionRequests(data, questions);
}

/** Same wire format as lifestyle, against the interests question set. */
export function toInterestsRequests(
  data: StepData,
  questions: readonly LifestyleQuestion[],
): InterestsRequest[] {
  return toQuestionRequests(data, questions);
}

/**
 * Career. Every dropdown here holds an id handed back by the option endpoints,
 * so the whole step is ids and free text — no reshaping beyond that. Fields the
 * user left alone go as `null`, which is how the endpoint distinguishes "not
 * answered yet" from a real value.
 */
export function toCareerRequest(data: StepData): CareerRequest {
  return {
    highestEdu: text(data.highestEducation),
    degree: text(data.degree),
    collegeName: text(data.collegeName),
    graduationYear: Number(data.graduationYear),
    professionId: id(data.profession),
    companyName: text(data.companyName),
    employmentTypeId: id(data.employmentType),
    experienceId: id(data.experience),
    ambitionId: id(data.ambition),
    salaryRangeId: id(data.salaryRange),
    bigDreams: text(data.bigDreams),
  };
}

/**
 * Prompts. The step keeps the whole answer entry per question — id, question
 * text and answer — but the endpoint only wants the id and the answer, so the
 * question wording is dropped here. The whole list goes in one PATCH, which is
 * why this is one request rather than one per answer.
 */
export function toPromptsRequest(data: StepData): PromptsRequest {
  const entries = Array.isArray(data.answers)
    ? (data.answers as Array<Record<string, unknown>>)
    : [];

  return {
    prompts: entries
      .map((entry) => ({
        promptId: str(entry?.promptId).trim(),
        answer: str(entry?.answer).trim(),
      }))
      .filter((prompt) => prompt.promptId !== "" && prompt.answer !== ""),
  };
}

/**
 * Photos are the one step whose body is not JSON: the endpoint takes one
 * multipart POST per file, field `image`. The upload happens as soon as the
 * file is picked — `uploadPhoto` in `OnboardingFormContext` builds the body
 * through this and posts it, so by the time Continue is pressed every entry
 * is already on the server.
 *
 * A `File` can't be read back out of a `PhotoValue` that lost it, so the
 * caller checks the file is present rather than silently posting nothing.
 */
export function toPhotoBody(file: File): FormData {
  const body = new FormData();
  body.append("images", file, file.name);
  return body;
}

/* -------------------------------------------------------------------------- */
/*  The other direction: GET /api/user/onboarding-details → step data.          */
/*                                                                              */
/*  Same job as the mappers above, read backwards. The flow starts with every    */
/*  step empty even when the profile is not, so a returning user has to answer   */
/*  questions they already answered. This turns the saved profile back into the    */
/*  form data objects, in the form field names the schemas declare — including    */
/*  the ids the save endpoints want, which is what makes a hydrated select show   */
/*  its label instead of a blank.                                               */
/* -------------------------------------------------------------------------- */

/**
 * Lifestyle and interests are answered question-by-question, and the form keys
 * each answer by the question's own `key`. One key can come back several times
 * when the question is multi, so picks are collected rather than overwritten.
 */
function answersToStepData(
  answers: readonly OnboardingAnswerApi[] | undefined
): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {};

  for (const answer of answers ?? []) {
    const key = answer?.question?.key;
    const optionId = answer?.option?.id;
    if (!key || !optionId) continue;

    const existing = out[key];

    if (existing === undefined) {
      out[key] = answer.question.isMulti ? [optionId] : optionId;
    } else if (Array.isArray(existing)) {
      existing.push(optionId);
    }
  }

  return out;
}

/** `"2008-09-08T00:00:00.000Z"` → `"2008-09-08"`, the shape the date input holds. */
function isoDate(value: unknown): string {
  const text = str(value).trim();
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(text);

  return match ? match[1]! : "";
}

/** Career ids arrive as numbers and the selects store strings. */
function optionId(value: unknown): string {
  if (value && typeof value === "object" && "id" in value) {
    return str((value as { id: unknown }).id);
  }

  return str(value);
}

/** Year `0` means "not answered", so it is left out rather than shown as 0. */
function graduationYear(value: unknown): string {
  const parsed = Number.parseInt(str(value), 10);

  return parsed > 0 ? String(parsed) : "";
}

/**
 * The saved profile as step data, keyed by step id. Only fields the profile
 * actually holds are present — nothing is written as an empty string, so
 * `hydrateStepData` can tell "the server has no answer" from "the answer is
 * blank".
 */
export function stepDataFromDetails(
  details: OnboardingDetailsApi
): Record<string, Record<string, unknown>> {
  const flows = details.flows ?? {};
  const basic = flows.BASIC_INFO;
  const career = flows.CAREER_AMBITION;
  const location = flows.LOCATION;

  const seed: Record<string, Record<string, unknown>> = {};

  if (basic) {
    seed.basics = {
      fullName: basic.fullName,
      email: basic.email,
      dateOfBirth: isoDate(basic.dateOfBirth),
      height: str(basic.height),
      gender: basic.gender,
      sexualOrientation: basic.genderOption,
    };
  }

  const interestedIn = genderEnum(flows.INTERESTED_IN?.interestedIn);
  if (interestedIn) {
    seed.preference = {
      genders: interestedIn,
      sexualOrientation: basic?.genderOption,
    };
  }

  /* The option's own uuid, which is exactly what the intentions list hands the
     radio group and what the save endpoint wants back. */
  const intentionId = flows.LOOKING_FOR?.intention?.id;
  if (typeof intentionId === "string") {
    seed.intentions = { intention: intentionId };
  }

  const lifestyle = answersToStepData(flows.LIFESTYLE);
  if (Object.keys(lifestyle).length > 0) {
    seed.lifestyle = lifestyle;
  }

  const interests = answersToStepData(flows.INTEREST);
  if (Object.keys(interests).length > 0) {
    seed.interests = interests;
  }

  if (career) {
    seed.career = {
      highestEducation: str(career.highestEducation),
      degree: str(career.degree),
      collegeName: str(career.collegeName),
      graduationYear: graduationYear(career.graduationYear),
      profession: optionId(career.profession),
      companyName: str(career.companyName),
      employmentType: optionId(career.employmentType),
      experience: optionId(career.experience),
      salaryRange: optionId(career.salaryRange),
      ambition: optionId(career.ambition),
      bigDreams: str(career.bigDreams),
    };
  }

  if (flows.STORY?.bio) {
    seed.bio = { bio: flows.STORY.bio };
  }

  if (location?.city) {
    seed.location = { city: location.city };
  }

  return seed;
}

/**
 * Drops the saved profile into the step objects, filling only what the user has
 * not touched — a blank field is the empty string or an empty array, and a
 * non-blank one is something they (or the flow) have already chosen. Anything
 * the profile doesn't hold is left as it was, so the returned object is the same
 * reference when there is nothing to hydrate.
 */
export function hydrateStepData<T extends Record<string, Record<string, unknown>>>(
  data: T,
  details: OnboardingDetailsApi
): T {
  let changed = false;
  const next: Record<string, Record<string, unknown>> = { ...data };

  for (const [stepId, fields] of Object.entries(stepDataFromDetails(details))) {
    const step = data[stepId] ?? {};
    const merged: Record<string, unknown> = { ...step };
    let stepChanged = false;

    for (const [name, value] of Object.entries(fields)) {
      if (isBlank(step[name]) && !isBlank(value)) {
        merged[name] = value;
        stepChanged = true;
      }
    }

    if (stepChanged) {
      next[stepId] = merged;
      changed = true;
    }
  }

  return changed ? (next as T) : data;
}

