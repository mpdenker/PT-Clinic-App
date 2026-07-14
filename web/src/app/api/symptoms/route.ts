import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const KINDS = ["NEW", "WORSE", "IMPROVED"];

/** Patient logs a symptom change (new pain, worsening, or improvement). */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.patientProfile || user.role !== "PATIENT") {
    return NextResponse.redirect(new URL("/login", req.url), 303);
  }

  const form = await req.formData();
  const kind = String(form.get("kind") ?? "");
  const description = String(form.get("description") ?? "").trim().slice(0, 500);

  if (KINDS.includes(kind) && description) {
    await db.symptomLog.create({
      data: { patientId: user.patientProfile.id, kind, description },
    });
  }
  return NextResponse.redirect(new URL("/patient", req.url), 303);
}
