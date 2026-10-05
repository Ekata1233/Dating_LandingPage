"use client";

import {
  isCareerField,
  useCareerOptionSources,
} from "../../context/OnBoardingDataContext";
import { useStepForm } from "../../context/OnboardingFormContext";
import {
  DateField,
  SelectField,
  StepFooter,
  TextField,
  TextareaField,
} from "../OnboardingFields";
import { StepShell } from "../StepShell";
import { STEP_SCHEMAS, type FieldDef } from "../stepSchemas";

/* -------------------------------------------------------------------------- */
/*  Step 5 — Career.                                                          */
/*                                                                            */
/*  Only `highestEducation` reads its options from the schema, because the       */
/*  backend has no education list endpoint. Everything else that is a dropdown   */
/*  — profession, employment type, experience, salary range, ambition level —    */
/*  is fed by its own GET in OnBoardingDataContext, and the value stored is the  */
/*  option id the save endpoint wants back.                                     */
/*                                                                            */
/*  All fields are optional, so Continue is never blocked; each dropdown reports */
/*  its own loading / error state instead of the whole step failing at once.    */
/* -------------------------------------------------------------------------- */

const SCHEMA = STEP_SCHEMAS.career;

const GROUPS = [
  { id: "education", heading: "Education" },
  { id: "work", heading: "Work" },
  { id: "ambition", heading: "Ambition" },
] as const;

export default function CareerStep() {
  const form = useStepForm("career");
  const sources = useCareerOptionSources();

  /* A half-loaded dropdown would save a null the user never chose, so hold
     Continue until every list has settled. Skip stays available regardless. */
  const listsLoading = Object.values(sources).some((source) => source.loading);

  /* Continue is never blocked on how much of the step is filled — a blank
     career is a valid answer, and the save posts it as such (null per field).
     All it waits for is the option lists themselves. */
  const { done, total } = form.filled;

  const renderField = (field: FieldDef) => {
    const error = form.errors[field.name];

    if (isCareerField(field.name)) {
      const source = sources[field.name];

      if (source.error) {
        return (
          <div key={field.name} className="space-y-1.5">
            <p className="text-xs font-semibold text-foreground">{field.label}</p>
            <p role="alert" className="text-[11px] font-medium text-destructive">
              {source.error}
            </p>
            <button
              type="button"
              onClick={() => source.refetch()}
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
            /* The schema owns the name and the label; the options come from the
               API, so they are layered on here rather than stored in it. */
            field={{ ...field, options: source.options }}
            value={form.get<string>(field.name)}
            error={error}
            onChange={(v) => form.set(field.name, v)}
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
          value={form.get<string>(field.name)}
          error={error}
          onChange={(v) => form.set(field.name, v)}
        />
      );
    }

    if (field.kind === "textarea") {
      return (
        <TextareaField
          key={field.name}
          field={field}
          value={form.get<string>(field.name)}
          error={error}
          onChange={(v) => form.set(field.name, v)}
        />
      );
    }

    if (field.kind === "date") {
      return (
        <DateField
          key={field.name}
          field={field}
          value={form.get<string>(field.name)}
          error={error}
          yearOnly={field.yearOnly}
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
  };

  return (
    <StepShell
      eyebrow="Career & Ambition"
      title="What do you do?"
      subtitle={
        done === total
          ? "All set. Continue saves this, or skip it and fill it in later."
          : `${done} of ${total} filled — Continue saves it either way, and you can fill in the rest later.`
      }
      footer={
        <StepFooter
          onSubmit={() => form.submit()}
          submitting={form.submitState === "submitting"}
          submitError={form.submitError}
          isValid={!listsLoading}
          skippable
          onSkip={() => form.skip()}
        />
      }
    >
      {GROUPS.map(({ id, heading }, index) => (
        <section key={id} className={index === 0 ? "space-y-5" : "mt-8 space-y-5"}>
          <h3 className="text-sm font-semibold text-gray-900">{heading}</h3>

          <div className="space-y-4">
            {SCHEMA.fields
              .filter((field) => field.group === id)
              .map(renderField)}
          </div>
        </section>
      ))}
    </StepShell>
  );
}
