import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { randomBytes, scryptSync } from "crypto";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const db = new PrismaClient({ adapter });

// Same format as src/lib/auth.ts hashPassword (salt:hash).
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
// Every demo account logs in with this password.
const DEMO_PASSWORD_HASH = hashPassword("demo1234");

const DAY = 24 * 60 * 60 * 1000;
// Anchor everything to a fixed "today" so the demo is stable and reproducible.
const TODAY = new Date("2026-07-13T09:00:00Z");
const daysAgo = (n: number) => new Date(TODAY.getTime() - n * DAY);

async function main() {
  // Wipe (dev only) so the seed is idempotent.
  await db.$transaction([
    db.exerciseCompletion.deleteMany(),
    db.exerciseAssignment.deleteMany(),
    db.exercise.deleteMany(),
    db.painLog.deleteMany(),
    db.symptomLog.deleteMany(),
    db.measurement.deleteMany(),
    db.milestone.deleteMany(),
    db.message.deleteMany(),
    db.appointment.deleteMany(),
    db.questionnaireResponse.deleteMany(),
    db.wearableDaily.deleteMany(),
    db.wearableConnection.deleteMany(),
    db.patientProfile.deleteMany(),
    db.therapistProfile.deleteMany(),
    db.user.deleteMany(),
    db.clinic.deleteMany(),
  ]);

  const clinic = await db.clinic.create({
    data: { name: "Riverside Physical Therapy" },
  });

  // --- Therapist ---
  const james = await db.user.create({
    data: {
      email: "james@riverside.example",
      name: "James Okafor",
      role: "THERAPIST",
      passwordHash: DEMO_PASSWORD_HASH,
      clinicId: clinic.id,
      therapistProfile: { create: { title: "PT, DPT", licenseNo: "PT-48211" } },
    },
    include: { therapistProfile: true },
  });
  const therapistId = james.therapistProfile!.id;

  // --- Clinic admin ---
  await db.user.create({
    data: {
      email: "admin@riverside.example",
      name: "Riverside Admin",
      role: "CLINIC_ADMIN",
      passwordHash: DEMO_PASSWORD_HASH,
      clinicId: clinic.id,
    },
  });

  // --- Exercise library ---
  const exDefs = [
    {
      name: "Quad sets",
      description: "3 sets × 10 · hold 5 sec",
      muscles: "quads",
      whyItHelps:
        "Your quadriceps switched off after surgery to protect the knee. This wakes it back up — it keeps your kneecap tracking straight and your new ligament protected.",
    },
    {
      name: "Straight-leg raises",
      description: "3 sets × 12",
      muscles: "quads,hipflex",
      whyItHelps:
        "Builds quad and hip-flexor strength without bending the knee, so you gain protection for the new ACL with zero strain on it.",
    },
    {
      name: "Hamstring curls",
      description: "3 sets × 10 each leg",
      muscles: "hams",
      whyItHelps:
        "Your hamstrings are the ACL's best friend — they pull the shin backward, directly taking load off the reconstructed ligament with every step.",
    },
    {
      name: "Heel raises",
      description: "3 sets × 15",
      muscles: "calf",
      whyItHelps:
        "Your calf stabilizes the knee from below and powers push-off. Strong calves mean a steadier landing when you get back to jogging.",
    },
  ];
  const exercises = [];
  for (const e of exDefs) {
    exercises.push(
      await db.exercise.create({ data: { ...e, clinicId: clinic.id } }),
    );
  }

  // --- Primary patient: Sarah ---
  const sarah = await db.user.create({
    data: {
      email: "sarah@example.com",
      name: "Sarah Mitchell",
      role: "PATIENT",
      passwordHash: DEMO_PASSWORD_HASH,
      clinicId: clinic.id,
      patientProfile: {
        create: {
          clinicId: clinic.id,
          therapistId,
          condition: "ACL reconstruction (right)",
          bodyRegion: "knee",
          surgeryDate: new Date("2026-05-31T00:00:00Z"),
          planWeeks: 24,
          referringMD: "Dr. Anita Patel",
        },
      },
    },
    include: { patientProfile: true },
  });
  const sarahId = sarah.patientProfile!.id;

  // Pain logs: 42 days trending down (mirrors the prototype curve).
  const painRows = [];
  for (let d = 41; d >= 0; d--) {
    const idx = 41 - d;
    let v =
      8.1 - idx * 0.117 + Math.sin(idx * 0.9) * 0.55 + Math.sin(idx * 2.63) * 0.35;
    if (idx > 38) v -= 0.15;
    const level = Math.max(1, Math.min(9, Math.round(v)));
    painRows.push({
      patientId: sarahId,
      date: daysAgo(d),
      level,
      bodyRegion: "Right knee",
    });
  }
  await db.painLog.createMany({ data: painRows });

  // Measurements: knee flexion (ROM) + quad strength progression.
  const romVals = [
    [41, 62],
    [37, 74],
    [30, 85],
    [23, 95],
    [16, 104],
    [9, 112],
    [3, 118],
  ] as const;
  for (const [ago, val] of romVals) {
    await db.measurement.create({
      data: {
        patientId: sarahId,
        therapistId,
        date: daysAgo(ago),
        kind: "ROM",
        label: "Knee flexion",
        value: val,
        unit: "°",
      },
    });
  }
  const strengthVals = [
    [41, 2, "Post-op baseline"],
    [23, 3, "Swelling down"],
    [12, 3.5, "Off crutches"],
    [3, 4, "Started balance work"],
  ] as const;
  for (const [ago, val, note] of strengthVals) {
    await db.measurement.create({
      data: {
        patientId: sarahId,
        therapistId,
        date: daysAgo(ago as number),
        kind: "STRENGTH",
        label: "Quad strength",
        value: val as number,
        unit: "/5",
        note: note as string,
      },
    });
  }

  // Milestones.
  const milestones = [
    ["Surgery — ACL reconstruction", "May 31", 0, daysAgo(43)],
    ["Bend knee to 90°", "Week 2", 1, daysAgo(30)],
    ["Walk without crutches", "Week 4", 2, daysAgo(16)],
    ["Bend knee to 120°", "Almost there — 118° now", 3, null],
    ["Jog on a treadmill", "Expected around week 12", 4, null],
    ["Return to soccer", "Expected around week 24", 5, null],
  ] as const;
  for (const [title, detail, order, achievedAt] of milestones) {
    await db.milestone.create({
      data: {
        patientId: sarahId,
        title: title as string,
        detail: detail as string,
        order: order as number,
        achievedAt: achievedAt as Date | null,
      },
    });
  }

  // Home program: assign all four exercises, with recent completions.
  for (const ex of exercises) {
    const assignment = await db.exerciseAssignment.create({
      data: {
        patientId: sarahId,
        exerciseId: ex.id,
        therapistId,
        sets: 3,
        reps: ex.description.includes("each leg") ? "10 each leg" : "10",
      },
    });
    // 11-day completion streak.
    for (let d = 11; d >= 1; d--) {
      await db.exerciseCompletion.create({
        data: {
          assignmentId: assignment.id,
          date: daysAgo(d),
          status: "DONE",
          difficulty: ex.name === "Hamstring curls" ? 4 : 2,
        },
      });
    }
  }

  // Messages between James and Sarah.
  const thread = [
    [james.id, sarah.id, "Great week, Sarah — your pain trend looks excellent and 118° of bend is ahead of schedule.", 4],
    [james.id, sarah.id, "I noticed you rated hamstring curls 4/5 difficulty twice. Want me to drop them to 2 sets for a few days?", 4],
    [sarah.id, james.id, "Yes please! They burn a lot by set 3.", 3],
    [james.id, sarah.id, "Done — updated your plan. Also added a short video showing an easier setup.", 2],
  ] as const;
  for (const [from, to, body, ago] of thread) {
    await db.message.create({
      data: {
        fromUserId: from as string,
        toUserId: to as string,
        body: body as string,
        sentAt: daysAgo(ago as number),
      },
    });
  }

  // Next appointment.
  await db.appointment.create({
    data: {
      patientId: sarahId,
      therapistId,
      startsAt: new Date("2026-07-15T14:30:00Z"),
      note: "Progress check + balance progression",
    },
  });

  // Questionnaire (KOOS-JR knee outcome).
  await db.questionnaireResponse.create({
    data: {
      patientId: sarahId,
      instrument: "KOOS-JR",
      date: daysAgo(2),
      score: 61,
      answersJson: JSON.stringify({ walking: 1, painFrequency: 2, stairs: 1 }),
    },
  });

  // Wearable: Apple Health + 7 days of steps/sleep.
  await db.wearableConnection.create({
    data: {
      patientId: sarahId,
      provider: "APPLE_HEALTH",
      lastSyncAt: TODAY,
    },
  });
  const steps = [3216, 3894, 4402, 4127, 5093, 5511, 5842];
  for (let i = 0; i < 7; i++) {
    await db.wearableDaily.create({
      data: {
        patientId: sarahId,
        date: daysAgo(6 - i),
        steps: steps[i],
        activeMinutes: 20 + i * 2,
        sleepMinutes: 410 + i * 5,
      },
    });
  }

  // --- Roster patients (lighter data for the therapist dashboard) ---
  const roster = [
    { name: "Marcus Webb", email: "marcus@example.com", condition: "Rotator cuff repair", region: "shoulder", weeksAgo: 3, pains: [5.2, 5.5, 5.0, 4.8, 4.7, 6.8] },
    { name: "Linda Tran", email: "linda@example.com", condition: "Total knee replacement", region: "knee", weeksAgo: 9, pains: [6.5, 6.0, 5.4, 4.9, 4.4, 4.2] },
    { name: "Devon Price", email: "devon@example.com", condition: "Lumbar strain", region: "back", weeksAgo: 2, pains: [7.2, 6.9, 6.5, 6.2, 5.8, 5.5] },
    { name: "Robert Chen", email: "robert@example.com", condition: "Hip replacement", region: "hip", weeksAgo: 7, pains: [6.8, 6.1, 5.5, 4.9, 4.2, 3.8] },
    { name: "Aisha Karim", email: "aisha@example.com", condition: "Achilles repair", region: "ankle", weeksAgo: 12, pains: [5.0, 4.4, 3.8, 3.1, 2.5, 2.0] },
  ];
  for (const r of roster) {
    const u = await db.user.create({
      data: {
        email: r.email,
        name: r.name,
        role: "PATIENT",
        passwordHash: DEMO_PASSWORD_HASH,
        clinicId: clinic.id,
        patientProfile: {
          create: {
            clinicId: clinic.id,
            therapistId,
            condition: r.condition,
            bodyRegion: r.region,
            surgeryDate: daysAgo(r.weeksAgo * 7),
          },
        },
      },
      include: { patientProfile: true },
    });
    const pid = u.patientProfile!.id;
    if (r.name === "Marcus Webb") {
      await db.symptomLog.create({
        data: {
          patientId: pid,
          date: daysAgo(1),
          kind: "WORSE",
          description: "Sharp pain when reaching overhead, worse since the new band exercises",
        },
      });
    }
    // 6 weekly pain points.
    for (let w = 0; w < r.pains.length; w++) {
      await db.painLog.create({
        data: {
          patientId: pid,
          date: daysAgo((r.pains.length - 1 - w) * 7),
          level: Math.round(r.pains[w]),
          bodyRegion: r.condition,
        },
      });
    }
  }

  const counts = {
    clinics: await db.clinic.count(),
    users: await db.user.count(),
    painLogs: await db.painLog.count(),
    exercises: await db.exercise.count(),
    measurements: await db.measurement.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
