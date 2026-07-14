export const dynamic = "force-dynamic";
import { Badge, Card, PageHeader, SetupNotice } from "@/components/ui";
import { getRosterForTherapist } from "@/lib/queries";
import { requireUser } from "@/lib/auth";

export default async function TherapistPage() {
  const user = await requireUser("THERAPIST");
  const therapist = user.therapistProfile;
  if (!therapist) return <SetupNotice />;

  const roster = await getRosterForTherapist(therapist.id);

  // Simple alert rule: pain rose over the last two readings.
  const withStatus = roster.map((p) => {
    const t = p.trend;
    const rising = t.length >= 2 && t[t.length - 1] - t[t.length - 2] >= 1.5;
    return { ...p, rising };
  });
  const needAttention = withStatus.filter((p) => p.rising);

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8">
      <PageHeader
        title={`Good morning, ${user.name.split(" ")[0]}`}
        sub={`${roster.length} active patients · ${needAttention.length} need attention`}
        logout
      />

      {needAttention.length > 0 && (
        <div className="mb-4 space-y-2">
          {needAttention.map((p) => (
            <Card key={p.id} className="border-l-4 border-l-red-400">
              <div className="flex items-center gap-2">
                <Badge tone="crit">Pain rising</Badge>
                <span className="font-medium">{p.name}</span>
              </div>
              <p className="mt-1 text-sm text-neutral-600">
                {p.condition} · pain now {p.painNow}/10, up from recent readings. Review the chart and check in.
              </p>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <h2 className="mb-3 font-semibold">Your patients</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="py-2 pr-4">Patient</th>
                <th className="py-2 pr-4">Condition</th>
                <th className="py-2 pr-4">Pain now</th>
                <th className="py-2 pr-4">Trend</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {withStatus.map((p) => (
                <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                  <td className="py-3 pr-4 font-medium">{p.name}</td>
                  <td className="py-3 pr-4 text-neutral-500">{p.condition}</td>
                  <td className="py-3 pr-4 tabular-nums">{p.painNow}/10</td>
                  <td className="py-3 pr-4"><Sparkline data={p.trend} /></td>
                  <td className="py-3">
                    {p.rising ? <Badge tone="crit">Pain rising</Badge> : <Badge tone="good">On track</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return <span className="text-neutral-400">—</span>;
  const w = 80, h = 24, min = Math.min(...data), max = Math.max(...data);
  const x = (i: number) => (i / (data.length - 1)) * w;
  const y = (v: number) => h - ((v - min) / (max - min || 1)) * h;
  const d = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path d={d} fill="none" stroke="#2a78d6" strokeWidth={1.5} />
    </svg>
  );
}
