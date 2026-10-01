export function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET is required in production."
      );
    }
    return new TextEncoder().encode("aman");
  }
  return new TextEncoder().encode(secret);
}
