const TOKEN_KEY = "welvors_token";

export function getClientToken(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${TOKEN_KEY}=([^;]*)`)
  );

  return match ? decodeURIComponent(match[1]) : null;
}

export function authHeader(): Record<string, string> {
  const token = getClientToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
