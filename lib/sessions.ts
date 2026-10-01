"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { getJwtSecretKey } from "@/lib/jwtSecret";

const cookie = {
  name: "welvors_token",
  options: {
    /* Readable by client JS on purpose: the feed and onboarding contexts are
       client components and attach the token themselves as a Bearer header,
       which avoids needing credentialed CORS on the API host. The trade-off is
       that the token is exposed to XSS, same as any non-httpOnly store. */
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  },
};

type SessionPayload = {
  welvors_token: string;
};

export async function createSession(welvors_token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(cookie.name, welvors_token, {
    ...cookie.options,
  });
}

export async function verifySession(): Promise<{ result : boolean }> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(cookie.name)?.value;
  if (!cookieValue) {
    return {result : false};
  }

  return {
    result : true
  };
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(cookie.name);
}

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const welvors_token = cookieStore.get(cookie.name)?.value;
  if (!welvors_token) {
    return null;
  }

  return welvors_token;
}