/* -------------------------------------------------------------------------- */
/*  Device location -> the seven fields the LOCATION flow stores.              */
/*                                                                             */
/*  Shared by the onboarding `location` step and the edit form's Location        */
/*  section, because both do the same thing and must agree on it:               */
/*                                                                             */
/*    1. ask the browser for a position, only on an explicit click              */
/*    2. reverse-geocode it through Nominatim                                  */
/*    3. write country / state / city / area / latitude / longitude            */
/*                                                                             */
/*  The coordinates are never typed and never shown to another member, so both  */
/*  surfaces render one read-only summary line and a button rather than fields. */
/*                                                                             */
/*  NOTE: `steps/Location.tsx` still carries its own private copy of this        */
/*  logic. It was left untouched deliberately, so the wording and the field     */
/*  set below and the ones in the step can drift. Point the step at this module */
/*  when it is next edited.                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Distance shown to a member who has never set one. The onboarding step writes
 * this into the form; `toLocationRequest` is what actually reaches the wire.
 */
export const DEFAULT_MAX_DISTANCE_KM = 25;

/** Zoom 14 is neighbourhood level — enough to resolve `area`, not a street address. */
const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/reverse";

export interface NominatimAddress {
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
}

export interface ResolvedLocation {
  country: string;
  state: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
}

/** The form fields a resolved position writes. Keys match `STEP_SCHEMAS.location`. */
export type LocationFields = Record<
  "country" | "state" | "city" | "area" | "latitude" | "longitude",
  string | number
>;

/**
 * Reverse-geocodes coordinates via OpenStreetMap Nominatim (free, no key, light
 * use only). For production traffic, proxy this through your own API route with
 * Google / Mapbox / LocationIQ.
 */
export async function reverseGeocode(
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

  const res = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
    signal,
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`Reverse geocoding failed (${res.status})`);

  const data: { address?: NominatimAddress } = await res.json();
  const a = data.address;

  if (!a) throw new Error("No address found");

  const city =
    a.city || a.town || a.village || a.municipality || a.county || a.state_district || "";
  const area = a.suburb || a.neighbourhood || a.city_district || a.quarter || "";
  const state = a.state || "";
  const country = a.country || "";

  if (!city || !country) throw new Error("Incomplete address");

  return {
    country,
    state,
    city,
    /* Some places have no sub-locality in OSM; fall back to the city so the
       required `area` field is never empty. */
    area: area || city,
    latitude: Number(latitude.toFixed(4)),
    longitude: Number(longitude.toFixed(4)),
  };
}

export function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10_000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

/**
 * One line for the read-only summary: "Kothrud, Pune, Maharashtra, India".
 * Drops empty parts and collapses an `area` that Nominatim answered with the
 * same string as the city.
 */
export function formatLocation(l: {
  area: string;
  city: string;
  state: string;
  country: string;
}): string {
  return [l.area, l.city, l.state, l.country]
    .filter((part, index, all) => Boolean(part) && all.indexOf(part) === index)
    .join(", ");
}

/** The seven writes, as one object, so callers spread it into their own store. */
export function locationFields(resolved: ResolvedLocation): LocationFields {
  return {
    country: resolved.country,
    state: resolved.state,
    city: resolved.city,
    area: resolved.area,
    latitude: resolved.latitude,
    longitude: resolved.longitude,
  };
}

/**
 * A geolocation failure and a failed reverse-geocode look identical to the user
 * unless the code is translated here, so the wording lives in one place.
 */
export function describeLocateError(err: unknown): string {
  const code = (err as Partial<GeolocationPositionError> | null)?.code;

  if (code === 1) {
    return "Location access is blocked. Allow it in your browser's site settings, then try again.";
  }

  if (code === 2) {
    return "Your location isn't available right now. Please try again.";
  }

  if (code === 3) {
    return "Locating you took too long. Please try again.";
  }

  return "We got your position but couldn't work out your city. Please try again.";
}