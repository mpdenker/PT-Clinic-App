"use client";

import { useState } from "react";
import { markExercise } from "@/app/patient/actions";

type Ex = {
  id: string;
  name: string;
  detail: string;
  whyItHelps: string;
  todayStatus: string | null;
  todayDifficulty: number | null;
};

function ExerciseRow({ ex }: { ex: Ex }) {
  const [open, setOpen] = useState(false);
  const [difficulty, setDifficulty] = useState(ex.todayDifficulty ?? 0);
  const done = ex.todayStatus === "DONE";
  const skipped = ex.todayStatus === "SKIPPED";

  async function submit(status: string) {
    const fd = new FormData();
    fd.set("assignmentId", ex.id);
    fd.set("status", status);
    if (difficulty) fd.set("difficulty", String(difficulty));
    await markExercise(fd);
  }

  return (
    <div className={`border-b border-neutral-100 py-3 last:border-0 ${done ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-medium">{ex.name}</div>
          <div className="text-sm text-neutral-500">{ex.detail}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1" aria-label="Difficulty">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDifficulty(n)}
                className={`h-7 w-7 rounded border text-xs ${
                  difficulty === n
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-neutral-300 text-neutral-500"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => submit("DONE")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              done ? "bg-green-100 text-green-800" : "bg-rose-500 text-white hover:bg-rose-600"
            }`}
          >
            {done ? "✓ Done" : "Mark done"}
          </button>
          <button
            type="button"
            onClick={() => submit("SKIPPED")}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600"
          >
            {skipped ? "Skipped" : "Skip"}
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-2 text-sm font-medium text-teal-700 hover:underline"
      >
        {open ? "Hide" : "Why this helps"}
      </button>
      {open && <p className="mt-1 text-sm text-neutral-600">{ex.whyItHelps}</p>}
    </div>
  );
}

export function ExerciseList({ exercises }: { exercises: Ex[] }) {
  return (
    <div>
      {exercises.map((ex) => (
        <ExerciseRow key={ex.id} ex={ex} />
      ))}
    </div>
  );
}
