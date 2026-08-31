import { SignJWT, jwtVerify } from "jose";

// Edge-safe JWT helpers (no next/headers, no DB) — usable in middleware too.

export type SessionPayload = {
  sub: string; // user id
  email: string;
  name: string;
  role: string; // USER | ADMIN
};

const ALG = "HS256";
export const SESSION_COOKIE = "mt_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

const KNOWN_PLACEHOLDER_SECRETS = new Set([
  "change-me-to-a-long-random-string",
  "dev-only-insecure-secret-change-me-please-0123456789abcdef",
]);

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set it in your environment (see .env.example).",
    );
  }
  if (process.env.NODE_ENV === "production") {
    if (secret.length < 32 || KNOWN_PLACEHOLDER_SECRETS.has(secret)) {
      throw new Error(
        "AUTH_SECRET must be a strong, unique value in production (>=32 chars, not a placeholder). Generate: openssl rand -base64 48",
      );
    }
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifyToken(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.sub === "string" &&
      typeof payload.email === "string" &&
      typeof payload.role === "string"
    ) {
      return {
        sub: payload.sub,
        email: payload.email,
        name: (payload.name as string) ?? "",
        role: payload.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}
