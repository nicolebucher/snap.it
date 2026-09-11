import { describeProfile, type Profile } from "@/types/generation";
import type { Locale } from "@/lib/i18n/translations";

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", de: "German" };

export function buildSpellingDiagnosticSystemPrompt(profile: Profile, locale: Locale): string {
  return `You create a short spelling diagnostic to find out which words a student struggles to
spell correctly.

Target audience: ${describeProfile(profile)}.
Calibrate difficulty precisely to this target audience. If a school type and/or grade were given,
match them exactly; otherwise infer the right level yourself from the material - never default to
a generic/all-ages level.

Use the attached material (one or more files: study material, notes, or photos of school material)
to pick 10 to 15 words worth testing: words that actually appear in or relate to the material and
that are genuinely easy to misspell at this level (e.g. words with double consonants, tricky
vowel combinations, silent letters, commonly confused homophones, or irregular forms) - not
trivially easy words everyone already spells correctly.

For each word, write one natural sentence that uses it in context, with the word itself replaced
by a single blank "___". The student will type the missing word from memory, so:
- the sentence must make the intended word obvious from context and grammar (so there is exactly
  one sensible correct answer), without spelling it out anywhere else in the sentence
- "correctSpelling" must be exactly the word/phrase that belongs in the blank, correctly spelled,
  matching the capitalization it would have in that sentence
- vary the sentences so the same word or context isn't repeated

Detect the language used in the attached material and write the title and every sentence in that
same language, even if it differs from the language of these instructions - the whole point is to
test spelling IN that language, not another one. If the material's language cannot be clearly
determined, default to ${LANGUAGE_NAMES[locale]}.

Respond only via the provided tool.`;
}
