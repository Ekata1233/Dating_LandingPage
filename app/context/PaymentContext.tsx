"use client";

/* -------------------------------------------------------------------------- */
/*  PaymentContext                                                            */
/*                                                                            */
/*  One place for every payment API call. Components never call fetch()       */
/*  directly — they use usePayment() / usePaymentSuccess().                   */
/*                                                                            */
/*   createOrder()        POST /api/payment/create-order                      */
/*   verifyPayment()      POST /api/payment/verify                            */
/*   getPaymentSuccess()  GET  /api/user/event-bookings/:id/payment-success   */
/*   loadRazorpay()       loads checkout.js once                              */
/*                                                                            */
/*  Wrap the app (or the /app layout) in <PaymentProvider>.                   */
/* -------------------------------------------------------------------------- */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getClientToken } from "@/utils/token";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://dev-api.welvors.com";

/* ================================== types ================================== */

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

/* ---------- create order ---------- */
export interface CreateOrderInput {
  eventId: string;
  menTicketCount: number;
  womenTicketCount: number;
  otherTicketCount?: number;
}

export interface CreateOrderData {
  paymentId: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number; // paise
  amountInRupees: string;
  currency: string;
  bookingId: string;
}

/* ---------- verify ---------- */
export interface VerifyPaymentInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

/* ---------- payment success ---------- */
export interface BookingTicket {
  id: string;
  ticketId: string;
  ticketType: string;
  ticketAmount: number;
  qrCodeUrl: string;
  status: string;
}

export interface PaymentSuccessData {
  booking: {
    id: string;
    bookingNumber: string;
    ticketCount: number;
    ticketAmount: number;
    discountAmount: number;
    platformFee: number;
    gstAmount: number;
    totalAmount: number;
    paidAmount: number;
    status: string;
    tickets: BookingTicket[];
  };
  payment: {
    transactionId: string | null;
    orderId: string | null;
    paidVia: string | null;
    paidAt: string | null;
    amount: number;
    currency: string;
    status: string;
    gatewayPaymentStatus: string | null;
  };
  event: {
    id: string;
    title: string;
    eventDate: string;
    startTime: string | null;
    endTime: string | null;
    venueName: string | null;
    fullAddress: string | null;
    city: string | null;
    heroImage: string | null;
  };
}

/* ============================== Razorpay loader ============================== */

declare global {
  interface Window {
    Razorpay?: any;
  }
}

let razorpayScriptPromise: Promise<boolean> | null = null;

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => {
      razorpayScriptPromise = null; // allow retry
      resolve(false);
    };
    document.body.appendChild(s);
  });
  return razorpayScriptPromise;
}

/* ============================== request helper ============================== */

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const token = getClientToken();
  if (!token) {
    return { ok: false, status: 401, message: "Login token nahi mila. Dobara login karo." };
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers ?? {}),
      },
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      // never show raw validation JSON (e.g. Zod errors) to the user
      const raw = typeof json?.message === "string" ? json.message : "";
      const message =
        res.status === 401
          ? "Session expire ho gaya. Dobara login karo."
          : res.status === 404
            ? "Record nahi mila."
            : raw && !raw.trim().startsWith("[") && !raw.trim().startsWith("{")
              ? raw
              : "Kuch galat hua. Dobara try karo.";
      if (raw && message !== raw) console.warn(`[Payment API] ${path} →`, raw);
      return { ok: false, status: res.status, message };
    }

    return { ok: true, data: json.data as T };
  } catch {
    return { ok: false, status: 0, message: "Network issue. Internet check karke dobara try karo." };
  }
}

/* ================================== context ================================== */

interface PaymentContextValue {
  loadRazorpay: () => Promise<boolean>;
  createOrder: (input: CreateOrderInput) => Promise<ApiResult<CreateOrderData>>;
  verifyPayment: (input: VerifyPaymentInput) => Promise<ApiResult<unknown>>;
  getPaymentSuccess: (bookingId: string) => Promise<ApiResult<PaymentSuccessData>>;
}

const PaymentContext = createContext<PaymentContextValue | null>(null);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const loadRazorpay = useCallback(() => loadRazorpayScript(), []);

  const createOrder = useCallback(
    (input: CreateOrderInput) =>
      request<CreateOrderData>("/api/payment/create-order", {
        method: "POST",
        body: JSON.stringify({
          purpose: "EVENT_BOOKING",
          eventId: input.eventId,
          menTicketCount: input.menTicketCount,
          womenTicketCount: input.womenTicketCount,
          otherTicketCount: input.otherTicketCount ?? 0,
        }),
      }),
    []
  );

  const verifyPayment = useCallback(
    (input: VerifyPaymentInput) =>
      // backend schema is strict: send ONLY these 3 keys
      request<unknown>("/api/payment/verify", {
        method: "POST",
        body: JSON.stringify({
          razorpay_order_id: input.razorpay_order_id,
          razorpay_payment_id: input.razorpay_payment_id,
          razorpay_signature: input.razorpay_signature,
        }),
      }),
    []
  );

  const getPaymentSuccess = useCallback(
    (bookingId: string) =>
      request<PaymentSuccessData>(`/api/user/event-bookings/${encodeURIComponent(bookingId)}/payment-success`, {
        method: "GET",
      }),
    []
  );

  const value = useMemo(
    () => ({ loadRazorpay, createOrder, verifyPayment, getPaymentSuccess }),
    [loadRazorpay, createOrder, verifyPayment, getPaymentSuccess]
  );

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export function usePayment(): PaymentContextValue {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error("usePayment() must be used inside <PaymentProvider>.");
  return ctx;
}

/* ============================ booking success hook ============================ */

export function usePaymentSuccess(bookingId: string | null) {
  const { getPaymentSuccess } = usePayment();
  const [data, setData] = useState<PaymentSuccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(
    async (silent = false) => {
      if (!bookingId) {
        setError("Booking ID missing.");
        setLoading(false);
        return;
      }
      silent ? setRefreshing(true) : setLoading(true);
      setError(null);

      const res = await getPaymentSuccess(bookingId);
      if (res.ok) setData(res.data);
      else setError(res.status === 404 ? "Booking nahi mili." : res.message);

      setLoading(false);
      setRefreshing(false);
    },
    [bookingId, getPaymentSuccess]
  );

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, refreshing, error, reload };
}