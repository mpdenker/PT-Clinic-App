import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { INSTRUMENT, QUESTIONS, OPTIONS, scoreAnswers } from "@/lib/questionnaire";

/** Patient submits an outcome questionnaire; we store answers + 0–100 score. */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user?.patientProfile || user.role !== "PATIENT") {
    return NextResponse.redirect(new URL("/login", req.url), 303);
  }

  const form = await req.formData();
  const answers: number[] = [];
  for (const q of QUESTIONS) {
    const v = Number(form.get(q.id));
    if (Number.isNaN(v) || v < 0 || v >= OPTIONS.length) {
      return NextResponse.redirect(new URL("/patient/questionnaire?error=1", req.url), 303);
    }
    answers.push(v);
  }

  const score = scoreAnswers(answers);
  await db.questionnaireResponse.create({
    data: {
      patientId: user.patientProfile.id,
      instrument: INSTRUMENT,
      score,
      answersJson: JSON.stringify(answers),
    },
  });
  return NextResponse.redirect(new URL("/patient/questionnaire?done=1", req.url), 303);
}
