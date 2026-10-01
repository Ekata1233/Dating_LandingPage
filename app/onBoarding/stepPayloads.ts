import type {
  BasicInfoRequest,
  CareerRequest,
  InterestedInRequest,
  IntentionsRequest,
  InterestsRequest,
  LifestyleRequest,
} from "../context/OnBoardingApiContext";
import type { LifestyleQuestion } from "../context/OnBoardingDataContext";

type StepData = Record<string, unknown>;

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
    graduationYear: year(data.graduationYear),
    professionId: id(data.profession),
    companyName: text(data.companyName),
    employmentTypeId: id(data.employmentType),
    experienceId: id(data.experience),
    ambitionId: id(data.ambition),
    salaryRangeId: id(data.salaryRange),
    bigDreams: text(data.bigDreams),
  };
}

