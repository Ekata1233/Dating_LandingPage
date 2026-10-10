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
/*  Every question is compulsory: Continue stays closed until each rendered      */
/*  field holds a value, and the step then saves them (one request per           */
/*  answered question). The gate lives here rather than in STEP_SCHEMAS because  */
/*  the field names are the API's own keys — a static schema entry would         */
/*  validate a key the step never writes and block the button with no visible    */
/*  error. There is no Skip on this step, so Continue is the only way past.      */
/* -------------------------------------------------------------------------- */

export default function LifestyleStep() {
  const form = useStepForm("lifestyle");
  const { lifestyle } = useOnBoardingData();

  const fields = lifestyle.questions.map(toLifestyleField);
  const answered = fields.filter((f) => !isBlank(form.get(f.name))).length;

  /* The questions come from the API, so `form.isComplete` (which counts schema
     fields) has nothing to count here — completeness is measured against the
     questions actually rendered, and every one of them must be answered. */
  const ready = !lifestyle.loading && fields.length > 0;
  const complete = ready && answered === fields.length;

  return (
    <StepShell
      eyebrow="Lifestyle"
      title="How do you live?"
      subtitle={
        !ready
          ? "Every question here is required — answer them all to continue."
          : complete
            ? `All ${fields.length} answered — Continue saves them.`
            : `${answered} of ${fields.length} answered — answer every question to continue.`
      }
      footer={
        <StepFooter
          onSubmit={() => form.submit()}
          submitting={form.submitState === "submitting"}
          submitError={form.submitError}
          isValid={complete}
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
