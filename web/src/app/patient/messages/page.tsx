export const dynamic = "force-dynamic";
import Link from "next/link";
import { Card, PageHeader, SetupNotice } from "@/components/ui";
import { Thread } from "@/components/Thread";
import { requireUser } from "@/lib/auth";
import { getThread, markThreadRead } from "@/lib/queries";
import { db } from "@/lib/db";

export default async function PatientMessagesPage() {
  const user = await requireUser("PATIENT");
  if (!user.patientProfile) return <SetupNotice />;

  const patient = await db.patientProfile.findUnique({
    where: { id: user.patientProfile.id },
    include: { therapist: { include: { user: true } } },
  });
  const therapistUser = patient?.therapist?.user;

  if (!therapistUser) {
    return (
      <main className="mx-auto w-full max-w-2xl px-5 py-8">
        <PageHeader title="Messages" logout />
        <Card>
          <p className="text-sm text-neutral-500">
            You don&apos;t have a therapist assigned yet. Your clinic will connect you at your
            first appointment.
          </p>
        </Card>
      </main>
    );
  }

  // Opening the thread marks their messages to me as read.
  await markThreadRead(user.id, therapistUser.id);
  const messages = await getThread(user.id, therapistUser.id);

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      <PageHeader
        title={`${therapistUser.name}, ${patient?.therapist?.title ?? "PT"}`}
        sub="Your therapist"
        logout
      />
      <Link href="/patient" className="mb-4 inline-block text-sm text-teal-700 hover:underline">
        ← Back to dashboard
      </Link>
      <Card>
        <Thread messages={messages} myUserId={user.id} back="/patient/messages" />
      </Card>
    </main>
  );
}
