// app/waitlist/WaitlistContext.tsx
"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from "react";

// Types matching your existing config
export type Status = "idle" | "sending" | "success" | "error";
export type Plan = "founding" | "free";
export type PayMethod = "upi" | "card";

export interface Profile {
  fullName: string;
  email: string;
  gender: string;
  city: string;
  lookingFor: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  height: string;
  orientation: string;
}

export interface Card {
  number: string;
  expiry: string;
  cvv: string;
}

interface WaitlistContextType {
  // Step
  step: number;
  setStep: (v: number) => void;

  // Status & Error
  status: Status;
  setStatus: (v: Status) => void;
  errorMsg: string;
  setErrorMsg: (v: string) => void;

  // Step 1 - Verify
  phone: string;
  setPhone: (v: string) => void;
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  otpSent: boolean;
  setOtpSent: (v: boolean) => void;
  secondsLeft: number;
  setSecondsLeft: (v: number) => void;
  referralOpen: boolean;
  setReferralOpen: React.Dispatch<React.SetStateAction<boolean>>;
  referralCode: string;
  setReferralCode: (v: string) => void;
  phoneRef: React.RefObject<HTMLInputElement | null>;
  otpRefs: React.MutableRefObject<Array<HTMLInputElement | null>>;

  // Step 2 - Profile
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;

  // Step 3 - Plan
  plan: Plan;
  setPlan: (v: Plan) => void;

  // Step 4 - Payment
  payMethod: PayMethod;
  setPayMethod: (v: PayMethod) => void;
  upiId: string;
  setUpiId: (v: string) => void;
  card: Card;
  setCard: React.Dispatch<React.SetStateAction<Card>>;

  // Step 5 - Done
  spotNumber: number | null;
  setSpotNumber: (v: number | null) => void;

  // Token
  token: string | null;
  setToken: (v: string | null) => void;

  // API Functions
  onSendOtp: (isResend?: boolean) => Promise<void>;
  onVerify: () => Promise<void>;
  onChangeNumber: () => void;
  onSubmitProfile: () => Promise<void>;
  onConfirmPlan: () => Promise<void>;
  onPayNow: () => Promise<void>;
  resetAll: () => void;
}

const WaitlistContext = createContext<WaitlistContextType | undefined>(undefined);

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

// Mock mode flag - set to false for production
const MOCK_MODE = false;

// API Endpoints
const SEND_OTP_ENDPOINT = "https://dating-app-backend-plum.vercel.app/api/user/send-otp";
const VERIFY_OTP_ENDPOINT = "https://dating-app-backend-plum.vercel.app/api/user/verify-otp";
const SAVE_PROFILE_ENDPOINT = "https://dating-app-backend-plum.vercel.app/api/user/profile/basic-info";

const initialProfile: Profile = {
  fullName: "",
  email: "",
  gender: "",
  city: "",
  lookingFor: "",
  dobDay: "",
  dobMonth: "",
  dobYear: "",
  height: "",
  orientation: "",
};

const initialCard: Card = {
  number: "",
  expiry: "",
  cvv: "",
};

// ---- Profile-skip helpers ----

// Backend se aane wala raw user — saare possible field variants optional.
// user?: RawUser recursive isliye hai kyunki data.data.user bhi ho sakta hai.
type RawUser = {
  user?: RawUser;
  fullName?: string;
  full_name?: string;
  email?: string;
  birth_date?: string;
  birthDate?: string;
  dob?: string;
  gender?: string;
  gender_option?: string;
  orientation?: string;
  onboarding_step?: string;
  city?: string;
  lookingFor?: string;
  looking_for?: string;
  height?: number | string | null;
};

interface VerifyOtpResponse {
  token?: string;
  user?: RawUser;
  data?: RawUser;
  message?: string | Array<{ message: string }>;
  error?: string;
}

// Backend enum -> UI label (hydration ke liye)
const GENDER_REVERSE: Record<string, string> = {
  MEN: "Man",
  WOMEN: "Woman",
  NON_BINARY: "Non-binary",
  PREFER_NOT_TO_SAY: "Prefer not to say",
  EVERYONE: "Everyone",
};

const ORIENTATION_REVERSE: Record<string, string> = {
  STRAIGHT: "Straight",
  GAY: "Gay",
  LESBIAN: "Lesbian",
  AROMATIC: "Aromatic",
  ASEXUAL: "Asexual",
  BISEXUAL: "Bisexual",
  DEMISEXUAL: "Demisexual",
  PANSEXUAL: "Pansexual",
  QUEER: "Queer",
  NOT_LISTED: "Not listed",
};

// Response ka shape kuch bhi ho — user object nikaalo defensively
const extractUser = (data: VerifyOtpResponse | null | undefined): RawUser | null =>
  data?.user ?? data?.data?.user ?? data?.data ?? null;

// Profile "saved" hai ya nahi.
// NOTE: height ko required NAHI rakha — verify-otp response me backend height
// return nahi karta. Core basic-info fields (name+email+dob+gender) present hone
// ka matlab profile save ho chuka. onboarding_step ko ek extra positive signal
// ke roop me use kiya hai (BASIC_INFO ya usse aage = done).
// Type predicate (u is RawUser) taaki callsite pe user null-narrow ho jaaye
// aur mapUserToProfile(user) compile ho.
const isProfileComplete = (u: RawUser | null): u is RawUser => {
  if (!u) return false;

  const hasName = !!(u.fullName || u.full_name);
  const hasEmail = !!u.email;
  const hasDob = !!(u.birth_date || u.birthDate || u.dob);
  const hasGender = !!u.gender;

  const coreDone = hasName && hasEmail && hasDob && hasGender;

  const step: string | undefined = u.onboarding_step;
  // Naya user (sirf phone verified) ka step PHONE/PHONE_VERIFIED/null hota hai.
  // Basic info save hote hi backend "BASIC_INFO" (ya aage) set kar deta hai.
  const stepDone =
    !!step && step !== "PHONE" && step !== "PHONE_VERIFIED";

  return coreDone || stepDone;
};

// Saved user ko wapas Profile state me daalo (Back button ke liye zaroori)
const mapUserToProfile = (u: RawUser): Profile => {
  const dobRaw: string = u.birth_date || u.birthDate || u.dob || "";
  let dobYear = "";
  let dobMonth = "";
  let dobDay = "";
  if (typeof dobRaw === "string" && dobRaw.includes("-")) {
    const [y, m, d] = dobRaw.split("T")[0].split("-");
    dobYear = y || "";
    dobMonth = m ? String(parseInt(m, 10)) : ""; // "01" -> "1" (select options match karne ke liye)
    dobDay = d ? String(parseInt(d, 10)) : "";
  }
  return {
    fullName: u.fullName || u.full_name || "",
    email: u.email || "",
    gender: GENDER_REVERSE[u.gender ?? ""] || u.gender || "",
    city: u.city || "",
    lookingFor: u.lookingFor || u.looking_for || "",
    dobDay,
    dobMonth,
    dobYear,
    height: u.height != null ? String(u.height) : "",
    orientation:
      ORIENTATION_REVERSE[u.gender_option ?? ""] ||
      ORIENTATION_REVERSE[u.orientation ?? ""] ||
      "",
  };
};

export function WaitlistProvider({ children }: { children: ReactNode }) {
  // Step
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Step 1 - Verify
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpSent, setOtpSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [referralOpen, setReferralOpen] = useState(true);
  const [referralCode, setReferralCode] = useState("");

  // Step 2 - Profile
  const [profile, setProfile] = useState<Profile>(initialProfile);

  // Step 3 - Plan
  const [plan, setPlan] = useState<Plan>("founding");

  // Step 4 - Payment
  const [payMethod, setPayMethod] = useState<PayMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState<Card>(initialCard);

  // Step 5 - Done
  const [spotNumber, setSpotNumber] = useState<number | null>(null);

  // Token
  const [token, setToken] = useState<string | null>(null);

  // Refs
  const phoneRef = useRef<HTMLInputElement>(null);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Auto-focus phone on mount
  useEffect(() => {
    if (phoneRef.current) {
      phoneRef.current.focus();
    }
  }, []);

  const startResendTimer = () => {
    setSecondsLeft(RESEND_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetAll = useCallback(() => {
  setStep(1);
  setStatus("idle");
  setErrorMsg("");
  setOtpSent(false);
  setPhone("");
  setOtp(Array(OTP_LENGTH).fill(""));
  setSecondsLeft(0);
  setReferralOpen(true);
  setReferralCode("");
  setProfile(initialProfile);
  setPlan("founding");
  setPayMethod("upi");
  setUpiId("");
  setCard(initialCard);
  setSpotNumber(null);
  setToken(null);
  if (timerRef.current) clearInterval(timerRef.current);
}, []);
  const fail = (msg: string) => {
    setStatus("error");
    setErrorMsg(msg);
  };

  // Step 1: Send OTP
  const onSendOtp = async (isResend = false) => {
    if (phone.length !== 10) {
      fail("Please enter a valid 10-digit mobile number.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    const onSuccess = () => {
      setStatus("idle");
      setOtpSent(true);
      startResendTimer();
      if (isResend) setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => otpRefs.current[0]?.focus(), 60);
    };

    if (MOCK_MODE) {
      setTimeout(onSuccess, 400);
      return;
    }

    try {
      const response = await fetch(SEND_OTP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || data.error || "Failed to send OTP");
      }

      onSuccess();
    } catch (error) {
      fail(error instanceof Error ? error.message : "Couldn't send the code. Please try again.");
    }
  };

  // Step 1: Verify OTP
  const onVerify = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      fail("Please enter the full 6-digit code.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    if (MOCK_MODE) {
      setTimeout(() => {
        setStatus("idle");
        setToken("mock-token-123");
        setStep(2);
      }, 400);
      return;
    }

    try {
      const response = await fetch(VERIFY_OTP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone,
          otp: code,
          referralCode: referralCode || undefined,
        }),
      });

      const data: VerifyOtpResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          (typeof data.message === "string" ? data.message : undefined) ||
            data.error ||
            "Invalid OTP. Please try again."
        );
      }

      // Success - token store karo, phir decide karo: profile saved hai ya nahi
      if (data.token) {
        setToken(data.token);
        setStatus("idle");
        setErrorMsg("");

        const user = extractUser(data);
        if (isProfileComplete(user)) {
          setProfile(mapUserToProfile(user)); // hydrate — Back karne pe fields bhare dikhein
          setStep(3); // profile already saved -> seedha Plan step pe jump
        } else {
          setStep(2); // naya user -> profile step
        }
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      fail(error instanceof Error ? error.message : "That code didn't match. Please try again.");
      setOtp(Array(OTP_LENGTH).fill("")); // Clear OTP on error
    }
  };

  // Step 1: Change number
  const onChangeNumber = () => {
    setOtpSent(false);
    setOtp(Array(OTP_LENGTH).fill(""));
    setStatus("idle");
    setErrorMsg("");
    setSecondsLeft(0);
    setToken(null);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => phoneRef.current?.focus(), 50);
  };

  // Helper: Calculate age
  const calcAge = (day: string, month: string, year: string): number | null => {
    if (!day || !month || !year) return null;
    const today = new Date();
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Step 2: Submit Profile
  const onSubmitProfile = async () => {
    if (!profile.fullName.trim()) {
      fail("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      fail("Please enter a valid email address.");
      return;
    }

    const age = calcAge(profile.dobDay, profile.dobMonth, profile.dobYear);
    if (age === null) {
      fail("Please enter a valid date of birth.");
      return;
    }
    if (age < 18) {
      fail("You must be 18 or older to join.");
      return;
    }

    if (!profile.height) {
      fail("Please select your height.");
      return;
    }

    if (!profile.gender) {
      fail("Please select your gender.");
      return;
    }

    if (!token) {
      fail("Please verify your phone number first.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    if (MOCK_MODE) {
      setTimeout(() => {
        setStatus("idle");
        setStep(3);
      }, 400);
      return;
    }

    try {
      // Format date for API
      const birthDate = `${profile.dobYear}-${profile.dobMonth.padStart(2, "0")}-${profile.dobDay.padStart(2, "0")}`;

      // Map gender to match backend enum
      const genderMap: Record<string, string> = {
        "Man": "MEN",
        "Woman": "WOMEN",
        "Non-binary": "NON_BINARY",
        "Prefer not to say": "PREFER_NOT_TO_SAY",
        "Everyone": "EVERYONE"
      };

      // Map orientation to match backend enum
      const orientationMap: Record<string, string> = {
        "Straight": "STRAIGHT",
        "Gay": "GAY",
        "Lesbian": "LESBIAN",
        "Aromatic": "AROMATIC",
        "Asexual": "ASEXUAL",
        "Bisexual": "BISEXUAL",
        "Demisexual": "DEMISEXUAL",
        "Pansexual": "PANSEXUAL",
        "Queer": "QUEER",
        "Not listed": "NOT_LISTED"
      };

      // Get mapped values
      const mappedGender = genderMap[profile.gender] || profile.gender;
      const mappedOrientation = orientationMap[profile.orientation] || profile.orientation;

      const requestBody = {
        fullName: profile.fullName,
        email: profile.email,
        birth_date: birthDate,
        height: parseInt(profile.height),
        gender: mappedGender,
        gender_option: mappedOrientation
      };

      console.log("Sending profile data:", requestBody);

      const response = await fetch(SAVE_PROFILE_ENDPOINT, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (data.message && Array.isArray(data.message)) {
          // Parse validation errors
          const errors = data.message.map((err: { message: string }) => err.message).join(". ");
          throw new Error(errors);
        }
        throw new Error(data.message || data.error || "Failed to save profile");
      }

      setStatus("idle");
      setErrorMsg("");
      setStep(3);
    } catch (error) {
      fail(error instanceof Error ? error.message : "Couldn't save your details. Please try again.");
    }
  };

  // Step 3: Confirm Plan
  const onConfirmPlan = async () => {
    setStatus("sending");
    setErrorMsg("");

    const nextStep = plan === "free" ? 5 : 4;

    if (MOCK_MODE) {
      setTimeout(() => {
        setStatus("idle");
        if (plan === "free") setSpotNumber(24);
        setStep(nextStep);
      }, 400);
      return;
    }

    try {
      // Since we don't have a checkout endpoint yet, just navigate
      setStatus("idle");
      setStep(nextStep);
    } catch (error) {
      fail("Couldn't start checkout. Please try again.");
    }
  };

  // Step 4: Pay Now
  const onPayNow = async () => {
    if (payMethod === "upi" && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId)) {
      fail("Please enter a valid UPI ID.");
      return;
    }

    if (payMethod === "card") {
      if (card.number.replace(/\D/g, "").length < 13) {
        fail("Please enter a valid card number.");
        return;
      }
      if (!/^\d{2}\s?\/\s?\d{2}$/.test(card.expiry)) {
        fail("Please enter expiry as MM / YY.");
        return;
      }
      if (card.cvv.length < 3) {
        fail("Please enter the CVV.");
        return;
      }
    }

    setStatus("sending");
    setErrorMsg("");

    if (MOCK_MODE) {
      setTimeout(() => {
        setStatus("idle");
        setSpotNumber(24);
        setStep(5);
      }, 600);
      return;
    }

    // TODO: Implement actual payment processing
    setStatus("idle");
    setSpotNumber(24);
    setStep(5);
  };

  const value: WaitlistContextType = {
    step,
    setStep,
    status,
    setStatus,
    errorMsg,
    setErrorMsg,
    phone,
    setPhone,
    otp,
    setOtp,
    otpSent,
    setOtpSent,
    secondsLeft,
    setSecondsLeft,
    referralOpen,
    setReferralOpen,
    referralCode,
    setReferralCode,
    phoneRef,
    otpRefs,
    profile,
    setProfile,
    plan,
    setPlan,
    payMethod,
    setPayMethod,
    upiId,
    setUpiId,
    card,
    setCard,
    spotNumber,
    setSpotNumber,
    token,
    setToken,
    onSendOtp,
    onVerify,
    onChangeNumber,
    onSubmitProfile,
    onConfirmPlan,
    onPayNow,
    resetAll,
  };

  return (
    <WaitlistContext.Provider value={value}>
      {children}
    </WaitlistContext.Provider>
  );
}

export function useWaitlist() {
  const context = useContext(WaitlistContext);
  if (!context) {
    throw new Error("useWaitlist must be used within a WaitlistProvider");
  }
  return context;
}