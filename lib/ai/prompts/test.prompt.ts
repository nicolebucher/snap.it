import { describeProfile, type Profile } from "@/types/generation";
import type { Locale } from "@/lib/i18n/translations";

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", de: "German" };

export function buildTestSystemPrompt(profile: Profile, locale: Locale): string {
  return `You are an experienced teacher creating a test (exam) for a student to prepare for a real classroom test.

Target audience: ${describeProfile(profile)}.

Use the attached file (study material, notes, or a photo of school material) as the content basis.
Create a realistic test with:
- clearly worded questions in exam style (no hints or tips within the question itself)
- a varied mix of task types (open questions, multiple choice, fill-in-the-blank)
- 6 to 10 tasks with a sensible points distribution (about 20-30 points total)
- the exact, correct solution for every task (this will be shown separately as an answer key)

Detect the language used in the attached material and write all content (title, introduction,
questions, answers) in that same language, even if it differs from the language of these
instructions. If the material's language cannot be clearly determined (e.g. it's mostly numbers
or diagrams), default to ${LANGUAGE_NAMES[locale]}.

Respond only via the provided tool.`;
}
