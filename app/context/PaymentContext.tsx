"use client";

/* -------------------------------------------------------------------------- */
/*  PaymentContext                                                            */
/*                                                                            */
/*  One place for every payment API call. Components never call fetch()       */
/*  directly — they use usePayment() / usePaymentSuccess().                   */
/*                                                                            */
/*   createOrder()        POST /api/payment/create-order  (EVENT_BOOKING)     */
/*   createWalletOrder()  POST /api/payment/create-order  (WALLET)            */
/*   topUpWallet()        full wallet flow: order → Razorpay → verify         */
/*   verifyPayment()      POST /api/payment/verify                            */
/*   getPaymentSuccess()  GET  /api/user/event-bookings/:id/payment-success   */
/*   loadRazorpay()       loads checkout.js once                              */
/*                                                                            */
/*  Wrap the app (or the /app layout) in <PaymentProvider>.                   */
/* -------------------------------------------------------------------------- */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getClientToken } from "@/utils/token";
import { API_BASE_URL } from "@/utils/api";


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

/* ---------- wallet order ---------- */
export interface WalletOrderData {
  paymentId: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number; // paise
  amountInRupees: string;
  currency: string;
  bookingId?: string | null;
}

export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
  /** pre-select a method in Razorpay: "upi" | "card" | "netbanking" */
  method?: "upi" | "card" | "netbanking";
}

export type TopUpStage = "creating" | "awaiting" | "verifying";

export interface TopUpOptions {
  prefill?: RazorpayPrefill;
  description?: string;
  /** progress callback so the UI can show "Preparing… / Confirming…" */
  onStage?: (stage: TopUpStage) => void;
}

export type WalletTopUpResult =
  | { ok: true; amount: number; paymentId: string; razorpayPaymentId: string }
  | {
      ok: false;
      cancelled: boolean;
      message: string;
      /** true = money was charged but verify failed; webhook should credit it */
      paymentCaptured?: boolean;
    };

/* ---------- wallet top-up history ---------- */
export interface WalletTx {
  id: string;
  type?: string;
  source?: string;
  status: string;
  direction: "IN" | "OUT";
  title: string;
  description?: string;
  amount: number;
  formattedAmount?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  referenceId?: string | null;
  createdAt: string;
}

export interface WalletHistoryData {
  wallet?: { balance: number; currency: string; formattedBalance?: string };
  filter?: "ALL" | "IN" | "OUT";
  transactions: WalletTx[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface WalletHistoryQuery {
  filter?: "ALL" | "IN" | "OUT";
  page?: number;
  limit?: number;
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

/* ============================ Razorpay as a Promise ============================ */

type CheckoutOutcome =
  | { status: "success"; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
  | { status: "cancelled" }
  | { status: "failed"; message: string };

function openRazorpayCheckout(
  order: { razorpayKeyId: string; razorpayOrderId: string; amount: number; currency: string },
  opts: { description?: string; prefill?: RazorpayPrefill; notes?: Record<string, string> }
): Promise<CheckoutOutcome> {
  return new Promise((resolve) => {
    let settled = false;
    let lastError: string | null = null;
    const done = (o: CheckoutOutcome) => {
      if (settled) return;
      settled = true;
      resolve(o);
    };

    try {
      const rzp = new window.Razorpay({
        key: order.razorpayKeyId,
        order_id: order.razorpayOrderId,
        amount: order.amount, // paise — must match the order
        currency: order.currency,
        name: "Welvors",
        description: opts.description ?? "Payment",
        prefill: opts.prefill ?? {},
        notes: opts.notes ?? {},
        theme: { color: "#d9456b" },
        retry: { enabled: true, max_count: 3 },
        handler: (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
          done({ status: "success", ...resp }),
        modal: {
          confirm_close: true,
          // closed without a successful payment
          ondismiss: () => done(lastError ? { status: "failed", message: lastError } : { status: "cancelled" }),
        },
      });

      // fires per failed attempt; user can retry inside Razorpay, so don't resolve here
      rzp.on("payment.failed", (resp: any) => {
        lastError = resp?.error?.description || "Payment fail ho gaya.";
      });

      rzp.open();
    } catch {
      done({ status: "failed", message: "Payment window open nahi hua. Dobara try karo." });
    }
  });
}

/* ============================== request helper ============================== */

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const token = getClientToken();
  if (!token) {
    return { ok: false, status: 401, message: "Login token nahi mila. Dobara login karo." };
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
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
  createWalletOrder: (amount: number) => Promise<ApiResult<WalletOrderData>>;
  topUpWallet: (amount: number, opts?: TopUpOptions) => Promise<WalletTopUpResult>;
  getWalletTopUps: (query?: WalletHistoryQuery) => Promise<ApiResult<WalletHistoryData>>;
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

  /* ---------------------------- wallet ---------------------------- */

  const createWalletOrder = useCallback(async (amount: number): Promise<ApiResult<WalletOrderData>> => {
    // amount is in RUPEES (₹500 → 500). Backend returns paise in data.amount.
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
      return { ok: false, status: 400, message: "Sahi amount daalo (sirf poore rupaye)." };
    }
    return request<WalletOrderData>("/api/payment/create-order", {
      method: "POST",
      body: JSON.stringify({ purpose: "WALLET", amount }),
    });
  }, []);

  const topUpWallet = useCallback(
    async (amount: number, opts: TopUpOptions = {}): Promise<WalletTopUpResult> => {
      opts.onStage?.("creating");

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        return { ok: false, cancelled: false, message: "Payment gateway load nahi hua. Internet check karke dobara try karo." };
      }

      const order = await createWalletOrder(amount);
      if (!order.ok) return { ok: false, cancelled: false, message: order.message };

      opts.onStage?.("awaiting");
      const outcome = await openRazorpayCheckout(order.data, {
        description: opts.description ?? `Wallet top-up ₹${amount}`,
        prefill: opts.prefill,
        notes: { purpose: "WALLET", paymentId: order.data.paymentId },
      });

      if (outcome.status === "cancelled") return { ok: false, cancelled: true, message: "Payment cancel kar diya." };
      if (outcome.status === "failed") return { ok: false, cancelled: false, message: outcome.message };

      opts.onStage?.("verifying");
      const verified = await verifyPayment({
        razorpay_order_id: outcome.razorpay_order_id,
        razorpay_payment_id: outcome.razorpay_payment_id,
        razorpay_signature: outcome.razorpay_signature,
      });

      if (!verified.ok) {
        return {
          ok: false,
          cancelled: false,
          paymentCaptured: true,
          message:
            "Payment receive hua par wallet update confirm nahi hua. Paisa kata hai to balance kuch minute mein update ho jayega, ya support se contact karo.",
        };
      }

      return {
        ok: true,
        amount,
        paymentId: order.data.paymentId,
        razorpayPaymentId: outcome.razorpay_payment_id,
      };
    },
    [createWalletOrder, verifyPayment]
  );

  /** GET /api/user/my-wallet?filter=ALL&page=1&limit=50&source=WALLET_TOPUP */
  const getWalletTopUps = useCallback((query: WalletHistoryQuery = {}) => {
    const qs = new URLSearchParams({
      filter: query.filter ?? "ALL",
      page: String(query.page ?? 1),
      limit: String(query.limit ?? 50),
      source: "WALLET_TOPUP",
    });
    return request<WalletHistoryData>(`/api/user/my-wallet?${qs.toString()}`, { method: "GET" });
  }, []);

  const value = useMemo(
    () => ({ loadRazorpay, createOrder, createWalletOrder, topUpWallet, getWalletTopUps, verifyPayment, getPaymentSuccess }),
    [loadRazorpay, createOrder, createWalletOrder, topUpWallet, getWalletTopUps, verifyPayment, getPaymentSuccess]
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