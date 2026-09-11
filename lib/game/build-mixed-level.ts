import type { Level, Question } from "@/types/generation";

export const MIXED_LEVEL_ID = -1;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Baut aus allen echten Leveln einen zusätzlichen, rein clientseitigen "Mixed"-Level
 * (kein weiterer KI-Call nötig): ein paar Fragen aus jeder Kategorie, gemischt.
 */
export function buildMixedLevel(levels: Level[], title: string): Level | null {
  if (levels.length < 2) return null;

  const perLevel = Math.max(5, Math.ceil(15 / levels.length));
  const pooled: Question[] = levels.flatMap((level) => shuffle(level.questions).slice(0, perLevel));
  if (pooled.length < 10) return null;

  return {
    id: MIXED_LEVEL_ID,
    title,
    difficulty: "mittel",
    questions: shuffle(pooled).slice(0, 15),
  };
}
