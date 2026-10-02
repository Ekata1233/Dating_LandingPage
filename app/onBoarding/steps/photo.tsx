"use client";

import { cn } from "cn";
import { ImagePlus, Loader2, X } from "lucide-react";
import * as React from "react";

import { StepFooter } from "../OnboardingFields";
import { useStepForm } from "../../context/OnboardingFormContext";
import { StepShell } from "../StepShell";
import { STEP_SCHEMAS } from "../stepSchemas";
import type { PhotoValue } from "../stepPayloads";

/* -------------------------------------------------------------------------- */
/*  Step 7 — Photos.                                                            */
/*                                                                            */
/*  This is the one step whose data is not JSON. A photo is a `File`, and a    */
/*  `File` cannot be put in a JSON body. Two consequences, both deliberate:    */
/*                                                                            */
/*  1. The `File` objects stay in the step's own data object on the client, and  */
/*     the object URLs used for the previews are revoked on unmount so a long   */
/*     session doesn't leak a dozen blobs.                                     */
/*  2. On submit, `toPhotoRequests` in `stepPayloads.ts` turns each entry into   */
/*     a multipart body (field `image`) and `saveStep` POSTs them one at a      */
/*     time. This step itself never calls the API.                             */
/* -------------------------------------------------------------------------- */

const SCHEMA = STEP_SCHEMAS.photos;
const FIELD = SCHEMA.fields.find((f) => f.name === "photos")!;
const SLOT_COUNT = FIELD.max ?? 6;
const MIN_PHOTOS = FIELD.min ?? 2;

export default function PhotoStep() {
  const form = useStepForm("photos");
  const photos = (form.get<PhotoValue[]>("photos") ?? []).filter(Boolean);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [busy, setBusy] = React.useState(false);

  /* Object URLs outlive React unless we hand them back. */
  React.useEffect(() => {
    return () => {
      for (const p of photos) URL.revokeObjectURL(p.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPhotos = (next: PhotoValue[]) => form.set("photos", next);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setBusy(true);

    const incoming = Array.from(files).slice(0, SLOT_COUNT - photos.length);
    const added: PhotoValue[] = incoming.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: URL.createObjectURL(file),
      file,
    }));

    setPhotos([...photos, ...added]);
    setBusy(false);
  };

  const removeAt = (index: number) => {
    const target = photos[index];
    if (target) URL.revokeObjectURL(target.previewUrl);
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    const next = photos.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setPhotos(next);
  };

  const full = photos.length >= SLOT_COUNT;
  const enough = photos.length >= MIN_PHOTOS;

  return (
    <StepShell
      eyebrow="Photos"
      title="Add a few photos."
      subtitle={`At least ${MIN_PHOTOS} — profiles with ${MIN_PHOTOS}+ photos get far more replies. Your first photo is the one people see first.`}
      footer={
        <StepFooter
          onSubmit={() => form.submit()}
          submitting={form.submitState === "submitting"}
          submitError={form.submitError}
          isValid={form.isValid}
        />
      }
    >
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <div
            key={photo.previewUrl}
            className="group relative aspect-3/4 overflow-hidden rounded-xl border border-border bg-muted"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.previewUrl}
              alt={photo.name}
              className="size-full object-cover"
            />
            <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
              {i === 0 ? "MAIN" : i + 1}
            </span>
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={`Remove ${photo.name}`}
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
            <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label="Move earlier"
                className="grid size-6 place-items-center rounded-full bg-black/60 text-xs text-white disabled:opacity-30"
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === photos.length - 1}
                aria-label="Move later"
                className="grid size-6 place-items-center rounded-full bg-black/60 text-xs text-white disabled:opacity-30"
              >
                &rarr;
              </button>
            </div>
          </div>
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={cn(
              "flex aspect-3/4 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border",
              "text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            )}
          >
            {busy ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus className="size-5" aria-hidden="true" />
            )}
            <span className="text-[10px] font-semibold">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {form.errors.photos && (
        <p role="alert" className="text-[11px] font-medium text-destructive">
          {form.errors.photos}
        </p>
      )}

      <p className="text-[11px] text-muted-foreground">
        {photos.length} of {SLOT_COUNT} added
        {!enough && ` · ${MIN_PHOTOS - photos.length} more to continue`}
      </p>
    </StepShell>
  );
}
