"use client";

/* -------------------------------------------------------------------------- */
/*  Edit profile (desktop frame + mobile fluid).                                */
/*                                                                            */
/*  One long, single-page form — every section stacked one below another, the   */
/*  way the onboarding flow presents the same information across its steps.      */
/*  Nothing here is a step, nothing advances, and nothing is invented:          */
/*                                                                            */
/*    values   -> GET /api/user/onboarding-details, via `OnBoardingDataContext` */
/*                (`profileDetails`). Nothing is seeded from a mock.             */
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
/*  There is no save endpoint yet: Save flips the card into its "saved" message  */
/*  and offers an Edit button to go back. No request is made.                    */
/* -------------------------------------------------------------------------- */

import { cn } from "cn";
import {
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Images,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  PlusCircle,
  Search,
  Sparkles,
  User,
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
  DateField,
  MultiField,
  RadioField,
  SelectField,
  TextareaField,
  TextField,
} from "@/app/onBoarding/OnboardingFields";
import { stepDataFromDetails } from "@/app/onBoarding/stepPayloads";
import { STEP_SCHEMAS, type FieldDef } from "@/app/onBoarding/stepSchemas";

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

/** A photo tile. The details payload carries no photos, so the caller supplies them. */
export interface ProfilePhoto {
  id: string;
  url: string;
  isMain?: boolean;
}

export interface ProfileEditMainProps {
  /**
   * Fires on Save. There is no endpoint yet, so this is purely the seam a caller
   * can hook; the UI shows its saved state either way.
   */
  onSave?: (data: ProfileEditPayload) => void | Promise<unknown>;
  /** Fill the parent edge to edge instead of rendering the 300px desktop frame. */
  fluid?: boolean;
  /** Caller-owned busy state, for when a save is wired up later. */
  saving?: boolean;
  /**
   * Values applied underneath the API payload. Useful for a preview or a draft,
   * never used to stand in for a missing payload.
   */
  initialData?: Record<string, unknown>;
  /** Renders the Photos grid when given. Omit and the section is not shown. */
  photos?: ProfilePhoto[];
  onEditPhoto?: (photo: ProfilePhoto) => void;
  onRemovePhoto?: (photo: ProfilePhoto) => void;
  /** Renders the live-video card when given. Omit and the section is not shown. */
  onRecordVideo?: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Location (geolocation + reverse geocoding)                                 */
/* -------------------------------------------------------------------------- */

const DEFAULT_MAX_DISTANCE_KM = 25;

type NominatimAddress = Record<string, string | undefined>;

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

/** Broadest -> narrowest. The first usable match wins. */
const AREA_KEYS = [
  "city_district",
  "suburb",
  "quarter",
  "neighbourhood",
  "residential",
] as const;

/** Skip administrative labels like "Hadapsar Ward Office". */
const ADMIN_NAME =
  /\b(ward|municipal|corporation|taluka|tehsil|district|division)\b/i;

function pickArea(address: NominatimAddress): string {
  for (const key of AREA_KEYS) {
    const value = address[key];
    if (value && !ADMIN_NAME.test(value)) return value;
  }
  return "";
}

/** BigDataCloud client-side API: free, no key, non-OSM data. */
async function fromBigDataCloud(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<PlaceParts> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: "en",
  });

  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`,
    { signal, headers: { Accept: "application/json" } }
  );
  if (!res.ok) throw new Error(`BigDataCloud failed: ${res.status}`);

  const d = await res.json();
  return {
    country: d.countryName ?? "",
    state: d.principalSubdivision ?? "",
    city: d.city ?? "",
    area: d.locality ?? "",
  };
}

/** OpenStreetMap Nominatim: free, no key, light use only. */
async function fromNominatim(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<PlaceParts> {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "16",
    addressdetails: "1",
    "accept-language": "en",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params}`,
    { signal, headers: { Accept: "application/json" } }
  );
  if (!res.ok) throw new Error(`Nominatim failed: ${res.status}`);

  const data = await res.json();
  const a: NominatimAddress = data.address ?? {};
  return {
    country: a.country ?? "",
    state: a.state ?? "",
    city: a.city ?? a.town ?? a.municipality ?? a.village ?? "",
    area: pickArea(a),
  };
}

/**
 * Reverse-geocodes coordinates using two free, key-less services in parallel
 * and merges them. If one fails, the other is used. For production traffic,
 * proxy this through your own API route and cache by rounded coordinates.
 */
async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<ResolvedLocation> {
  const [bdc, osm] = await Promise.allSettled([
    fromBigDataCloud(latitude, longitude, signal),
    fromNominatim(latitude, longitude, signal),
  ]);

  const b = bdc.status === "fulfilled" ? bdc.value : null;
  const o = osm.status === "fulfilled" ? osm.value : null;

  console.log("Reverse geocode — BigDataCloud:", b, "Nominatim:", o);

  if (!b && !o) {
    throw new Error("Reverse geocoding failed");
  }

  const city = b?.city || o?.city || "";

  return {
    country: b?.country || o?.country || "",
    state: b?.state || o?.state || "",
    city,
    // If one source names your area better, swap the order of b?.area / o?.area.
    // Falls back to the city so `area` is never empty.
    area: b?.area || o?.area || city,
    latitude: Number(latitude.toFixed(4)),
    longitude: Number(longitude.toFixed(4)),
  };
}

/**
 * Watches for a GPS fix and resolves as soon as accuracy is good enough,
 * or with the best fix seen when the time limit is reached.
 */
function getPosition(
  targetAccuracyM = 100,
  maxWaitMs = 10_000
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    let best: GeolocationPosition | null = null;
    let done = false;
    let watchId = -1;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const finish = (fn: () => void) => {
      if (done) return;
      done = true;
      if (watchId !== -1) navigator.geolocation.clearWatch(watchId);
      if (timer) clearTimeout(timer);
      fn();
    };

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!best || pos.coords.accuracy < best.coords.accuracy) best = pos;
        if (pos.coords.accuracy <= targetAccuracyM) {
          finish(() => resolve(pos));
        }
      },
      (err) => finish(() => (best ? resolve(best) : reject(err))),
      { enableHighAccuracy: true, timeout: maxWaitMs, maximumAge: 0 }
    );

    timer = setTimeout(
      () =>
        finish(() =>
          best
            ? resolve(best)
            : reject({ code: 3 } as Partial<GeolocationPositionError>)
        ),
      maxWaitMs
    );
  });
}

/** "Hadapsar, Pune, Maharashtra, India" (drops empty/duplicate parts). */
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
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

const ProfileEditMain: React.FC<ProfileEditMainProps> = ({
  onSave,
  fluid = false,
  saving = false,
  initialData,
  photos,
  onEditPhoto,
  onRemovePhoto,
  onRecordVideo,
}) => {
  const { intentions, lifestyle, interests, profileDetails } = useOnBoardingData();
  const careerSources = useCareerOptionSources();
  const { categories: promptCategories, loading: promptsLoading, error: promptsError } =
    usePromptCategories();

  const router = useRouter();

  const { details, loading, error, refetch } = profileDetails;

  /* Only what the user has actually touched lives in state. Everything else is
     derived from the payload, so there is no hydration effect and a refetch
     cannot overwrite an edit in progress. */
  const [fieldOverrides, setFieldOverrides] = React.useState<Record<string, unknown>>({});
  const [promptOverrides, setPromptOverrides] = React.useState<PromptAnswer[] | null>(null);

  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  /* Which summary row is expanded into its editor. One at a time keeps the page short. */
  const [openRow, setOpenRow] = React.useState<string | null>(null);
  const toggleRow = (id: string) => setOpenRow((current) => (current === id ? null : id));

  const seedFields = React.useMemo(
    () => (details ? fieldsFromDetails(details, initialData) : { ...initialData }),
    [details, initialData]
  );
  const fields = React.useMemo(
    () => ({ ...seedFields, ...fieldOverrides }),
    [seedFields, fieldOverrides]
  );

  const seedPrompts = React.useMemo(
    () => (details ? promptsFromDetails(details) : []),
    [details]
  );
  const prompts = promptOverrides ?? seedPrompts;

  const dirty = Object.keys(fieldOverrides).length > 0 || promptOverrides !== null;

  const setField = React.useCallback((name: string, value: unknown) => {
    setFieldOverrides((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  }, []);

  const readString = (name: string) => asString(fields[name]);
  const readList = (name: string) => asList(fields[name]);

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
      console.log("Geolocation result", {
        lat: coords.latitude,
        lon: coords.longitude,
        accuracyM: coords.accuracy,
      });

      const loc = await reverseGeocode(
        coords.latitude,
        coords.longitude,
        controller.signal
      );
      if (controller.signal.aborted) return;

      setField("country", loc.country);
      setField("state", loc.state);
      setField("city", loc.city);
      setField("area", loc.area);
      setField("latitude", loc.latitude);
      setField("longitude", loc.longitude);

      /* Keep a distance the user already has; only seed the default when unset. */
      if (!readString("max_distance_km")) {
        setField("max_distance_km", DEFAULT_MAX_DISTANCE_KM);
      }
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
        setLocateError(
          "We got your position but couldn't work out your city. Please try again."
        );
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

  const handleSave = async () => {
    if (busy || saving || !dirty) return;

    setBusy(true);
    try {
      await onSave?.({ fields, prompts });
      /* No endpoint yet — this is a UI state, not a persisted change. */
      setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  const startEditing = () => {
    setSaved(false);
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
  const renderField = (field: FieldDef) => {
    const error = undefined;

    if (isCareerField(field.name)) {
      const source = careerSources[field.name];

      if (source.error) {
        return (
          <div key={field.name} className="space-y-1.5">
            <p className="text-xs font-semibold">{field.label}</p>
            <p role="alert" className="text-[11px] font-medium text-destructive">
              {source.error}
            </p>
            <button
              type="button"
              onClick={() => void source.refetch()}
              className="text-[11px] font-semibold text-primary underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        );
      }

      return (
        <div key={field.name} className="space-y-1.5">
          <SelectField
            /* The schema owns the name and the label; the option list belongs to
               the API, so it is layered on here. */
            field={{ ...field, options: source.options }}
            value={readString(field.name)}
            error={error}
            onChange={(v) => setField(field.name, v)}
          />
          {source.loading && (
            <p className="text-[11px] text-muted-foreground">Loading options…</p>
          )}
        </div>
      );
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

    if (field.kind === "multi") {
      const options = (field as { options?: unknown }).options;

      return {
        display: asList(fields[field.name])
          .map((value) => optionLabel(options, value))
          .join(", "),
      };
    }

    if (field.kind === "select") {
      const options = isCareerField(field.name)
        ? careerSources[field.name].options
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

  if (loading) {
    return shell(<Loader label="Loading your details…" hint="Fetching what you've already saved." />);
  }

  if (error) {
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
      {photos && (
        <section className="pec-section">
          <SectionHeading icon={Images} title="Photos" />

          <div className="pec-photo-grid">
            {photos.map((photo, index) => (
              <div key={photo.id} className="pec-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={`Profile photo ${index + 1}`} />

                {photo.isMain && <span className="pec-photo-main">Main</span>}

                {onRemovePhoto && (
                  <button
                    type="button"
                    className="pec-photo-remove"
                    aria-label={`Remove photo ${index + 1}`}
                    onClick={() => onRemovePhoto(photo)}
                  >
                    <X aria-hidden="true" />
                  </button>
                )}

                {onEditPhoto && (
                  <button
                    type="button"
                    className="pec-photo-edit"
                    aria-label={`Edit photo ${index + 1}`}
                    onClick={() => onEditPhoto(photo)}
                  >
                    <Pencil aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

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
                placeholder="A few honest lines is plenty."
                className="pec-bio-input"
                onChange={(e) => setField(field.name, e.target.value.slice(0, max))}
              />

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
      <Section icon={PlusCircle} title="Basic details" flush>
        {STEP_SCHEMAS.basics.fields.map(renderRow)}
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
            {!hasLocation && !locateError && (
              <p className="text-[11px] font-medium text-muted-foreground">
                No location saved yet.
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
        <span aria-hidden="true">🔒</span> Only you can see this until you publish it.
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
                  Saving isn&rsquo;t connected to the server yet, so these answers are only
                  held on this device.
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

            <p className="pec-foot-note">
              The save endpoint isn&rsquo;t live yet — this only previews the flow.
            </p>
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
  .pec-bio-count {
    display: block;
    text-align: right;
    font-size: calc(var(--pec-u) * 16);
    font-variant-numeric: tabular-nums;
    color: #b9b2a8;
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
  .pec-photo-remove,
  .pec-photo-edit {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 999px;
    cursor: pointer;
  }
  .pec-photo-remove {
    top: calc(var(--pec-u) * 10);
    right: calc(var(--pec-u) * 10);
    width: calc(var(--pec-u) * 36);
    height: calc(var(--pec-u) * 36);
    background: rgba(28, 26, 23, 0.62);
    color: #fff;
  }
  .pec-photo-edit {
    right: calc(var(--pec-u) * 10);
    bottom: calc(var(--pec-u) * 10);
    width: calc(var(--pec-u) * 48);
    height: calc(var(--pec-u) * 48);
    background: rgba(255, 255, 255, 0.94);
    color: var(--pec-pink);
  }
  .pec-photo-remove svg { width: 55%; height: 55%; }
  .pec-photo-edit svg { width: 46%; height: 46%; }

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
  .pec-photo-edit {
    right: 6px;
    bottom: 6px;
    width: clamp(26px, calc(var(--pec-u) * 46), 34px);
    height: clamp(26px, calc(var(--pec-u) * 46), 34px);
  }
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