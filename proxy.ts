import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { API_BASE_URL } from "./utils/api";

/* -------------------------------------------------------------------------- */
/*  Proxy — the /app and /onBoarding gates.                                  */
/*                                                                            */
/*  1. A session cookie must be present. If not, redirect to the home page    */
/*     and open the login modal.                                              */
/*                                                                            */
/*  2. `/onBoarding` is a one-way door. Once onboarding is completed,          */
/*     redirect the user to their profile.                                    */
/*                                                                            */
/*  No redirect destination is remembered for unauthenticated users.          */
/* -------------------------------------------------------------------------- */

const TOKEN_COOKIE = "welvors_token";

const ONBOARDING_DETAILS_URL = `${API_BASE_URL}/api/user/onboarding-details`;

/** Where someone with a finished profile goes instead of back into onboarding. */
const ONBOARDING_DONE_PATH = "/app/profile";

function isOnBoardingPath(pathname: string): boolean {
  return pathname === "/onBoarding" || pathname.startsWith("/onBoarding/");
}

/**
 * Reads onboardingCompleted from the onboarding-details response.
 *
 * Returns null if the value is not a boolean.
 */
function readCompletedFlag(payload: unknown): boolean | null {
  const flows = (
    payload as {
      data?: {
        flows?: Record<string, unknown>;
      };
    } | null
  )?.data?.flows;

  const completed = (
    flows?.REVIEW_FINISH as
      | {
          onboardingCompleted?: unknown;
        }
      | undefined
  )?.onboardingCompleted;

  return typeof completed === "boolean" ? completed : null;
}

/**
 * Asks the backend whether the user has finished onboarding.
 *
 * Returns null if the request fails or the response is invalid.
 * In that case, the user is allowed to continue into onboarding.
 */
async function hasFinishedOnboarding(
  token: string
): Promise<boolean | null> {
  try {
    const response = await fetch(ONBOARDING_DETAILS_URL, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return readCompletedFlag(await response.json());
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  /* ------------------------------------------------------------------------ */
  /* Not logged in                                                            */
  /* ------------------------------------------------------------------------ */

  if (!token) {
    /*
     * Send the user to the home page and open the login modal.
     *
     * IMPORTANT:
     * We intentionally do NOT add a `next` parameter.
     * The original requested page is not remembered.
     */
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("login", "1");

    return NextResponse.redirect(loginUrl);
  }

  /* ------------------------------------------------------------------------ */
  /* Onboarding completed check                                               */
  /* ------------------------------------------------------------------------ */

  if (
    isOnBoardingPath(request.nextUrl.pathname) &&
    (await hasFinishedOnboarding(token))
  ) {
    const doneUrl = new URL(ONBOARDING_DONE_PATH, request.url);

    doneUrl.searchParams.set("onboarding", "complete");

    return NextResponse.redirect(doneUrl);
  }

  /* ------------------------------------------------------------------------ */
  /* Allow the request                                                        */
  /* ------------------------------------------------------------------------ */

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app",
    "/app/:path*",
    "/onBoarding",
    "/onBoarding/:path*",
  ],
};