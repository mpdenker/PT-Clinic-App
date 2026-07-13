"use client";

import { useState } from "react";
import { saveCheckin } from "@/app/patient/actions";

const REGIONS = [
  "Head", "Neck", "Right shoulder", "Left shoulder", "Lower back",
  "Right hip", "Left hip", "Right knee", "Left knee", "Right ankle", "Left ankle",
];
const WORDS = ["No pain", "Barely there", "Mild", "Mild", "Moderate", "Moderate", "Strong", "Strong", "Severe", "Very severe", "Worst"];

export function CheckinForm({ defaultRegion = "Right knee" }: { defaultRegion?: string }) {
  const [level, setLevel] = useState(3);
  const [region, setRegion] = useState(defaultRegion);
  const [saved, setSaved] = useState(false);

  return (
    <form
      action={async (fd) => {
        await saveCheckin(fd);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }}
    >
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-semibold tabular-nums">{level}</span>
        <span className="text-sm text-neutral-500">{WORDS[level]}</span>
      </div>
      <input
        type="range" name="level" min={0} max={10} value={level}
        onChange={(e) => setLevel(Number(e.target.value))}
        className="mt-3 w-full accent-rose-500"
        aria-label="Pain from 0 to 10"
      />
      <div className="flex justify-between text-xs text-neutral-400">
        <span>0 · no pain</span><span>10 · worst</span>
      </div>

      <label className="mt-4 block text-sm font-medium">Where does it hurt?</label>
      <select
        name="bodyRegion" value={region}
        onChange={(e) => setRegion(e.target.value)}
        className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
      >
        {REGIONS.map((r) => <option key={r}>{r}</option>)}
      </select>

      <button
        type="submit"
        className="mt-4 w-full rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-600"
      >
        {saved ? "Saved ✓" : "Save today's check-in"}
      </button>
    </form>
  );
}
