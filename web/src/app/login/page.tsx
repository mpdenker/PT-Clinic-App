import { redirect } from "next/navigation";
import { getCurrentUser, homeFor } from "@/lib/auth";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect(homeFor(user.role));
  const { error } = await searchParams;

  const demoAccounts = [
    { label: "Sarah (patient)", email: "sarah@example.com" },
    { label: "James (therapist)", email: "james@riverside.example" },
    { label: "Clinic admin", email: "admin@riverside.example" },
  ];

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <div className="mb-2 text-sm font-medium uppercase tracking-widest text-teal-700">Stride</div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Sign in</h1>

      <Card>
        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Wrong email or password — try again.
          </p>
        )}
        <form method="POST" action="/api/login" className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email" name="email" type="email" required autoComplete="email"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input
              id="password" name="password" type="password" required autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
          >
            Sign in
          </button>
        </form>
      </Card>

      <Card className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
          Demo accounts (password: demo1234)
        </p>
        <div className="flex flex-col gap-2">
          {demoAccounts.map((a) => (
            <form key={a.email} method="POST" action="/api/login">
              <input type="hidden" name="email" value={a.email} />
              <input type="hidden" name="password" value="demo1234" />
              <button
                type="submit"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-left text-sm hover:border-teal-400"
              >
                Continue as <span className="font-medium">{a.label}</span>
              </button>
            </form>
          ))}
        </div>
      </Card>
    </main>
  );
}
