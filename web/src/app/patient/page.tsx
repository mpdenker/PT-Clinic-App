export const dynamic = "force-dynamic";
import { Card, PageHeader, StatTile } from "@/components/ui";
import { PainChart } from "@/components/PainChart";
import { CheckinForm } from "@/components/CheckinForm";
import { ExerciseList } from "@/components/ExerciseList";
import {
  getDemoPatient,
  getPainSeries,
  getRecoveryMetrics,
  getTodaysExercises,
} from "@/lib/queries";
import { db } from "@/lib/db";

export default async function PatientPage() {
  const { user, patient } = await getDemoPatient();
  const [metrics, pain, exercises, milestones, wearable] = await Promise.all([
    getRecoveryMetrics(patient.id),
    getPainSeries(patient.id),
    getTodaysExercises(patient.id),
    db.milestone.findMany({ where: { patientId: patient.id }, orderBy: { order: "asc" } }),
    db.wearableDaily.findMany({
      where: { patientId: patient.id },
      orderBy: { date: "desc" },
      take: 1,
    }),
  ]);

  const weeksSinceSurgery = patient.surgeryDate
    ? Math.floor((Date.now() - new Date(patient.surgeryDate).getTime()) / (7 * 864e5))
    : null;

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8">
      <PageHeader
        title={`Good morning, ${user.name.split(" ")[0]}`}
        sub={`${patient.condition} · ${weeksSinceSurgery !== null ? `Week ${weeksSinceSurgery} of ~${patient.planWeeks}` : ""}`}
        back
      />

      <Card className="mb-4">
        <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Recovery score
        </div>
        <div className="mt-1 text-5xl font-semibold tabular-nums">
          {metrics.score}
          <span className="text-xl font-normal text-neutral-400"> / 100</span>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-100">
          <div className="h-full rounded-full bg-rose-500" style={{ width: `${metrics.score}%` }} />
        </div>
        <p className="mt-2 text-sm text-neutral-500">
          Combines your pain, knee motion and exercise consistency into one number.
        </p>
      </Card>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Pain today" value={metrics.painToday ?? "—"} />
        <StatTile label="Day streak" value={metrics.streak} />
        <StatTile label="This week" value={`${metrics.adherencePct}%`} />
        <StatTile label="Knee bend" value={metrics.latestRom ? `${metrics.latestRom.value}${metrics.latestRom.unit}` : "—"} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-1 font-semibold">Daily check-in</h2>
          <p className="mb-3 text-sm text-neutral-500">How is your pain right now?</p>
          <CheckinForm defaultRegion="Right knee" />
        </Card>

        <Card>
          <h2 className="mb-1 font-semibold">Your pain is trending down</h2>
          <p className="mb-2 text-sm text-neutral-500">Daily check-ins, last 6 weeks</p>
          <PainChart data={pain} />
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-1 font-semibold">Today&apos;s exercises</h2>
        <p className="mb-2 text-sm text-neutral-500">
          Assigned by {patient.referringMD ? "your therapist" : "James"} — mark each done or skipped and rate how hard it felt.
        </p>
        <ExerciseList exercises={exercises} />
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-semibold">Milestones</h2>
          <ul className="space-y-2">
            {milestones.map((m) => (
              <li key={m.id} className="flex items-start gap-2 text-sm">
                <span className={m.achievedAt ? "text-green-600" : "text-neutral-300"}>
                  {m.achievedAt ? "✓" : "○"}
                </span>
                <span>
                  <span className={m.achievedAt ? "" : "text-neutral-500"}>{m.title}</span>
                  {m.detail && <span className="block text-xs text-neutral-400">{m.detail}</span>}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-1 font-semibold">From your devices</h2>
          <p className="mb-2 text-sm text-neutral-500">Apple Health · synced automatically</p>
          {wearable[0] ? (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><div className="text-xl font-semibold tabular-nums">{wearable[0].steps?.toLocaleString()}</div><div className="text-xs text-neutral-500">Steps</div></div>
              <div><div className="text-xl font-semibold tabular-nums">{wearable[0].activeMinutes}m</div><div className="text-xs text-neutral-500">Active</div></div>
              <div><div className="text-xl font-semibold tabular-nums">{Math.floor((wearable[0].sleepMinutes ?? 0) / 60)}h {(wearable[0].sleepMinutes ?? 0) % 60}m</div><div className="text-xs text-neutral-500">Sleep</div></div>
            </div>
          ) : (
            <p className="text-sm text-neutral-400">No device connected yet.</p>
          )}
        </Card>
      </div>
    </main>
  );
}
