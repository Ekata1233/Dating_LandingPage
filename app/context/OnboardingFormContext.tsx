"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import {
  STEP_SCHEMAS,
  initialStepData,
  isBlank,
  validateStepData,
  type FieldErrors,
  type StepSchema,
} from "../onBoarding/stepSchemas";
import {
  toBasicInfoRequest,
  toCareerRequest,
  toIntentionsRequest,
  toInterestedInRequest,
  toInterestsRequests,
  toLifestyleRequests,
  toPhotoRequests,
} from "../onBoarding/stepPayloads";
import { useOnBoardingData } from "./OnBoardingDataContext";
import { useProfileData } from "./OnBoardingApiContext";

/* -------------------------------------------------------------------------- */
/*  One data object per step, plus the rules for getting to the next one.       */
/*                                                                            */
/*  Each step is the owner of exactly one object (`data[stepId]`), built from   */
/*  its schema and shaped by the step's own fields. Nothing here knows what the */
/*  fields mean — the schema does. The step component reads and writes its own   */
/*  slice through `useStepForm`, and never has to lift anything.               */
/*                                                                            */
/*  Advancing is gated: `submitCurrent` refuses to move on unless the current  */
/*  step validates. The steps with an endpoint — `basics`, `preference`,        */
/*  `intentions`, `lifestyle`, `career`, `interests`, `photos` — are saved      */
/*  through `OnBoardingApiContext` before the flow moves on. The rest validate  */
/*  and advance on their own, with no request, until their endpoint exists.     */
/* -------------------------------------------------------------------------- */

type StepData = Record<string, unknown>;
type AllStepData = Record<string, StepData>;

export type SubmitState = "idle" | "submitting" | "error";

export interface SubmitResult {
  ok: boolean;
  /** Populated when `ok` is false. */
  errors?: FieldErrors;
  /** Server-side message when the request itself failed. */
  message?: string;
}

interface OnboardingFormState {
  /** The data object for every step visited so far. */
  data: AllStepData;
  /** Per-field errors for the step being edited. */
  errors: FieldErrors;
  submitState: SubmitState;
  submitError: string | null;

  /** Schema for a given step id. */
  schemaFor: (stepId: string) => StepSchema;
  /** The data object for one step, guaranteed to exist. */
  dataFor: (stepId: string) => StepData;
  setField: (stepId: string, name: string, value: unknown) => void;
  /** Replaces a whole step object at once (used by multi-value fields). */
  setData: (stepId: string, next: StepData) => void;
  /** True when the step has no failing required fields. */
  isStepValid: (stepId: string) => boolean;
  /** Which required fields are still unfilled, for the "x of y" hint. */
  completionFor: (stepId: string) => { done: number; total: number };
  /**
   * How many of the step's fields hold a value, counting optional ones too.
   * This is the gate a skippable step uses: Continue waits for all of them,
   * because Skip is already there as the way past.
   */
  filledFor: (stepId: string) => { done: number; total: number };
  /** True when every field on the step holds a value. */
  isStepComplete: (stepId: string) => boolean;
  clearErrors: () => void;
  /** Validates the step, saves it if it has an endpoint, then advances. */
  submitCurrent: (stepId: string) => Promise<SubmitResult>;
  /**
   * Leaves the step without validating or saving. Nothing is posted and
   * whatever was typed stays in the form context for a later visit.
   */
  skipCurrent: () => void;
  reset: () => void;
}

const OnboardingFormContext = createContext<OnboardingFormState | null>(null);

/* Stable empty objects, so clearing state doesn't hand React a new reference
   and trigger a render for nothing. */
const NO_ERRORS: FieldErrors = {};

function buildInitialData(): AllStepData {
  return Object.fromEntries(
    Object.values(STEP_SCHEMAS).map((schema) => [schema.id, initialStepData(schema)])
  );
}

export function OnboardingFormProvider({
  children,
  /** Called after a step validates and, where there is one, its save succeeds. */
  onAdvance,
}: {
  children: ReactNode;
  onAdvance: () => void;
}) {
  const [data, setAllData] = useState<AllStepData>(buildInitialData);
  const [errors, setErrors] = useState<FieldErrors>(NO_ERRORS);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    updateBasicInfo,
    updateInterestedIn,
    updateIntentions,
    updateLifestyle,
    updateCareer,
    updateInterests,
    createPhotos,
  } = useProfileData();

  // Lifestyle and interests question ids are only known to the API context, so
  // the payload mappers need them.
  const { lifestyle, interests } = useOnBoardingData();

  const schemaFor = useCallback(
    (stepId: string): StepSchema => STEP_SCHEMAS[stepId] ?? { id: stepId, fields: [] },
    []
  );

  const dataFor = useCallback(
    (stepId: string): StepData => data[stepId] ?? initialStepData(schemaFor(stepId)),
    [data, schemaFor]
  );

  const setField = useCallback((stepId: string, name: string, value: unknown) => {
    setAllData((prev) => {
      const next = { ...(prev[stepId] ?? {}), [name]: value };
      const schema = STEP_SCHEMAS[stepId];
      if (!schema) return { ...prev, [stepId]: next };

      /* Clear this field's error the moment it becomes valid, so the message
         disappears while the user is still typing rather than only after they
         press Continue. Done here rather than in an effect so it lands in the
         same render as the keystroke that fixed it. */
      setErrors((prevErrs) => {
        if (!prevErrs[name]) return prevErrs;
        const still = validateStepData(schema, next);
        if (still[name]) return prevErrs;
        const rest = { ...prevErrs };
        delete rest[name];
        return rest;
      });

      return { ...prev, [stepId]: next };
    });
  }, []);

  const setData = useCallback((stepId: string, next: StepData) => {
    setAllData((prev) => ({ ...prev, [stepId]: next }));
  }, []);

  const isStepValid = useCallback((stepId: string) => {
    const schema = STEP_SCHEMAS[stepId];
    if (!schema) return true;
    return Object.keys(validateStepData(schema, data[stepId] ?? initialStepData(schema))).length === 0;
  }, [data]);

  const completionFor = useCallback(
    (stepId: string) => {
      const schema = STEP_SCHEMAS[stepId];
      if (!schema) return { done: 0, total: 0 };
      const required = schema.fields.filter((f) => f.required !== false);
      const current = data[stepId] ?? {};
      const done = required.filter((f) => {
        const value = current[f.name];
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "string") return value.trim() !== "";
        return value !== undefined && value !== null;
      }).length;
      return { done, total: required.length };
    },
    [data]
  );

  const filledFor = useCallback(
    (stepId: string) => {
      const schema = STEP_SCHEMAS[stepId];
      if (!schema) return { done: 0, total: 0 };
      const current = data[stepId] ?? initialStepData(schema);
      /* Unlike `completionFor`, optional fields count here: on a skippable step
         Continue is the "I answered all of it" path, so leaving any field empty
         has to keep it closed. */
      const done = schema.fields.filter((field) => !isBlank(current[field.name])).length;
      return { done, total: schema.fields.length };
    },
    [data]
  );

  const isStepComplete = useCallback(
    (stepId: string) => {
      const { done, total } = filledFor(stepId);
      return total === 0 || done === total;
    },
    [filledFor]
  );

  const clearErrors = useCallback(() => {
    setErrors(NO_ERRORS);
    setSubmitError(null);
    setSubmitState("idle");
  }, []);
  /**
   * The steps that have a real endpoint. Anything not listed here has no
   * backend yet, so it validates and advances without a request.
   */
  const saveStep = useCallback(
    async (stepId: string, current: StepData): Promise<SubmitResult> => {
      if (stepId === "basics") {
        const res = await updateBasicInfo(toBasicInfoRequest(current));
        if (!res?.success) return { ok: false, message: res?.message };
        return { ok: true };
      }

      if (stepId === "preference") {
        const res = await updateInterestedIn(toInterestedInRequest(current));
        if (!res?.success) return { ok: false, message: res?.message };
        return { ok: true };
      }
      if (stepId === "intentions") {
        const res = await updateIntentions(toIntentionsRequest(current));
        if (!res?.success) return { ok: false, message: res?.message };
        return { ok: true };
      }

      if (stepId === "lifestyle") {
        // One request per answered question; the rest are optional and skipped.
        for (const request of toLifestyleRequests(current, lifestyle.questions)) {
          const res = await updateLifestyle(request);
          if (!res?.success) return { ok: false, message: res?.message };
        }

        return { ok: true };
      }

      if (stepId === "career") {
        const res = await updateCareer(toCareerRequest(current));
        if (!res?.success) return { ok: false, message: res?.message };
        return { ok: true };
      }

      if (stepId === "interests") {
        // One request per answered question, same as lifestyle.
        for (const request of toInterestsRequests(current, interests.questions)) {
          const res = await updateInterests(request);
          if (!res?.success) return { ok: false, message: res?.message };
        }

        return { ok: true };
      }
      if (stepId === "photos") {
        // One multipart POST per photo; the body shape lives in stepPayloads.
        const requests = toPhotoRequests(current);
        const picked = Array.isArray(current.photos) ? current.photos.length : 0;

        if (requests.length === 0 || requests.length !== picked) {
          return {
            ok: false,
            message: "One of those photos couldn't be read. Remove it and add it again.",
          };
        }

        for (const body of requests) {
          const res = await createPhotos(body);
          if (!res?.success) return { ok: false, message: res?.message };
        }

        return { ok: true };
      }

      return { ok: true };
    },
    [
      updateBasicInfo,
      updateInterestedIn,
      updateIntentions,
      updateLifestyle,
      updateCareer,
      updateInterests,
      createPhotos,
      lifestyle.questions,
      interests.questions,
    ]
  );

  const submitCurrent = useCallback(
    async (stepId: string): Promise<SubmitResult> => {
      const schema = STEP_SCHEMAS[stepId];
      const current = data[stepId] ?? (schema ? initialStepData(schema) : {});

      if (schema) {
        const found = validateStepData(schema, current);

        if (Object.keys(found).length > 0) {
          setErrors(found);
          return { ok: false, errors: found };
        }
      }

      setErrors(NO_ERRORS);
      setSubmitState("submitting");
      setSubmitError(null);

      const saved = await saveStep(stepId, current);

      if (!saved.ok) {
        setSubmitState("error");
        setSubmitError(
          saved.message ?? "Couldn't save this step. Please try again."
        );
        return saved;
      }

      setSubmitState("idle");
      onAdvance();
      return { ok: true };
    },
    [data, saveStep, onAdvance]
  );

  /**
   * Skip is deliberately not `submitCurrent`: it must not validate and, above
   * all, must not reach the save endpoint. Half-typed data simply stays in the
   * form context, so coming back to the step shows it again.
   */
  const skipCurrent = useCallback(() => {
    setErrors(NO_ERRORS);
    setSubmitState("idle");
    setSubmitError(null);
    onAdvance();
  }, [onAdvance]);

  const reset = useCallback(() => {
    setAllData(buildInitialData());
    setErrors(NO_ERRORS);
    setSubmitState("idle");
    setSubmitError(null);
  }, []);

  const value = useMemo<OnboardingFormState>(
    () => ({
      data,
      errors,
      submitState,
      submitError,
      schemaFor,
      dataFor,
      setField,
      setData,
      isStepValid,
      completionFor,
      filledFor,
      isStepComplete,
      clearErrors,
      submitCurrent,
      skipCurrent,
      reset,
    }),
    [
      data,
      errors,
      submitState,
      submitError,
      schemaFor,
      dataFor,
      setField,
      setData,
      isStepValid,
      completionFor,
      filledFor,
      isStepComplete,
      clearErrors,
      submitCurrent,
      skipCurrent,
      reset,
    ]
  );

  return (
    <OnboardingFormContext.Provider value={value}>{children}</OnboardingFormContext.Provider>
  );
}

export function useOnboardingForm(): OnboardingFormState {
  const ctx = useContext(OnboardingFormContext);
  if (!ctx) {
    throw new Error("useOnboardingForm must be used inside <OnboardingFormProvider>");
  }
  return ctx;
}

/**
 * A step's own slice of the form. This is all a step component needs — it
 * never touches the store, never imports the other steps' data, and has no way
 * to read or clobber another step's object.
 */
export function useStepForm(stepId: string) {
  const form = useOnboardingForm();
  const schema = form.schemaFor(stepId);
  const data = form.dataFor(stepId);

  return useMemo(
    () => ({
      schema,
      data,
      errors: form.errors,
      isValid: form.isStepValid(stepId),
      /** Every field filled, optional ones included. See `filledFor`. */
      isComplete: form.isStepComplete(stepId),
      completion: form.completionFor(stepId),
      filled: form.filledFor(stepId),
      submitState: form.submitState,
      submitError: form.submitError,
      get: <T,>(name: string): T => data[name] as T,
      set: (name: string, v: unknown) => form.setField(stepId, name, v),
      setAll: (next: Record<string, unknown>) => form.setData(stepId, next),
      submit: () => form.submitCurrent(stepId),
      /** Advances without validating and without calling the save endpoint. */
      skip: form.skipCurrent,
      clearErrors: form.clearErrors,
    }),
    [schema, data, form, stepId]
  );
}
