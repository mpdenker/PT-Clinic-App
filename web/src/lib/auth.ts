import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";

// Session secret: fine to default in dev; MUST be set in production.
const SECRET = process.env.SESSION_SECRET ?? "dev-only-secret-change-me";
const COOKIE = "stride_session";
const SESSION_DAYS = 30;

// ---------------------------------------------------------------------------
// Passwords (scrypt — built into Node, no dependency)
// ---------------------------------------------------------------------------

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

// ---------------------------------------------------------------------------
// Sessions (HMAC-signed cookie: userId.expiry.signature)
// ---------------------------------------------------------------------------

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

export function createSessionToken(userId: string): string {
  const expires = Date.now() + SESSION_DAYS * 864e5;
  const payload = `${userId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function parseSessionToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expires, signature] = parts;
  const payload = `${userId}.${expires}`;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (Number(expires) < Date.now()) return null;
  return userId;
}

export async function setSessionCookie(userId: string) {
  const store = await cookies();
  store.set(COOKIE, createSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 86400,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}

// ---------------------------------------------------------------------------
// Current user
// ---------------------------------------------------------------------------

/** Returns the logged-in user (with profiles) or null. Cached per request. */
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const userId = parseSessionToken(token);
  if (!userId) return null;
  return db.user.findUnique({
    where: { id: userId },
    include: { patientProfile: true, therapistProfile: true },
  });
});

/** Redirects to /login unless logged in (and, if given, has the role). */
export async function requireUser(role?: "PATIENT" | "THERAPIST" | "CLINIC_ADMIN") {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (role && user.role !== role) redirect(homeFor(user.role));
  return user;
}

export function homeFor(role: string): string {
  switch (role) {
    case "THERAPIST": return "/therapist";
    case "CLINIC_ADMIN": return "/clinic";
    default: return "/patient";
  }
}
