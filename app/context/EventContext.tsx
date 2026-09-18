"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
const BASE = "https://dating-app-backend-plum.vercel.app";
const EVENTS_URL = `https://api.welvors.com/api/admin/events/get-all`;

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

export interface Event {
    id: string;
    eventType?: EventType;
    title: string;
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
interface EventContextValue {
    events: Event[];
    loading: boolean;
    error: string | null;
}

const EventContext = createContext<EventContextValue | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
    const [events, setEvents] = useState<Event[] | []>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = process.env.NEXT_PUBLIC_API_TOKEN;

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
                    [publicGet(EVENTS_URL)]);
                if (!alive) return;
                if (r1?.success && r1.data) {
                    console.log(r1.data)
                    setEvents(r1.data as Event[]);
                    // setEvents([] as Event[]);
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
    }, []);

    return (
        <EventContext.Provider value={{
            events, loading, error
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
