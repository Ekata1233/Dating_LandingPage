"use client";

import { isBlank } from "../stepSchemas";
import {
  toLifestyleField,
  useOnBoardingData,
} from "../../context/OnBoardingDataContext";
import { useStepForm } from "../../context/OnboardingFormContext";
import { MultiField, RadioField, StepFooter } from "../OnboardingFields";
import { StepShell } from "../StepShell";

/* -------------------------------------------------------------------------- */
/*  Step 4 — Lifestyle.                                                         */
/*                                                                            */
/*  Both the questions and their options come from the API. Each question is     */
/*  turned into a field keyed by the question's own `key`, so this step does    */
/*  not read the static schema.                                                 */
/*                                                                            */
/*  Continue is the "I answered all of it" path and stays closed until every    */
/*  question has an answer. Leaving early is what Skip is for, and Skip posts    */
/*  nothing. A failed fetch is surfaced rather than papered over with a stale    */
/*  local list.                                                                 */
/* -------------------------------------------------------------------------- */

export default function LifestyleStep() {
  const form = useStepForm("lifestyle");
  const { lifestyle } = useOnBoardingData();

  const fields = lifestyle.questions.map(toLifestyleField);
  const answered = fields.filter((f) => form.get(f.name)).length;

  /* The questions come from the API, so `form.isComplete` (which counts schema
     fields) has nothing to count here — completeness is measured against the
     questions actually rendered. */
  const allAnswered =
    fields.length > 0 && fields.every((field) => !isBlank(form.get(field.name)));

  return (
    <StepShell
      eyebrow="Lifestyle"
      title="How do you live?"
      subtitle={
        answered > 0
          ? `${answered} of ${fields.length} answered — Continue unlocks when they're all done.`
          : "Answer every question to continue, or skip the lot and come back later."
      }
      footer={
        <StepFooter
          onSubmit={() => form.submit()}
          submitting={form.submitState === "submitting"}
          submitError={form.submitError}
          isValid={allAnswered}
          skippable
          onSkip={() => form.skip()}
        />
      }
    >
      {lifestyle.loading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Loading questions…
        </p>
      ) : lifestyle.error ? (
        <p
          role="alert"
          className="py-6 text-center text-sm font-medium text-destructive"
        >
          {lifestyle.error}
        </p>
      ) : fields.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No questions are available right now.
        </p>
      ) : (
        fields.map((field) =>
          field.kind === "multi" ? (
            <MultiField
              key={field.name}
              field={field}
              values={form.get<string[]>(field.name) ?? []}
              error={form.errors[field.name]}
              onChange={(v) => form.set(field.name, v)}
            />
          ) : (
            <RadioField
              key={field.name}
              field={field}
              value={form.get<string>(field.name)}
              error={form.errors[field.name]}
              onChange={(v) => form.set(field.name, v)}
            />
          ),
        )
      )}
    </StepShell>
  );
}
