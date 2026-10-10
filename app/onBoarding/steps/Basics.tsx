"use client";

import { StepShell } from "../StepShell";
import {
  DateField,
  SelectField,
  StepFooter,
  TextField,
} from "../OnboardingFields";
import { useStepForm } from "../../context/OnboardingFormContext";
import { STEP_SCHEMAS } from "../stepSchemas";

/* -------------------------------------------------------------------------- */
/*  Step 1 — The basics.                                                        */
/*                                                                            */
/*  The fields live in `stepSchemas.ts`; this file decides only the order and  */
/*  which control each one renders with.                                       */
/* -------------------------------------------------------------------------- */

const SCHEMA = STEP_SCHEMAS.basics;

export default function ProfileBasicsSteps() {
  const form = useStepForm("basics");

  return (
    <StepShell
      eyebrow="About you"
      title="Let&rsquo;s set up your profile."
      subtitle="A few basics to get you started — you can refine all of this later."
      footer={
        <StepFooter
          onSubmit={() => form.submit()}
          submitting={form.submitState === "submitting"}
          submitError={form.submitError}
          isValid={form.isValid}
        />
      }
    >
      {SCHEMA.fields.map((field) => {
        const error = form.errors[field.name];

        if (field.kind === "date") {
          return (
            <DateField
              key={field.name}
              field={field}
              value={form.get<string>(field.name)}
              error={error}
              adultOnly={true}
              onChange={(v) => form.set(field.name, v)}
            />
          );
        }

        if (field.kind === "select") {
          return (
            <SelectField
              key={field.name}
              field={field}
              value={form.get<string>(field.name)}
              error={error}
              onChange={(v) => form.set(field.name, v)}
            />
          );
        }

        return (
          <TextField
            key={field.name}
            field={field}
            value={form.get<string>(field.name)}
            error={error}
            onChange={(v) => form.set(field.name, v)}
          />
        );
      })}
    </StepShell>
  );
}
