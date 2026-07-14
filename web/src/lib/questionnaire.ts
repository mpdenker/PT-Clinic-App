// KOOS-JR-style knee outcome survey (simplified for the demo — the production
// version uses the licensed instrument text verbatim).
// Each answer scores 0 (best) to 4 (worst); total converts to 0–100 where
// higher = better function.

export const INSTRUMENT = "KOOS-JR";

export const QUESTIONS = [
  { id: "q0", text: "How much does your knee affect standing upright?" },
  { id: "q1", text: "How severe is your pain walking on a flat surface?" },
  { id: "q2", text: "How severe is your pain going up or down stairs?" },
  { id: "q3", text: "How much difficulty do you have rising from sitting?" },
  { id: "q4", text: "How much difficulty do you have twisting or pivoting on your knee?" },
] as const;

export const OPTIONS = ["None", "Mild", "Moderate", "Severe", "Extreme"] as const;

export function scoreAnswers(answers: number[]): number {
  const max = QUESTIONS.length * (OPTIONS.length - 1);
  const raw = answers.reduce((a, b) => a + b, 0);
  return Math.round(100 * (1 - raw / max));
}
