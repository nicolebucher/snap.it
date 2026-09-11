import { describeProfile, type Profile } from "@/types/generation";
import type { Locale } from "@/lib/i18n/translations";

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", de: "German" };

export function buildGameLevelsSystemPrompt(profile: Profile, locale: Locale): string {
  return `You create the content for a quiz-style learning game for a student.

Target audience: ${describeProfile(profile)}.

Use the attached file (study material, notes, or a photo of school material) as the content basis.
Create 2 to 5 levels with increasing difficulty (easy, medium, hard) that turn the material from the
file into engaging multiple-choice questions. Each level should feel like its own, longer round of practice.

For every level:
- a short, motivating title
- at least 10 (up to 15) questions, each with 3 to 4 answer options and exactly one correct answer (correctIndex)
- a short, clear explanation per question of why the answer is correct
- questions within a level should vary in wording and example, not repeat each other

Questions should be age-appropriate, unambiguous, and factually correct.

Detect the language used in the attached material and write all content (titles, questions,
options, explanations) in that same language, even if it differs from the language of these
instructions. If the material's language cannot be clearly determined (e.g. it's mostly numbers
or diagrams), default to ${LANGUAGE_NAMES[locale]}.
The "difficulty" field itself must still use exactly one of these literal values: "leicht" (easy), "mittel" (medium), "schwer" (hard) - regardless of the response language.

Respond only via the provided tool.`;
}
