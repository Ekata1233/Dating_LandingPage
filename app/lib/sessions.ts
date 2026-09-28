"use server";

import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { getJwtSecretKey } from "@/app/lib/jwtSecret";

const cookie = {
  name: "session",
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  },
  duration: 24 * 60 * 60 * 1000,
};

type SessionPayload = {
  welvors_token: string;
  expires?: Date;
};

export async function encrypt(payload: SessionPayload): Promise<string> {
  const key = getJwtSecretKey();

  return new SignJWT({
    welvors_token: payload.welvors_token,
    expires: payload.expires?.toISOString(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1day")
    .sign(key);
}

export async function decrypt(
  session: string | undefined
): Promise<SessionPayload | null> {
  if (!session) {
    return null;
  }

  try {
    const key = getJwtSecretKey();

    const { payload } = await jwtVerify(session, key, {
      algorithms: ["HS256"],
    });

    if (typeof payload.welvors_token !== "string") {
      return null;
    }

    return {
      welvors_token: payload.welvors_token,
      expires:
        typeof payload.expires === "string"
          ? new Date(payload.expires)
          : undefined,
    };
  } catch {
    return null;
  }
}

export async function createSession(welvors_token: string): Promise<void> {
  const expires = new Date(Date.now() + cookie.duration);

  const session = await encrypt({
    welvors_token,
    expires,
  });

  const cookieStore = await cookies();

  cookieStore.set(cookie.name, session, {
    ...cookie.options,
    expires,
  });
}

export async function verifySession(): Promise<{ result : boolean }> {
  const cookieStore = await cookies();

  const cookieValue = cookieStore.get(cookie.name)?.value;

  const session = await decrypt(cookieValue);

  if (!session?.welvors_token) {
    return {result : false};
  }

  return {
    result : true
  };
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete("role");
  cookieStore.delete("id");
  cookieStore.delete(cookie.name);
}

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();

  const cookieValue = cookieStore.get(cookie.name)?.value;

  const session = await decrypt(cookieValue);

  if (!session?.welvors_token) {
    return null;
  }

  return session.welvors_token;
}