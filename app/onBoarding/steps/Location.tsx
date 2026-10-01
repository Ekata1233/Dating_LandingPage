"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

import { RadioField, StepFooter, TextField } from "../OnboardingFields";
import { useStepForm } from "../../context/OnboardingFormContext";
import { StepShell } from "../StepShell";
import { STEP_SCHEMAS } from "../stepSchemas";

/* -------------------------------------------------------------------------- */
/*  Step 10 — Location.                                                         */
/*                                                                            */
/*  City is required; the "use my current location" toggle is optional and is  */
/*  omitted from the payload unless actually answered. The geolocation request   */
/*  is only made on an explicit click — never on mount — because a permission    */
/*  prompt nobody asked for is a good way to lose someone on the last step.     */
/* -------------------------------------------------------------------------- */

const SCHEMA = STEP_SCHEMAS.location;
const CITY = SCHEMA.fields.find((f) => f.name === "city")!;
const USE_CURRENT = SCHEMA.fields.find((f) => f.name === "useCurrentLocation")!;

export default function LocationStep() {
  const form = useStepForm("location");
  const [locating, setLocating] = React.useState(false);
  const [locateError, setLocateError] = React.useState<string | null>(null);

  const useCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocateError("Your browser doesn't support location sharing.");
      return;
    }

    setLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        /* The placeholder endpoint takes a city name, and reverse geocoding
           needs a paid service, so the coordinates are what we can honestly
           produce here. Swap this for a real reverse-geocode call. */
        form.set("city", `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        form.set("useCurrentLocation", "yes");
        setLocating(false);
      },
      () => {
        setLocateError("Couldn't get your location. Search for your city instead.");
        setLocating(false);
      },
      { timeout: 10_000 }
    );
  };

  return (
    <StepShell
      eyebrow="Location"
      title="Where are you based?"
      subtitle="We use this to show you people nearby. Your exact address is never shared."
      footer={
        <StepFooter
          onSubmit={() => form.submit()}
          submitting={form.submitState === "submitting"}
          submitError={form.submitError}
          isValid={form.isValid}
        />
      }
    >
      <TextField
        field={CITY}
        value={form.get<string>("city")}
        error={form.errors.city}
        onChange={(v) => form.set("city", v)}
      />

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={useCurrentLocation}
          disabled={locating}
          className="h-11 w-full"
        >
          {locating ? "Locating…" : "Use my current location"}
        </Button>
        {locateError && (
          <p className="text-[11px] font-medium text-destructive">{locateError}</p>
        )}
      </div>

      <RadioField
        field={USE_CURRENT}
        value={form.get<string>("useCurrentLocation")}
        error={form.errors.useCurrentLocation}
        onChange={(v) => form.set("useCurrentLocation", v)}
      />
    </StepShell>
  );
}
