import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/** Send a secure message. Patients may only message their own therapist;
 *  therapists may only message patients on their own roster. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url), 303);

  const form = await req.formData();
  const body = String(form.get("body") ?? "").trim().slice(0, 2000);
  const back = String(form.get("back") ?? "/");
  const redirectBack = () => NextResponse.redirect(new URL(back, req.url), 303);
  if (!body) return redirectBack();

  let toUserId: string | null = null;

  if (user.role === "PATIENT" && user.patientProfile) {
    // Patient → their assigned therapist.
    const patient = await db.patientProfile.findUnique({
      where: { id: user.patientProfile.id },
      include: { therapist: true },
    });
    toUserId = patient?.therapist?.userId ?? null;
  } else if (user.role === "THERAPIST" && user.therapistProfile) {
    // Therapist → a patient who is actually on their roster.
    const patientProfileId = String(form.get("patientProfileId") ?? "");
    const patient = await db.patientProfile.findFirst({
      where: { id: patientProfileId, therapistId: user.therapistProfile.id },
    });
    toUserId = patient?.userId ?? null;
  }

  if (!toUserId) return redirectBack();

  await db.message.create({
    data: { fromUserId: user.id, toUserId, body },
  });
  return redirectBack();
}
