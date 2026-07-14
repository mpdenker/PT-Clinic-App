"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/** Server functions are reachable by direct POST, so every action verifies the
 *  session and that the caller owns the record it touches. */
async function requirePatientProfile() {
  const user = await getCurrentUser();
  if (!user || user.role !== "PATIENT" || !user.patientProfile) {
    throw new Error("Not authorized");
  }
  return user.patientProfile;
}

export async function saveCheckin(formData: FormData) {
  const patient = await requirePatientProfile();
  const level = Number(formData.get("level"));
  const bodyRegion = String(formData.get("bodyRegion") || "");
  if (Number.isNaN(level) || level < 0 || level > 10) return;

  await db.painLog.create({
    data: { patientId: patient.id, level, bodyRegion: bodyRegion || null },
  });
  revalidatePath("/patient");
}

export async function markExercise(formData: FormData) {
  const patient = await requirePatientProfile();
  const assignmentId = String(formData.get("assignmentId"));
  const status = String(formData.get("status"));
  const difficulty = formData.get("difficulty")
    ? Number(formData.get("difficulty"))
    : null;
  if (status !== "DONE" && status !== "SKIPPED") return;

  // Ownership check: the assignment must belong to the logged-in patient.
  const assignment = await db.exerciseAssignment.findFirst({
    where: { id: assignmentId, patientId: patient.id },
  });
  if (!assignment) return;

  // One completion per assignment per day: replace today's if it exists.
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const existing = await db.exerciseCompletion.findFirst({
    where: { assignmentId, date: { gte: start } },
  });
  if (existing) {
    await db.exerciseCompletion.update({
      where: { id: existing.id },
      data: { status, difficulty },
    });
  } else {
    await db.exerciseCompletion.create({
      data: { assignmentId, status, difficulty },
    });
  }
  revalidatePath("/patient");
}
