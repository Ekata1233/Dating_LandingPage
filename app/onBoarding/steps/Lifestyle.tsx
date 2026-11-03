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
/*  The step is skippable and Continue is deliberately partial: it opens once    */
/*  at least one rendered question holds a value, and then saves only the        */
/*  answered ones (one request per answered question — an unanswered question    */
/*  has nothing to post). Skip advances without saving anything. The gate lives   */
/*  here rather than in STEP_SCHEMAS because the field names are the API's own   */
/*  keys — a static schema entry would validate a key the step never writes and  */
/*  block the button with no visible error.                                      */
/* -------------------------------------------------------------------------- */

export default function LifestyleStep() {
  const form = useStepForm("lifestyle");
  const { lifestyle } = useOnBoardingData();

  const fields = lifestyle.questions.map(toLifestyleField);
  const answered = fields.filter((f) => !isBlank(form.get(f.name))).length;

  /* The questions come from the API, so `form.isComplete` (which counts schema
     fields) has nothing to count here — completeness is measured against the
     questions actually rendered. Nothing is compulsory: Continue saves whatever
     is answered, so it only needs at least one answer to be worth pressing. */
  const ready = !lifestyle.loading && fields.length > 0;
  const complete = ready && answered === fields.length;
  const canContinue = ready && answered > 0;

  return (
    <StepShell
      eyebrow="Lifestyle"
      title="How do you live?"
      subtitle={
        !ready
          ? "Answer what you like — you can skip anything you'd rather not share."
          : complete
            ? `All ${fields.length} answered — Continue saves them.`
            : `${answered} of ${fields.length} answered — Continue saves what you've picked, or skip for now.`
      }
      footer={
        <StepFooter
          onSubmit={() => form.submit()}
          submitting={form.submitState === "submitting"}
          submitError={form.submitError}
          isValid={canContinue}
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
