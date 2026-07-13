"use server";

import { db } from "@/lib/db";
import { getDemoPatient } from "@/lib/queries";
import { revalidatePath } from "next/cache";

// NOTE: these actions currently resolve the patient from the demo user. When
// real auth lands (next step), the patient will come from the session instead,
// and each action will verify the caller owns the record.

export async function saveCheckin(formData: FormData) {
  const { patient } = await getDemoPatient();
  const level = Number(formData.get("level"));
  const bodyRegion = String(formData.get("bodyRegion") || "");
  if (Number.isNaN(level) || level < 0 || level > 10) return;

  await db.painLog.create({
    data: { patientId: patient.id, level, bodyRegion: bodyRegion || null },
  });
  revalidatePath("/patient");
}

export async function markExercise(formData: FormData) {
  const assignmentId = String(formData.get("assignmentId"));
  const status = String(formData.get("status")); // "DONE" | "SKIPPED"
  const difficulty = formData.get("difficulty")
    ? Number(formData.get("difficulty"))
    : null;

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
