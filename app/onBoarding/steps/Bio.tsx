"use client";

import { StepFooter, TextareaField } from "../OnboardingFields";
import { useStepForm } from "../../context/OnboardingFormContext";
import { StepShell } from "../StepShell";
import { STEP_SCHEMAS } from "../stepSchemas";

/* -------------------------------------------------------------------------- */
/*  Step 8 — Bio.                                                              */
/*                                                                            */
/*  Continue is the "I wrote a real one" path: it stays closed until the        */
/*  textarea holds a bio that clears the minimum. Passing an empty box is what  */
/*  Skip is for, and Skip posts nothing.                                        */
/* -------------------------------------------------------------------------- */

const SCHEMA = STEP_SCHEMAS.bio;
const FIELD = SCHEMA.fields.find((f) => f.name === "bio")!;
const MIN = FIELD.minLength ?? 10;

export default function BioStep() {
  const form = useStepForm("bio");
  const value = form.get<string>("bio") ?? "";
  const untouched = value.trim() === "";
  const tooShort = !untouched && value.trim().length < MIN;

  return (
    <StepShell
      eyebrow="Bio"
      title="Tell us about you."
      subtitle="Skip it if you'd rather — but a couple of honest lines make a real difference."
      footer={
        <StepFooter
          onSubmit={() => form.submit()}
          submitting={form.submitState === "submitting"}
          submitError={form.submitError}
          isValid={form.isComplete && !tooShort}
          skippable
          onSkip={() => form.skip()}
        />
      }
    >
      <TextareaField
        field={FIELD}
        value={value}
        error={tooShort ? FIELD.message : form.errors.bio}
        onChange={(v) => form.set("bio", v)}
      />

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Good bios mention something specific rather than listing adjectives. What you do on a
        Sunday is more useful than &ldquo;fun and honest&rdquo;.
      </p>
    </StepShell>
  );
}
