/* -------------------------------------------------------------------------- */
/*  Per-step form schemas.                                                       */
/*                                                                            */
/*  Every step owns ONE object of data, and this file is the single place that */
/*  describes what that object contains. Two things come out of it:             */
/*                                                                            */
/*    1. The initial (empty) value for the step, so the form context never has  */
/*       to guess a type.                                                       */
/*    2. The validation rules, so "can I press Continue" is answered in exactly  */
/*       one place instead of every step re-deriving it from its own local     */
/*       state.                                                                 */
/*                                                                            */
/*  Required vs optional:                                                       */
/*  - A REQUIRED field blocks Continue while empty. This is the default.       */
/*  - An OPTIONAL field never blocks Continue, and renders with a Skip         */
/*    affordance when `skippable` is set.                                       */
/*                                                                            */
/*  Shapes, not wire formats: turning one of these objects into an API body is */
/*  the job of `stepPayloads.ts`, which holds the typed mappers for the two    */
/*  steps that have a backend endpoint.                                         */
/* -------------------------------------------------------------------------- */

export type FieldKind = "text" | "textarea" | "select" | "radio" | "multi" | "date" | "photos";

export interface FieldOption {
  value: string;
  label: string;
  description?: string;
}

export interface FieldDef {
  name: string;
  label: string;
  kind: FieldKind;
  /** For `date` fields: collects a bare 4-digit year, not a full ISO date. */
  yearOnly?: boolean;
  /** Blocks Continue while empty. Defaults to true. */
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: readonly FieldOption[];
  /** Minimum characters, for text/textarea. */
  group?: string;
  minLength?: number;
  maxLength?: number;
  /** Minimum/maximum number of chosen options, for multi. */
  min?: number;
  max?: number;
  /** Extra pattern check, for text. */
  pattern?: RegExp;
  /** Overrides the generated message. */
  message?: string;
  skippable?: boolean;
}

export interface StepSchema {
  id: string;
  fields: readonly FieldDef[];
}

/* ------------------------------ shared bits ------------------------------- */

export const GENDERS: readonly FieldOption[] = [
  { value: "WOMEN", label: "Woman" },
  { value: "MEN", label: "Man" },
  { value: "NON-BINARY", label: "Non-binary" },
  { value: "OTHER", label: "Other" },
];

export const ORIENTATIONS: readonly FieldOption[] = [
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say", description: "You can add this later" },
  { value: "STRAIGHT", label: "Straight", "description": "Attracted to people of the opposite gender" },
  { value: "GAY", label: "Gay", "description": "Attracted to people of the same gender" },
  { value: "LESBIAN", label: "Lesbian", "description": "A woman attracted to other women" },
  { value: "BISEXUAL", label: "Bisexual", "description": "Attracted to more than one gender" },
  { value: "PANSEXUAL", label: "Pansexual", "description": "Attracted to people regardless of gender" },
  { value: "ASEXUAL", label: "Asexual", "description": "Little or no sexual attraction — may still feel romantic attraction" },
  { value: "AROMATIC", label: "Aromatic", "description": "Little or no romantic attraction — may still feel other connections" },
  { value: "QUEER", label: "Queer", description: "A broad, self-defined orientation" },
  { value: "QUESTIONING", label: "Questioning", "description": "Still exploring what feels right" },
];

export const HEIGHTS: readonly FieldOption[] = Array.from({ length: 151 }, (_, i) => {
  const cm = 90 + i * 1;
  return { value: String(cm), label: `${cm} cm` };
});

/** "YYYY-MM-DD", used by the date input and the API alike. */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** A `yearOnly` date field holds just the year. */
const YEAR_RE = /^\d{4}$/;

/* --------------------------------- schemas -------------------------------- */

export const STEP_SCHEMAS: Record<string, StepSchema> = {
  basics: {
    id: "basics",
    fields: [
      {
        name: "fullName",
        label: "Full name",
        kind: "text",
        placeholder: "Full name",
        minLength: 2,
        maxLength: 80,
        message: "Please enter your full name.",
      },
      {
        name: "email",
        label: "Email ID",
        kind: "text",
        placeholder: "you@email.com",
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
        message: "Please enter a valid email address.",
      },
      {
        name: "dateOfBirth",
        label: "Date of birth",
        kind: "date",
        hint: "We only show your age — never the full date.",
        message: "Please enter your date of birth.",
      },
      {
        name: "height",
        label: "Height",
        kind: "select",
        placeholder: "Select height",
        options: HEIGHTS,
      },
      {
        name: "gender",
        label: "Gender",
        kind: "select",
        placeholder: "Select gender",
        options: GENDERS,
      },
      {
        name: "sexualOrientation",
        label: "Sexual orientation",
        kind: "select",
        placeholder: "Select orientation",
        options: ORIENTATIONS,
        required: true,
        skippable: false,
        hint: "We use this to show you relevant matches.",
      },
    ],
  },

  preference: {
    id: "preference",
    fields: [
      {
        name: "genders",
        label: "Who are you interested in seeing?",
        kind: "radio",
        min: 1,
        options: [
          { value: "WOMEN", label: "Women", description: "Show me women" },
          { value: "MEN", label: "Men", description: "Show me men" },
          { value: "NON_BINARY", label: "Non-binary", description: "Show me non-binary people" },
        ],
        message: "Choose at least one option.",
      },
      {
        name: "sexualOrientation",
        label: "Sexual orientation",
        kind: "select",
        placeholder: "Select orientation",
        options: ORIENTATIONS,
        required: true,
        skippable: false,
        hint: "We use this to show you relevant matches.",
      },

    ],
  },

  intentions: {
    id: "intentions",
    fields: [
      {
        name: "intention",
        label: "What kind of love are you ready for?",
        kind: "radio",
        // Options are API-driven — see IntentionProvider in
        // context/OnBoardingDataContext. This field stays for validation only.
        message: "Choose what you're looking for.",
      },
    ],
  },

  lifestyle: {
    id: "lifestyle",
    // Questions and options are API-driven — see OnBoardingDataProvider in
    // context/OnBoardingDataContext. These entries only supply a sensible label
    // and fallback order; the step renders whatever the endpoint returns.
    fields: [
      {
        name: "nightlife",
        label: "Going out",
        kind: "radio",
        required: false,
        skippable: true,
      },
      {
        name: "alcohol",
        label: "Drinking",
        kind: "radio",
        required: false,
        skippable: true,
      },
      {
        name: "smoking",
        label: "Smoking",
        kind: "radio",
        required: false,
        skippable: true,
      },
      {
        name: "diet",
        label: "Food",
        kind: "radio",
        required: false,
        skippable: true,
      },
      {
        name: "fitness",
        label: "Fitness",
        kind: "radio",
        required: false,
        skippable: true,
      },
      {
        name: "sleep",
        label: "Sleep",
        kind: "radio",
        required: false,
        skippable: true,
      },
    ],
  },

  career: {
    id: "career",

    fields: [
      // =========================
      // EDUCATION
      // =========================
      {
        name: "collegeName",
        label: "College / institution name",
        kind: "text",
        group: "education",
        required: false,
        skippable: true,
        placeholder: "College / institution name",
        maxLength: 120,
      },

      {
        /* The one select on this step the backend does not feed. There is no
           education list endpoint yet, so these stay local. */
        name: "highestEducation",
        label: "Highest education",
        kind: "select",
        group: "education",
        required: false,
        skippable: true,
        placeholder: "Highest education",
        options: [
          { value: "HIGH_SCHOOL", label: "High school" },
          { value: "ITI", label: "ITI" },
          { value: "DIPLOMA", label: "Diploma" },
          { value: "UNDERGRADUATE", label: "Undergraduate" },
          { value: "BACHELOR", label: "Bachelor" },
          { value: "POSTGRADUATE", label: "Post Graduate" },
          { value: "MASTER", label: "Master" },
          { value: "MPHIL", label: "M Phil" },
          { value: "PHD", label: "PHD" },
          { value: "POST_DOCTORATE", label: "Post Doctorate" },
        ],
      },

      {
        name: "degree",
        label: "Degree / course",
        kind: "text",
        group: "education",
        required: false,
        skippable: true,
        placeholder: "Degree / course · e.g. B.Tech Computer",
        maxLength: 120,
      },

      {
        name: "graduationYear",
        label: "Graduation year",
        kind: "date",
        yearOnly: true,
        group: "education",
        required: false,
        skippable: true,
        placeholder: "2026",
        message: "Enter a graduation year.",
      },

      // =========================
      // WORK
      // =========================
      /* Every select below is fed by its own endpoint — see
         OnBoardingDataProvider. The ids it returns are what the save endpoint
         wants back, so no `options` belong here. */

      {
        name: "profession",
        label: "Profession",
        kind: "select",
        group: "work",
        required: false,
        skippable: true,
        placeholder: "Profession · select",
      },
      {
        name: "companyName",
        label: "Company / Organisation name",
        kind: "text",
        group: "work",
        required: false,
        skippable: true,
        placeholder: "Company / Organisation name",
        maxLength: 120,
      },
      {
        name: "employmentType",
        label: "Employment type",
        kind: "select",
        group: "work",
        required: false,
        skippable: true,
        placeholder: "Employment type · select",
      },
      {
        name: "experience",
        label: "Experience",
        kind: "select",
        group: "work",
        required: false,
        skippable: true,
        placeholder: "Experience · select",
      },
      {
        name: "salaryRange",
        label: "Expected salary",
        kind: "select",
        group: "work",
        required: false,
        skippable: true,
        placeholder: "Salary range · select",
      },

      // =========================
      // AMBITION
      // =========================
      {
        name: "ambition",
        label: "Ambition level",
        kind: "select",
        group: "ambition",
        required: false,
        skippable: true,
        placeholder: "Ambition level · select",
      },
      {
        name: "bigDreams",
        label: "Big dream",
        kind: "textarea",
        group: "ambition",
        required: false,
        skippable: true,
        placeholder: "Big dream — what are you aiming for?",
        maxLength: 100,
      },

    ],
  },

  interests: {
    id: "interests",
    /* The questions and their options come from the API, so the form data is
       keyed by each question's own `key` rather than by a field declared here.
       Leaving a static `interests` field in place would make validation look for
       a key the step never writes, and block Continue on it forever. The 5–10
       rule is carried by `toInterestsField` and enforced by the step's own
       Continue gate. */
    fields: [],
  },

  photos: {
    id: "photos",
    fields: [
      {
        name: "photos",
        label: "Your photos",
        kind: "photos",
        min: 2,
        max: 6,
        message: "Add at least 2 photos.",
        /* The client keeps an object URL for each preview; that's meaningless
           to the server, so the photos mapper in `stepPayloads.ts` sends only
           the file's identity and order. */
      },
    ],
  },

  bio: {
    id: "bio",
    fields: [
      {
        name: "bio",
        label: "About you",
        kind: "textarea",
        required: false,
        skippable: true,

        placeholder: "A few honest lines about who you are and what you're looking for…",
        minLength: 10,
        maxLength: 300,
        message: "Write at least 10 characters, or skip this step.",
      },
    ],
  },

  prompts: {
    id: "prompts",
    fields: [
      {
        name: "answers",
        label: "Prompt answers",
        kind: "multi",
        required: false,
        skippable: true,

        min: 1,
        max: 3,
        message: "Answer at least one prompt, or skip the step.",
      },
    ],
  },

  location: {
    id: "location",
    fields: [
      {
        name: "country",
        label: "Country",
        kind: "text",
        minLength: 2,
        maxLength: 80,
        message: "Please allow location access to detect your country.",
      },
      {
        name: "state",
        label: "State",
        kind: "text",
        // Some places have no state in OpenStreetMap (e.g. city-states),
        // and the component falls back to "" in that case.
        required: false,
        maxLength: 80,
      },
      {
        name: "city",
        label: "Location",
        kind: "text",
        minLength: 2,
        maxLength: 80,
        message: "Please allow location access to detect your city.",
      },
      {
        name: "area",
        label: "Area",
        kind: "text",
        minLength: 2,
        maxLength: 80,
        message: "Please allow location access to detect your area.",
      },
      {
        name: "latitude",
        label: "Latitude",
        kind: "text",
        min: -90,
        max: 90,
        message: "Please allow location access to continue.",
      },
      {
        name: "longitude",
        label: "Longitude",
        kind: "text",
        min: -180,
        max: 180,
        message: "Please allow location access to continue.",
      },
      {
        name: "max_distance_km",
        label: "Maximum distance (km)",
        kind: "text",
        min: 1,
        max: 500,
        message: "Please choose a distance.",
      },
    ],
  },

  review: {
    id: "review",
    fields: [],
  },
};

/* ------------------------------ default values ---------------------------- */

function emptyValueFor(field: FieldDef): unknown {
  if (field.kind === "multi" || field.kind === "photos") return [];
  if (field.kind === "radio") return "";
  return "";
}

/** The shape a step's data object starts in — every key present, none filled. */
export function initialStepData(schema: StepSchema): Record<string, unknown> {
  return Object.fromEntries(schema.fields.map((f) => [f.name, emptyValueFor(f)]));
}

/* ------------------------------- validation ------------------------------- */

export function isBlank(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export type FieldErrors = Record<string, string>;

function validateField(field: FieldDef, value: unknown): string | null {
  const required = field.required !== false;

  if (isBlank(value)) {
    if (!required) return null;
    return field.message ?? `${field.label} is required.`;
  }

  if (typeof value === "string") {
    if (field.maxLength && value.length > field.maxLength) {
      return `${field.label} must be ${field.maxLength} characters or fewer.`;
    }
    if (field.minLength && value.trim().length < field.minLength) {
      return field.message ?? `${field.label} must be at least ${field.minLength} characters.`;
    }
    if (field.pattern && !field.pattern.test(value.trim())) {
      return field.message ?? `${field.label} is not valid.`;
    }
    if (field.kind === "date" && !(field.yearOnly ? YEAR_RE : DATE_RE).test(value)) {
      return field.message ?? `${field.label} is not valid.`;
    }
  }

  if (Array.isArray(value)) {
    if (field.min && value.length < field.min) {
      return field.message ?? `Choose at least ${field.min}.`;
    }
    if (field.max && value.length > field.max) {
      return `Choose no more than ${field.max}.`;
    }
  }

  return null;
}

/** Returns one message per failing field. An empty object means the step passes. */
export function validateStepData(schema: StepSchema, data: Record<string, unknown>): FieldErrors {
  const errors: FieldErrors = {};

  for (const field of schema.fields) {
    const message = validateField(field, data[field.name]);
    if (message) errors[field.name] = message;
  }

  return errors;
}
