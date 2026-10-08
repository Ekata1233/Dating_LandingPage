"use client";

/* -------------------------------------------------------------------------- */
/*  Edit profile (desktop frame + mobile fluid).                                */
/*                                                                            */
/*  One long, single-page form — every section stacked one below another, the   */
/*  way the onboarding flow presents the same information across its steps.      */
/*  Nothing here is a step, nothing advances, and nothing is invented:          */
/*                                                                            */
/*    values   -> GET /api/user/onboarding-details, via `OnBoardingDataContext` */
/*                (`profileDetails`). Nothing is seeded from a mock. The six     */
/*                edit-only extras (religion, caste, mother tongue, zodiac,      */
/*                love language, communication style) are the exception: that    */
/*                payload does not carry them, so they come from                */
/*                GET /api/user/feed/details/:userId via `useUserDetails` — the  */
/*                same `loadDetails` the feed cards read.                        */
/*    options  -> the same option lists the onboarding steps read: intentions,   */
/*                lifestyle questions, interests questions, profession /         */
/*                experience / employment-type / salary-range / ambition, and    */
/*                the prompt catalogue.                                          */
/*    labels   -> `STEP_SCHEMAS`, so a field says the same thing here as it      */
/*                does during onboarding.                                        */
/*                                                                            */
/*  Presentation: each field is a summary row (LABEL / current value / chevron)  */
/*  inside a section card. Tapping a row opens the *same* onboarding field       */
/*  component underneath it, so the data mapping is untouched — only the way it   */
/*  is shown changed.                                                            */
/*                                                                            */
/*  The form holds only what the user has *changed*. Everything else is derived  */
/*  from the payload on every render, which is why a refetch after a server-side*/
/*  update refreshes the untouched fields for free and never clobbers an edit.   */
/*                                                                            */
/*  Location is detected from the device on an explicit click (never on mount)  */
/*  and written through `setField`, like every other field.                     */
/*                                                                            */
/*  Save fans the changed sections out over the *same* per-step PATCH endpoints  */
/*  onboarding already uses, through the same mappers in `stepPayloads.ts`.      */
/*  There is deliberately no "save the whole profile" call: each section goes   */
/*  to the endpoint that owns it, and only sections the user actually touched    */
/*  are sent, so saving one field never rewrites the other nine. The mappers are */
/*  shared rather than reimplemented, which is why the field names here are the */
/*  onboarding field names — that identity is what makes the mapping work with  */
/*  no translation layer in between.                                             */
/* -------------------------------------------------------------------------- */

import { cn } from "cn";
import {
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  ImagePlus,
  Images,
  Loader2,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  PlusCircle,
  Search,
  Sparkles,
  User,
  Users,
  Video,
  Wine,
  X,
  type LucideIcon,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { photoIdFrom, useProfileData } from "@/app/context/OnBoardingApiContext";
import {
  INTERESTS_MAX,
  INTERESTS_MIN,
  isCareerField,
  toInterestsField,
  toLifestyleField,
  useCareerOptionSources,
  useOnBoardingData,
  usePromptCategories,
  type OnboardingDetailsApi,
  type PromptItem,
} from "@/app/context/OnBoardingDataContext";
import {
  useUserProfileData,
  type FamilyOptionKey,
  type FamilyOptions,
  type FamilyProfilePayload,
  type Sibling,
} from "@/app/context/UserProfileDataContext";
import { useUserDetails } from "@/app/context/UsersContext";
import {
  DateField,
  MultiField,
  RadioField,
  SelectField,
  TextareaField,
  TextField,
} from "@/app/onBoarding/OnboardingFields";
import {
  stepDataFromDetails,
  toBasicInfoRequest,
  toBioRequest,
  toCareerRequest,
  toEditBasicInfoRequest,
  toIntentionsRequest,
  toInterestedInRequest,
  toInterestsRequests,
  toLifestyleRequests,
  toLocationRequest,
  toPhotoBody,
  toPromptsRequest,
  type PhotoValue,
} from "@/app/onBoarding/stepPayloads";
import {
  FieldOption,
  STEP_SCHEMAS,
  validateStepData,
  type FieldDef,
  type FieldErrors,
} from "@/app/onBoarding/stepSchemas";

import { Loader, Notice } from "../shared/Loader";
import { useRouter } from "next/navigation";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

/** One answered prompt. `promptId` is what a save endpoint would take back. */
export interface PromptAnswer {
  promptId: string;
  question: string;
  answer: string;
}
export const ZODIAC: readonly FieldOption[] = [
  { value: "ARIES", label: "Aries" },
  { value: "TAURUS", label: "Taurus" },
  { value: "GEMINI", label: "Gemini" },
  { value: "CANCER", label: "Cancer" },
  { value: "LEO", label: "Leo" },
  { value: "VIRGO", label: "Virgo" },
  { value: "LIBRA", label: "Libra" },
  { value: "SCORPIO", label: "Scorpio" },
  { value: "SAGITTARIUS", label: "Sagittarius" },
  { value: "CAPRICORN", label: "Capricorn" },
  { value: "AQUARIUS", label: "Aquarius" },
  { value: "PISCES", label: "Pisces" },
];

export const LOVELANGUAGE: readonly FieldOption[] = [
  { value: "WORDS_OF_AFFIRMATION", label: "Words of Affirmation" },
  { value: "QUALITY_TIME", label: "Quality Time" },
  { value: "ACTS_OF_SERVICE", label: "Acts of Service" },
  { value: "PHYSICAL_TOUCH", label: "Physical Touch" },
  { value: "RECEIVING_GIFTS", label: "Receiving Gifts" },
];

export const COMMUNICATIONSTYLE: readonly FieldOption[] = [
  { value: "PHONE_CALLS_OVER_TEXTS", label: "Phone Calls over Texts" },
  { value: "TEXTS_OVER_CALLS", label: "Texts over Calls" },
  { value: "VIDEO_CALLS", label: "Video Calls" },
  { value: "VOICE_NOTES", label: "Voice Notes" },
  { value: "IN_PERSON_ALWAYS", label: "In Person Always" },
  { value: "A_BIT_OF_EVERYTHING", label: "A Bit of Everything" },
];
/**
 * What the form would post. Grouped rather than flat so a future save can fan
 * the fields out over the per-step endpoints onboarding already has, instead of
 * inventing one endpoint for the whole page.
 */
export interface ProfileEditPayload {
  /** Field values, keyed by the onboarding field name (`fullName`, `profession`…). */
  fields: Record<string, unknown>;
  prompts: PromptAnswer[];
}

/**
 * Thrown inside the save fan-out when a section's PATCH comes back unsuccessful,
 * so the loop unwinds to the one handler instead of checking `success` after every
 * call. `section` is the label of the section that failed, which is the bit the
 * user actually needs — "Couldn't save" on a form this long tells them nothing.
 */
class SaveFailed extends Error {
  constructor(message: string | undefined, readonly section: string) {
    super(message ?? "Couldn't save that section.");
    this.name = "SaveFailed";
  }
}

/**
 * A caller-supplied photo. Only needed to render a *preview* grid — omitted, the
 * section reads the real list off `flows.PHOTOS` and posts through the endpoints.
 */
export interface ProfilePhoto {
  id: string;
  url: string;
  isMain?: boolean;
}

/**
 * One tile in the grid, whether the photo is already on the server or is a file
 * this session is still posting. `serverId` is what the delete endpoint accepts,
 * so it is only set once the upload settles.
 */
interface PhotoTile {
  /** Stable React key: the server id, or the local object URL while in flight. */
  key: string;
  url: string;
  name: string;
  isMain: boolean;
  uploading: boolean;
  serverId: string;
}

/** Slot count and minimum, taken from the photos schema rather than restated. */
const PHOTO_SLOTS = STEP_SCHEMAS.photos.fields[0].max ?? 6;
const PHOTO_MIN = STEP_SCHEMAS.photos.fields[0].min ?? 2;

export interface ProfileEditMainProps {
  /**
   * Fires on Save, alongside the per-section PATCH fan-out. Purely an extra
   * seam for a caller that wants to observe the payload; the save itself does
   * not depend on it being passed.
   */
  onSave?: (data: ProfileEditPayload) => void | Promise<unknown>;
  /** Fill the parent edge to edge instead of rendering the 300px desktop frame. */
  fluid?: boolean;
  /** Caller-owned busy state, for when a caller wants to show its own spinner. */
  saving?: boolean;
  /**
   * Values applied underneath the API payload. Useful for a preview or a draft,
   * never used to stand in for a missing payload.
   */
  initialData?: Record<string, unknown>;
  /**
   * Overrides the Photos grid. Omit it and the section reads the server's own
   * list and posts through the photo endpoints; pass it only to render a preview
   * list that isn't the user's real one.
   */
  photos?: ProfilePhoto[];
  /** Replaces the built-in remove, which deletes on the server then drops the tile. */
  onRemovePhoto?: (photo: ProfilePhoto) => void;
  /** Renders the live-video card when given. Omit and the section is not shown. */
  onRecordVideo?: () => void;
  /**
   * Runs once the whole fan-out has succeeded, after the overrides are dropped.
   *
   * Omitted, the form navigates to `/app/profile` — the edit page has served its
   * purpose at that point and staying on it would only invite a second save over
   * the top of one just written. The mobile Edit/Preview tabs pass this instead,
   * to swap to the Preview tab and refetch, because there the preview *is* the
   * screen the user wants to land on.
   */
  onSaved?: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Location (geolocation + reverse geocoding)                                 */
/* -------------------------------------------------------------------------- */

const DEFAULT_MAX_DISTANCE_KM = 25;

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state_district?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  quarter?: string;
  state?: string;
  country?: string;
};

/** The shape the save endpoint expects. */
type ResolvedLocation = {
  country: string;
  state: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
};

type PlaceParts = Pick<ResolvedLocation, "country" | "state" | "city" | "area">;

/**
 * Reverse-geocodes coordinates via OpenStreetMap Nominatim (free, no key,
 * light use only). For production traffic, proxy this through your own API
 * route with Google / Mapbox / LocationIQ.
 */
async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<ResolvedLocation> {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "14",
    addressdetails: "1",
    "accept-language": "en",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params}`,
    {
      signal,
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed: ${response.status}`);
  }

  const data = await response.json();
  const address: NominatimAddress = data.address ?? {};
  const country = address.country ?? "";
  const state = address.state ?? "";
  const city =
    address.city ??
    address.town ??
    address.municipality ??
    address.village ??
    "";

  // Prefer broader locality/suburb over small neighbourhoods.
  // This is more likely to return "Hadapsar" instead of "Fatima Nagar".
  const area =
    address.suburb ??
    address.city_district ??
    address.neighbourhood ??
    address.quarter ??
    "";

  return {
    country,
    state,
    city,
    // Some places have no sub-locality in OSM; fall back to the city so the
    // required `area` field is never empty.
    area: area || city,
    latitude: Number(latitude.toFixed(4)),
    longitude: Number(longitude.toFixed(4)),
  };
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

/** "Kothrud, Pune, Maharashtra, India" (drops empty/duplicate parts). */
function formatLocation(l: PlaceParts) {
  return [l.area, l.city, l.state, l.country]
    .filter((part, i, arr) => Boolean(part) && arr.indexOf(part) === i)
    .join(", ");
}

/* -------------------------------------------------------------------------- */
/*  Payload -> form values                                                     */
/* -------------------------------------------------------------------------- */

function text(value: unknown): string {
  if (value === null || value === undefined) return "";

  return Array.isArray(value) ? "" : String(value);
}

/** `0` is a real latitude/longitude, so only blank is treated as "not set". */
function coordinate(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";

  const parsed = Number(value);

  return Number.isFinite(parsed) ? String(parsed) : "";
}

/**
 * `flows.PROMPT` is untyped on the wire, so every key is read defensively and a
 * row without an answer is dropped — the prompt list is only ever real answers.
 */
function promptsFromDetails(details: OnboardingDetailsApi): PromptAnswer[] {
  const raw = details.flows?.PROMPT;

  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => {
      const record = (entry ?? {}) as Record<string, unknown>;

      return {
        promptId: text(record.promptId) || text(record.id),
        question: text(record.question) || text(record.promptQuestion),
        answer: (text(record.answer) || text(record.response)).slice(0, 200),
      };
    })
    .filter((prompt) => Boolean(prompt.promptId && prompt.answer));
}

/**
 * The saved profile as one flat field object.
 *
 * `stepDataFromDetails` already does this job for the onboarding flow, keyed by
 * step, so it is reused rather than reimplemented — that is what makes a hydrated
 * select hold the option id its own endpoint handed out, and therefore show a
 * label instead of a blank. The location and prompt groups the onboarding
 * hydration does not carry are filled in here.
 */
function fieldsFromDetails(
  details: OnboardingDetailsApi,
  initial?: Record<string, unknown>
): Record<string, unknown> {
  const fields: Record<string, unknown> = {};

  for (const step of Object.values(stepDataFromDetails(details))) {
    Object.assign(fields, step);
  }

  const location = details.flows?.LOCATION ?? {};

  /* Onboarding derives coordinates from the device rather than asking, so the
     edit form shows the four human fields and keeps the rest in the payload. */
  Object.assign(fields, {
    country: text(location.country),
    state: text(location.state),
    city: text(location.city),
    area: text(location.area),
    latitude: coordinate(location.latitude),
    longitude: coordinate(location.longitude),
    max_distance_km: coordinate(location.max_distance_km),
  });

  return { ...fields, ...initial };
}

/* -------------------------------------------------------------------------- */
/*  Value coercion                                                            */
/* -------------------------------------------------------------------------- */

/** A single-value field reads a string out of whatever shape the payload used. */
function asString(value: unknown): string {
  if (value === null || value === undefined) return "";

  return Array.isArray(value) ? "" : String(value);
}

/** A multi-value field accepts either a list or a lone answer for the question. */
function asList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);

  if (value === null || value === undefined || value === "") return [];

  return [String(value)];
}

/* -------------------------------------------------------------------------- */
/*  Display helpers (read-only — they never change what is stored)             */
/* -------------------------------------------------------------------------- */

/** Finds the option a stored value points at, whatever shape the list uses. */
function findOption(options: unknown, value: string): Record<string, unknown> | string | null {
  if (!value || !Array.isArray(options)) return null;

  for (const option of options) {
    if (typeof option === "string") {
      if (option === value) return option;
      continue;
    }

    if (option && typeof option === "object") {
      const record = option as Record<string, unknown>;

      if (text(record.value ?? record.id) === value) return record;
    }
  }

  return null;
}

/** The label to show for a stored option id; falls back to the raw value. */
function optionLabel(options: unknown, value: string): string {
  const option = findOption(options, value);

  if (!option) return value;
  if (typeof option === "string") return option;

  return text(option.label ?? option.name ?? option.title) || value;
}

function optionDescription(options: unknown, value: string): string {
  const option = findOption(options, value);

  if (!option || typeof option === "string") return "";

  return text(option.description ?? option.subtitle);
}

/**
 * A saved option arrives as an id, a label, or the object either one lives in —
 * so `{ id: 31, value: "2 Sisters" }` reads as "31" and never "[object Object]".
 */
function unwrapOption(saved: unknown): unknown {
  if (saved && typeof saved === "object" && !Array.isArray(saved)) {
    const record = saved as Record<string, unknown>;
    return record.id ?? record.value ?? record.name ?? record.label ?? "";
  }

  return saved;
}

/**
 * The option id a saved value points at, matched on value *or* on label —
 * the feed details hand back whichever the backend stored (an id, a wire
 * enum, or the display name), and this is the one place the saved shape and
 * the option list's shape are allowed to differ. Unmatched resolves to "",
 * which reads as "not set" rather than inventing an answer.
 */
function resolveOptionId(options: readonly FieldOption[], saved: unknown): string {
  const raw = text(unwrapOption(saved)).trim();
  if (!raw) return "";

  const wanted = raw.toLowerCase();
  const hit = options.find(
    (option) =>
      option.value.toLowerCase() === wanted || option.label.trim().toLowerCase() === wanted
  );

  return hit ? hit.value : "";
}

/**
 * The value a select holds for a stored answer: its option id when the list can
 * name it, the stored text itself when it cannot. A saved answer the list has
 * dropped still reads on the field instead of as "not set", and a save still
 * sends an id only when one is actually known.
 */
function optionValueFor(options: readonly FieldOption[], saved: unknown): string {
  return resolveOptionId(options, saved) || text(unwrapOption(saved)).trim();
}

/** Mother tongue is multi: a list, or one string that may name several. */
function resolveOptionIds(options: readonly FieldOption[], saved: unknown): string[] {
  const entries = Array.isArray(saved) ? saved : [saved];

  return entries
    .flatMap((entry) => text(unwrapOption(entry)).split(","))
    .map((entry) => resolveOptionId(options, entry))
    .filter((entry) => entry !== "");
}

/* -------------------------------------------------------------------------- */
/*  Siblings (the Family section's two counts, one row per sibling)             */
/* -------------------------------------------------------------------------- */

/** Which half of the sibling list a row sits under — the row's relation. */
type SiblingGroup = "sister" | "brother";

interface SiblingCounts {
  sisters: number;
  brothers: number;
}

/** One sibling row: the two answers a row collects. `group` *is* the relation. */
interface SiblingRow {
  group: SiblingGroup;
  occupation: string;
  marital: string;
}

/**
 * A row as the feed handed it over — before anything knows which half of the
 * family it belongs to. `group` is null when the stored relation is missing,
 * composite ("More than 2 Siblings"), or an id this list cannot name.
 */
interface StoredSiblingRow {
  group: SiblingGroup | null;
  occupation: string;
  marital: string;
}

const emptySibling = (group: SiblingGroup): SiblingRow => ({
  group,
  occupation: "",
  marital: "",
});

/**
 * What the two count selects offer. `4` stands for "More than 3" — the list has
 * no larger exact value, and a saved count past it gets its own entry appended
 * (see `countOptionsFor`) so a big family is never collapsed on the way back in.
 */
const SIBLING_COUNT_OPTIONS: readonly FieldOption[] = [
  { value: "0", label: "None" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "More than 3" },
];

const SIBLING_COUNT_MAX = 4;

/**
 * The list a sibling row's select shows — with that row's own saved answer
 * appended when the fetched list no longer holds it. Without this a stored id
 * the list has dropped would leave the trigger blank, which reads as "the
 * profile has nothing here" even though it does.
 */
function selectOptionsWith(
  options: readonly FieldOption[] | undefined,
  value: string
): readonly FieldOption[] {
  const list = options ?? [];
  if (value === "" || list.some((option) => option.value === value)) return list;

  return [...list, { value, label: value }];
}

/** The list a select shows — with an exact entry when the saved count exceeds it. */
const countOptionsFor = (count: number): readonly FieldOption[] =>
  count > SIBLING_COUNT_MAX
    ? [...SIBLING_COUNT_OPTIONS, { value: String(count), label: String(count) }]
    : SIBLING_COUNT_OPTIONS;

/** "" means "not answered"; any other number is how many siblings there are. */
function isCounted(value: unknown): boolean {
  const raw = text(value).trim();
  return raw !== "" && Number.isFinite(Number(raw));
}

function countFrom(value: unknown): number {
  const n = Number(text(value));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/** The relation text a stored sibling row carries, in whichever shape it arrived. */
function relationTextOf(entry: unknown): string {
  const record = entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {};

  return text(
    unwrapOption(
      record.relation ?? record.relationId ?? record.siblingType ?? (typeof entry === "string" ? entry : "")
    )
  );
}

/**
 * The group a stored relation names. Read-only: it turns old rows — which each
 * carried their own relation select — into rows the counts-driven UI can place.
 * A composite label ("1 Brother & 1 Sister") names no single side, so it reads
 * as no group rather than a guess.
 */
function groupFromRelation(relation: unknown): SiblingGroup | null {
  const label = text(relation).trim().toLowerCase();
  const sister = label.includes("sister");
  const brother = label.includes("brother");

  if (sister && !brother) return "sister";
  if (brother && !sister) return "brother";
  return null;
}

/**
 * Parses a `siblingtype` option — "No Siblings", "2 Sisters", "4 Brothers",
 * "1 Brother & 1 Sister" — into counts. The one value that says nothing exact,
 * "More than 2 Siblings", reads as null and is the caller's problem.
 */
function countsFromSiblingTypeLabel(label: unknown): SiblingCounts | null {
  const raw = text(label).trim().toLowerCase();
  if (!raw) return null;
  if (raw === "no siblings") return { sisters: 0, brothers: 0 };

  const both = /^(\d+)\s+brothers?\s*&\s*(\d+)\s+sisters?$/.exec(raw);
  if (both) return { sisters: Number(both[2]), brothers: Number(both[1]) };

  const brothers = /^(\d+)\s+brothers?$/.exec(raw);
  if (brothers) return { sisters: 0, brothers: Number(brothers[1]) };

  const sisters = /^(\d+)\s+sisters?$/.exec(raw);
  if (sisters) return { sisters: Number(sisters[1]), brothers: 0 };

  return null;
}

/**
 * The two counts a saved family implies, read first from the profile's
 * `siblingType` (one answer for the whole family) and then from the stored
 * rows, whose relation may name one side each.
 *
 * `null` means the profile says nothing about siblings at all, so both selects
 * stay unanswered rather than claiming "None".
 *
 * Whatever it works out, the counts never come back smaller than the rows that
 * arrived: a row the relation could not place still needs a slot, or its
 * occupation and marital status would be sliced off by `padSiblingRows`.
 */
function hydrateSiblingCounts(
  raw: unknown,
  siblingTypeId: unknown,
  lists: Record<FamilyOptionKey, FieldOption[]> | null,
  rowCount = 0
): SiblingCounts | null {
  const rows = Array.isArray(raw) ? raw : [];
  if (rows.length === 0 && !text(siblingTypeId).trim()) return null;

  const fromType = countsFromSiblingTypeLabel(
    optionLabel(lists?.relation ?? [], text(siblingTypeId))
  );

  const fromRows = rows.reduce<SiblingCounts>(
    (total, entry) => {
      const counts = countsFromSiblingTypeLabel(
        optionLabel(lists?.relation ?? [], relationTextOf(entry))
      );
      if (!counts) return total;

      return {
        sisters: total.sisters + counts.sisters,
        brothers: total.brothers + counts.brothers,
      };
    },
    { sisters: 0, brothers: 0 }
  );

  /* "More than 2 Siblings" names no exact split, so the stored rows are kept
     by halving them — an uneven guess beats dropping a sibling on a save. */
  const halved = rows.length > 0
    ? {
        sisters: Math.floor(rows.length / 2),
        brothers: rows.length - Math.floor(rows.length / 2),
      }
    : { sisters: 0, brothers: 0 };

  const counts =
    fromType ??
    (fromRows.sisters + fromRows.brothers > 0 ? fromRows : null) ??
    halved;

  /* Each side must also cover the rows that belong to it. The type answer
     describes the family as a whole and can understate — or name — neither
     side, and `padSiblingRows` slices a row off a side with no slot, taking
     that sibling's occupation and marital status with it. */
  const sideRows = rows.reduce<SiblingCounts>(
    (total, entry) => {
      const group = groupFromRelation(
        optionLabel(lists?.relation ?? [], relationTextOf(entry))
      );

      if (group === "sister") return { ...total, sisters: total.sisters + 1 };
      if (group === "brother") return { ...total, brothers: total.brothers + 1 };
      return total;
    },
    { sisters: 0, brothers: 0 }
  );

  const sisters = Math.max(counts.sisters, sideRows.sisters);
  const brothers = Math.max(counts.brothers, sideRows.brothers);

  const needed = Math.max(rows.length, rowCount);
  const total = sisters + brothers;
  if (total >= needed) return { sisters, brothers };

  /* Every extra slot stays empty — it exists so a stored answer has somewhere
     to land, not to invent a sibling the profile never had. */
  return { sisters: sisters + (needed - total), brothers };
}

/**
 * The stored siblings as form rows. Nothing is thrown away here: a row whose
 * relation names no single side comes back with `group: null` for
 * `placeSiblingRows` to seat, because it may be the only record of that
 * sibling's occupation and marital status.
 */
function hydrateSiblingRows(
  raw: unknown,
  lists: Record<FamilyOptionKey, FieldOption[]> | null
): StoredSiblingRow[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => {
      const record =
        entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {};

      return {
        group: groupFromRelation(
          optionLabel(lists?.relation ?? [], relationTextOf(entry))
        ),
        occupation: optionValueFor(
          lists?.siblingOccupation ?? [],
          record.occupation ?? record.occupationId ?? record.occupation_id ?? record.job
        ),
        marital: optionValueFor(
          lists?.siblingMarital ?? [],
          record.marital ??
            record.maritalId ??
            record.maritalStatus ??
            record.maritalStatusId ??
            record.marital_status
        ),
      };
    })
    .filter((row) => row.occupation !== "" || row.marital !== "");
}

/**
 * Counts -> the rows the form shows. Readable rows keep their own group; the
 * rest are seated in the first slot still empty, sisters before brothers —
 * the order `toFamilyRequest` sends them in, so a save round-trips onto the
 * same row it came from.
 */
function placeSiblingRows(rows: StoredSiblingRow[], counts: SiblingCounts): SiblingRow[] {
  const grouped: SiblingRow[] = [];
  const loose: StoredSiblingRow[] = [];

  for (const row of rows) {
    if (row.group) {
      grouped.push({ group: row.group, occupation: row.occupation, marital: row.marital });
    } else {
      loose.push(row);
    }
  }

  const placed = padSiblingRows(grouped, counts);

  let next = 0;
  return placed.map((slot) => {
    if (next >= loose.length || slot.occupation !== "" || slot.marital !== "") return slot;

    const row = loose[next];
    next += 1;
    return { group: slot.group, occupation: row.occupation, marital: row.marital };
  });
}

/** Exactly `counts` rows per group, sisters first, keeping what was stored. */
function padSiblingRows(rows: SiblingRow[], counts: SiblingCounts): SiblingRow[] {
  const sisters = rows.filter((row) => row.group === "sister");
  const brothers = rows.filter((row) => row.group === "brother");

  const take = (group: SiblingGroup, own: SiblingRow[], count: number) => [
    ...own.slice(0, count),
    ...Array.from({ length: Math.max(0, count - own.length) }, () => emptySibling(group)),
  ];

  return [
    ...take("sister", sisters, counts.sisters),
    ...take("brother", brothers, counts.brothers),
  ];
}

/** Whatever landed in `fields.siblings`, read back defensively as rows. */
function asSiblingRows(value: unknown): SiblingRow[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      const record =
        entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {};

      const group =
        record.group === "sister" || record.group === "brother"
          ? record.group
          : groupFromRelation(record.relation);

      if (!group) return null;

      return { group, occupation: text(record.occupation), marital: text(record.marital) };
    })
    .filter((row): row is SiblingRow => row !== null);
}

/**
 * The relation id a row carries: each row is one brother or one sister, so it
 * points at the list's single-sibling option for its own side — the composite
 * options describe a whole family, not one person.
 */
function relationIdForGroup(group: SiblingGroup, options: readonly FieldOption[]): string {
  const own = group === "sister" ? "sister" : "brother";
  const other = group === "sister" ? "brother" : "sister";

  const exact = options.find((option) => option.label.trim().toLowerCase() === `1 ${own}`);
  if (exact) return exact.value;

  const near = options.find((option) => {
    const label = option.label.toLowerCase();
    return label.includes(own) && !label.includes(other);
  });

  return near?.value ?? "";
}

/**
 * The `siblingtype` option describing a family of this shape, resolved against
 * the fetched list so the id is the backend's rather than a hardcoded one.
 * Anything the list cannot say exactly — 3 brothers, two of each — falls to the
 * "More than 2 Siblings" catch-all.
 */
function siblingTypeIdFor(counts: SiblingCounts, options: readonly FieldOption[]): string {
  const { sisters, brothers } = counts;
  const candidates: string[] = [];

  if (sisters === 0 && brothers === 0) candidates.push("No Siblings");
  else if (sisters === 0) candidates.push(`${brothers} Brother${brothers === 1 ? "" : "s"}`);
  else if (brothers === 0) candidates.push(`${sisters} Sister${sisters === 1 ? "" : "s"}`);
  else if (sisters === 1 && brothers === 1) candidates.push("1 Brother & 1 Sister");

  candidates.push("More than 2 Siblings");

  for (const candidate of candidates) {
    const id = resolveOptionId(options, candidate);
    if (id) return id;
  }

  return "";
}

/**
 * What a closed row says about a family: the backend's own sibling-type wording
 * when the list can name this shape ("2 Sisters", "1 Brother & 1 Sister"), and
 * the plain counts when it cannot. Kept as a read-only display — the counts
 * behind it are still what the editor answers.
 */
function describeSiblingCounts(
  counts: SiblingCounts,
  lists: Record<FamilyOptionKey, FieldOption[]> | null
): string {
  const relation = lists?.relation ?? [];
  const fromType = optionLabel(relation, siblingTypeIdFor(counts, relation));
  /* An unresolved id renders as the raw number, which says nothing on a row. */
  if (fromType && !/^\d+$/.test(fromType)) return fromType;

  const parts: string[] = [];
  if (counts.sisters > 0) parts.push(`${counts.sisters} Sister${counts.sisters === 1 ? "" : "s"}`);
  if (counts.brothers > 0) parts.push(`${counts.brothers} Brother${counts.brothers === 1 ? "" : "s"}`);

  return parts.join(" · ") || "No siblings";
}

/**
 * The second line under that value: each stored sibling's own answers, named the
 * way the editor names them. Built per render — a string over a handful of rows
 * is not a derivation worth memoizing.
 */
function describeStoredSiblings(
  siblings: readonly SiblingRow[],
  counts: SiblingCounts,
  lists: Record<FamilyOptionKey, FieldOption[]> | null
): string {
  const parts: string[] = [];

  for (const group of ["sister", "brother"] as const) {
    const own = siblings.filter((row) => row.group === group);
    const count = group === "sister" ? counts.sisters : counts.brothers;

    for (let index = 0; index < count; index += 1) {
      const row = own[index] ?? emptySibling(group);
      const occupation = optionLabel(lists?.siblingOccupation ?? [], row.occupation);
      const marital = optionLabel(lists?.siblingMarital ?? [], row.marital);
      const facts = [occupation, marital].filter((fact) => fact !== "");
      if (facts.length === 0) continue;

      const who = group === "sister" ? `Sister ${index + 1}` : `Brother ${index + 1}`;
      parts.push(`${who}: ${facts.join(", ")}`);
    }
  }

  return parts.join("  ·  ");
}

/**
 * The Family section -> PATCH /api/user/profile/family. Every id rides the form
 * as an option-id string; anything the user never answered is left out of the
 * body rather than sent as `0`, which the backend would read as a real option.
 *
 * The rows are the counts' rows: a sibling whose occupation and marital status
 * are both blank sends nothing at all, because `siblingTypeId` already says
 * that sibling exists.
 */
function toFamilyRequest(
  fields: Record<string, unknown>,
  lists: Record<FamilyOptionKey, FieldOption[]> | null
): FamilyProfilePayload {
  const id = (name: string): number | undefined => {
    const value = Number(text(fields[name]));
    return Number.isFinite(value) && value > 0 ? value : undefined;
  };

  const counts: SiblingCounts = {
    sisters: isCounted(fields.sisterCount) ? countFrom(fields.sisterCount) : 0,
    brothers: isCounted(fields.brotherCount) ? countFrom(fields.brotherCount) : 0,
  };

  const relationOptions = lists?.relation ?? [];
  /* An unanswered pair says nothing, so it sends no `siblingTypeId` — "No
     Siblings" is an answer, not the absence of one. */
  const answered = isCounted(fields.sisterCount) || isCounted(fields.brotherCount);
  const siblingTypeId = answered
    ? Number(siblingTypeIdFor(counts, relationOptions)) || undefined
    : undefined;

  const siblings = padSiblingRows(asSiblingRows(fields.siblings), counts)
    .map((row): Partial<Sibling> => {
      const relationId = Number(relationIdForGroup(row.group, relationOptions)) || undefined;
      const occupationId = Number(row.occupation) || undefined;
      const maritalId = Number(row.marital) || undefined;

      return {
        ...(relationId ? { relationId } : {}),
        ...(occupationId ? { occupationId } : {}),
        ...(maritalId ? { maritalId } : {}),
      };
    })
    .filter((row) => Object.keys(row).length > 0);

  return {
    familyStatusId: id("familyStatus"),
    familyTypeId: id("familyType"),
    fatherOccupationId: id("fatherOccupation"),
    fatherOrganisationId: id("fatherOrganisation"),
    motherOccupationId: id("motherOccupation"),
    motherOrganisationId: id("motherOrganisation"),
    familyHomeId: id("familyHome"),
    nativePlaceId: id("nativePlace"),
    familyIncomeId: id("familyIncome"),
    siblingTypeId,
    siblings,
  };
}

/** `2004-07-09` -> `09 / 07 / 2004`. Anything else is shown as stored. */
function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  return match ? `${match[3]} / ${match[2]} / ${match[1]}` : value;
}

function ageFrom(value: string): number | null {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();

  if (
    now.getMonth() < date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() < date.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 && age < 130 ? age : null;
}

/** `170` -> `5'7" · 170 cm`. Only applied when the stored height is a bare number. */
function formatHeightCm(value: string): string {
  const cm = Number(value);

  if (!Number.isFinite(cm) || cm <= 0) return value;

  const totalInches = Math.round(cm / 2.54);

  return `${Math.floor(totalInches / 12)}'${totalInches % 12}" · ${Math.round(cm)} cm`;
}

/* -------------------------------------------------------------------------- */
/*  Section chrome                                                            */
/* -------------------------------------------------------------------------- */

interface SectionHeadingProps {
  icon: LucideIcon;
  title: string;
  hint?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ icon: Icon, title, hint }) => (
  <>
    <h3 className="pec-section-title">
      <Icon className="pec-section-icon" aria-hidden="true" />
      <span>{title}</span>
    </h3>

    {hint && <p className="pec-section-hint">{hint}</p>}
  </>
);

interface SectionProps extends SectionHeadingProps {
  /** Rows run edge to edge inside the card, separated by hairlines. */
  flush?: boolean;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ flush = false, children, ...heading }) => (
  <section className="pec-section">
    <SectionHeading {...heading} />

    <div className={cn("pec-card", flush && "pec-card--flush")}>{children}</div>
  </section>
);

interface FieldRowProps {
  label: string;
  value: string;
  /** A second, quieter line under the value (an option's description). */
  description?: string;
  /** A small helper under the value, e.g. "You'll appear as 22". */
  note?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  /** The real onboarding field, shown while the row is open. */
  children: React.ReactNode;
}

/** LABEL / value / chevron — the row opens the existing field component below it. */
const FieldRow: React.FC<FieldRowProps> = ({
  label,
  value,
  description,
  note,
  open,
  onToggle,
  children,
}) => (
  <div className="pec-row" data-open={open}>
    <button type="button" className="pec-row-btn" aria-expanded={open} onClick={onToggle}>
      <span className="min-w-0 flex-1">
        <span className="pec-row-label">{label}</span>
        <span className={cn("pec-row-value", !value && "pec-row-value--empty")}>
          {value || "Not set"}
        </span>
        {description && <span className="pec-row-desc">{description}</span>}
        {note && <span className="pec-row-note">{note}</span>}
      </span>

      <ChevronRight className="pec-row-chev" aria-hidden="true" />
    </button>

    {open && <div className="pec-row-editor">{children}</div>}
  </div>
);

/** Emoji per prompt category, mirroring the onboarding prompts step. */
const CATEGORY_EMOJI: Record<string, string> = {
  "About me": "👋",
  "Personality & quirks": "✨",
  "Dating & Love": "💕",
  "Goals & values": "🎯",
  "Lifestyle & interests": "🌿",
  "Just for fun": "🎉",
  "Gen-Z corner": "🔥",
  "Marriage-minded": "💍",
};

const PROMPT_FALLBACK_MAX_LENGTH = 200;
const MAX_PROMPTS = STEP_SCHEMAS.prompts.fields[0].max ?? 3;
const BIO_FALLBACK_MAX_LENGTH = 300;

/* -------------------------------------------------------------------------- */
/*  Section -> endpoint                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Which form fields belong to which save endpoint.
 *
 * The form is one flat object of *onboarding* field names, and these are the
 * names each per-step PATCH owns. `sexualOrientation` is deliberately listed
 * twice: it appears in both `basics` (as `gender_option`) and `preference` (as
 * `sexual_orientation`), so a change to it has to reach both endpoints or the
 * two would drift apart.
 *
 * Derived from the schemas rather than hand-written, so a field added to a step
 * is covered by the next edit here rather than silently dropped from the save.
 */
/**
 * The Basic-details rows the profile editor shows and onboarding does not.
 * They ride their own PATCH (`toEditBasicInfoRequest` → /edit-profile/basic-
 * info), so they live here rather than in `STEP_SCHEMAS.basics` — a schema
 * entry would make the onboarding `Basics` step render them too.
 *
 * `religion`, `caste` and `motherTongue` carry no options: their lists come
 * from the API (`useUserProfileData`) and are layered on in `renderField`,
 * the same way the career selects take theirs from `careerSources`. Mother
 * tongue is the one `multi` of the set — it stores a list of language ids.
 */
const EDIT_BASIC_FIELDS: FieldDef[] = [
  {
    name: "religion",
    label: "Religion",
    kind: "select",
    placeholder: "Select religion",
  },
  {
    name: "caste",
    label: "Caste",
    kind: "select",
    placeholder: "Select caste",
  },
  {
    name: "motherTongue",
    label: "Mother tongue",
    kind: "multi",
    placeholder: "Select mother tongue",
  },
  {
    name: "zodiac",
    label: "Zodiac sign",
    kind: "select",
    options: ZODIAC,
    placeholder: "Zodiac sign",
  },
  {
    name: "loveLanguage",
    label: "Love language",
    kind: "select",
    options: LOVELANGUAGE,
    placeholder: "Love language",
  },
  {
    name: "communicationStyle",
    label: "Communication style",
    kind: "select",
    options: COMMUNICATIONSTYLE,
    placeholder: "Communication style",
  },
];

/** The edit-only fields whose option lists are fetched, not declared. */
const EDIT_API_OPTION_FIELDS = new Set(["religion", "caste", "motherTongue"]);

/**
 * The Family section: nine API-backed selects plus the two sibling counts.
 *
 * The names mirror the save payload minus its `Id` suffix (`familyStatusId` ->
 * `familyStatus`), so `toFamilyRequest` is a lookup rather than a translation.
 * The two counts are the only sibling fields the user answers directly — every
 * row below them, and the `siblingTypeId` sent with them, is derived. Options
 * are layered on from `useUserProfileData`'s family lists, the same way the
 * basic-details selects take theirs from `editOptionSource`.
 */
const FAMILY_FIELD_DEFS: FieldDef[] = [
  { name: "familyStatus", label: "Family status", kind: "select", placeholder: "Select family status" },
  { name: "familyType", label: "Family type", kind: "select", placeholder: "Select family type" },
  { name: "fatherOccupation", label: "Father's occupation", kind: "select", placeholder: "Select occupation" },
  { name: "fatherOrganisation", label: "Father's organisation", kind: "select", placeholder: "Select organisation" },
  { name: "motherOccupation", label: "Mother's occupation", kind: "select", placeholder: "Select occupation" },
  { name: "motherOrganisation", label: "Mother's organisation", kind: "select", placeholder: "Select organisation" },
  { name: "familyHome", label: "Family home", kind: "select", placeholder: "Select family home" },
  { name: "nativePlace", label: "Native place", kind: "select", placeholder: "Select native place" },
  { name: "familyIncome", label: "Family income", kind: "select", placeholder: "Select family income" },
];
/* The two halves of "Basic details": the schema fields PATCH to
   /profile/basic-info, the edit-only extras to /edit-profile/basic-info. Kept
   apart so each half validates and saves exactly what it owns. */
const SCHEMA_BASIC_FIELDS = new Set(STEP_SCHEMAS.basics.fields.map((f) => f.name));
const EDIT_BASIC_FIELD_NAMES = new Set(EDIT_BASIC_FIELDS.map((f) => f.name));
const PREFERENCE_FIELDS = new Set(STEP_SCHEMAS.preference.fields.map((f) => f.name));
const CAREER_FIELDS = new Set(STEP_SCHEMAS.career.fields.map((f) => f.name));
const LOCATION_FIELDS = new Set([
  ...STEP_SCHEMAS.location.fields.map((f) => f.name),
  "max_distance_km",
]);
const BIO_FIELDS = new Set(STEP_SCHEMAS.bio.fields.map((f) => f.name));
/** The whole Family section, sibling counts included, for form bookkeeping. */
const FAMILY_FIELD_NAMES = new Set<string>([
  ...FAMILY_FIELD_DEFS.map((field) => field.name),
  "sisterCount",
  "brotherCount",
  "siblings",
]);

/**
 * The schema that owns a given field name, or `undefined` for the sections with
 * none (lifestyle, interests, prompts — their names come from the API, and the
 * intentions field is validated against its option list rather than a schema).
 */
function schemaForField(name: string) {
  if (SCHEMA_BASIC_FIELDS.has(name)) return STEP_SCHEMAS.basics;
  if (PREFERENCE_FIELDS.has(name)) return STEP_SCHEMAS.preference;
  if (CAREER_FIELDS.has(name)) return STEP_SCHEMAS.career;
  if (BIO_FIELDS.has(name)) return STEP_SCHEMAS.bio;
  /* Family has no schema: its names are the save payload's, not onboarding's,
     and it validates locally (or not at all) until an endpoint exists. */
  return undefined;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

const ProfileEditMain: React.FC<ProfileEditMainProps> = ({
  onSave,
  fluid = false,
  saving = false,
  initialData,
  photos: photosProp,
  onRemovePhoto,
  onRecordVideo,
  onSaved,
}) => {
  const { intentions, lifestyle, interests, profileDetails } = useOnBoardingData();
  const careerSources = useCareerOptionSources();
  /* Option lists for the edit-only basics: religions (with their communities
     as the caste list) and languages as the mother-tongue list. */
  const {
    religions,
    religionsLoading,
    religionsError,
    refetchReligions,
    languages,
    languagesLoading,
    languagesError,
    refetchLanguages,
    /* The twelve family option lists — fetched lazily, only when this page
       mounts (see `ensureFamilyOptions` below). */
    familyOptions,
    familyOptionsError,
    ensureFamilyOptions,
    refetchFamilyOptions,
    saveFamily,
  } = useUserProfileData();
  const { categories: promptCategories, loading: promptsLoading, error: promptsError } =
    usePromptCategories();

  const router = useRouter();

  const { details, loading, error, refetch } = profileDetails;

  const {
    updateBasicInfo,
    updateInterestedIn,
    updateIntentions,
    updateLifestyle,
    updateCareer,
    updateInterests,
    updateBio,
    updatePrompts,
    updateLocation,
    createPhotos,
    deletePhoto,
    editBasicInfo
  } = useProfileData();

  /* Only what the user has actually touched lives in state. Everything else is
     derived from the payload, so there is no hydration effect and a refetch
     cannot overwrite an edit in progress. */
  const [fieldOverrides, setFieldOverrides] = React.useState<Record<string, unknown>>({});
  const [promptOverrides, setPromptOverrides] = React.useState<PromptAnswer[] | null>(null);

  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  /** Server-side message from the fan-out, shown under the Save button. */
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveSummary, setSaveSummary] = React.useState<string[]>([]);
  /** Field-level validation, same shape the onboarding footer consumes. */
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  /* ------------------------------ photos ------------------------------ */

  /* The server's own list, which carries the ids `deletePhoto` needs. Read from
     the same payload as everything else rather than mirrored into state. */
  const serverPhotos = profileDetails.photos;

  /* Files this session has queued and not yet seen echoed back by the server.
     Mirrors the onboarding photos step: a `File` cannot go in a JSON body, so it
     is POSTed the moment it is picked and the tile only exists locally until the
     POST settles. */
  const [photoQueue, setPhotoQueue] = React.useState<PhotoValue[]>([]);
  /** One network call at a time across the whole grid — see the note in `uploadPhotos`. */
  const [photoBusy, setPhotoBusy] = React.useState(false);
  const [photoError, setPhotoError] = React.useState<string | null>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  /**
   * The grid: the server's photos in server order, plus anything still in flight.
   *
   * A queued entry survives until the server actually lists it, so the tile never
   * flickers out and back between the upload resolving and the refetch landing.
   */
  const photoTiles = React.useMemo<PhotoTile[]>(() => {
    if (photosProp) {
      return photosProp.map((photo, index) => ({
        key: photo.id,
        url: photo.url,
        name: `Photo ${index + 1}`,
        isMain: photo.isMain ?? index === 0,
        uploading: false,
        serverId: photo.id,
      }));
    }

    const known = new Set(serverPhotos.map((photo) => photo.id));
    const inFlight = photoQueue.filter(
      (photo) => photo.uploading || !photo.serverId || !known.has(photo.serverId)
    );
    const inFlightIds = new Set(
      inFlight.map((photo) => photo.serverId).filter((id): id is string => Boolean(id))
    );

    return [
      ...serverPhotos
        .filter((photo) => !inFlightIds.has(photo.id))
        .map((photo) => ({
          key: photo.id,
          url: photo.mediaUrl,
          name: `Photo ${photo.order}`,
          isMain: photo.isPrimary,
          uploading: false,
          serverId: photo.id,
        })),
      ...inFlight.map((photo) => ({
        key: photo.previewUrl,
        url: photo.previewUrl,
        name: photo.name,
        isMain: false,
        uploading: Boolean(photo.uploading),
        serverId: photo.serverId ?? "",
      })),
    ];
  }, [photosProp, serverPhotos, photoQueue]);

  const patchPhotoQueue = React.useCallback(
    (update: (queued: PhotoValue[]) => PhotoValue[]) => {
      setPhotoQueue((prev) => update(prev));
    },
    []
  );

  /**
   * Posts each picked file on its own, in the order chosen, and drops the tile if
   * its upload fails — a tile that lingers for a photo the server never took would
   * let the user save a profile with an undeletable tile in it.
   *
   * `photoBusy` is held for the whole batch rather than per file, so a second pick
   * cannot interleave with the one in flight.
   */
  const uploadPhotos = async (files: FileList | null) => {
    if (!files || photoBusy || photosProp) return;

    const incoming = Array.from(files).slice(0, PHOTO_SLOTS - photoTiles.length);
    if (incoming.length === 0) return;

    setPhotoBusy(true);
    setPhotoError(null);

    try {
      for (const file of incoming) {
        /* The tile lands as soon as the file is queued, so the grid fills while
           the uploads run. The object URL is the local preview only. */
        const previewUrl = URL.createObjectURL(file);
        patchPhotoQueue((queued) => [
          ...queued,
          { name: file.name, size: file.size, type: file.type, previewUrl, file, uploading: true },
        ]);

        const res = await createPhotos(toPhotoBody(file));

        if (!res?.success) {
          URL.revokeObjectURL(previewUrl);
          patchPhotoQueue((queued) => queued.filter((p) => p.previewUrl !== previewUrl));
          setPhotoError(res?.message ?? "Couldn't upload that photo.");
          break;
        }

        patchPhotoQueue((queued) =>
          queued.map((photo) =>
            photo.previewUrl === previewUrl
              ? { ...photo, uploading: false, serverId: photoIdFrom(res) ?? undefined }
              : photo
          )
        );

        /* Pull the server's own list in the background — that is where the ids and
           the primary/order it reports from. */
        void refetch();
      }
    } finally {
      setPhotoBusy(false);
    }
  };

  /**
   * Deletes on the server first and only then drops the tile, so a failed delete
   * leaves the photo exactly where the user can try again.
   */
  const removePhotoTile = async (tile: PhotoTile) => {
    if (photoBusy) return;

    /* A caller-supplied list is a preview, not the user's real photos — nothing
       here should DELETE anything on their behalf. */
    if (photosProp) {
      onRemovePhoto?.({ id: tile.serverId, url: tile.url, isMain: tile.isMain });
      return;
    }

    /* Still uploading: it has no server id yet, so there is nothing to delete.
       Revoke the preview so the blob doesn't outlive the tile. */
    if (!tile.serverId) {
      URL.revokeObjectURL(tile.url);
      patchPhotoQueue((queued) => queued.filter((photo) => photo.previewUrl !== tile.url));
      return;
    }

    setPhotoBusy(true);
    setPhotoError(null);

    try {
      const res = await deletePhoto(tile.serverId);

      if (!res?.success) {
        setPhotoError(res?.message ?? "Couldn't delete that photo.");
        return;
      }

      patchPhotoQueue((queued) => queued.filter((photo) => photo.serverId !== tile.serverId));
      void refetch();
    } finally {
      setPhotoBusy(false);
    }
  };

  /* Object URLs are the caller's to release, but a tile that leaves the list while
     this component is mounted would leak its blob, so the queued ones are freed
     on unmount. Server photos are remote URLs and are left alone. */
  React.useEffect(
    () => () => {
      for (const photo of photoQueue) {
        if (!photo.serverId) URL.revokeObjectURL(photo.previewUrl);
      }
    },
    [photoQueue]
  );

  /* Which summary row is expanded into its editor. One at a time keeps the page short. */
  const [openRow, setOpenRow] = React.useState<string | null>(null);
  const toggleRow = (id: string) => setOpenRow((current) => (current === id ? null : id));

  /* --------------------- edit-only basics: options --------------------- */

  /* The three lists that do not depend on the form. They sit before
     `seedFields` on purpose: turning the feed details' saved names into ids
     needs the list, and the list has no reason to wait for the form. */
  const religionOptions = React.useMemo(
    () => religions.map((row) => ({ value: String(row.id), label: row.name })),
    [religions]
  );

  const languageOptions = React.useMemo(
    () => languages.map((row) => ({ value: String(row.id), label: row.name })),
    [languages]
  );

  /** Every community across every religion — used to *name* a saved caste. */
  const allCommunityOptions = React.useMemo(
    () =>
      religions.flatMap((row) =>
        (row.communities ?? []).map((community) => ({
          value: String(community.id),
          label: community.name,
        }))
      ),
    [religions]
  );

  /* The twelve family lists as FieldOptions ({id, value} -> {value, label}),
     the same shape the religion/language lists above use. Null until the
     fetch lands, which the Family section renders as its loading state. */
  const familyOptionLists = React.useMemo<Record<FamilyOptionKey, FieldOption[]> | null>(
    () => {
      if (!familyOptions) return null;

      const toOptions = (rows: FamilyOptions[]) =>
        rows.map((row) => ({ value: String(row.id), label: row.value }));

      return {
        familyStatus: toOptions(familyOptions.familyStatus),
        familyType: toOptions(familyOptions.familyType),
        fatherOccupation: toOptions(familyOptions.fatherOccupation),
        fatherOrganisation: toOptions(familyOptions.fatherOrganisation),
        motherOccupation: toOptions(familyOptions.motherOccupation),
        motherOrganisation: toOptions(familyOptions.motherOrganisation),
        relation: toOptions(familyOptions.relation),
        siblingOccupation: toOptions(familyOptions.siblingOccupation),
        siblingMarital: toOptions(familyOptions.siblingMarital),
        familyHome: toOptions(familyOptions.familyHome),
        nativePlace: toOptions(familyOptions.nativePlace),
        familyIncome: toOptions(familyOptions.familyIncome),
      };
    },
    [familyOptions]
  );

  /** The list behind a family row — [] while the fetch is still in flight. */
  const familyRowOptions = (name: string): readonly FieldOption[] =>
    familyOptionLists?.[name as FamilyOptionKey] ?? [];

  /* The onboarding-details payload carries none of the six extras, so they
     come from the feed details endpoint — the same `loadDetails` the feed
     cards read — keyed by this profile's own user id. */
  const feed = useUserDetails(details?.userId);
  const { ensure: ensureFeed, refresh: refreshFeed } = feed;

  React.useEffect(() => {
    ensureFeed();
  }, [ensureFeed]);

  /* The family option lists are fetched lazily — this is the only page that
     wants them, so nothing runs on the marketing pages. */
  React.useEffect(() => {
    ensureFamilyOptions();
  }, [ensureFamilyOptions]);

  /**
   * The six extras as form values: `null` until the feed details land, then
   * always an answer ("" where the profile has none).
   *
   * That endpoint sends zodiac / love language / communication style as their
   * wire enums — exactly what the static options hold — and religion / caste /
   * mother tongue as display names, so those three resolve against the id
   * lists above. Matching on value *or* label means an id, an enum or a name
   * all land on the same option.
   *
   * Family rides the same endpoint, nested under `family`, and resolves the
   * same way — the family lists belong in the deps, because name -> id needs
   * both the saved string and the options, and the twelve lists often land
   * after the details do.
   */
  const feedExtras = React.useMemo(() => {
    const saved = feed.details;
    if (!saved) return null;

    const savedFamily = saved.family;

    /* Siblings are counts first: the two selects are what the user answers, and
       the rows below them are padded out to those counts. `null` means the
       profile never mentioned siblings, so both selects stay unanswered.
       Rows are read before the counts so the counts can promise each stored
       row a slot, then seated by `placeSiblingRows`. */
    const storedSiblings = hydrateSiblingRows(savedFamily?.siblings, familyOptionLists);
    const siblingCounts = hydrateSiblingCounts(
      savedFamily?.siblings,
      savedFamily?.siblingTypeId ?? savedFamily?.siblingType,
      familyOptionLists,
      storedSiblings.length
    );

    return {
      religion: resolveOptionId(religionOptions, saved.religion),
      caste: resolveOptionId(allCommunityOptions, saved.community),
      motherTongue: resolveOptionIds(languageOptions, saved.motherTongue),
      zodiac: resolveOptionId(ZODIAC, saved.zodiac),
      loveLanguage: resolveOptionId(LOVELANGUAGE, saved.loveLanguage),
      communicationStyle: resolveOptionId(COMMUNICATIONSTYLE, saved.communicationStyle),

      familyStatus: resolveOptionId(
        familyOptionLists?.familyStatus ?? [],
        savedFamily?.familyStatus
      ),
      familyType: resolveOptionId(
        familyOptionLists?.familyType ?? [],
        savedFamily?.familyType
      ),
      fatherOccupation: resolveOptionId(
        familyOptionLists?.fatherOccupation ?? [],
        savedFamily?.fatherOccupation
      ),
      fatherOrganisation: resolveOptionId(
        familyOptionLists?.fatherOrganisation ?? [],
        savedFamily?.fatherOrganisation
      ),
      motherOccupation: resolveOptionId(
        familyOptionLists?.motherOccupation ?? [],
        savedFamily?.motherOccupation
      ),
      motherOrganisation: resolveOptionId(
        familyOptionLists?.motherOrganisation ?? [],
        savedFamily?.motherOrganisation
      ),
      familyHome: resolveOptionId(
        familyOptionLists?.familyHome ?? [],
        savedFamily?.familyHome
      ),
      nativePlace: resolveOptionId(
        familyOptionLists?.nativePlace ?? [],
        savedFamily?.nativePlace
      ),
      familyIncome: resolveOptionId(
        familyOptionLists?.familyIncome ?? [],
        savedFamily?.familyIncome
      ),
      sisterCount: siblingCounts ? String(siblingCounts.sisters) : "",
      brotherCount: siblingCounts ? String(siblingCounts.brothers) : "",
      siblings: siblingCounts ? placeSiblingRows(storedSiblings, siblingCounts) : [],
    };
  }, [
    feed.details,
    religionOptions,
    allCommunityOptions,
    languageOptions,
    familyOptionLists,
  ]);

  const seedFields = React.useMemo(() => {
    const base = details ? fieldsFromDetails(details, initialData) : { ...initialData };

    /* The extras layer over the base once they arrive — and again whenever the
       option lists land after them, since name -> id needs both. Fields the
       user has edited live in `fieldOverrides` and always win. */
    return feedExtras ? { ...base, ...feedExtras } : base;
  }, [details, initialData, feedExtras]);

  const fields = React.useMemo(
    () => ({ ...seedFields, ...fieldOverrides }),
    [seedFields, fieldOverrides]
  );

  const seedPrompts = React.useMemo(
    () => (details ? promptsFromDetails(details) : []),
    [details]
  );
  const prompts = promptOverrides ?? seedPrompts;

  /* Every section has an endpoint of its own, Family included — so any edit at
     all makes the form dirty, and Save fans out to exactly what changed. */
  const dirty = Object.keys(fieldOverrides).length > 0 || promptOverrides !== null;

  const setField = React.useCallback(
    (name: string, value: unknown) => {
      setFieldOverrides((prev) =>
        /* Caste belongs to the religion above it, so a new religion makes the
           old caste meaningless — clear it instead of saving a contradiction. */
        name === "religion"
          ? { ...prev, religion: value, caste: "" }
          : { ...prev, [name]: value }
      );
      setSaved(false);
      setSaveError(null);

      /* Same rule as the onboarding form: a message disappears as soon as the
         field becomes valid, rather than only on the next submit. Validated
         against the value being written plus everything already on the form, so
         a field that is only one character short keeps its message. */
      setFieldErrors((prev) => {
        /* A new count renumbers that group's rows, so every message under them
           points at a row that may no longer exist. */
        if (name === "sisterCount" || name === "brotherCount") {
          const kept = Object.entries(prev).filter(([key]) => !key.startsWith("siblings."));
          return kept.length === Object.keys(prev).length ? prev : Object.fromEntries(kept);
        }

        if (!prev[name]) return prev;

        const schema = schemaForField(name);
        if (schema) {
          const still = validateStepData(schema, { ...fields, [name]: value });
          if (still[name]) return prev;
        }

        const rest = { ...prev };
        delete rest[name];
        return rest;
      });
    },
    [fields]
  );

  /** True when the user has touched a field this section owns. */
  const touches = (owned: ReadonlySet<string>) => Object.keys(fieldOverrides).some((n) => owned.has(n));

  const readString = (name: string) => asString(fields[name]);
  const readList = (name: string) => asList(fields[name]);

  /* The sibling rows live in the same flat store, but the two counts above them
     decide how many of each group exist — so rows are padded *out* to the
     counts on the way to the screen and to the save payload, rather than being
     added or removed by hand. */
  const siblings = React.useMemo(() => asSiblingRows(fields.siblings), [fields.siblings]);

  const writeSiblings = (next: SiblingRow[]) => setField("siblings", next);

  /* The counts are ordinary form fields: nothing about a sibling is stored
     before the user picks a number, which is why an unanswered select shows no
     rows at all rather than an empty row. */
  const sisterAnswered = isCounted(fields.sisterCount);
  const brotherAnswered = isCounted(fields.brotherCount);
  const sisterCount = countFrom(fields.sisterCount);
  const brotherCount = countFrom(fields.brotherCount);

  /** One group's rows, padded to its count so the two can never disagree. */
  const siblingRowsFor = (group: SiblingGroup): SiblingRow[] => {
    const own = siblings.filter((row) => row.group === group);
    const count = group === "sister" ? sisterCount : brotherCount;

    return Array.from({ length: count }, (_, index) => own[index] ?? emptySibling(group));
  };

  /**
   * An edit is written back onto the rows the screen is showing — padded to
   * the counts — not onto whatever the store happens to hold. A row that
   * exists only as padding (a fresh count, an unanswered store) used to be
   * mapped over nothing, so the answer was chosen and silently dropped.
   */
  const updateSibling = (
    group: SiblingGroup,
    index: number,
    member: "occupation" | "marital",
    value: string
  ) => {
    const own = siblingRowsFor(group);
    const rest = siblings.filter((row) => row.group !== group);
    const next = own.map((row, i) => (i === index ? { ...row, [member]: value } : row));

    writeSiblings(group === "sister" ? [...next, ...rest] : [...rest, ...next]);

    /* The row's message is stored under the name its select renders with, and
       `setField` writes `siblings` — a name no message is keyed to. Clearing it
       here is what makes the red go away the moment the answer is chosen. */
    setFieldErrors((prev) => {
      const target = `siblings.${group}.${index}.${member}`;
      if (!prev[target]) return prev;

      const kept = { ...prev };
      delete kept[target];
      return kept;
    });
  };

  /**
   * What the closed "Siblings" row shows before anyone taps it — the saved
   * details from `/api/user/feed/details/:id`, not a prompt to start filling
   * them in. `""` is how an untouched profile reads ("Not set"), because a row
   * with no answer is not a family of zero.
   */
  const siblingsValue =
    sisterAnswered || brotherAnswered
      ? describeSiblingCounts({ sisters: sisterCount, brothers: brotherCount }, familyOptionLists)
      : "";

  /** The second line: each stored sibling's own occupation and marital status. */
  const siblingsDetail = describeStoredSiblings(
    siblings,
    { sisters: sisterCount, brothers: brotherCount },
    familyOptionLists
  );

  /**
   * A radio is single-select, so its value is a plain string — but the onboarding
   * hydration for `genders` seeds a one-element array. `asString` returns "" for an
   * array, which would render the group with nothing selected. Take the first
   * entry so both shapes read the same.
   */
  const readRadio = (name: string) => {
    const stored = fields[name];
    return Array.isArray(stored) ? asString(stored[0]) : asString(stored);
  };

  /* The caste picker only offers the selected religion's communities, so a
     caste can never contradict the religion above it. With no religion picked
     yet (or one the list no longer holds) the full flattened list is shown so
     the field is still answerable. */
  const casteOptions = React.useMemo(() => {
    const selected = asString(fields.religion);
    const religion = religions.find((row) => String(row.id) === selected);

    if (!religion) return allCommunityOptions;

    return (religion.communities ?? []).map((community) => ({
      value: String(community.id),
      label: community.name,
    }));
  }, [religions, fields.religion, allCommunityOptions]);

  /**
   * The option list + fetch state behind an edit-only select, or `null` for
   * the three whose options are static (and for every other field).
   */
  const editOptionSource = (
    name: string
  ): {
    options: readonly FieldOption[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
  } | null => {
    if (name === "religion") {
      return {
        options: religionOptions,
        loading: religionsLoading,
        error: religionsError,
        refetch: () => void refetchReligions(),
      };
    }

    if (name === "caste") {
      return {
        options: casteOptions,
        loading: religionsLoading,
        error: religionsError,
        refetch: () => void refetchReligions(),
      };
    }

    if (name === "motherTongue") {
      return {
        options: languageOptions,
        loading: languagesLoading,
        error: languagesError,
        refetch: () => void refetchLanguages(),
      };
    }

    return null;
  };

  /* ------------------------------ location ------------------------------ */

  const [locating, setLocating] = React.useState(false);
  const [locateError, setLocateError] = React.useState<string | null>(null);

  const abortRef = React.useRef<AbortController | null>(null);
  React.useEffect(() => () => abortRef.current?.abort(), []);

  const locationCity = readString("city");
  const hasLocation =
    Boolean(locationCity) &&
    readString("latitude") !== "" &&
    readString("longitude") !== "" &&
    Number.isFinite(Number(readString("latitude"))) &&
    Number.isFinite(Number(readString("longitude")));

  const displayValue = hasLocation
    ? formatLocation({
      area: readString("area"),
      city: locationCity,
      state: readString("state"),
      country: readString("country"),
    })
    : "";

  const detectLocation = async () => {
    if (!("geolocation" in navigator)) {
      setLocateError("Your browser doesn't support location sharing.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLocating(true);
    setLocateError(null);

    try {
      const { coords } = await getPosition();
      const loc = await reverseGeocode(coords.latitude, coords.longitude, controller.signal);
      if (controller.signal.aborted) return;

      setField("country", loc.country);
      setField("state", loc.state);
      setField("city", loc.city);
      setField("area", loc.area);
      setField("latitude", loc.latitude);
      setField("longitude", loc.longitude);
      setField("max_distance_km", DEFAULT_MAX_DISTANCE_KM);
    } catch (err) {
      if (controller.signal.aborted) return;

      const code = (err as Partial<GeolocationPositionError> | null)?.code;
      if (code === 1) {
        setLocateError(
          "Location access is blocked. Allow it in your browser's site settings, then try again."
        );
      } else if (code === 3) {
        setLocateError("Locating you took too long. Please try again.");
      } else if (code === 2) {
        setLocateError("Your location isn't available right now. Please try again.");
      } else {
        setLocateError("We got your position but couldn't work out your city. Please try again.");
      }
    } finally {
      if (!controller.signal.aborted) setLocating(false);
    }
  };

  /* ------------------------------ prompts ------------------------------ */

  const [pickerOpen, setPickerOpen] = React.useState(false);
  /* Null until a pill is tapped; the first category is derived as the fallback
     below, so there is no effect seeding it into state. */
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(null);
  const [draftPrompt, setDraftPrompt] = React.useState<PromptItem | null>(null);
  const [draft, setDraft] = React.useState("");

  const activeCategory =
    promptCategories.find((c) => c.id === activeCategoryId) ?? promptCategories[0] ?? null;

  const writePrompts = (next: PromptAnswer[]) => {
    setPromptOverrides(next);
    setSaved(false);
    setSaveError(null);
  };

  const addPrompt = () => {
    const answer = draft.trim();
    if (!draftPrompt || !answer) return;

    writePrompts([
      ...prompts.filter((p) => p.promptId !== draftPrompt.id),
      {
        promptId: draftPrompt.id,
        question: draftPrompt.question,
        answer: answer.slice(0, draftPrompt.maxLength || PROMPT_FALLBACK_MAX_LENGTH),
      },
    ]);

    setDraftPrompt(null);
    setDraft("");
  };

  const promptsFull = prompts.length >= MAX_PROMPTS;
  const takenPromptIds = React.useMemo(
    () => new Set(prompts.map((p) => p.promptId)),
    [prompts]
  );

  /* ------------------------------- save ------------------------------- */

  /**
   * Validates every section the user touched, keyed by field name.
   *
   * Only the touched sections are validated: an untouched section is not being
   * written, so its shape is not this save's problem. Lifestyle and interests are
   * skipped entirely — their field names come from the API, so the static schema
   * would validate keys this form never writes and fail on a section that is
   * perfectly fine.
   */
  const validateTouched = () => {
    const data = fields as Record<string, unknown>;
    const errors: FieldErrors = {};

    /* Only the schema half has rules — the edit-only extras are validated by
       the option lists themselves (nothing to pick means nothing to enter). */
    if (touches(SCHEMA_BASIC_FIELDS)) {
      Object.assign(errors, validateStepData(STEP_SCHEMAS.basics, data));
    }
    if (touches(PREFERENCE_FIELDS)) {
      Object.assign(errors, validateStepData(STEP_SCHEMAS.preference, data));
    }
    if (touches(CAREER_FIELDS)) Object.assign(errors, validateStepData(STEP_SCHEMAS.career, data));
    if (touches(BIO_FIELDS)) Object.assign(errors, validateStepData(STEP_SCHEMAS.bio, data));

    /* Location has no editable fields here — the whole section is one geolocation
       detect — so it is only valid once that produced a city and coordinates. */
    if (touches(LOCATION_FIELDS) && !hasLocation) {
      errors.city = "Allow location access to detect your city.";
    }

    /* Family has no schema, but it has one rule: a count that is not "None"
       opens that many rows, and every one of them needs both answers. Without
       this the save would happily store a sibling nobody described — and
       `siblingTypeId` would claim a brother or sister the profile says nothing
       about. */
    if (touches(FAMILY_FIELD_NAMES)) {
      for (const group of ["sister", "brother"] as const) {
        const count = group === "sister" ? sisterCount : brotherCount;
        if (count <= 0) continue;

        siblingRowsFor(group).forEach((row, index) => {
          const name = `siblings.${group}.${index}`;
          const who = `${group === "sister" ? "Sister" : "Brother"} ${index + 1}`;

          if (!row.occupation) errors[`${name}.occupation`] = `Choose ${who}'s occupation.`;
          if (!row.marital) errors[`${name}.marital`] = `Choose ${who}'s marital status.`;
        });
      }
    }

    return errors;
  };

  /**
   * Fans the changed sections out over the per-step PATCH endpoints, in the same
   * order and with the same bodies the onboarding flow sends.
   *
   * Deliberately one request per section rather than one request for the page:
   * the backend has no whole-profile endpoint, and posting `basics` on every save
   * would overwrite fields the user never opened. Sections are independent, so a
   * failure stops the fan-out and reports which section it was — the ones already
   * saved stay saved, and the rest are still marked dirty, so pressing Save again
   * retries from the failure rather than from the top.
   */
  const handleSave = async () => {
    if (busy || saving || !dirty) return;

    const found = validateTouched();
    if (Object.keys(found).length > 0) {
      setFieldErrors(found);

      /* A message inside a collapsed row is a message nobody reads — pull the
         row whose fields failed open so the red is where the eye lands. */
      if (Object.keys(found).some((key) => key.startsWith("siblings."))) {
        setOpenRow("siblings");
      }

      setSaveError("Fix the highlighted fields before saving.");
      return;
    }

    setBusy(true);
    setSaveError(null);
    setFieldErrors({});

    const savedSections: string[] = [];

    try {
      await onSave?.({ fields, prompts });

      /* The two halves of Basic details ride different endpoints: the onboarding
         schema fields to /profile/basic-info, the edit-only extras to
         /edit-profile/basic-info. Either may fire alone; both when one save
         touched each. The summary gets one entry either way. */
      const savedBasics = touches(SCHEMA_BASIC_FIELDS);
      const savedEditBasics = touches(EDIT_BASIC_FIELD_NAMES);

      if (savedBasics) {
        const res = await updateBasicInfo(toBasicInfoRequest(fields));
        if (!res?.success) throw new SaveFailed(res?.message, "basic details");
      }

      if (savedEditBasics) {
        const res = await editBasicInfo(toEditBasicInfoRequest(fields));
        if (!res?.success) throw new SaveFailed(res?.message, "basic details");
      }

      if (savedBasics || savedEditBasics) savedSections.push("Basic details");

      if (touches(PREFERENCE_FIELDS)) {
        const res = await updateInterestedIn(toInterestedInRequest(fields));
        if (!res?.success) throw new SaveFailed(res?.message, "who you're seeing");
        savedSections.push("Who you're seeing");
      }

      if (touches(new Set(["intention"]))) {
        const res = await updateIntentions(toIntentionsRequest(fields));
        if (!res?.success) throw new SaveFailed(res?.message, "your intentions");
        savedSections.push("Your intentions");
      }

      if (touches(BIO_FIELDS)) {
        const res = await updateBio(toBioRequest(fields));
        if (!res?.success) throw new SaveFailed(res?.message, "about you");
        savedSections.push("About you");
      }

      if (touches(CAREER_FIELDS)) {
        const res = await updateCareer(toCareerRequest(fields));
        if (!res?.success) throw new SaveFailed(res?.message, "career");
        savedSections.push("Career & ambition");
      }

      /* Family is one PATCH: the nine selects, the two counts as a single
         `siblingTypeId`, and one row per sibling — all three derived from the
         same form values in `toFamilyRequest`. */
      const savedFamily = touches(FAMILY_FIELD_NAMES);

      if (savedFamily) {
        const res = await saveFamily(toFamilyRequest(fields, familyOptionLists));
        if (!res?.success) throw new SaveFailed(res?.message, "family");
        savedSections.push("Family");
      }

      /* One request per answered question, same as onboarding. Blank questions
         produce no request at all — the endpoint cannot express "cleared". */
      if (touches(new Set(lifestyle.questions.map((q) => q.key)))) {
        for (const request of toLifestyleRequests(fields, lifestyle.questions)) {
          const res = await updateLifestyle(request);
          if (!res?.success) throw new SaveFailed(res?.message, "lifestyle");
        }
        savedSections.push("Lifestyle");
      }

      if (touches(new Set(interests.questions.map((q) => q.key)))) {
        for (const request of toInterestsRequests(fields, interests.questions)) {
          const res = await updateInterests(request);
          if (!res?.success) throw new SaveFailed(res?.message, "interests");
        }
        savedSections.push("Interests");
      }

      if (touches(LOCATION_FIELDS)) {
        const res = await updateLocation(toLocationRequest(fields));
        if (!res?.success) throw new SaveFailed(res?.message, "location");
        savedSections.push("Location");
      }

      /* The prompt endpoint replaces the whole set, so this is the one PATCH that
         always carries removals too. Only sent when prompts were actually edited —
         an untouched list would otherwise be re-sent from a payload that may not
         carry the answer text. */
      if (promptOverrides !== null) {
        const res = await updatePrompts(toPromptsRequest({ answers: prompts }));
        if (!res?.success) throw new SaveFailed(res?.message, "profile prompts");
        savedSections.push("Profile prompts");
      }

      /* The saved sections are now the server's copy, so drop this session's
         overrides and let the payload drive the form again. Without the refetch
         the values would visibly snap back to the pre-save read. */
      setFieldOverrides({});
      setPromptOverrides(null);
      setSaveSummary(savedSections);
      setSaved(true);

      void refetch();

      /* The extras seed from the feed-details cache, not this payload — bust it
         too, or clearing the overrides would re-derive the rows from the
         pre-save copy until something else invalidated it. Family is read from
         that same cache, so it needs the refetch as much as the edit-only
         basics do. */
      if (savedEditBasics || savedFamily) refreshFeed();

      /* `onSaved` runs last, after this render's state has settled, so the caller's
         refetch reads the profile the save just wrote. Left out, the edit page has
         done its job and the profile itself is where the user belongs. */
      if (onSaved) {
        onSaved();
      } else {
        router.push("/app/profile");
      }
    } catch (err) {
      if (err instanceof SaveFailed) {
        setSaveError(`${err.message ?? "Couldn't save that section."} (${err.section})`);
      } else {
        setSaveError("Couldn't save your changes. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const startEditing = () => {
    setSaved(false);
    setSaveError(null);
    setPickerOpen(true);
  };

  /* --------------------------- field rendering --------------------------- */

  /**
   * One renderer for every schema field, so the career selects and the plain
   * text inputs cannot drift apart. The career selects take their option list
   * from the API instead of the schema, the same way the onboarding career step
   * layers `careerSources` over the field.
   *
   * This is the editor a summary row opens — unchanged from before the restyle.
   */
  /**
   * The editor for a select whose option list belongs to an API rather than
   * the schema: the schema (or the edit-only field def) owns the name and the
   * label, the list is layered on here — exactly how the onboarding career
   * step treats `careerSources`.
   */
  /**
   * The editor for a field whose option list belongs to an API rather than the
   * schema: the field def owns the name and the label, the list is layered on
   * here — exactly how the onboarding career step treats `careerSources`.
   * Renders the control its `kind` asks for (select today, multi for mother
   * tongue), so an API-backed field only has to name its source.
   */
  const renderApiField = (
    field: FieldDef,
    source: {
      options: readonly FieldOption[];
      loading: boolean;
      error: string | null;
      refetch: () => void;
    },
    disabled = false,
    disabledHint?: string
  ) => {
    if (source.error) {
      return (
        <div key={field.name} className="space-y-1.5">
          <p className="text-xs font-semibold">{field.label}</p>
          <p role="alert" className="text-[11px] font-medium text-destructive">
            {source.error}
          </p>
          <button
            type="button"
            onClick={source.refetch}
            className="text-[11px] font-semibold text-primary underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      );
    }

    const layered: FieldDef = {
      ...field,
      options: source.options,
      /* A locked control needs to say why — `FieldShell` renders this. */
      ...(disabled && disabledHint ? { hint: disabledHint } : {}),
    };

    return (
      <div key={field.name} className="space-y-1.5">
        {field.kind === "multi" ? (
          <MultiField
            field={layered}
            values={readList(field.name)}
            error={fieldErrors[field.name]}
            onChange={(v) => setField(field.name, v)}
          />
        ) : (
          <SelectField
            field={layered}
            value={readString(field.name)}
            error={fieldErrors[field.name]}
            disabled={disabled}
            onChange={(v) => setField(field.name, v)}
          />
        )}
        {source.loading && (
          <p className="text-[11px] text-muted-foreground">Loading options…</p>
        )}
      </div>
    );
  };

  const renderField = (field: FieldDef) => {
    const error = fieldErrors[field.name];

    if (isCareerField(field.name)) {
      return renderApiField(field, careerSources[field.name]);
    }

    if (EDIT_API_OPTION_FIELDS.has(field.name)) {
      const source = editOptionSource(field.name);
      if (source) {
        /* Caste is religion's sub-question: with no religion picked there is
           no list to show, so the control stays locked until one is chosen. */
        const locked = field.name === "caste" && !asString(fields.religion);

        return renderApiField(
          field,
          source,
          locked,
          locked ? "Choose your religion first." : undefined
        );
      }
    }

    if (field.kind === "select") {
      return (
        <SelectField
          key={field.name}
          field={field}
          value={readString(field.name)}
          error={error}
          onChange={(v) => setField(field.name, v)}
        />
      );
    }

    if (field.kind === "radio") {
      return (
        <RadioField
          key={field.name}
          field={field}
          value={readRadio(field.name)}
          error={error}
          onChange={(v) => setField(field.name, v)}
        />
      );
    }

    if (field.kind === "multi") {
      return (
        <MultiField
          key={field.name}
          field={field}
          values={readList(field.name)}
          onChange={(v) => setField(field.name, v)}
        />
      );
    }

    if (field.kind === "textarea") {
      return (
        <TextareaField
          key={field.name}
          field={field}
          value={readString(field.name)}
          error={error}
          onChange={(v) => setField(field.name, v)}
        />
      );
    }

    if (field.kind === "date") {
      return (
        <DateField
          key={field.name}
          field={field}
          value={readString(field.name)}
          error={error}
          yearOnly={field.yearOnly}
          /* Same gate onboarding's `Basics` step applies: the picker refuses
             anything that leaves the user under 18. Keyed by name rather than
             blanket-applied, because the editor also renders `graduationYear` as
             a date — a year that has nothing to do with age. */
          adultOnly={field.name === "dateOfBirth"}
          onChange={(v) => setField(field.name, v)}
        />
      );
    }

    return (
      <TextField
        key={field.name}
        field={field}
        value={readString(field.name)}
        error={error}
        onChange={(v) => setField(field.name, v)}
      />
    );
  };

  /**
   * What a schema field looks like while its row is closed. Select values are
   * stored as option ids, so the label is looked up in the same list the editor
   * uses (the API's list for the career selects, the schema's for the rest).
   */
  const describeField = (field: FieldDef): { display: string; note?: React.ReactNode } => {
    /* Multi is checked first: its value is an array, which `readString` reads
       as "" — falling through to the blank guard below would hide every pick. */
    if (field.kind === "multi") {
      const options =
        field.name === "motherTongue"
          ? languageOptions
          : (field as { options?: unknown }).options;

      const picks = asList(fields[field.name]);
      if (picks.length === 0) return { display: "" };

      return { display: picks.map((value) => optionLabel(options, value)).join(", ") };
    }

    const raw = readString(field.name);

    if (!raw) return { display: "" };

    if (field.kind === "date") {
      if (field.yearOnly) return { display: raw };
      const age = ageFrom(raw);

      return {
        display: formatDate(raw),
        note:
          age === null ? undefined : (
            <>
              You&rsquo;ll appear as <strong>{age}</strong> &mdash; we only show your age.
            </>
          ),
      };
    }

    /* A radio stores an option id too, so it needs the same lookup as a select or
       the closed row would read "NON_BINARY" instead of "Non-binary". */
    if (field.kind === "radio") {
      const value = readRadio(field.name);
      if (!value) return { display: "" };

      return { display: optionLabel((field as { options?: unknown }).options, value) };
    }

    if (field.kind === "select") {
      /* Same list the editor uses — except caste, which is *named* from every
         community so a saved caste still reads as text even when the religion
         above it has since changed (the picker itself is the filtered list). */
      const options = isCareerField(field.name)
        ? careerSources[field.name].options
        : field.name === "religion"
          ? religionOptions
          : field.name === "caste"
            ? allCommunityOptions
            : (field as { options?: unknown }).options;

      const label = optionLabel(options, raw);

      /* A bare number with no matching option is a height in centimetres. */
      if (label === raw && field.name === "height") return { display: formatHeightCm(raw) };

      return { display: label };
    }

    return { display: raw };
  };

  const renderRow = (field: FieldDef) => {
    const { display, note } = describeField(field);

    return (
      <FieldRow
        key={field.name}
        label={field.label}
        value={display}
        note={note}
        open={openRow === field.name}
        onToggle={() => toggleRow(field.name)}
      >
        {renderField(field)}
      </FieldRow>
    );
  };

  /* ------------------------------ interest budget ------------------------------ */

  const interestFields = interests.questions.map(toInterestsField);

  const interestPicksFor = (name: string) => readList(name);

  const interestPicked = interestFields.reduce(
    (total, field) => total + interestPicksFor(field.name).length,
    0
  );

  /* One frame for every branch — loading, failure and the form itself — so the
     stylesheet is always mounted and the card never changes size between them. */
  const shell = (children: React.ReactNode) => (
    <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
        <div
          className={cn(
            fluid
              ? "absolute inset-0 overflow-hidden"
              : "mt-2 w-[320px] sm:w-[300px] h-[480px] sm:h-[520px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out"
          )}
        >
          <div className="pec-root">
            <style>{CSS}</style>

            {children}
          </div>
        </div>
      </div>
    </main>
  );

  /* Only the *first* load blanks the form. A refetch after a save also flips
     `loading`, and tearing the page down to a spinner there would throw away the
     "Changes saved" state the user is looking at — so the form stays mounted and
     simply re-derives from the fresh payload. Same for the error frame: it is a
     dead end only when there is nothing to show in the first place. */
  if (loading && !details) {
    return shell(<Loader label="Loading your details…" hint="Fetching what you've already saved." />);
  }

  if (error && !details) {
    return shell(
      <Notice
        title="Couldn't load your details"
        detail="Check your connection and try again."
        actionLabel="Try again"
        onAction={() => void refetch()}
      />
    );
  }

  /* -------------------------------- render -------------------------------- */

  const intentionValue = readString("intention");

  const body = (
    <div className="pec-body">
      {!details && (
        <p className="pec-empty-note">
          <span aria-hidden="true">🌱</span> Nothing saved yet — fill this in and it becomes your
          profile.
        </p>
      )}

      {/* ------------------------------ photos ------------------------------ */}
      <section className="pec-section">
        <SectionHeading
          icon={Images}
          title="Photos"
          hint={`Up to ${PHOTO_SLOTS}. Your first photo is the one people see first.`}
        />

        <div className="pec-photo-grid">
          {photoTiles.map((tile) => (
            <div key={tile.key} className="pec-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tile.url} alt={tile.name} />

              {tile.isMain && <span className="pec-photo-main">Main</span>}

              {tile.uploading && (
                <div className="pec-photo-busy">
                  <Loader2 className="pec-photo-spinner" aria-hidden="true" />
                  <span className="sr-only">Uploading {tile.name}</span>
                </div>
              )}

              <button
                type="button"
                className="pec-photo-remove"
                disabled={photoBusy}
                aria-label={`Remove ${tile.name}`}
                onClick={() => void removePhotoTile(tile)}
              >
                <X aria-hidden="true" />
              </button>
            </div>
          ))}

          {/* The add tile is part of the grid rather than a sibling, so it occupies
              the same 3:4 box and the layout doesn't jump when the last slot fills. */}
          {!photosProp && photoTiles.length < PHOTO_SLOTS && (
            <button
              type="button"
              className="pec-photo-add"
              disabled={photoBusy}
              onClick={() => photoInputRef.current?.click()}
            >
              {photoBusy ? (
                <Loader2 className="pec-photo-add-icon pec-photo-spinner" aria-hidden="true" />
              ) : (
                <ImagePlus className="pec-photo-add-icon" aria-hidden="true" />
              )}
              <span className="pec-photo-add-label">Add</span>
            </button>
          )}
        </div>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            void uploadPhotos(e.target.files);
            /* Reset so picking the same file twice in a row still fires a change. */
            e.target.value = "";
          }}
        />

        {photoError && (
          <p role="alert" className="pec-photo-error">
            {photoError}
          </p>
        )}

        <p className="pec-photo-count">
          {photoTiles.length} of {PHOTO_SLOTS} added
          {photoTiles.length < PHOTO_MIN &&
            ` · ${PHOTO_MIN - photoTiles.length} more to show up in matches`}
        </p>
      </section>

      {/* ------------------------------ video ------------------------------- */}
      {onRecordVideo && (
        <section className="pec-section">
          <SectionHeading icon={Video} title="Video" />

          <button type="button" className="pec-video-card" onClick={onRecordVideo}>
            <span>
              <span className="pec-video-title">Record a live video</span>
              <span className="pec-video-sub">Camera opens right here — no uploads</span>
            </span>
            <Video className="pec-video-icon" aria-hidden="true" />
          </button>

          <p className="pec-video-hint">
            Record a 15s intro live to keep profiles genuine. A live video gets 2x more matches.
          </p>
        </section>
      )}

      {/* ------------------------------- about ------------------------------ */}
      <Section icon={User} title="About you">
        {STEP_SCHEMAS.bio.fields.map((field) => {
          const value = readString(field.name);
          const max = field.max ?? BIO_FALLBACK_MAX_LENGTH;

          return (
            <div key={field.name} className="pec-bio">
              <label htmlFor={`pec-${field.name}`} className="pec-row-label">
                {field.label}
              </label>

              <Textarea
                id={`pec-${field.name}`}
                value={value}
                rows={3}
                maxLength={max}
                aria-invalid={Boolean(fieldErrors[field.name])}
                placeholder="A few honest lines is plenty."
                className="pec-bio-input"
                onChange={(e) => setField(field.name, e.target.value.slice(0, max))}
              />

              {fieldErrors[field.name] && (
                <span role="alert" className="pec-bio-error">
                  {fieldErrors[field.name]}
                </span>
              )}

              <span className="pec-bio-count">
                {value.length}/{max}
              </span>
            </div>
          );
        })}
      </Section>

      {/* --------------------------- looking for ---------------------------- */}
      <Section icon={Heart} title="Your intentions" flush>
        {intentions.loading ? (
          <p className="pec-pad text-[11px] text-muted-foreground">Loading intentions…</p>
        ) : intentions.error ? (
          <div className="pec-pad space-y-1.5">
            <p role="alert" className="text-[11px] font-medium text-destructive">
              {intentions.error}
            </p>
            <button
              type="button"
              onClick={() => void intentions.refetch()}
              className="text-[11px] font-semibold text-primary underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        ) : intentions.options.length === 0 ? (
          <p className="pec-pad text-[11px] text-muted-foreground">
            No intentions are available right now.
          </p>
        ) : (
          <FieldRow
            label="Looking for"
            value={optionLabel(intentions.options, intentionValue)}
            description={optionDescription(intentions.options, intentionValue)}
            open={openRow === "intention"}
            onToggle={() => toggleRow("intention")}
          >
            <RadioField
              field={{
                name: "intention",
                label: intentions.question?.title ?? "What kind of love are you ready for?",
                kind: "radio",
              }}
              options={intentions.options}
              value={intentionValue}
              hideLabel={Boolean(intentions.question?.title)}
              onChange={(v) => setField("intention", v)}
            />
          </FieldRow>
        )}
      </Section>

      {/* ------------------------------- basics ----------------------------- */}
      <Section
        icon={PlusCircle}
        title="Basic details"
        hint="The essentials, plus a few extras you can only set here."
        flush
      >
        {STEP_SCHEMAS.basics.fields.map(renderRow)}
        {EDIT_BASIC_FIELDS.map(renderRow)}
      </Section>

      {/* ---------------------------- preferences --------------------------- */}
      <Section
        icon={Search}
        title="Who you're seeing"
        hint="Used to show you relevant matches."
        flush
      >
        {STEP_SCHEMAS.preference.fields.map(renderRow)}
      </Section>

      {/* ------------------------------ lifestyle --------------------------- */}
      <Section
        icon={Wine}
        title="Lifestyle"
        hint="Pick what fits. Nothing here is compulsory."
        flush
      >
        {lifestyle.loading ? (
          <p className="pec-pad text-[11px] text-muted-foreground">Loading questions…</p>
        ) : lifestyle.error ? (
          <p role="alert" className="pec-pad text-[11px] font-medium text-destructive">
            {lifestyle.error}
          </p>
        ) : lifestyle.questions.length === 0 ? (
          <p className="pec-pad text-[11px] text-muted-foreground">
            No lifestyle questions are available right now.
          </p>
        ) : (
          lifestyle.questions.map((question) => {
            const field = toLifestyleField(question);
            const options = (field as { options?: unknown }).options;

            const display =
              field.kind === "multi"
                ? readList(field.name)
                  .map((value) => optionLabel(options, value))
                  .join(", ")
                : optionLabel(options, readString(field.name));

            return (
              <FieldRow
                key={field.name}
                label={field.label}
                value={display}
                open={openRow === field.name}
                onToggle={() => toggleRow(field.name)}
              >
                {field.kind === "multi" ? (
                  <MultiField
                    field={field}
                    values={readList(field.name)}
                    onChange={(v) => setField(field.name, v)}
                  />
                ) : (
                  <RadioField
                    field={field}
                    value={readString(field.name)}
                    onChange={(v) => setField(field.name, v)}
                  />
                )}
              </FieldRow>
            );
          })
        )}
      </Section>

      {/* ------------------------------- career ----------------------------- */}
      <Section icon={Briefcase} title="Career & ambition" flush>
        {/* Same order the onboarding career step uses: education, work, ambition. */}
        {(["education", "work", "ambition"] as const).flatMap((groupId) =>
          STEP_SCHEMAS.career.fields.filter((field) => field.group === groupId).map(renderRow)
        )}
      </Section>

      {/* ------------------------------- family ---------------------------- */}
      <Section
        icon={Users}
        title="Family"
        hint="Your family details and siblings save with the rest of your profile."
        flush
      >
        {!familyOptions ? (
          familyOptionsError ? (
            <div className="pec-pad space-y-1.5">
              <p role="alert" className="text-[11px] font-medium text-destructive">
                {familyOptionsError}
              </p>
              <button
                type="button"
                onClick={() => void refetchFamilyOptions()}
                className="text-[11px] font-semibold text-primary underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          ) : (
            <p className="pec-pad text-[11px] text-muted-foreground">
              Loading family options…
            </p>
          )
        ) : (
          <>
            {/* Partial failure: the lists that arrived stay usable, with the
                first failure surfaced as a banner above them. */}
            {familyOptionsError && (
              <div className="pec-pad space-y-1.5">
                <p role="alert" className="text-[11px] font-medium text-destructive">
                  {familyOptionsError}
                </p>
                <button
                  type="button"
                  onClick={() => void refetchFamilyOptions()}
                  className="text-[11px] font-semibold text-primary underline underline-offset-2"
                >
                  Try again
                </button>
              </div>
            )}

            {FAMILY_FIELD_DEFS.map((field) =>
              renderRow({ ...field, options: familyRowOptions(field.name) })
            )}

            {/* -------------------------- siblings -------------------------- */}
            {/* The one Family row that holds more than a single option. It
                *shows* what /api/user/feed/details/:id stored — the sibling type
                and each sibling's own answers — and tapping it opens the two
                counts plus the rows they decide, the way every other row opens
                its editor. */}
            <FieldRow
              label="Siblings"
              value={siblingsValue}
              description={siblingsDetail}
              open={openRow === "siblings"}
              onToggle={() => toggleRow("siblings")}
            >
              <div className="space-y-3">
                <p className="text-[11px] text-muted-foreground">
                  Pick how many sisters and brothers you have — a row opens for each one.
                </p>

                <SelectField
                  field={{
                    name: "sisterCount",
                    label: "How many sisters",
                    kind: "select",
                    /* Sisters are optional — the badge says so, and an unanswered
                       select simply opens no rows below. */
                    required: false,
                    skippable: false,
                    options: countOptionsFor(sisterCount),
                    placeholder: "Select how many",
                  }}
                  value={readString("sisterCount")}
                  error={fieldErrors.sisterCount}
                  onChange={(v) => setField("sisterCount", v)}
                />

                <SelectField
                  field={{
                    name: "brotherCount",
                    label: "How many brothers",
                    kind: "select",
                    options: countOptionsFor(brotherCount),
                    placeholder: "Select how many",
                  }}
                  value={readString("brotherCount")}
                  error={fieldErrors.brotherCount}
                  onChange={(v) => setField("brotherCount", v)}
                />

                {sisterCount > 0 && (
                  <div className="space-y-2.5">
                    <p className="pec-row-label">Sisters</p>

                    {siblingRowsFor("sister").map((sibling, index) => (
                      <div
                        key={`sister-${index}`}
                        className="space-y-2.5 rounded-xl border border-border bg-card p-3"
                      >
                        <p className="text-xs font-semibold">Sister {index + 1}</p>

                        <SelectField
                          field={{
                            name: `siblings.sister.${index}.occupation`,
                            label: "Occupation",
                            kind: "select",
                            options: selectOptionsWith(
                              familyOptionLists?.siblingOccupation,
                              sibling.occupation
                            ),
                            placeholder: "Select occupation",
                          }}
                          value={sibling.occupation}
                          error={fieldErrors[`siblings.sister.${index}.occupation`]}
                          onChange={(v) => updateSibling("sister", index, "occupation", v)}
                        />
                        <SelectField
                          field={{
                            name: `siblings.sister.${index}.marital`,
                            label: "Marital status",
                            kind: "select",
                            options: selectOptionsWith(
                              familyOptionLists?.siblingMarital,
                              sibling.marital
                            ),
                            placeholder: "Select marital status",
                          }}
                          value={sibling.marital}
                          error={fieldErrors[`siblings.sister.${index}.marital`]}
                          onChange={(v) => updateSibling("sister", index, "marital", v)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {brotherCount > 0 && (
                  <div className="space-y-2.5">
                    <p className="pec-row-label">Brothers</p>

                    {siblingRowsFor("brother").map((sibling, index) => (
                      <div
                        key={`brother-${index}`}
                        className="space-y-2.5 rounded-xl border border-border bg-card p-3"
                      >
                        <p className="text-xs font-semibold">Brother {index + 1}</p>

                        <SelectField
                          field={{
                            name: `siblings.brother.${index}.occupation`,
                            label: "Occupation",
                            kind: "select",
                            options: selectOptionsWith(
                              familyOptionLists?.siblingOccupation,
                              sibling.occupation
                            ),
                            placeholder: "Select occupation",
                          }}
                          value={sibling.occupation}
                          error={fieldErrors[`siblings.brother.${index}.occupation`]}
                          onChange={(v) => updateSibling("brother", index, "occupation", v)}
                        />
                        <SelectField
                          field={{
                            name: `siblings.brother.${index}.marital`,
                            label: "Marital status",
                            kind: "select",
                            options: selectOptionsWith(
                              familyOptionLists?.siblingMarital,
                              sibling.marital
                            ),
                            placeholder: "Select marital status",
                          }}
                          value={sibling.marital}
                          error={fieldErrors[`siblings.brother.${index}.marital`]}
                          onChange={(v) => updateSibling("brother", index, "marital", v)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Neither count opens a row, so this is where the editor says
                    what to do — and confirms "None" when both were answered. */}
                {sisterCount + brotherCount === 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    {sisterAnswered && brotherAnswered
                      ? "No siblings to add."
                      : "Choose a number above and a row opens for each sibling."}
                  </p>
                )}
              </div>
            </FieldRow>
          </>
        )}
      </Section>

      {/* ------------------------------ interests --------------------------- */}
      <Section
        icon={Sparkles}
        title="Interests & hobbies"
        hint={`Pick ${INTERESTS_MIN} to ${INTERESTS_MAX} in total — shared interests are the easiest conversation starter.`}
      >
        {interests.loading ? (
          <p className="text-[11px] text-muted-foreground">Loading questions…</p>
        ) : interests.error ? (
          <p role="alert" className="text-[11px] font-medium text-destructive">
            {interests.error}
          </p>
        ) : interestFields.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">
            No interest questions are available right now.
          </p>
        ) : (
          <>
            <p className="mb-3 text-[10px] tabular-nums text-muted-foreground">
              {interestPicked} / {INTERESTS_MAX} selected
              {interestPicked < INTERESTS_MIN && ` · ${INTERESTS_MIN - interestPicked} more needed`}
            </p>

            <div className="space-y-4">
              {interestFields.map((field) => {
                const own = interestPicksFor(field.name);
                /* What this category may still add: the shared budget minus
                   what the other categories are already holding. */
                const allotment = Math.max(0, INTERESTS_MAX - (interestPicked - own.length));

                if (field.kind === "multi") {
                  return (
                    <MultiField
                      key={field.name}
                      field={field}
                      values={own}
                      max={allotment}
                      hideCount
                      onChange={(v) => setField(field.name, v)}
                    />
                  );
                }

                return (
                  <RadioField
                    key={field.name}
                    field={field}
                    value={readString(field.name)}
                    disabled={allotment === 0 && own.length === 0}
                    onChange={(v) => setField(field.name, v)}
                  />
                );
              })}
            </div>
          </>
        )}
      </Section>

      {/* ------------------------------ location ---------------------------- */}
      <Section icon={MapPin} title="Location">
        <div className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="location-display" className="text-sm font-medium">
              Your location
            </label>
            <Input
              id="location-display"
              readOnly
              tabIndex={-1}
              value={displayValue}
              placeholder="Allow location access to detect your city"
              className="h-11 cursor-default bg-muted/40"
            />
            {!hasLocation && locateError && (
              <p role="alert" className="text-[11px] font-medium text-destructive">
                {locateError}
              </p>
            )}

            {!hasLocation && !locateError && !fieldErrors.city && (
              <p className="text-[11px] font-medium text-muted-foreground">
                No location saved yet.
              </p>
            )}

            {/* A save attempt with no fix yet: the row has to show why it is
                refusing, since the section itself has nothing to display. */}
            {fieldErrors.city && (
              <p role="alert" className="text-[11px] font-medium text-destructive">
                {fieldErrors.city}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant={hasLocation ? "outline" : "default"}
              onClick={detectLocation}
              disabled={locating}
              className="h-11 w-full"
            >
              {locating
                ? "Locating…"
                : hasLocation
                  ? "Update my location"
                  : "Allow location access"}
            </Button>
            {locateError && (
              <p role="alert" className="text-[11px] font-medium text-destructive">
                {locateError}
              </p>
            )}
          </div>

          <p className="pec-location-note">
            Your precise coordinates are detected from your device and are never shown to other
            members.
          </p>
        </div>
      </Section>

      {/* ------------------------------- prompts ---------------------------- */}
      <section className="pec-section">
        <SectionHeading
          icon={MessageCircle}
          title="Profile prompts"
          hint={`Answer up to ${MAX_PROMPTS}. A little personality goes a long way.`}
        />

        <div className="pec-prompts space-y-2.5">
          {prompts.map((prompt) => (
            <div
              key={prompt.promptId}
              className="space-y-1.5 rounded-xl border border-border bg-card p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold leading-snug">{prompt.question}</p>
                <button
                  type="button"
                  aria-label={`Remove answer for ${prompt.question}`}
                  onClick={() => writePrompts(prompts.filter((p) => p.promptId !== prompt.promptId))}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>

              <Textarea
                value={prompt.answer}
                rows={2}
                maxLength={PROMPT_FALLBACK_MAX_LENGTH}
                className="resize-none"
                onChange={(e) =>
                  writePrompts(
                    prompts.map((p) =>
                      p.promptId === prompt.promptId
                        ? { ...p, answer: e.target.value.slice(0, PROMPT_FALLBACK_MAX_LENGTH) }
                        : p
                    )
                  )
                }
              />
            </div>
          ))}

          {draftPrompt && (
            <div className="space-y-1.5 rounded-xl border border-primary bg-primary-muted p-3">
              <Label htmlFor="pec-prompt-draft" className="text-xs font-semibold">
                {draftPrompt.question}
              </Label>

              <Textarea
                id="pec-prompt-draft"
                autoFocus
                rows={3}
                value={draft}
                maxLength={draftPrompt.maxLength || PROMPT_FALLBACK_MAX_LENGTH}
                placeholder="Type your answer…"
                className="resize-none"
                onChange={(e) =>
                  setDraft(
                    e.target.value.slice(0, draftPrompt.maxLength || PROMPT_FALLBACK_MAX_LENGTH)
                  )
                }
              />

              <div className="flex items-center justify-between">
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {draft.length} / {draftPrompt.maxLength || PROMPT_FALLBACK_MAX_LENGTH}
                </span>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDraftPrompt(null);
                      setDraft("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={addPrompt} disabled={!draft.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------ picker ------------------------------ */}
          {!promptsFull && !draftPrompt && !pickerOpen && (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-card px-4 py-3.5 text-left transition-colors hover:border-primary"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Plus className="size-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold">Choose a prompt</span>
            </button>
          )}

          {pickerOpen && (
            <div className="space-y-3 rounded-2xl border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">Choose a prompt</p>
                <button
                  type="button"
                  aria-label="Close the prompt picker"
                  onClick={() => {
                    setPickerOpen(false);
                    setDraftPrompt(null);
                    setDraft("");
                  }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>

              {promptsLoading ? (
                <p className="py-3 text-center text-[11px] text-muted-foreground">
                  Loading prompts…
                </p>
              ) : promptsError ? (
                <p role="alert" className="py-3 text-center text-[11px] font-medium text-destructive">
                  {promptsError}
                </p>
              ) : (
                <>
                  <div
                    className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: "none" }}
                    role="tablist"
                    aria-label="Prompt categories"
                  >
                    {promptCategories.map((category) => {
                      const isActive = category.id === activeCategory?.id;

                      return (
                        <button
                          key={category.id}
                          type="button"
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setActiveCategoryId(category.id)}
                          className={cn(
                            "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "border border-border bg-card hover:border-primary"
                          )}
                        >
                          <span aria-hidden="true">{CATEGORY_EMOJI[category.name] ?? "💬"}</span>
                          {category.name}
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-1.5">
                    {activeCategory?.prompts.map((prompt) => {
                      const taken = takenPromptIds.has(prompt.id);

                      return (
                        <button
                          key={prompt.id}
                          type="button"
                          disabled={taken}
                          onClick={() => {
                            setDraftPrompt(prompt);
                            setDraft(
                              prompts.find((p) => p.promptId === prompt.id)?.answer ?? ""
                            );
                            setPickerOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-left text-[12px] font-medium transition-colors",
                            taken
                              ? "cursor-not-allowed opacity-50"
                              : "hover:border-primary"
                          )}
                        >
                          {prompt.question}
                          {taken && (
                            <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
                              Added
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {activeCategory && activeCategory.prompts.length === 0 && (
                      <p className="py-3 text-center text-[11px] text-muted-foreground">
                        No prompts in this category yet.
                      </p>
                    )}

                    {!activeCategory && (
                      <p className="py-3 text-center text-[11px] text-muted-foreground">
                        No prompt categories available right now.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {promptsFull && !draftPrompt && (
            <p className="text-[11px] text-muted-foreground">
              That&rsquo;s all {MAX_PROMPTS}. Remove one to swap it out.
            </p>
          )}
        </div>
      </section>

      <p className="pec-tail-note">
        {/* <span aria-hidden="true">🔒</span> Only you can see this until you publish it. */}
      </p>
    </div>
  );

  return shell(
    <>
      <header className="pec-head">
        <div className="min-w-0 min-h-5 flex items-center gap-1">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="shrink-0 -ml-1 w-9 h-9 flex text-gray-400 items-center justify-center rounded-full hover:bg-black/5 active:bg-black/5 cursor-pointer"
          >
            <ChevronLeft size={22} />
          </button>
          <p className="font-figtree text-pink-500 ">Edit profile</p>
        </div>

        {dirty && !saved && <span className="pec-dirty-pill">Unsaved</span>}
        {saved && (
          <span className="pec-saved-pill">
            <Check className="size-3" aria-hidden="true" /> Saved
          </span>
        )}
      </header>

      {body}

      <footer className="pec-foot">
        {saved ? (
          <>
            <div className="pec-saved-message" role="status">
              <span className="pec-saved-icon" aria-hidden="true">
                ✅
              </span>
              <div className="min-w-0">
                <p className="pec-saved-title">Changes saved</p>
                <p className="pec-saved-detail">
                  {saveSummary.length > 0
                    ? `Updated ${saveSummary.join(", ").toLowerCase()}.`
                    : "Your profile is up to date."}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-10 w-full rounded-xl"
              onClick={startEditing}
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit again
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              className="h-11 w-full rounded-xl text-sm font-semibold"
              disabled={!dirty || busy || saving}
              onClick={() => void handleSave()}
            >
              {busy || saving ? "Saving…" : dirty ? "Save changes" : "No changes yet"}
            </Button>

            {saveError ? (
              <p role="alert" className="pec-foot-note pec-foot-note--error">
                {saveError}
              </p>
            ) : (
              <p className="pec-foot-note">
              </p>
            )}
          </>
        )}
      </footer>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*  Styles                                                                     */
/* -------------------------------------------------------------------------- */

/*
 * Container-relative sizing, as in the rest of this folder: 1 design unit is the
 * card's own width / 720, so every gap, radius and font below tracks the box the
 * component is dropped into instead of the viewport.
 */
const CSS = `
  .pec-root {
    container-type: size;
    container-name: pec;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    font-family: "DM Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    color: #1c1a17;
    overflow: hidden;
  }
  .pec-root *,
  .pec-root *::before,
  .pec-root *::after { box-sizing: border-box; }

  .pec-root {
    --pec-u: calc(100cqw / 720);
    --pec-pink: #e11d63;
    --pec-ink: #1c1a17;
    --pec-muted: #8a8378;
    --pec-line: #f8dce7;
    --pec-soft: #fff5f8;
    --pec-hair: #eeeae7;
    --pec-card: #fbfbfb;
  }

  .pec-root ::-webkit-scrollbar { width: 0; height: 0; display: none; }
  .pec-root { scrollbar-width: none; -ms-overflow-style: none; }

  /* ---------- header ---------- */

  .pec-head {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: calc(var(--pec-u) * 16);
    padding: calc(var(--pec-u) * 26) calc(var(--pec-u) * 30) calc(var(--pec-u) * 18);
    border-bottom: 1px solid var(--pec-line);
    background: #fff;
  }
  .pec-eyebrow {
    margin: 0;
    font-size: calc(var(--pec-u) * 19);
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--pec-pink);
  }
  .pec-title {
    margin: calc(var(--pec-u) * 6) 0 0;
    font-size: calc(var(--pec-u) * 30);
    font-weight: 600;
    line-height: 1.15;
    color: var(--pec-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pec-dirty-pill,
  .pec-saved-pill {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: calc(var(--pec-u) * 4);
    border-radius: 999px;
    padding: calc(var(--pec-u) * 7) calc(var(--pec-u) * 16);
    font-size: calc(var(--pec-u) * 17);
    font-weight: 700;
    white-space: nowrap;
  }
  .pec-dirty-pill {
    background: var(--pec-soft);
    color: var(--pec-pink);
  }
  .pec-saved-pill {
    background: #e7f7ee;
    color: #1f9254;
  }

  /* ---------- body ---------- */

  .pec-body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: calc(var(--pec-u) * 22) calc(var(--pec-u) * 26);
  }

  .pec-section { margin-bottom: calc(var(--pec-u) * 34); }
  .pec-section:last-of-type { margin-bottom: 0; }

  .pec-section-title {
    display: flex;
    align-items: center;
    gap: calc(var(--pec-u) * 12);
    margin: 0;
    font-size: calc(var(--pec-u) * 21);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--pec-pink);
  }
  .pec-section-icon {
    flex: none;
    width: calc(var(--pec-u) * 26);
    height: calc(var(--pec-u) * 26);
    stroke-width: 2;
  }
  .pec-section-hint {
    margin: calc(var(--pec-u) * 6) 0 0 calc(var(--pec-u) * 38);
    font-size: calc(var(--pec-u) * 17);
    line-height: 1.45;
    color: var(--pec-muted);
  }

  .pec-card {
    margin-top: calc(var(--pec-u) * 14);
    border: 1px solid var(--pec-hair);
    border-radius: calc(var(--pec-u) * 26);
    background: var(--pec-card);
    padding: calc(var(--pec-u) * 18) calc(var(--pec-u) * 22);
  }
  .pec-card--flush {
    padding: 0 calc(var(--pec-u) * 22);
    overflow: hidden;
  }
  .pec-pad { padding: calc(var(--pec-u) * 18) 0; margin: 0; }

  .pec-empty-note,
  .pec-tail-note {
    display: flex;
    align-items: flex-start;
    gap: calc(var(--pec-u) * 7);
    margin: 0 0 calc(var(--pec-u) * 18);
    border-radius: calc(var(--pec-u) * 14);
    background: var(--pec-soft);
    padding: calc(var(--pec-u) * 13) calc(var(--pec-u) * 16);
    font-size: calc(var(--pec-u) * 17);
    line-height: 1.45;
    color: var(--pec-pink);
  }
  .pec-tail-note {
    margin: calc(var(--pec-u) * 22) 0 0;
    background: transparent;
    padding: 0;
    color: var(--pec-muted);
  }

  /* ---------- summary rows ---------- */

  .pec-row { border-top: 1px solid var(--pec-hair); }
  .pec-row:first-child { border-top: 0; }

  .pec-row-btn {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: calc(var(--pec-u) * 14);
    padding: calc(var(--pec-u) * 20) 0;
    border: 0;
    background: none;
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }
  .pec-row-btn > span { display: block; }

  .pec-row-label {
    display: block;
    font-size: calc(var(--pec-u) * 16);
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--pec-muted);
  }
  .pec-row-value {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    margin-top: calc(var(--pec-u) * 7);
    font-size: calc(var(--pec-u) * 25);
    font-weight: 500;
    line-height: 1.25;
    color: var(--pec-ink);
  }
  .pec-row-value--empty { color: #b9b2a8; font-weight: 400; }

  .pec-row-desc,
  .pec-row-note {
    display: block;
    margin-top: calc(var(--pec-u) * 5);
    font-size: calc(var(--pec-u) * 17);
    line-height: 1.4;
    color: var(--pec-muted);
  }
  .pec-row-desc {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .pec-row-note strong { color: var(--pec-ink); font-weight: 700; }

  .pec-row-chev {
    flex: none;
    width: calc(var(--pec-u) * 24);
    height: calc(var(--pec-u) * 24);
    color: var(--pec-muted);
    transition: transform 0.18s ease;
  }
  .pec-row[data-open="true"] .pec-row-chev { transform: rotate(90deg); }

  .pec-row-editor { padding: 0 0 calc(var(--pec-u) * 20); }

  .pec-location-note {
    margin: 0;
    font-size: calc(var(--pec-u) * 16);
    line-height: 1.45;
    color: var(--pec-muted);
  }

  /* ---------- bio ---------- */

  .pec-bio { padding: calc(var(--pec-u) * 4) 0; }
  .pec-bio-input.pec-bio-input {
    display: block;
    width: 100%;
    min-height: 0;
    margin-top: calc(var(--pec-u) * 10);
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    resize: none;
    font-size: calc(var(--pec-u) * 25);
    font-weight: 500;
    line-height: 1.4;
    color: var(--pec-ink);
  }
  .pec-bio-input.pec-bio-input:focus-visible { outline: none; box-shadow: none; }
  .pec-bio-input[aria-invalid="true"] { color: #c0362c; }
  .pec-bio-count {
    display: block;
    text-align: right;
    font-size: calc(var(--pec-u) * 16);
    font-variant-numeric: tabular-nums;
    color: #b9b2a8;
  }
  .pec-bio-error {
    display: block;
    margin-top: calc(var(--pec-u) * 5);
    font-size: calc(var(--pec-u) * 16);
    line-height: 1.4;
    font-weight: 600;
    color: #c0362c;
  }

  /* ---------- photos & video ---------- */

  .pec-photo-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: calc(var(--pec-u) * 14);
    margin-top: calc(var(--pec-u) * 14);
  }
  .pec-photo {
    position: relative;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    border-radius: calc(var(--pec-u) * 26);
    background: #ece8e4;
  }
  .pec-photo img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .pec-photo-main {
    position: absolute;
    top: calc(var(--pec-u) * 10);
    left: calc(var(--pec-u) * 10);
    border-radius: 999px;
    background: var(--pec-pink);
    padding: calc(var(--pec-u) * 6) calc(var(--pec-u) * 18);
    font-size: calc(var(--pec-u) * 16);
    font-weight: 600;
    color: #fff;
  }
  .pec-photo-remove {
    position: absolute;
    top: calc(var(--pec-u) * 10);
    right: calc(var(--pec-u) * 10);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    width: calc(var(--pec-u) * 36);
    height: calc(var(--pec-u) * 36);
    background: rgba(28, 26, 23, 0.62);
    color: #fff;
  }
  .pec-photo-remove:disabled { cursor: default; opacity: 0.4; }
  .pec-photo-remove svg { width: 55%; height: 55%; }

  /* The scrim over a tile whose POST is still in flight. */
  .pec-photo-busy {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(28, 26, 23, 0.45);
    color: #fff;
  }
  .pec-photo-spinner { animation: pec-spin 0.9s linear infinite; }
  @keyframes pec-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) {
    .pec-photo-spinner { animation: none; }
  }

  /* The add slot, inside the grid so it holds the same 3:4 box as a tile. */
  .pec-photo-add {
    display: flex;
    aspect-ratio: 3 / 4;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: calc(var(--pec-u) * 6);
    border: 2px dashed var(--pec-line);
    border-radius: calc(var(--pec-u) * 26);
    background: var(--pec-card);
    font: inherit;
    color: var(--pec-pink);
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease;
  }
  .pec-photo-add:hover:not(:disabled) { border-color: var(--pec-pink); }
  .pec-photo-add:disabled { cursor: default; opacity: 0.6; }
  .pec-photo-add-icon {
    width: calc(var(--pec-u) * 34);
    height: calc(var(--pec-u) * 34);
    stroke-width: 2;
  }
  .pec-photo-add-label {
    font-size: calc(var(--pec-u) * 16);
    font-weight: 600;
  }
  .pec-photo-error {
    margin: calc(var(--pec-u) * 12) 0 0;
    font-size: calc(var(--pec-u) * 16);
    font-weight: 600;
    line-height: 1.4;
    color: #c0362c;
  }
  .pec-photo-count {
    margin: calc(var(--pec-u) * 9) 0 0;
    font-size: calc(var(--pec-u) * 16);
    line-height: 1.4;
    color: var(--pec-muted);
  }

  .pec-video-card {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: calc(var(--pec-u) * 14);
    margin-top: calc(var(--pec-u) * 14);
    border: 1px solid var(--pec-hair);
    border-radius: calc(var(--pec-u) * 26);
    background: var(--pec-card);
    padding: calc(var(--pec-u) * 22) calc(var(--pec-u) * 24);
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }
  .pec-video-card > span { display: block; }
  .pec-video-title {
    display: block;
    font-size: calc(var(--pec-u) * 26);
    font-weight: 600;
    color: var(--pec-ink);
  }
  .pec-video-sub {
    display: block;
    margin-top: calc(var(--pec-u) * 6);
    font-size: calc(var(--pec-u) * 18);
    color: var(--pec-muted);
  }
  .pec-video-icon {
    flex: none;
    width: calc(var(--pec-u) * 36);
    height: calc(var(--pec-u) * 36);
    color: var(--pec-muted);
  }
  .pec-video-hint {
    margin: calc(var(--pec-u) * 14) 0 0;
    font-size: calc(var(--pec-u) * 17);
    line-height: 1.45;
    color: var(--pec-muted);
  }

  /* ---------- footer ---------- */

  .pec-foot {
    flex: none;
    padding: calc(var(--pec-u) * 16) calc(var(--pec-u) * 30) calc(var(--pec-u) * 24);
    border-top: 1px solid var(--pec-line);
    background: #fdfdfd;
  }
  .pec-foot-note {
    margin: calc(var(--pec-u) * 10) 0 0;
    text-align: center;
    font-size: calc(var(--pec-u) * 15);
    line-height: 1.4;
    color: var(--pec-muted);
  }
  .pec-foot-note--error {
    color: #c0362c;
    font-weight: 600;
  }

  .pec-saved-message {
    display: flex;
    align-items: flex-start;
    gap: calc(var(--pec-u) * 11);
    margin-bottom: calc(var(--pec-u) * 13);
    border-radius: calc(var(--pec-u) * 14);
    background: #e7f7ee;
    padding: calc(var(--pec-u) * 13) calc(var(--pec-u) * 15);
  }
  .pec-saved-icon { flex: none; font-size: calc(var(--pec-u) * 22); line-height: 1.2; }
  .pec-saved-title {
    margin: 0;
    font-size: calc(var(--pec-u) * 19);
    font-weight: 700;
    color: #1f9254;
  }
  .pec-saved-detail {
    margin: calc(var(--pec-u) * 3) 0 0;
    font-size: calc(var(--pec-u) * 16);
    line-height: 1.4;
    color: #4b7a63;
  }

  /* ---------- dimension tuning ----------
     Sizes below are clamped, so text never gets huge on a wide card or
     unreadably small in the 300px desktop frame. Declared after the rules
     above so they take precedence. */

  .pec-root {
    --pec-fs-label: clamp(9px, calc(var(--pec-u) * 15), 11px);
    --pec-fs-value: clamp(12.5px, calc(var(--pec-u) * 22), 15px);
    --pec-fs-small: clamp(10px, calc(var(--pec-u) * 16), 12px);
    --pec-fs-title: clamp(11px, calc(var(--pec-u) * 19), 13px);
    --pec-gap: clamp(8px, calc(var(--pec-u) * 14), 12px);
    --pec-pad-x: clamp(12px, calc(var(--pec-u) * 20), 16px);
    --pec-radius: clamp(14px, calc(var(--pec-u) * 24), 18px);
  }

  /* header + footer */
  .pec-head {
    padding: clamp(14px, calc(var(--pec-u) * 24), 20px) clamp(14px, calc(var(--pec-u) * 28), 20px)
      clamp(10px, calc(var(--pec-u) * 16), 14px);
  }
  .pec-eyebrow { font-size: var(--pec-fs-label); }
  .pec-title { font-size: clamp(14px, calc(var(--pec-u) * 28), 18px); }
  .pec-dirty-pill,
  .pec-saved-pill {
    padding: 3px 10px;
    font-size: var(--pec-fs-small);
  }
  .pec-foot {
    padding: 10px clamp(14px, calc(var(--pec-u) * 28), 20px) 14px;
  }
  .pec-foot-note { font-size: var(--pec-fs-label); }
  .pec-saved-title { font-size: var(--pec-fs-value); }
  .pec-saved-detail { font-size: var(--pec-fs-small); }

  /* body + section chrome */
  .pec-body {
    padding: clamp(14px, calc(var(--pec-u) * 22), 20px) clamp(14px, calc(var(--pec-u) * 26), 20px);
  }
  .pec-section { margin-bottom: clamp(20px, calc(var(--pec-u) * 30), 26px); }
  .pec-section-title {
    gap: 8px;
    font-size: var(--pec-fs-title);
  }
  .pec-section-icon {
    width: clamp(14px, calc(var(--pec-u) * 24), 18px);
    height: clamp(14px, calc(var(--pec-u) * 24), 18px);
  }
  .pec-section-hint {
    margin: 4px 0 0 26px;
    font-size: var(--pec-fs-small);
  }
  .pec-card {
    margin-top: var(--pec-gap);
    border-radius: var(--pec-radius);
    padding: var(--pec-gap) var(--pec-pad-x);
  }
  .pec-card--flush { padding: 0 var(--pec-pad-x); }
  .pec-pad { padding: var(--pec-gap) 0; }
  .pec-empty-note,
  .pec-tail-note { font-size: var(--pec-fs-small); }

  /* summary rows */
  .pec-row-btn {
    gap: 10px;
    padding: clamp(10px, calc(var(--pec-u) * 18), 14px) 0;
  }
  .pec-row-label { font-size: var(--pec-fs-label); }
  .pec-row-value {
    margin-top: 3px;
    font-size: var(--pec-fs-value);
  }
  .pec-row-desc,
  .pec-row-note {
    margin-top: 3px;
    font-size: var(--pec-fs-small);
  }
  .pec-row-chev {
    width: clamp(14px, calc(var(--pec-u) * 22), 18px);
    height: clamp(14px, calc(var(--pec-u) * 22), 18px);
  }
  .pec-location-note { font-size: var(--pec-fs-small); }

  /* bio */
  .pec-bio-input.pec-bio-input {
    margin-top: 6px;
    font-size: var(--pec-fs-value);
  }
  .pec-bio-count { font-size: var(--pec-fs-small); }

  /* photos + video */
  .pec-photo-grid { gap: var(--pec-gap); margin-top: var(--pec-gap); }
  .pec-photo { border-radius: clamp(12px, calc(var(--pec-u) * 22), 16px); }
  .pec-photo-main {
    top: 6px;
    left: 6px;
    padding: 2px 10px;
    font-size: var(--pec-fs-small);
  }
  .pec-photo-remove {
    top: 6px;
    right: 6px;
    width: clamp(20px, calc(var(--pec-u) * 34), 26px);
    height: clamp(20px, calc(var(--pec-u) * 34), 26px);
  }
  .pec-photo-add {
    gap: 4px;
    border-radius: clamp(12px, calc(var(--pec-u) * 22), 16px);
  }
  .pec-photo-add-icon {
    width: clamp(16px, calc(var(--pec-u) * 30), 22px);
    height: clamp(16px, calc(var(--pec-u) * 30), 22px);
  }
  .pec-photo-add-label,
  .pec-photo-error,
  .pec-photo-count { font-size: var(--pec-fs-small); }
  .pec-photo-error,
  .pec-photo-count { margin-top: 6px; }
  .pec-video-card {
    margin-top: var(--pec-gap);
    border-radius: var(--pec-radius);
    padding: var(--pec-gap) var(--pec-pad-x);
  }
  .pec-video-title { font-size: clamp(13px, calc(var(--pec-u) * 24), 16px); }
  .pec-video-sub {
    margin-top: 3px;
    font-size: var(--pec-fs-small);
  }
  .pec-video-icon {
    width: clamp(20px, calc(var(--pec-u) * 34), 26px);
    height: clamp(20px, calc(var(--pec-u) * 34), 26px);
  }
  .pec-video-hint {
    margin-top: 8px;
    font-size: var(--pec-fs-small);
  }

  /* expanded editors — the onboarding field components were sized for a
     full-screen step, so they are compacted to fit inside a row */
  .pec-row-editor {
    min-width: 0;
    max-width: 100%;
    /* No overflow:hidden here — it clipped the radio/checkbox indicators, which
       sit in their own absolutely-positioned box. The max-width above is the
       constraint that was actually needed. */
    padding: 0 0 12px;
    font-size: var(--pec-fs-value);
    line-height: 1.35;
  }
  .pec-root .pec-row-editor * {
    max-width: 100%;
    font-size: var(--pec-fs-value);
    line-height: 1.35;
  }
  .pec-root .pec-row-editor label,
  .pec-root .pec-row-editor p,
  .pec-root .pec-row-editor legend {
    font-size: var(--pec-fs-small);
  }
  .pec-root .pec-row-editor input,
  .pec-root .pec-row-editor select,
  .pec-root .pec-row-editor [role="combobox"] {
    height: 36px;
    min-height: 0;
    padding: 4px 10px;
    border-radius: 10px;
  }
  .pec-root .pec-row-editor textarea {
    min-height: 60px;
    padding: 6px 10px;
    border-radius: 10px;
  }
  /* Chips and option buttons only. The radio/checkbox *controls* are excluded:
     base-ui renders them as fixed-square spans, and this padding collapses their
     content box to zero, which makes the selected indicator invisible. */
  .pec-root .pec-row-editor button:not([role="combobox"]):not([data-slot="radio-group-item"]):not([data-slot="checkbox"]),
  .pec-root .pec-row-editor button[role="checkbox"]:not([data-slot="checkbox"]) {
    height: auto;
    min-height: 0;
    padding: 6px 12px;
    border-radius: 10px;
    font-size: var(--pec-fs-small);
  }

  /* Base UI's RadioGroupItem is a <span role="radio"> at size-4 aspect-square
     (16px). Size is restated here and no padding applied, so the indicator has a
     box to draw in. data-slot rather than [role] because the multi-select chips
     are <button role="checkbox"> and must keep the chip padding above. */
  .pec-root .pec-row-editor [data-slot="radio-group-item"],
  .pec-root .pec-row-editor [data-slot="checkbox"] {
    flex: none;
    width: 16px;
    height: 16px;
    min-height: 0;
    padding: 0;
  }
  .pec-root .pec-row-editor [data-slot="radio-group-indicator"] {
    width: 16px;
    height: 16px;
  }
  .pec-root .pec-row-editor [data-slot="radio-group-indicator"] > span {
    width: 7px;
    height: 7px;
  }
  .pec-root .pec-row-editor [data-slot="checkbox-indicator"] {
    width: 16px;
    height: 16px;
  }
  .pec-root .pec-row-editor [data-slot="radio-group-item"] svg,
  .pec-root .pec-row-editor [data-slot="checkbox"] svg,
  .pec-root .pec-row-editor button svg {
    width: 14px;
    height: 14px;
  }
  .pec-root .pec-row-editor [class*="space-y-"] > * + * { margin-top: 8px; }
  .pec-root .pec-row-editor [class*="gap-"] { gap: 6px; }

  /* ---------- a11y / motion ---------- */

  .pec-root :focus-visible {
    outline: calc(var(--pec-u) * 4) solid var(--pec-pink);
    outline-offset: calc(var(--pec-u) * 3);
  }

  @media (prefers-reduced-motion: reduce) {
    .pec-root * { transition: none !important; animation: none !important; }
  }
`;

export default ProfileEditMain;