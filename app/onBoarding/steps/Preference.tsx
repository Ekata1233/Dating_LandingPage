"use client";

import { RadioField, SelectField, StepFooter } from "../OnboardingFields";
import { useStepForm } from "../../context/OnboardingFormContext";
import { StepShell } from "../StepShell";
import { STEP_SCHEMAS } from "../stepSchemas";

const SCHEMA = STEP_SCHEMAS.preference;

export default function PreferenceStep() {
  const form = useStepForm("preference");

  const genders = SCHEMA.fields.find((f) => f.name === "genders")!;
  const sexualOrientation = SCHEMA.fields.find(
    (f) => f.name === "sexualOrientation"
  )!;

  const selectedGender = form.get<string>("genders");

  return (
    <StepShell
      eyebrow="Preferences"
      title="Who would you like to meet?"
      subtitle="Select as many as you like. This only changes who you're shown."
      footer={
        <StepFooter
          onSubmit={() => form.submit()}
          submitting={form.submitState === "submitting"}
          submitError={form.submitError}
          isValid={form.isValid}
        />
      }
    >
      <RadioField
        field={genders}
        value={selectedGender}
        error={form.errors.genders}
        onChange={(value) => form.set("genders", value)}
      />

      {selectedGender ? (
        <SelectField
          field={sexualOrientation}
          value={form.get<string>("sexualOrientation")}
          error={form.errors.sexualOrientation}
          onChange={(value) => form.set("sexualOrientation", value)}
        />
      ) : null}
    </StepShell>
  );
}