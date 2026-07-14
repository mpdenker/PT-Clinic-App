import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { homeFor, setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  const fail = () =>
    NextResponse.redirect(new URL("/login?error=1", req.url), 303);

  if (!email || !password) return fail();

  const user = await db.user.findUnique({ where: { email } }).catch(() => null);
  if (!user?.passwordHash) return fail();
  if (!verifyPassword(password, user.passwordHash)) return fail();

  await setSessionCookie(user.id);
  return NextResponse.redirect(new URL(homeFor(user.role), req.url), 303);
}
