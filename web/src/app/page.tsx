import Link from "next/link";
import { db } from "@/lib/db";

export default async function Home() {
  // A stand-in for real login: pick whose view to open. Real authentication
  // (Supabase Auth, one account per person) is the next build step.
  const clinic = await db.clinic.findFirst().catch(() => null);

  const roles = [
    { href: "/patient", title: "Patient", who: "Sarah Mitchell", desc: "Log pain, do exercises, see progress" },
    { href: "/therapist", title: "Therapist", who: "James Okafor, PT", desc: "Monitor patients, spot alerts, assign exercises" },
    { href: "/clinic", title: "Clinic", who: clinic?.name ?? "Riverside PT", desc: "Outcomes and analytics across all patients" },
  ];

  return (
    <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-6 py-16">
      <div className="mb-2 text-sm font-medium uppercase tracking-widest text-teal-700">Stride</div>
      <h1 className="text-3xl font-semibold tracking-tight">Recovery, in view.</h1>
      <p className="mt-2 max-w-prose text-neutral-600">
        A working build of the patient progress platform. Choose a role to open its view — every
        screen below reads and writes real data from the database.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {roles.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-teal-400 hover:shadow"
          >
            <div className="text-lg font-semibold">{r.title}</div>
            <div className="text-sm text-teal-700">{r.who}</div>
            <p className="mt-2 text-sm text-neutral-500">{r.desc}</p>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-xs text-neutral-400">
        Demo data is fictional. Login, roles and HIPAA-grade security are upcoming build steps.
      </p>
    </main>
  );
}
