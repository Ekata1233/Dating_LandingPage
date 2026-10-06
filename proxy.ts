import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* -------------------------------------------------------------------------- */
/*  Proxy — the /app and /onBoarding gates.                                  */
/*                                                                            */
/*  1. A session cookie must be present. If not, redirect to the home page    */
/*     and open the login modal.                                              */
/*                                                                            */
/*  2. Authenticated users are allowed to continue to /app and /onBoarding.  */
/* -------------------------------------------------------------------------- */

const TOKEN_COOKIE = "welvors_token";

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