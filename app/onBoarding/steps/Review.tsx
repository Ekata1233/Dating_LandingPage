"use client";

import { Check } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";

import {
  isCareerField,
  toInterestsField,
  toLifestyleField,
  useCareerOptionSources,
  useOnBoardingData,
} from "../../context/OnBoardingDataContext";
import { useOnboardingForm } from "../../context/OnboardingFormContext";
import { StepShell } from "../StepShell";
import { STEP_SCHEMAS, isBlank, type FieldDef, type FieldOption, type StepSchema } from "../stepSchemas";

/* -------------------------------------------------------------------------- */
/*  Step 11 — Review.                                                        */
/*                                                                            */
/*  Read-only. Everything on this screen — the photo, name, age, orientation, */
/*  verified badge, and every summary row — is pulled from `form.data` and    */
/*  STEP_SCHEMAS at render time. Nothing here is a sample value: a summary    */
/*  that disagrees with the form is worse than no summary. There's no link    */
/*  back to a step from a row anymore (the new design dropped that           */
/*  affordance) — if you still want edit-in-place, reintroduce the           */
/*  onClick/chevron that used to sit on each row.                            */
/* -------------------------------------------------------------------------- */

interface SummaryRow {
  label: string;
  value: string;
  stepId: string;
}

function labelFor(
  schema: StepSchema,
  field: FieldDef,
  value: unknown,
  dynamicOptions?: readonly FieldOption[],
): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value
      .map((v) => {
        if (v && typeof v === "object") {
          const rec = v as Record<string, unknown>;
          if (typeof rec.label === "string") return rec.label;
          if (typeof rec.answer === "string") return String(rec.answer).slice(0, 40);
          return String(rec.name ?? "");
        }
        return resolveLabel(schema, dynamicOptions, v);
      })
      .filter(Boolean)
      .join(", ");
  }

  return resolveLabel(schema, dynamicOptions, value);
}

/**
 * Preference: API-supplied options first, so API-driven steps (which store a
 * uuid) still render a readable label. Falls back to the schema's static list.
 */
function resolveLabel(
  schema: StepSchema,
  dynamicOptions: readonly FieldOption[] | undefined,
  value: unknown,
): string {
  const target = String(value);

  const fromApi = dynamicOptions?.find((o) => o.value === target);
  if (fromApi) return fromApi.label;

  const fromSchema = schema.fields
    .flatMap((f) => f.options ?? [])
    .find((o) => o.value === target);

  return fromSchema?.label ?? target;
}

/** Turns whatever shape a single photo is stored in (a File, a plain url
 *  string, or an object carrying one of those) into something an <img> can
 *  point at. Matches the loose shapes the photos step already tolerates. */
function photoSrc(photo: unknown): string | undefined {
  if (!photo) return undefined;
  if (typeof photo === "string") return photo;
  if (typeof File !== "undefined" && photo instanceof File) return URL.createObjectURL(photo);
  if (typeof photo === "object") {
    const rec = photo as Record<string, unknown>;
    if (typeof rec.url === "string") return rec.url;
    if (typeof rec.preview === "string") return rec.preview;
    if (typeof File !== "undefined" && rec.file instanceof File) {
      return URL.createObjectURL(rec.file);
    }
  }
  return undefined;
}

/** `basics.dateOfBirth` → whole years old, as of today. Returns undefined for
 *  anything unparsable so the UI can just omit the age rather than show NaN. */
function ageFromDob(dob: unknown): number | undefined {
  if (typeof dob !== "string" || !dob) return undefined;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hadBirthdayThisYear =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
  if (!hadBirthdayThisYear) age -= 1;
  return age;
}

export default function ReviewStep({ onFinish }: { onFinish?: () => void }) {
  const form = useOnboardingForm();
  const { intentions, lifestyle, interests,profileDetails } = useOnBoardingData();
  const careerSources = useCareerOptionSources();
  /* API-driven steps keep their questions and options out of the schema, so the
   * summary has to ask the context for them. */
  const fieldsForStep = (stepId: string): readonly FieldDef[] => {
    if (stepId === "lifestyle") return lifestyle.questions.map(toLifestyleField);
    if (stepId === "interests") return interests.questions.map(toInterestsField);

    return STEP_SCHEMAS[stepId]?.fields ?? [];
  };

  const optionsForStep = (
    stepId: string,
    field: FieldDef,
  ): readonly FieldOption[] | undefined => {
    if (stepId === "intentions") return intentions.options;

    // A lifestyle field is built from its API question, so it already carries
    // the fetched options.
    if (stepId === "lifestyle") return field.options;

    // Interests fields are built from their API question, so they already carry
    // the fetched options.
    if (stepId === "interests") return field.options;

    // Career dropdowns hold an option id, so the label has to come from the
    // list that supplied it.
    if (stepId === "career" && isCareerField(field.name)) {
      return careerSources[field.name].options;
    }

    return undefined;
  };

  /* basics fields that surface in the profile card up top instead of as a
   * row below — adjust these keys if your `basics` schema names them
   * differently. */
  const PROFILE_CARD_FIELDS = new Set([
    "fullName",
    "email",
    "dateOfBirth",
    "height",
    "sexualOrientation",
  ]);

  /* The steps worth summarising, in flow order. Review itself is excluded.
   * "photos" isn't a schema-backed step — the photo list lives directly on
   * form.data.photos — so it's handled separately below rather than through
   * fieldsForStep/optionsForStep. */
  const shown = [
    "basics",
    "preference",
    "intentions",
    "photos",
    "interests",
    "bio",
    "location",
  ];

  const photos = profileDetails.photos ?? [];
  const location = profileDetails.details?.flows.LOCATION?.city ?? "";

  const rows: SummaryRow[] = shown.flatMap((stepId) => {
    if (stepId === "photos") {
      if (photos.length === 0) return [];
      return [{ label: "Photos", value: `${photos.length} added`, stepId: "photos" }];
    }
    if (stepId === "location") {
      return [{ label: "Location", value: `${location}`, stepId: "location" }];
    }

    const schema = STEP_SCHEMAS[stepId];
    if (!schema) return [];
    const data = form.data[stepId] ?? {};

    return fieldsForStep(stepId)
      .filter(
        (f) =>
          f.kind !== "photos" &&
          !isBlank(data[f.name]) &&
          !(stepId === "basics" && PROFILE_CARD_FIELDS.has(f.name)),
      )
      .map((f) => ({
        label: f.label,
        value: labelFor(schema, f, data[f.name], optionsForStep(stepId, f)),
        stepId,
      }));
  });

  /* Profile card: name, age, orientation, avatar and verified state, all read
   * straight off the basics step's data rather than hardcoded. */
  const basicsData = form.data.basics ?? {};
  const basicsSchema = STEP_SCHEMAS.basics;

  const fullName = typeof basicsData.fullName === "string" ? basicsData.fullName : undefined;
  const age = ageFromDob(basicsData.dateOfBirth);
  const orientationLabel =
    basicsSchema && !isBlank(basicsData.sexualOrientation)
      ? resolveLabel(basicsSchema, undefined, basicsData.sexualOrientation)
      : undefined;
  // Adjust this path if phone-verification state is tracked somewhere else
  // in your form/context (e.g. a separate verification step or a profile
  // object from useOnBoardingData()).
  const phoneVerified = Boolean(basicsData.phoneVerified);
  const avatarUrl = React.useMemo(() => photos[0]?.mediaUrl, [photos]);

  return (
    <StepShell
      eyebrow="Almost done"
      title="Looks good?"
      subtitle="Here's your profile so far. You can change anything later."
      footer={
        <div className="space-y-2 px-5 pb-5 pt-3">
          {form.submitError && (
            <p role="alert" className="text-center text-[11px] font-medium text-destructive">
              {form.submitError}
            </p>
          )}
          <Button
            type="button"
            onClick={async () => {
              const result = await form.submitCurrent("review");
              if (result.ok) onFinish?.();
            }}
            disabled={form.submitState === "submitting"}
            className="h-12 w-full rounded-full bg-primary text-sm font-semibold shadow-lg shadow-primary/30"
          >
            {form.submitState === "submitting" ? "Creating your profile…" : "Create my profile"}
          </Button>
        </div>
      }
    >
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="size-14 shrink-0 overflow-hidden rounded-full bg-muted">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName ?? "Your profile photo"}
                className="size-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold leading-tight">
              {fullName ?? "Your profile"}
              {age !== undefined ? `, ${age}` : ""}
            </p>
            {orientationLabel && (
              <p className="mt-0.5 text-sm text-muted-foreground">{orientationLabel}</p>
            )}
            {phoneVerified && (
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                <Check className="size-3" aria-hidden="true" />
                Phone verified
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 divide-y divide-border border-t border-border">
          {rows.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">Nothing added yet.</p>
          )}

          {rows.map((row) => (
            <div
              key={`${row.stepId}-${row.label}`}
              className="flex items-baseline justify-between gap-4 py-4"
            >
              <p className="text-sm text-muted-foreground">{row.label}</p>
              <p className="truncate text-right text-sm font-bold">{row.value}</p>
            </div>
          ))}
        </div>
      </div>
    </StepShell>
  );
}
