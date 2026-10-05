import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { API_BASE_URL } from "./utils/api";

/* -------------------------------------------------------------------------- */
/*  Proxy — the /app and /onBoarding gates.                                      */
/*                                                                             */
/*  Next.js 16 renamed `middleware` to `proxy`; this is that file. It runs before */
/*  either route renders.                                                       */
/*                                                                             */
/*  Two checks, in order:                                                       */
/*                                                                             */
/*    1. A session cookie must be present — the same check `verifySession()` in  */
/*       `lib/sessions.ts` performs. A visitor without one is sent to the home    */
/*       page to open the login modal.                                          */
/*                                                                             */
/*    2. `/onBoarding` is a one-way door. Once the backend says the flow is done  */
/*       (`flows.REVIEW_FINISH.onboardingCompleted`), the page is off limits and  */
/*       the user is sent to their profile instead. Everywhere else can be       */
/*       changed later from Edit Profile, which is exactly what that screen is    */
/*       for.                                                                   */
/*                                                                             */
/*  Neither check validates the token against the backend, and check 2 has to    */
/*  make a request of its own; every API call is still authorised by the server, */
/*  so this is a UX gate, not the security boundary.                             */
/* -------------------------------------------------------------------------- */

/** Keep in step with `cookie.name` in `lib/sessions.ts` and `TOKEN_KEY` in `utils/token.ts`. */
const TOKEN_COOKIE = "welvors_token";

const ONBOARDING_DETAILS_URL = `${API_BASE_URL}/api/user/onboarding-details`;

/** Where someone with a finished profile goes instead of back into the flow. */
const ONBOARDING_DONE_PATH = "/app/profile";

function isOnBoardingPath(pathname: string): boolean {
  return pathname === "/onBoarding" || pathname.startsWith("/onBoarding/");
}

/**
 * Pulls the flag out of the onboarding-details payload without trusting the rest
 * of the shape: anything that is not a boolean comes back as `null`.
 */
function readCompletedFlag(payload: unknown): boolean | null {
  const flows = (payload as { data?: { flows?: Record<string, unknown> } } | null)?.data?.flows;

  const completed = (flows?.REVIEW_FINISH as { onboardingCompleted?: unknown } | undefined)
    ?.onboardingCompleted;

  return typeof completed === "boolean" ? completed : null;
}

/**
 * Asks the backend whether this user has finished onboarding.
 *
 * Returns `null` whenever the question cannot be answered — a non-OK response, a
 * transport failure, an unrecognised payload — and the caller reads `null` as
 * "let them in". Failing closed would mean a single flaky request locking a real
 * person out of the flow with no way back, which is much worse than the few extra
 * views of `/onBoarding` the gate lets past when the API is unhealthy.
 */
async function hasFinishedOnboarding(token: string): Promise<boolean | null> {
  try {
    const response = await fetch(ONBOARDING_DETAILS_URL, {
      /* The cookie is the only credential here — `authHeader()` reads
         `document.cookie`, which does not exist on this side of the wire. */
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      /* The flag flips exactly once, when the review step saves. Caching it
         would bounce a user off the flow on the visit right after they finish. */
      cache: "no-store",
    });

    if (!response.ok) return null;

    return readCompletedFlag(await response.json());
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  if (!token) {
    /* The login modal lives in the marketing Navbar, so send the visitor to the
       home page and ask it to open. `next` carries them back once they are in. */
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("login", "1");
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );

    return NextResponse.redirect(loginUrl);
  }

  /* Only the flow asks the backend. Every /app screen already re-reads the
     profile for its own content, so gating there would double the request. */
  if (
    isOnBoardingPath(request.nextUrl.pathname) &&
    (await hasFinishedOnboarding(token))
  ) {
    const doneUrl = new URL(ONBOARDING_DONE_PATH, request.url);

    /* Say why, so the destination can explain itself instead of looking broken. */
    doneUrl.searchParams.set("onboarding", "complete");

    return NextResponse.redirect(doneUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app", "/app/:path*","/onBoarding", "/onBoarding/:path*"],
};