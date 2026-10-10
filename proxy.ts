import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isUsableSessionToken } from "@/lib/sessionToken";

/* -------------------------------------------------------------------------- */
/*  Proxy — the /app and /onBoarding gates.                                  */
/*                                                                            */
/*  1. A session cookie must be present AND usable: a decodable JWT that has  */
/*     not expired. A forged/garbage/expired cookie is treated as no session. */
/*     If not usable, redirect to the home page and open the login modal.     */
/*                                                                            */
/*  2. Authenticated users are allowed to continue to /app and /onBoarding.  */
/*     The API still re-validates the token on every real request (401s).     */
/* -------------------------------------------------------------------------- */

const TOKEN_COOKIE = "welvors_token";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  /* ------------------------------------------------------------------------ */
  /* Not logged in (or unusable token)                                        */
  /* ------------------------------------------------------------------------ */

  if (!isUsableSessionToken(token)) {
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