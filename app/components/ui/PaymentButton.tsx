
"use client";

import Script from "next/script";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CreateOrderResponse {
    orderId: string;
    key: string;
    amount: number;
    currency?: string;
    message?: string;
}

interface VerifyPaymentResponse {
    success: boolean;
    message?: string;
}

interface RazorpaySuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayErrorResponse {
    error?: {
        code?: string;
        description?: string;
        source?: string;
        step?: string;
        reason?: string;
        metadata?: Record<string, string>;
    };
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpaySuccessResponse) => Promise<void>;
    modal: {
        ondismiss: () => void;
    };
}

interface RazorpayInstance {
    open: () => void;
    on: (
        event: "payment.failed",
        callback: (response: RazorpayErrorResponse) => void
    ) => void;
}

interface RazorpayConstructor {
    new(options: RazorpayOptions): RazorpayInstance;
}

declare global {
    interface Window {
        Razorpay?: RazorpayConstructor;
    }
}

export default function PaymentButton() {
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    async function handlePayment(): Promise<void> {
        if (!scriptLoaded || !window.Razorpay || loading) return;

        setLoading(true);
        setStatus("");

        try {
            // Step 1: Create order on the backend
            const orderResponse = await fetch(
                `${API_URL}/api/payment/create-order`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        // Add your plan ID or product details here.
                    }),
                }
            );

            const order: CreateOrderResponse = await orderResponse.json();

            if (!orderResponse.ok || !order.orderId) {
                throw new Error(order.message || "Could not create order");
            }

            // Step 2: Configure Razorpay Checkout
            const options: RazorpayOptions = {
                key: order.key,
                amount: order.amount,
                currency: order.currency || "INR",
                name: "Your Website",
                description: "Payment",
                order_id: order.orderId,

                handler: async (response: RazorpaySuccessResponse) => {
                    try {
                        setStatus("Verifying payment...");

                        // Step 3: Verify payment on the backend
                        const verifyResponse = await fetch(
                            `${API_URL}/api/payment/verify`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_signature: response.razorpay_signature,
                                }),
                            }
                        );

                        const result: VerifyPaymentResponse =
                            await verifyResponse.json();

                        if (!verifyResponse.ok || result.success !== true) {
                            setStatus(
                                "Payment verification is pending. Please check your payment status."
                            );
                            return;
                        }

                        setStatus("Payment successful!");

                        // Redirect after successful payment if needed:
                        // window.location.href = "/payment/success";
                    } catch (error: unknown) {
                        console.error("Verification error:", error);
                        setStatus(
                            "Could not verify payment. Please check payment status."
                        );
                    } finally {
                        setLoading(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        setStatus("Payment window closed.");
                    },
                },
            };

            // Step 4: Open Razorpay Checkout
            const checkout = new window.Razorpay(options);

            checkout.on("payment.failed", (response) => {
                console.error("Payment failed:", response.error);

                setStatus(
                    response.error?.description || "Payment failed. Please retry."
                );

                setLoading(false);
            });

            checkout.open();
        } catch (error: unknown) {
            console.error("Payment error:", error);

            setStatus(
                error instanceof Error
                    ? error.message
                    : "Unable to start payment."
            );

            setLoading(false);
        }
    }

    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
                onReady={() => setScriptLoaded(true)}
            />

            <button
                type="button"
                onClick={handlePayment}
                disabled={!scriptLoaded || loading}
            >
                {loading ? "Processing..." : "Pay Now"}
            </button>

            {status && <p role="status">{status}</p>}
        </>
    );
}
