import { ResolvedLocation } from "@/app/onBoarding/locationGeo";
import { GeocodeError, GoogleGeocodeResponse, GoogleGeocodeResult } from "@/app/onBoarding/steps/Location";
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<ResolvedLocation> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new GeocodeError(
      "missing_key",
      "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set."
    );
  }

  const params = new URLSearchParams({
    latlng: `${latitude},${longitude}`,
    key: GOOGLE_MAPS_API_KEY,
    language: "en",
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params}`,
    { signal, headers: { Accept: "application/json" } }
  );

  if (!response.ok) {
    throw new GeocodeError(
      "request_failed",
      `Reverse geocoding failed: ${response.status}`
    );
  }

  const data = (await response.json()) as GoogleGeocodeResponse;

  if (data.status === "ZERO_RESULTS") {
    throw new GeocodeError("no_results", "No address found for these coordinates.");
  }
  if (data.status !== "OK") {
    // REQUEST_DENIED, OVER_QUERY_LIMIT, INVALID_REQUEST, etc.
    throw new GeocodeError(
      "request_failed",
      `Geocoding error ${data.status}${data.error_message ? `: ${data.error_message}` : ""}`
    );
  }

  const results = data.results ?? [];

  const country = pickComponent(results, ["country"]);
  const state = pickComponent(results, ["administrative_area_level_1"]);
  const city = pickComponent(results, [
    "locality",
    "postal_town",
    "administrative_area_level_3",
    "administrative_area_level_2",
  ]);

  // Prefer the broader sub-locality over small neighbourhoods
  // (e.g. "Hadapsar" rather than "Fatima Nagar").
  const area = pickComponent(results, [
    "sublocality_level_1",
    "sublocality",
    "neighborhood",
    "sublocality_level_2",
  ]);

  return {
    country,
    state,
    city,
    // Some places have no sub-locality; fall back to the city so the
    // required `area` field is never empty.
    area: area || city,
    latitude: Number(latitude.toFixed(4)),
    longitude: Number(longitude.toFixed(4)),
  };
}

export function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

/** "Kothrud, Pune, Maharashtra, India" (drops empty/duplicate parts). */
export function formatLocation(l: Pick<ResolvedLocation, "area" | "city" | "state" | "country">) {
  return [l.area, l.city, l.state, l.country]
    .filter((part, i, arr) => Boolean(part) && arr.indexOf(part) === i)
    .join(", ");
}
export function pickComponent(
  results: GoogleGeocodeResult[],
  types: string[]
): string {
  for (const type of types) {
    for (const result of results) {
      const match = result.address_components.find((c) => c.types.includes(type));
      if (match?.long_name) return match.long_name;
    }
  }
  return "";
}