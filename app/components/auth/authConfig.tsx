"use client";

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
  "https://dating-app-backend-plum.vercel.app/api/user/send-otp";
export const LOGIN_VERIFY_OTP =
  "https://dating-app-backend-plum.vercel.app/api/user/verify-otp";

export type Status = "idle" | "sending" | "error";