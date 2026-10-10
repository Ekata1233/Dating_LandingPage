"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { StepFooter } from "../OnboardingFields";
import { useStepForm } from "../../context/OnboardingFormContext";
import { StepShell } from "../StepShell";

/* -------------------------------------------------------------------------- */
/*  Step 10 — Location.                                                       */
/*                                                                            */
/*  Location is required and can only be filled by granting browser           */
/*  permission. The input is read-only and just displays the result. The      */
/*  geolocation request is only made on an explicit click, never on mount.    */
/*                                                                            */
/*  Values stored on the form (matches the save endpoint):                    */
/*    country, state, city, area, latitude, longitude, max_distance_km        */
/* -------------------------------------------------------------------------- */

const DEFAULT_MAX_DISTANCE_KM = 25;

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state_district?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  quarter?: string;
  state?: string;
  country?: string;
};

type ResolvedLocation = {
  country: string;
  state: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
};

/**
 * Reverse-geocodes coordinates via OpenStreetMap Nominatim (free, no key,
 * light use only). For production traffic, proxy this through your own API
 * route with Google / Mapbox / LocationIQ.
 */
async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<ResolvedLocation> {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "14",
    addressdetails: "1",
    "accept-language": "en",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params}`,
    {
      signal,
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed: ${response.status}`);
  }

  const data = await response.json();
  const address = data.address ?? {};
  const country = address.country ?? "";
  const state = address.state ?? "";
  const city =
    address.city ??
    address.town ??
    address.municipality ??
    address.village ??
    "";

  // Prefer broader locality/suburb over small neighbourhoods.
  // This is more likely to return "Hadapsar" instead of "Fatima Nagar".
  const area =
    address.suburb ??
    address.city_district ??
    address.neighbourhood ??
    address.quarter ??
    "";

  return {
    country,
    state,
    city,
    // Some places have no sub-locality in OSM; fall back to the city so the
    // required `area` field is never empty.
    area: area || city,
    latitude: Number(latitude.toFixed(4)),
    longitude: Number(longitude.toFixed(4)),
  };
}


function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

/** "Kothrud, Pune, Maharashtra, India" (drops empty/duplicate parts). */
function formatLocation(l: Pick<ResolvedLocation, "area" | "city" | "state" | "country">) {
  return [l.area, l.city, l.state, l.country]
    .filter((part, i, arr) => Boolean(part) && arr.indexOf(part) === i)
    .join(", ");
}

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

      form.set("country", loc.country);
      form.set("state", loc.state);
      form.set("city", loc.city);
      form.set("area", loc.area);
      form.set("latitude", loc.latitude);
      form.set("longitude", loc.longitude);
      form.set("max_distance_km", DEFAULT_MAX_DISTANCE_KM);
    } catch (err) {
      if (controller.signal.aborted) return;

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