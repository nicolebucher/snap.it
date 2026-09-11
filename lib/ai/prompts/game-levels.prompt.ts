import { describeProfile, type Profile } from "@/types/generation";
import type { Locale } from "@/lib/i18n/translations";

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", de: "German" };

export function buildGameLevelsSystemPrompt(profile: Profile, locale: Locale): string {
  return `You create the content for a quiz-style learning game for a student.

Target audience: ${describeProfile(profile)}.
Calibrate difficulty, vocabulary and complexity precisely to this target audience. If a school
type and/or grade were given, match them exactly; otherwise infer the right level yourself from
the material (see instructions above) - never default to a generic/all-ages level.

Use the attached material (one or more files: study material, notes, or photos of school material)
as the content basis. Handwritten or photographed material can contain spelling mistakes or
transcription artifacts - silently use the correct spelling/wording in your output rather than
reproducing an error, unless the error itself is the point of a question.
Create 2 to 5 levels that turn the material into engaging multiple-choice
questions. Levels are NOT a strict linear progression the student must unlock in order - the
player can jump into any level directly. Instead, each level should represent a distinct
sub-topic, chapter, or skill/question type found in the material (e.g. different chapters,
vocabulary vs. grammar, theory vs. application) so a student can pick exactly what they want to
practice. Give each level the "difficulty" that naturally fits its own content (it does not need
to increase from level to level).

For every level:
- a short, motivating title that names the specific sub-topic/category it covers
- at least 10 (up to 15) questions, each with 3 to 4 answer options and exactly one correct answer (correctIndex)
- a short, clear explanation per question of why the answer is correct
- questions within a level should vary in wording and example, not repeat each other

Questions should be age-appropriate, unambiguous, and factually correct. A wrong or mismatched
answer key (a "correctIndex" that isn't truly the correct option) is a serious failure - before
finalizing each question, re-read it together with the option at "correctIndex" and verify they
actually match. When several questions in a level test the same vocabulary/word list, phrase all
of them using ONE consistent question template (e.g. always "What does '___' mean?" with
translations as the options, or always the same translation direction) - do not mix different
framings for the same vocabulary set, since that produces items where more than one option could
defensibly be "correct".

Detect the language used in the attached material and write all content (titles, questions,
options, explanations) in that same language, even if it differs from the language of these
instructions. If the material's language cannot be clearly determined (e.g. it's mostly numbers
or diagrams), default to ${LANGUAGE_NAMES[locale]}.
The "difficulty" field itself must still use exactly one of these literal values: "leicht" (easy), "mittel" (medium), "schwer" (hard) - regardless of the response language.

Respond only via the provided tool.`;
}
