"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/utils/api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type EventType = "TREK_DATES" | string; // backend se verify karna hai

type EventIntent = "MIXED" | "MEN_ONLY" | "WOMEN_ONLY" | string; // yeh bhi
interface FeatureTag {
    id: string;
    label: string;
    displayOrder: number;
}

export interface Event_Type {
    id: string;
    eventType?: EventType;
    title: string;
    city:string;
    eventDate: string;
    startTime?: string;
    endTime?: string;
    fullAddress: string;
    totalCapacity?: number;
    menCapacity?: number;
    womenCapacity?: number;
    otherCapacity?: number;
    menEntryPrice?: string;
    womenEntryPrice?: string;
    otherEntryPrice?: string;
    discountPercentage?: string;
    menDiscountedPrice?: string;
    womenDiscountedPrice?: string;
    otherDiscountedPrice?: string;
    minAge?: number;
    maxAge?: number;
    eventIntent?: EventIntent;
    heroImage: string;
    eventTag?: string | null;
    featureTags?: FeatureTag[];
    bookedCount: number;
    spotsLeft?: number;
    bookedLast24Hours?: number;
    bookingPercentage?: number;
    fillingFast?: boolean;
    fillingFastText?: string | null;
    bookingSummary?: string;
    last24HoursText?: string;
}
/* ------------------------------------------------------------------ */
/*  Detail endpoint types                                              */
/*  GET /api/admin/events/details/:id — the full marketing payload     */
/* ------------------------------------------------------------------ */

export interface EventGalleryImage {
    id: string;
    imageUrl: string;
    sortOrder?: number;
}

export interface EventWhyItem {
    id: string;
    title: string;
    description: string;
    icon?: string | null;
    sortOrder?: number;
}

export interface EventAmenity {
    id: string;
    name: string;
    icon?: string | null;
    sortOrder?: number;
}

export interface EventItineraryItem {
    id: string;
    date?: string | null;
    dayNumber?: number | null;
    time?: string | null;
    title: string;
    description: string;
    icon?: string | null;
    location?: string | null;
    elevation?: string | null;
    distance?: string | null;
    accommodation?: string | null;
    meals?: string | null;
    sortOrder?: number;
}

export interface EventSafetyFeature {
    id: string;
    title: string;
}

export interface EventFaq {
    id: string;
    question: string;
    answer: string;
}

export interface EventPartner {
    id: string;
    businessName: string;
    businessType?: string | null;
    contactPerson?: string | null;
    logo?: string | null;
    city?: string | null;
}

export interface EventBookingStats {
    totalCapacity?: number;
    bookedCount?: number;
    spotsLeft?: number;
    bookedLast24Hours?: number;
    bookingPercentage?: number;
    fillingFast?: boolean;
    fillingFastText?: string | null;
    bookingSummary?: string | null;
    last24HoursText?: string | null;
}

export interface EventDetails {
    id: string;
    title: string;
    eventType?: string;
    eventPartnerId?: string | null;
    eventTag?: string | null;
    eventDate: string;
    startTime?: string | null;
    endTime?: string | null;
    totalCapacity?: number;
    menCapacity?: number;
    womenCapacity?: number;
    otherCapacity?: number;
    menEntryPrice?: string | null;
    womenEntryPrice?: string | null;
    otherEntryPrice?: string | null;
    discountPercentage?: string | null;
    menDiscountedPrice?: string | null;
    womenDiscountedPrice?: string | null;
    otherDiscountedPrice?: string | null;
    minAge?: number;
    maxAge?: number;
    eventIntent?: string | null;
    fullAddress: string;
    latitude?: number | null;
    longitude?: number | null;
    heroImage: string;
    featureTags?: Array<{ id: string; label: string; displayOrder?: number }>;
    aboutEvent?: string | null;
    galleryImages?: EventGalleryImage[];
    whyShouldCome?: EventWhyItem[];
    amenities?: EventAmenity[];
    itinerary?: EventItineraryItem[];
    safetyFeatures?: EventSafetyFeature[];
    faqs?: EventFaq[];
    termsConditions?: string | null;
    eventPartner?: EventPartner | null;
    bookingStats?: EventBookingStats | null;
}

interface EventContextValue {
    events: Event_Type[];
    filter: string;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
    loading: boolean;
    error: string | null;
}
const EventContext = createContext<EventContextValue | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
    const [events, setEvents] = useState<Event_Type[] | []>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = process.env.NEXT_PUBLIC_API_TOKEN;
    const [filter, setFilter] = useState("ALL")

    useEffect(() => {
        let alive = true;

        const publicGet = async (url: string) => {
            try {
                const response = await axios.get(url);
                return response.data;
            } catch (err) {
                console.error("LegalContext fetch error:", url, err);
                return null;
            }
        };

        (async () => {
            try {
                const [r1] = await Promise.all(
                    [publicGet(`${API_BASE_URL}/api/admin/events/get?eventType=${filter}`)]);
                if (!alive) return;
                if (r1?.success && r1.data) {
                    setEvents(r1.data as Event_Type[]);
                    // setEvents([] as Event_Type[]);
                } else {
                    setError("Couldn't load events");
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [filter]);

    return (
        <EventContext.Provider value={{
            events, loading, error, filter, setFilter
        }}>
            {children}
        </EventContext.Provider>
    );
}

export function useEventData() {
    const context = useContext(EventContext);
    if (context === undefined) {
        throw new Error("useEventData must be used within an EventContext.Provider");
    }
    return context;
}

/* ------------------------------------------------------------------ */
/*  Single event details — GET /api/admin/events/details/:id           */
/* ------------------------------------------------------------------ */

const eventDetailsUrl = (id: string) =>
    `${API_BASE_URL}/api/admin/events/details/${encodeURIComponent(id)}`;

export interface EventDetailsResult {
    details: EventDetails | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Public, single-event fetch. Work is keyed by `${id}::${reloadKey}` so a late
 * response for a previous event can never overwrite the current one, and a
 * manual refetch flips back to the loader without setting state synchronously
 * inside the effect (which the React compiler lint forbids).
 */
export function useEventDetails(eventId: string | null | undefined): EventDetailsResult {
    const [reloadKey, setReloadKey] = useState(0);
    const requestKey = eventId ? `${eventId}::${reloadKey}` : null;

    const [result, setResult] = useState<{
        key: string | null;
        details: EventDetails | null;
        error: string | null;
    }>({ key: null, details: null, error: null });

    useEffect(() => {
        if (!eventId || !requestKey) return;

        let alive = true;

        (async () => {
            try {
                const response = await axios.get(eventDetailsUrl(eventId));
                if (!alive) return;

                const payload = response.data as
                    | { success?: boolean; data?: EventDetails }
                    | null;

                if (payload?.success && payload.data) {
                    setResult({ key: requestKey, details: payload.data, error: null });
                } else {
                    setResult({
                        key: requestKey,
                        details: null,
                        error: "Couldn't load this event.",
                    });
                }
            } catch (err) {
                if (!alive) return;
                console.error("Event details fetch error:", eventId, err);
                setResult({
                    key: requestKey,
                    details: null,
                    error: "Couldn't load this event.",
                });
            }
        })();

        return () => {
            alive = false;
        };
    }, [eventId, requestKey]);

    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

    const settled = requestKey !== null && result.key === requestKey;

    return {
        details: settled ? result.details : null,
        loading: Boolean(eventId) && !settled,
        error: settled ? result.error : null,
        refetch,
    };
}
