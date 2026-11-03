"use client";

import { isBlank, type FieldDef } from "../stepSchemas";
import {
  INTERESTS_MAX,
  INTERESTS_MIN,
  toInterestsField,
  useOnBoardingData,
} from "../../context/OnBoardingDataContext";
import { useStepForm } from "../../context/OnboardingFormContext";
import { MultiField, RadioField, StepFooter } from "../OnboardingFields";
import { StepShell } from "../StepShell";

/* -------------------------------------------------------------------------- */
/*  Step 6 — Interests.                                                         */
/*                                                                            */
/*  The questions and their options come from the API, so the chips are option   */
/*  ids and each question is keyed by its own `key` — that is what the save      */
/*  endpoint needs back. The step does not read the static schema.               */
/*                                                                            */
/*  The limits are a single budget for the whole step: between INTERESTS_MIN and */
/*  INTERESTS_MAX picks in total, regardless of how many categories the API      */
/*  returns. Each category therefore only ever sees what the others have left,   */
/*  which is why the cap is worked out per render instead of sitting on a field. */
/*                                                                            */
/*  Exception: the VIP / VIP Elite questions take a single answer. The chips     */
/*  stay exactly as they are — picking another one replaces the current pick     */
/*  instead of adding to it.                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The VIP / VIP Elite questions (`"⭐⭐ VIP & Elite only (…)"` and friends)
 * are single-answer. Their `key` is API-generated gibberish, so the match is
 * on the title the step already renders.
 */
function isSingleAnswer(field: FieldDef): boolean {
  return /vip|elite/i.test(field.label) || /vip|elite/i.test(field.name);
}

export default function InterestsStep() {
  const form = useStepForm("interests");
  const { interests } = useOnBoardingData();

  const fields = interests.questions.map(toInterestsField);

  /** Picks on one question as an array, whichever shape the field stores. */
  const picksFor = (name: string): string[] => {
    const raw = form.get<unknown>(name);
    if (Array.isArray(raw)) return raw as string[];
    return isBlank(raw) ? [] : [String(raw)];
  };

  const picked = fields.reduce(
    (total, field) => total + picksFor(field.name).length,
    0
  );

  const complete =
    fields.length > 0 && picked >= INTERESTS_MIN && picked <= INTERESTS_MAX;

  return (
    <StepShell
      eyebrow="Interests"
      title="What are you into?"
      subtitle={
        picked >= INTERESTS_MIN
          ? `${picked} picked — that works. Continue saves it.`
          : `Pick at least ${INTERESTS_MIN}, up to ${INTERESTS_MAX} in total. Shared interests are the easiest thing to start a conversation from.`
      }
      footer={
        <StepFooter
          onSubmit={() => form.submit()}
          submitting={form.submitState === "submitting"}
          submitError={form.submitError}
          isValid={complete}
        />
      }
    >
      {interests.loading ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Loading questions…
        </p>
      ) : interests.error ? (
        <p
          role="alert"
          className="py-6 text-center text-sm font-medium text-destructive"
        >
          {interests.error}
        </p>
      ) : fields.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No questions are available right now.
        </p>
      ) : (
        <>
          {/* One total for the step, rather than a per-category counter that
              would read like each one had its own allowance. */}
          <p className="text-[10px] tabular-nums text-muted-foreground">
            {picked} / {INTERESTS_MAX} selected · at least {INTERESTS_MIN} needed
          </p>

          {fields.map((field) => {
            const own = picksFor(field.name);
            /* What this category may still add: the step's budget minus what
               the other categories are already holding. */
            const allotment = Math.max(
              0,
              INTERESTS_MAX - (picked - own.length)
            );

            if (field.kind === "multi") {
              const single = isSingleAnswer(field);
              return (
                <MultiField
                  key={field.name}
                  field={field}
                  values={own}
                  error={form.errors[field.name]}
                  max={allotment}
                  hideCount
                  /* Single-answer questions keep the chips they already have,
                     but a new pick replaces the old one instead of joining it. */
                  onChange={(v) =>
                    form.set(field.name, single ? v.slice(-1) : v)
                  }
                />
              );
            }

            return (
              <RadioField
                key={field.name}
                field={field}
                value={form.get<string>(field.name)}
                error={form.errors[field.name]}
                /* A lone radio pick still spends from the same pot, so it is
                   only offered while there is something left to spend. */
                disabled={allotment === 0 && own.length === 0}
                onChange={(v) => form.set(field.name, v)}
              />
            );
          })}
        </>
      )}
    </StepShell>
  );
}
