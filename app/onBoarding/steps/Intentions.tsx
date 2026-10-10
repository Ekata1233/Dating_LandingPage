"use client";

import * as React from "react";

import { useOnBoardingData } from "../../context/OnBoardingDataContext";
import { useStepForm } from "../../context/OnboardingFormContext";
import { RadioField, StepFooter } from "../OnboardingFields";
import { StepShell } from "../StepShell";
import { STEP_SCHEMAS } from "../stepSchemas";

const SCHEMA = STEP_SCHEMAS.intentions;

/* -----------------------------------------------------------------------------
 *  The options here come from the API, not the schema — see IntentionProvider.
 *  The schema still owns validation, so the field is looked up as usual.
 * -------------------------------------------------------------------------- */

export default function IntentionStep() {
  const form = useStepForm("intentions");
  const {
    intentions: { question, options, loading, error },
  } = useOnBoardingData();

  const intention = SCHEMA.fields.find((f) => f.name === "intention")!;

  // A failed or empty fetch must not look like a skippable-but-unanswered step.
  const unavailable = Boolean(error) || (options.length === 0 && !loading);

  return (
    <StepShell
      eyebrow="Intentions"
      title={question?.title || SCHEMA.fields[0]!.label}
      subtitle={question?.subtitle}
      footer={
        <StepFooter
          onSubmit={() => form.submit()}
          submitting={form.submitState === "submitting"}
          submitError={form.submitError}
          isValid={form.isValid && !unavailable && !loading}
        />
      }
    >
      {loading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Loading options…
        </p>
      ) : error ? (
        <p
          role="alert"
          className="py-6 text-center text-sm font-medium text-destructive"
        >
          {error}
        </p>
      ) : options.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No options are available right now.
        </p>
      ) : (
        <RadioField
          field={intention}
          options={options}
          hideLabel
          value={form.get<string>("intention")}
          error={form.errors.intention}
          onChange={(v) => form.set("intention", v)}
        />
      )}
    </StepShell>
  );
}
