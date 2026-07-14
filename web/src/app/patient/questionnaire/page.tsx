export const dynamic = "force-dynamic";
import Link from "next/link";
import { Card, PageHeader, SetupNotice } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getQuestionnaireHistory } from "@/lib/queries";
import { INSTRUMENT, QUESTIONS, OPTIONS } from "@/lib/questionnaire";

export default async function QuestionnairePage({
  searchParams,
}: {
  searchParams: Promise<{ done?: string; error?: string }>;
}) {
  const user = await requireUser("PATIENT");
  if (!user.patientProfile) return <SetupNotice />;
  const { done, error } = await searchParams;

  const history = await getQuestionnaireHistory(user.patientProfile.id);
  const latest = history[0];
  const previous = history[1];
  const delta = latest && previous ? Math.round(latest.score - previous.score) : null;

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8">
      <PageHeader
        title="Knee outcome survey"
        sub={`${INSTRUMENT} · standard questions your physician and insurance recognize`}
        logout
      />
      <Link href="/patient" className="mb-4 inline-block text-sm text-teal-700 hover:underline">
        ← Back to dashboard
      </Link>

      {done && latest && (
        <Card className="mb-4 border-green-200 bg-green-50">
          <p className="text-sm text-green-900">
            <span className="font-semibold">Submitted — your score: {Math.round(latest.score)}/100.</span>
            {delta !== null && (
              <> {delta >= 0 ? `Up ${delta}` : `Down ${Math.abs(delta)}`} points since last time.</>
            )}{" "}
            This goes on your chart and into reports for your physician.
          </p>
        </Card>
      )}
      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-800">Please answer every question, then submit.</p>
        </Card>
      )}

      <Card>
        <form method="POST" action="/api/questionnaire">
          {QUESTIONS.map((q, qi) => (
            <fieldset key={q.id} className="mb-5">
              <legend className="mb-2 text-sm font-medium">{qi + 1}. {q.text}</legend>
              <div className="flex flex-wrap gap-2">
                {OPTIONS.map((label, vi) => (
                  <label
                    key={vi}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm has-checked:border-teal-600 has-checked:bg-teal-50"
                  >
                    <input type="radio" name={q.id} value={vi} required className="accent-teal-700" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <button className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800">
            Submit questionnaire
          </button>
        </form>
      </Card>

      {history.length > 0 && (
        <Card className="mt-4">
          <h2 className="mb-2 font-semibold">Your scores over time</h2>
          <ul className="space-y-1">
            {history.map((h) => (
              <li key={h.id} className="flex justify-between text-sm">
                <span className="text-neutral-500">
                  {new Date(h.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="font-medium tabular-nums">{Math.round(h.score)}/100</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </main>
  );
}
