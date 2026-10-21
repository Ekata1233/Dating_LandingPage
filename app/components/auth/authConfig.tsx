"use client";

import { API_BASE_URL } from "@/utils/api";

export {
  C,
  Icon,
  OTP_LENGTH,
  RESEND_SECONDS,
} from "../../waitlist/waitlistConfig";

// Login real API use karega — isliye mock yahan OFF.
// (Waitlist ka apna MOCK_MODE alag rahega, yeh usse decouple ho gaya.)
export const MOCK_MODE = false;

export const LOGIN_SEND_OTP =
  `${API_BASE_URL}/api/user/send-otp`;
export const LOGIN_VERIFY_OTP =
  `${API_BASE_URL}/api/user/verify-otp`;

export type Status = "idle" | "sending" | "error";