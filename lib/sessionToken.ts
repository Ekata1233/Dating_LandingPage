import { decodeJwt } from "jose";

/**
 * Structural session check for the `welvors_token` cookie.
 *
 * The cookie is readable by client JS on purpose (see `lib/sessions.ts`), and
 * both gates — this app's `proxy.ts` and `verifySession()` — used to treat
 * "any non-empty string is present" as logged in, so a forged cookie of any
 * shape passed the UI/auth gate. This helper rejects anything that is not a
 * decodable JWT and any JWT whose `exp` has already passed.
 *
 * Signature verification is deliberately NOT done here: API-issued tokens are
 * validated by the backend on every real request, and this frontend does not
 * hold the issuing secret (`JWT_SECRET`/`getJwtSecretKey` is only wired up for
 * future use). Fail-closed on shape/expiry only, so a legitimate token is
 * never rejected by a wrong key.
 */
export function isUsableSessionToken(token: string | null | undefined): boolean {
  if (!token) return false;

  try {
    const payload = decodeJwt(token);

    if (typeof payload.exp === "number" && payload.exp <= Math.floor(Date.now() / 1000)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
