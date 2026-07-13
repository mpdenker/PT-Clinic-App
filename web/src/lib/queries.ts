import { db } from "@/lib/db";

const DAY = 24 * 60 * 60 * 1000;

/** The demo patient (Sarah). Real auth arrives in the next step; for now we
 *  load the seeded patient so every screen renders against real DB data. */
export async function getDemoPatient() {
  const user = await db.user.findUnique({
    where: { email: "sarah@example.com" },
    include: { patientProfile: true },
  });
  if (!user?.patientProfile) throw new Error("Demo patient not seeded");
  return { user, patient: user.patientProfile };
}

export type RecoveryMetrics = {
  score: number;
  painToday: number | null;
  streak: number;
  adherencePct: number;
  latestRom: { value: number; unit: string } | null;
};

/** Blend pain, motion and adherence into a single 0–100 recovery score. */
export async function getRecoveryMetrics(patientId: string): Promise<RecoveryMetrics> {
  const [latestPain, completions, assignments, latestRom] = await Promise.all([
    db.painLog.findFirst({ where: { patientId }, orderBy: { date: "desc" } }),
    db.exerciseCompletion.findMany({
      where: { assignment: { patientId }, date: { gte: new Date(Date.now() - 14 * DAY) } },
      orderBy: { date: "desc" },
    }),
    db.exerciseAssignment.count({ where: { patientId, active: true } }),
    db.measurement.findFirst({
      where: { patientId, kind: "ROM" },
      orderBy: { date: "desc" },
    }),
  ]);

  // Streak: consecutive calendar days (back from today) with a completion.
  const doneDays = new Set(
    completions
      .filter((c) => c.status === "DONE")
      .map((c) => new Date(c.date).toISOString().slice(0, 10)),
  );
  let streak = 0;
  for (let d = 1; d <= 14; d++) {
    const key = new Date(Date.now() - d * DAY).toISOString().slice(0, 10);
    if (doneDays.has(key)) streak++;
    else if (streak > 0) break;
  }

  // Adherence this week: DONE completions vs assigned-per-day over 7 days.
  const weekDone = completions.filter(
    (c) => c.status === "DONE" && new Date(c.date).getTime() >= Date.now() - 7 * DAY,
  ).length;
  const expected = Math.max(assignments * 7, 1);
  const adherencePct = Math.min(100, Math.round((weekDone / expected) * 100));

  // Score: lower pain, higher ROM, higher adherence all raise it.
  const painPart = latestPain ? (10 - latestPain.level) / 10 : 0.5; // 0–1
  const romPart = latestRom ? Math.min(1, latestRom.value / 135) : 0.5; // goal 135°
  const adhPart = adherencePct / 100;
  const score = Math.round((painPart * 0.4 + romPart * 0.35 + adhPart * 0.25) * 100);

  return {
    score,
    painToday: latestPain?.level ?? null,
    streak,
    adherencePct,
    latestRom: latestRom ? { value: latestRom.value, unit: latestRom.unit } : null,
  };
}

export async function getPainSeries(patientId: string, days = 42) {
  const logs = await db.painLog.findMany({
    where: { patientId, date: { gte: new Date(Date.now() - days * DAY) } },
    orderBy: { date: "asc" },
  });
  return logs.map((l) => ({
    date: new Date(l.date).toISOString().slice(0, 10),
    level: l.level,
  }));
}

export async function getTodaysExercises(patientId: string) {
  const assignments = await db.exerciseAssignment.findMany({
    where: { patientId, active: true },
    include: {
      exercise: true,
      completions: { where: { date: { gte: startOfToday() } }, orderBy: { date: "desc" } },
    },
    orderBy: { createdAt: "asc" },
  });
  return assignments.map((a) => ({
    id: a.id,
    name: a.exercise.name,
    detail: `${a.sets} sets × ${a.reps}`,
    whyItHelps: a.exercise.whyItHelps,
    muscles: a.exercise.muscles,
    todayStatus: a.completions[0]?.status ?? null,
    todayDifficulty: a.completions[0]?.difficulty ?? null,
  }));
}

export async function getRosterForTherapist(therapistId: string) {
  const patients = await db.patientProfile.findMany({
    where: { therapistId },
    include: {
      user: true,
      painLogs: { orderBy: { date: "desc" }, take: 8 },
    },
  });
  return patients.map((p) => {
    const pains = [...p.painLogs].reverse().map((l) => l.level);
    const painNow = p.painLogs[0]?.level ?? null;
    return {
      id: p.id,
      name: p.user.name,
      condition: p.condition,
      painNow,
      trend: pains,
    };
  });
}

export async function getClinicStats(clinicId: string) {
  const [patientCount, painLogs, completions] = await Promise.all([
    db.patientProfile.count({ where: { clinicId } }),
    db.painLog.findMany({ where: { patient: { clinicId } } }),
    db.exerciseCompletion.findMany({ where: { assignment: { patient: { clinicId } } } }),
  ]);
  const done = completions.filter((c) => c.status === "DONE").length;
  const adherence = completions.length
    ? Math.round((done / completions.length) * 100)
    : 0;
  return { patientCount, painLogCount: painLogs.length, adherence };
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
