export const dynamic = "force-dynamic";
import { Card, PageHeader, StatTile } from "@/components/ui";
import { getClinicStats } from "@/lib/queries";
import { db } from "@/lib/db";

export default async function ClinicPage() {
  const clinic = await db.clinic.findFirst();
  if (!clinic) return <main className="p-8">No clinic seeded.</main>;

  const stats = await getClinicStats(clinic.id);

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8">
      <PageHeader title={clinic.name} sub="Clinic overview · all patients" back />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Active patients" value={stats.patientCount} />
        <StatTile label="Check-ins logged" value={stats.painLogCount} />
        <StatTile label="Home-exercise adherence" value={`${stats.adherence}%`} />
      </div>

      <Card className="mt-4">
        <h2 className="mb-1 font-semibold">Marketing-ready outcomes</h2>
        <p className="text-sm text-neutral-500">
          Aggregate, de-identified numbers safe to publish. Charts for recovery timelines and
          outcome trends arrive with the analytics build step.
        </p>
      </Card>
    </main>
  );
}
