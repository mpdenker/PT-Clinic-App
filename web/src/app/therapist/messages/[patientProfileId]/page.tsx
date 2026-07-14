export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, PageHeader, SetupNotice } from "@/components/ui";
import { Thread } from "@/components/Thread";
import { requireUser } from "@/lib/auth";
import { getThread, markThreadRead } from "@/lib/queries";
import { db } from "@/lib/db";

export default async function TherapistThreadPage({
  params,
}: {
  params: Promise<{ patientProfileId: string }>;
}) {
  const user = await requireUser("THERAPIST");
  if (!user.therapistProfile) return <SetupNotice />;
  const { patientProfileId } = await params;

  // Ownership: the patient must be on this therapist's roster.
  const patient = await db.patientProfile.findFirst({
    where: { id: patientProfileId, therapistId: user.therapistProfile.id },
    include: { user: true },
  });
  if (!patient) notFound();

  await markThreadRead(user.id, patient.user.id);
  const messages = await getThread(user.id, patient.user.id);

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      <PageHeader title={patient.user.name} sub={patient.condition} logout />
      <Link href="/therapist" className="mb-4 inline-block text-sm text-teal-700 hover:underline">
        ← Back to patients
      </Link>
      <Card>
        <Thread
          messages={messages}
          myUserId={user.id}
          back={`/therapist/messages/${patient.id}`}
          patientProfileId={patient.id}
        />
      </Card>
    </main>
  );
}
