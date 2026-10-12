"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { StepFooter } from "../OnboardingFields";
import { useStepForm } from "../../context/OnboardingFormContext";
import { StepShell } from "../StepShell";
import {
  formatLocation,
  getPosition,
  reverseGeocode,
} from "@/lib/googleGeocode";
/* -------------------------------------------------------------------------- */
/*  Step 10 — Location.                                                       */
/*                                                                            */
/*  Location is required and can only be filled by granting browser           */
/*  permission. The input is read-only and just displays the result. The      */
/*  geolocation request is only made on an explicit click, never on mount.    */
/*                                                                            */
/*  Reverse geocoding uses the Google Maps Geocoding API.                     */
/*  Setup:                                                                    */
/*    1. Enable "Geocoding API" in Google Cloud Console.                      */
/*    2. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local.                   */
/*    3. Restrict the key (HTTP referrers + API restriction: Geocoding API).  */
/*                                                                            */
/*  Values stored on the form (matches the save endpoint):                    */
/*    country, state, city, area, latitude, longitude, max_distance_km        */
/* -------------------------------------------------------------------------- */

const DEFAULT_MAX_DISTANCE_KM = 25;


type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

export type GoogleGeocodeResult = {
  address_components: GoogleAddressComponent[];
};

export type GoogleGeocodeResponse = {
  status: string;
  error_message?: string;
  results: GoogleGeocodeResult[];
};

type ResolvedLocation = {
  country: string;
  state: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
};

export class GeocodeError extends Error {
  kind: "missing_key" | "no_results" | "request_failed";

  constructor(kind: GeocodeError["kind"], message: string) {
    super(message);
    this.name = "GeocodeError";
    this.kind = kind;
  }
}

/**
 * Finds the first address component matching any of the given types, trying
 * the types in priority order and scanning every result (the first result is
 * the most precise, later ones are broader).
 */


/**
 * Reverse-geocodes coordinates via the Google Maps Geocoding API.
 *
 * NOTE: a NEXT_PUBLIC_ key is visible in the browser, so it MUST be restricted
 * in Google Cloud Console. For stricter control, proxy this call through your
 * own API route and keep the key server-side.
 */


export default function LocationStep() {
  const form = useStepForm("location");
  const [locating, setLocating] = React.useState(false);
  const [locateError, setLocateError] = React.useState<string | null>(null);

  const abortRef = React.useRef<AbortController | null>(null);
  React.useEffect(() => () => abortRef.current?.abort(), []);

  const city = form.get<string>("city");
  const latitude = form.get<number>("latitude");
  const longitude = form.get<number>("longitude");

  const hasLocation =
    Boolean(city) && typeof latitude === "number" && typeof longitude === "number";

  const displayValue = hasLocation
    ? formatLocation({
        area: form.get<string>("area") ?? "",
        city: city ?? "",
        state: form.get<string>("state") ?? "",
        country: form.get<string>("country") ?? "",
      })
    : "";

  const detectLocation = async () => {
    if (!("geolocation" in navigator)) {
      setLocateError("Your browser doesn't support location sharing.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLocating(true);
    setLocateError(null);

    try {
      const { coords } = await getPosition();
      const loc = await reverseGeocode(coords.latitude, coords.longitude, controller.signal);
      if (controller.signal.aborted) return;

      if (!loc.city) {
        setLocateError("We got your position but couldn't work out your city. Please try again.");
        return;
      }

      form.set("country", loc.country);
      form.set("state", loc.state);
      form.set("city", loc.city);
      form.set("area", loc.area);
      form.set("latitude", loc.latitude);
      form.set("longitude", loc.longitude);
      form.set("max_distance_km", DEFAULT_MAX_DISTANCE_KM);
    } catch (err) {
      if (controller.signal.aborted) return;

      if (err instanceof GeocodeError) {
        if (err.kind === "missing_key") {
          console.error(err.message);
          setLocateError("Location lookup isn't configured right now. Please try again later.");
        } else if (err.kind === "no_results") {
          setLocateError("We couldn't find an address for your position. Please try again.");
        } else {
          console.error(err.message);
          setLocateError("We got your position but couldn't work out your city. Please try again.");
        }
        return;
      }

      const code = (err as Partial<GeolocationPositionError> | null)?.code;
      if (code === 1) {
        setLocateError(
          "Location access is blocked. Allow it in your browser's site settings, then try again."
        );
      } else if (code === 3) {
        setLocateError("Locating you took too long. Please try again.");
      } else if (code === 2) {
        setLocateError("Your location isn't available right now. Please try again.");
      } else {
        // Network failure or anything unexpected during the geocode request.
        setLocateError("We got your position but couldn't work out your city. Please try again.");
      }
    } finally {
      if (!controller.signal.aborted) setLocating(false);
    }
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
          isValid={hasLocation && form.isValid}
        />
      }
    >
      <div className="space-y-2">
        <label htmlFor="location-display" className="text-sm font-medium">
          Your location
        </label>
        <Input
          id="location-display"
          readOnly
          tabIndex={-1}
          value={displayValue}
          placeholder="Allow location access to detect your city"
          className="h-11 cursor-default bg-muted/40"
        />
        {form.errors.city && !hasLocation && (
          <p className="text-[11px] font-medium text-destructive">{form.errors.city}</p>
        )}
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          variant={hasLocation ? "outline" : "default"}
          onClick={detectLocation}
          disabled={locating}
          className="h-11 w-full"
        >
          {locating
            ? "Locating…"
            : hasLocation
              ? "Update my location"
              : "Allow location access"}
        </Button>
        {locateError && (
          <p className="text-[11px] font-medium text-destructive">{locateError}</p>
        )}
      </div>
    </StepShell>
  );
}
