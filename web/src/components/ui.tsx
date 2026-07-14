import Link from "next/link";
import { ReactNode } from "react";

// Plain, functional building blocks. Visual polish (the dark "Stride" design
// from the prototype) is applied as the final phase — for now these are clean
// and readable so we can focus on behavior.

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-neutral-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function StatTile({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <Card className="text-center">
      <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-xs text-neutral-500">{sub}</div>}
    </Card>
  );
}

export function PageHeader({ title, sub, back }: { title: string; sub?: string; back?: boolean }) {
  return (
    <header className="mb-6">
      {back && (
        <Link href="/" className="text-sm text-teal-700 hover:underline">
          ← Switch role
        </Link>
      )}
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
      {sub && <p className="text-sm text-neutral-500">{sub}</p>}
    </header>
  );
}

export function SetupNotice() {
  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col justify-center px-6 py-16">
      <Card>
        <div className="text-xs font-medium uppercase tracking-widest text-teal-700">Stride</div>
        <h1 className="mt-1 text-xl font-semibold">Almost there — the cloud database isn&apos;t connected yet</h1>
        <p className="mt-2 text-sm text-neutral-600">
          The app deployed successfully, but it has no database to read from in this
          environment. This is the expected next setup step: create a Postgres database
          in the Vercel dashboard (Storage tab) and redeploy. Demo data loads automatically
          after that.
        </p>
      </Card>
    </main>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "warn" | "crit" }) {
  const tones = {
    neutral: "bg-neutral-100 text-neutral-700",
    good: "bg-green-100 text-green-800",
    warn: "bg-amber-100 text-amber-800",
    crit: "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
