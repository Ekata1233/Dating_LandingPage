"use client";

import { cn } from "cn";
import { Check, ChevronRight } from "lucide-react";

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
/*  Step 11 — Review.                                                           */
/*                                                                            */
/*  Read-only. Shows what the earlier steps actually captured rather than a      */
/*  hardcoded sample, because a summary that disagrees with the form is worse   */
/*  than no summary. Rows link back to their step so a wrong answer can be      */
/*  fixed before finishing.                                                     */
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

export default function ReviewStep({ onFinish }: { onFinish?: () => void }) {
  const form = useOnboardingForm();
  const { intentions, lifestyle, interests } = useOnBoardingData();
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

  /* The steps worth summarising, in flow order. Review itself is excluded. */
  const shown = [
    "basics",
    "preference",
    "intentions",
    "lifestyle",
    "career",
    "interests",
    "bio",
    "prompts",
    "location",
  ];

  const rows: SummaryRow[] = shown.flatMap((stepId) => {
    const schema = STEP_SCHEMAS[stepId];
    if (!schema) return [];
    const data = form.data[stepId] ?? {};

    return fieldsForStep(stepId)
      .filter((f) => f.kind !== "photos" && !isBlank(data[f.name]))
      .map((f) => ({
        label: f.label,
        value: labelFor(
          schema,
          f,
          data[f.name],
          optionsForStep(stepId, f),
        ),
        stepId,
      }));
  });

  const photos = Array.isArray(form.data.photos) ? form.data.photos : [];

  return (
    <StepShell
      eyebrow="Review"
      title="Does this look right?"
      subtitle="Anything you skipped can still be added later from your profile."
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
            className="h-12 w-full rounded-xl bg-primary text-sm font-semibold"
          >
            {form.submitState === "submitting" ? "Finishing…" : "Finish"}
          </Button>
        </div>
      }
    >
      {photos.length > 0 && (
        <div className="flex gap-2">
          {photos.slice(0, 4).map((_, i) => (
            <div
              key={i}
              className="grid aspect-3/4 flex-1 place-items-center rounded-lg bg-muted text-[10px] text-muted-foreground"
            >
              Photo {i + 1}
            </div>
          ))}
        </div>
      )}

      <div className="divide-y divide-border rounded-xl border border-border">
        {rows.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Nothing added yet.</p>
        )}

        {rows.map((row) => (
          <div key={`${row.stepId}-${row.label}`} className="flex items-start gap-3 p-3">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {row.label}
              </p>
              <p className="truncate text-sm">{row.value}</p>
            </div>
            <ChevronRight
              className={cn("mt-0.5 size-4 shrink-0 text-muted-foreground")}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
    </StepShell>
  );
}
