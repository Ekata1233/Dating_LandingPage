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
/*  1. Each file is posted the moment it is picked, through `form.uploadPhoto`, */
/*     so the server already owns it before Continue is pressed. While that    */
/*     POST is in flight `busy` is held: no second pick, no removal, no        */
/*     reordering — one network call at a time, and no way to lose track of    */
/*     which tile belongs to which request.                                    */
/*  2. The X does the same in reverse: `form.removePhotoAt` deletes it on the  */
/*     server first and only then drops the tile, so a failed delete leaves      */
/*     the photo where the user can try again.                                 */
/*                                                                            */
/*  The object URLs used for the previews are handed back when a tile leaves   */
/*  the list, so a long session doesn't leak a dozen blobs.                     */
/* -------------------------------------------------------------------------- */

const SCHEMA = STEP_SCHEMAS.photos;
const FIELD = SCHEMA.fields.find((f) => f.name === "photos")!;
const SLOT_COUNT = FIELD.max ?? 6;
const MIN_PHOTOS = FIELD.min ?? 2;

export default function PhotoStep() {
  const form = useStepForm("photos");
  /* The form context's merged list: the photos the server already holds (with
     the ids `deletePhoto` needs) plus any file still uploading. */
  const photos = form.photos.filter(Boolean);
  const inputRef = React.useRef<HTMLInputElement>(null);
  /* Held for the whole of one request — an upload or a delete. This is the
     lock the requirement asks for: nothing else can be added while a photo is
     being posted. */
  const [busy, setBusy] = React.useState(false);

  const setPhotos = (next: PhotoValue[]) => form.set("photos", next);

  const handleFiles = async (files: FileList | null) => {
    if (!files || busy) return;

    const incoming = Array.from(files).slice(0, SLOT_COUNT - photos.length);
    if (incoming.length === 0) return;

    setBusy(true);
    try {
      /* One POST per file, in the order chosen. The tile lands as soon as it
         is queued, so the grid fills up while the uploads run. */
      for (const file of incoming) {
        const result = await form.uploadPhoto(file);
        if (!result.ok) break;
      }
    } finally {
      setBusy(false);
    }
  };

  const removeAt = async (index: number) => {
    if (busy) return;

    setBusy(true);
    try {
      await form.removePhotoAt(index);
    } finally {
      setBusy(false);
    }
  };

  const move = (from: number, to: number) => {
    if (busy) return;
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
          submitting={busy || form.submitState === "submitting"}
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

            {photo.uploading && (
              <div className="absolute inset-0 grid place-items-center bg-black/45">
                <Loader2
                  className="size-5 animate-spin text-white"
                  aria-hidden="true"
                />
                <span className="sr-only">Uploading {photo.name}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => removeAt(i)}
              disabled={busy}
              aria-label={`Remove ${photo.name}`}
              className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white disabled:opacity-40"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
            <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={busy || i === 0}
                aria-label="Move earlier"
                className="grid size-6 place-items-center rounded-full bg-black/60 text-xs text-white disabled:opacity-30"
              >
                &larr;
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={busy || i === photos.length - 1}
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
