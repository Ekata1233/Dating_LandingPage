"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
  toBioRequest,
  toCareerRequest,
  toIntentionsRequest,
  toInterestedInRequest,
  toInterestsRequests,
  toLifestyleRequests,
  toPhotoBody,
  toPromptsRequest,
  hydrateStepData,
  type PhotoValue,
  toLocationRequest,
} from "../onBoarding/stepPayloads";
import { useOnBoardingData, type OnboardingPhotoApi } from "./OnBoardingDataContext";
import { photoIdFrom, useProfileData } from "./OnBoardingApiContext";

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
/*                                                                            */
/*  `photos` is the exception to the timing, not the rule: each file is posted  */
/*  the moment it is picked (`uploadPhoto`) and deleted the moment it is        */
/*  removed (`removePhoto`), so by the time Continue is pressed there is       */
/*  nothing left to send — the step only refuses to advance while one is still  */
/*  in flight.                                                                 */
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

/**
 * One tile per photo already on the server. The remote URL is the preview (a
 * photo uploaded in an earlier session has no local `File`), and the id is the
 * only thing the delete endpoint accepts — which is what makes X work on a
 * photo the step never uploaded itself.
 */
function tileFromServer(photo: OnboardingPhotoApi): PhotoValue {
  return {
    name: photo.mediaUrl.split("/").pop() || "photo",
    size: 0,
    type: photo.mediaType === "VIDEO" ? "video/*" : "image/*",
    previewUrl: photo.mediaUrl,
    serverId: photo.id,
    uploading: false,
  };
}

/**
 * The photos step's list: what the server holds (in server order, carrying the
 * ids `deletePhoto` needs) plus anything this session added and the server
 * hasn't echoed back yet — a file still uploading, or one whose POST hasn't
 * settled. Pure, so it is derived on render rather than mirrored into state.
 */
function mergeServerPhotos(
  local: PhotoValue[],
  server: OnboardingPhotoApi[]
): PhotoValue[] {
  /* A local entry survives untouched only while the server doesn't know it. */
  const inFlight = local.filter(
    (photo) =>
      photo.uploading || !photo.serverId || !server.some((p) => p.id === photo.serverId)
  );
  const inFlightIds = new Set(inFlight.map((photo) => photo.serverId).filter(Boolean));

  return [
    ...server.filter((photo) => !inFlightIds.has(photo.id)).map(tileFromServer),
    ...inFlight,
  ];
}

/**
 * A step's data as the rest of the app must read it. The photos step is the one
 * that differs: the store only ever holds what *this session* uploaded, while the
 * grid shows the server's photos too. Everything that counts or validates — the
 * Continue gate, `filled`, `submitCurrent` — has to see the same list the user
 * can see, or a profile that already holds two photos reads as empty and blocks
 * Continue forever.
 */
function stepDataFor(
  stepId: string,
  step: StepData,
  serverPhotos: readonly OnboardingPhotoApi[]
): StepData {
  if (stepId !== "photos") return step;

  const stored = Array.isArray(step.photos) ? (step.photos as PhotoValue[]) : [];

  return { ...step, photos: mergeServerPhotos(stored, [...serverPhotos]) };
}

interface OnboardingFormState {
  /** The data object for every step visited so far. */
  data: AllStepData;
  /**
   * The photos step's full list — the server's photos (with their ids) merged
   * with the ones this session is still uploading. See `mergeServerPhotos`.
   */
  photos: PhotoValue[];
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
   * Photos only. Queues the file in the step's own list and POSTs it
   * straight away — the tile appears optimistically and is pulled again if
   * the upload fails. Nothing waits for `submitCurrent`.
   */
  uploadPhoto: (stepId: string, file: File) => Promise<SubmitResult>;
  /**
   * Photos only. Drops the entry at `index`, calling the delete endpoint
   * first when the server already knows about it. A photo that never made
   * it past the queue is just dropped locally.
   */
  removePhoto: (stepId: string, index: number) => Promise<SubmitResult>;
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
    deletePhoto,
    updateBio,
    updatePrompts,
    updateLocation,
  } = useProfileData();

  // Lifestyle and interests question ids are only known to the API context, so
  // the payload mappers need them.
  const { lifestyle, interests, profileDetails } = useOnBoardingData();

  /* Every save below refreshes this, so the photo ids the server owns (the only
     thing the delete endpoint accepts) follow whatever the step just wrote. */
  const { refetch: refetchProfileDetails, photos: serverPhotos } = profileDetails;

  /* ---------------------------------------------------------------------- */
  /*  HYDRATION — the profile the server already holds, dropped into the form */
  /* ---------------------------------------------------------------------- */

  const details = profileDetails.details;

  /* Which user's profile is in the store. Hydration runs once per user: after
     that the store belongs to whoever is editing, and the refetch that follows
     every save must not put an answer back into a field they just cleared. */
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);

  /* Adjusting the store during render, not in an effect: the reply is already
     in hand at this point, so the steps never paint once with empty inputs and
     then fill themselves in. React re-renders before committing, and the guard
     below makes sure it happens exactly once. */
  if (details && hydratedFor !== details.userId) {
    setHydratedFor(details.userId);
    setAllData((prev) => hydrateStepData(prev, details));
  }

  const schemaFor = useCallback(
    (stepId: string): StepSchema => STEP_SCHEMAS[stepId] ?? { id: stepId, fields: [] },
    []
  );

  /** The step's data with the photos list the grid actually shows. */
  const resolvedData = useCallback(
    (stepId: string): StepData =>
      stepDataFor(
        stepId,
        data[stepId] ?? initialStepData(schemaFor(stepId)),
        serverPhotos
      ),
    [data, schemaFor, serverPhotos]
  );

  const dataFor = useCallback(
    (stepId: string): StepData => resolvedData(stepId),
    [resolvedData]
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

  const isStepValid = useCallback(
    (stepId: string) => {
      const schema = STEP_SCHEMAS[stepId];
      if (!schema) return true;
      return (
        Object.keys(validateStepData(schema, resolvedData(stepId))).length === 0
      );
    },
    [resolvedData]
  );

  const completionFor = useCallback(
    (stepId: string) => {
      const schema = STEP_SCHEMAS[stepId];
      if (!schema) return { done: 0, total: 0 };
      const required = schema.fields.filter((f) => f.required !== false);
      const current = resolvedData(stepId);
      const done = required.filter((f) => {
        const value = current[f.name];
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "string") return value.trim() !== "";
        return value !== undefined && value !== null;
      }).length;
      return { done, total: required.length };
    },
    [resolvedData]
  );

  const filledFor = useCallback(
    (stepId: string) => {
      const schema = STEP_SCHEMAS[stepId];
      if (!schema) return { done: 0, total: 0 };
      const current = resolvedData(stepId);
      /* Unlike `completionFor`, optional fields count here: on a skippable step
         Continue is the "I answered all of it" path, so leaving any field empty
         has to keep it closed. */
      const done = schema.fields.filter((field) => !isBlank(current[field.name])).length;
      return { done, total: schema.fields.length };
    },
    [resolvedData]
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
      if (stepId === "location") {
        const res = await updateLocation(toLocationRequest(current));
        if (!res?.success) return { ok: false, message: res?.message };
        console.log("Sending Data : ",current);
        return { ok: true };
      }

      if (stepId === "lifestyle") {
        /* Continue only opens once every rendered question holds a value (see
           Lifestyle.tsx), so this normally arrives complete. One request per
           answered question: a question with no picks has nothing to post (the
           endpoint has no way to express "explicitly cleared"). */
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

      if (stepId === "bio") {
        const res = await updateBio(toBioRequest(current));
        if (!res?.success) return { ok: false, message: res?.message };
        return { ok: true };
      }

      if (stepId === "prompts") {
        /* One PATCH for the whole set — the endpoint replaces it, so what is in
           the form is what the profile ends up with, removals included. */
        const res = await updatePrompts(toPromptsRequest(current));
        if (!res?.success) return { ok: false, message: res?.message };
        return { ok: true };
      }

      if (stepId === "photos") {
        /* Every photo is posted the moment it is picked, so there is nothing
           left to send here — this is only the gate that stops the flow
           advancing while one of them is still in the air. */
        const photos = Array.isArray(current.photos)
          ? (current.photos as PhotoValue[])
          : [];
        const pending = photos.filter((photo) => photo?.uploading);

        if (pending.length > 0) {
          return {
            ok: false,
            message: "One of those photos is still uploading. Hold on a moment.",
          };
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
updateBio,
        updatePrompts,
        lifestyle.questions,
      interests.questions,
    ]
  );

  /* ---------------------------------------------------------------- */
  /*  PHOTOS — one POST per file, at pick time                         */
  /* ---------------------------------------------------------------- */

  const patchPhotos = useCallback(
    (stepId: string, update: (photos: PhotoValue[]) => PhotoValue[]) => {
      setAllData((prev) => {
        const step = prev[stepId] ?? {};
        const current = Array.isArray(step.photos)
          ? (step.photos as PhotoValue[])
          : [];
        return { ...prev, [stepId]: { ...step, photos: update(current) } };
      });
    },
    []
  );

  const uploadPhoto = useCallback(
    async (stepId: string, file: File): Promise<SubmitResult> => {
      /* The tile goes in before the request so the grid reacts at once; it is
         flagged `uploading`, which is what locks the step's controls. */
      const previewUrl = URL.createObjectURL(file);
      const queued: PhotoValue = {
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl,
        file,
        uploading: true,
      };

      patchPhotos(stepId, (photos) => [...photos, queued]);
      setSubmitError(null);

      const res = await createPhotos(toPhotoBody(file));

      if (!res?.success) {
        /* The photo never reached the server, so the tile comes back out —
           leaving it would let Continue pass a photo nobody can delete. */
        URL.revokeObjectURL(previewUrl);
        patchPhotos(stepId, (photos) =>
          photos.filter((photo) => photo.previewUrl !== previewUrl)
        );

        const message = res?.message ?? "Couldn't upload that photo.";
        setSubmitState("error");
        setSubmitError(message);
        return { ok: false, message };
      }

      const serverId = photoIdFrom(res);
      if (!serverId) {
        console.warn("Photo uploaded without an id; it can't be deleted later.");
      }

      patchPhotos(stepId, (photos) =>
        photos.map((photo) =>
          photo.previewUrl === previewUrl
            ? { ...photo, uploading: false, serverId: serverId ?? undefined }
            : photo
        )
      );

      /* Refresh in the background: this is where the server's own copy of the
         list, ids included, comes from. */
      void refetchProfileDetails();

      return { ok: true };
    },
    [createPhotos, patchPhotos, refetchProfileDetails]
  );

  const removePhoto = useCallback(
    async (stepId: string, index: number): Promise<SubmitResult> => {
      /* The index comes from the merged grid, so it is resolved against the
         merged list too — that is how a photo the step never uploaded still
         finds its server id for the delete call. */
      const step = data[stepId] ?? {};
      const stored = Array.isArray(step.photos)
        ? (step.photos as PhotoValue[])
        : [];
      const target = mergeServerPhotos(stored, serverPhotos)[index];
      if (!target) return { ok: true };

      if (target.uploading) {
        const message = "That photo is still uploading.";
        setSubmitError(message);
        return { ok: false, message };
      }

      /* Only a photo the server knows about can be deleted; one that was
         queued and never sent is dropped locally and nothing else happens. */
      if (target.serverId) {
        setSubmitError(null);
        const res = await deletePhoto(target.serverId);
        if (!res?.success) {
          const message = res?.message ?? "Couldn't delete that photo.";
          setSubmitState("error");
          setSubmitError(message);
          return { ok: false, message };
        }
      }

      URL.revokeObjectURL(target.previewUrl);
      /* Only the session's own list needs patching; a photo that lives purely
         on the server leaves the merged grid when the refetch below returns. */
      patchPhotos(stepId, (photos) =>
        photos.filter(
          (photo) =>
            photo.previewUrl !== target.previewUrl &&
            (target.serverId ? photo.serverId !== target.serverId : true)
        )
      );

      /* The delete landed, so drop it from the cached profile too. */
      void refetchProfileDetails();

      return { ok: true };
    },
    [data, serverPhotos, deletePhoto, patchPhotos, refetchProfileDetails]
  );

  const submitCurrent = useCallback(
    async (stepId: string): Promise<SubmitResult> => {
      const schema = STEP_SCHEMAS[stepId];
      /* The same view of the data the gate used, so a step that looked valid
         cannot fail validation here — and on photos, the server's own photos
         count towards the minimum. */
      const current = resolvedData(stepId);

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
      /* The step is saved, so pull the profile the server now holds — this is
         what keeps a photo's id (needed by the delete endpoint) in step with
         what the flow just wrote. Not awaited: the step advances either way. */
      void refetchProfileDetails();
      onAdvance();
      return { ok: true };
    },
    [resolvedData, saveStep, onAdvance, refetchProfileDetails]
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

  /* The photo list is derived on render, never stored: the server's photos (ids
     included) merged with the ones this session is still uploading. */
  const value = useMemo<OnboardingFormState>(
    () => {
      const stored = data["photos"]?.photos;
      const photos = mergeServerPhotos(
        Array.isArray(stored) ? (stored as PhotoValue[]) : [],
        serverPhotos
      );

      return {
        data,
        photos,
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
        uploadPhoto,
        removePhoto,
        skipCurrent,
        reset,
      };
    },
    [
      data,
      serverPhotos,
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
      uploadPhoto,
      removePhoto,
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
      /**
       * Photos step only: the server's photos plus whatever is still uploading,
       * so a photo uploaded in an earlier session still carries the id the
       * delete endpoint needs.
       */
      photos: form.photos,
      set: (name: string, v: unknown) => form.setField(stepId, name, v),
      setAll: (next: Record<string, unknown>) => form.setData(stepId, next),
      submit: () => form.submitCurrent(stepId),
      /** Posts one photo to the server as soon as it is picked. */
      uploadPhoto: (file: File) => form.uploadPhoto(stepId, file),
      /** Deletes the photo at `index` on the server, then drops it locally. */
      removePhotoAt: (index: number) => form.removePhoto(stepId, index),
      /** Advances without validating and without calling the save endpoint. */
      skip: form.skipCurrent,
      clearErrors: form.clearErrors,
    }),
    [schema, data, form, stepId]
  );
}
