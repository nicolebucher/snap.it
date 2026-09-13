import { describeProfile, type Profile } from "@/types/generation";
import type { Locale } from "@/lib/i18n/translations";

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", de: "German" };

export function buildSpellingDiagnosticSystemPrompt(profile: Profile, locale: Locale, hasMaterial: boolean): string {
  const wordSourceInstructions = hasMaterial
    ? `Use the attached material (one or more files: study material, notes, or photos of school
material) to pick 10 to 15 words worth testing: words that actually appear in or relate to the
material and that are genuinely easy to misspell at this level (e.g. words with double
consonants, tricky vowel combinations, silent letters, commonly confused homophones, or
irregular forms) - not trivially easy words everyone already spells correctly.`
    : `No material was uploaded, so pick 10 to 15 words yourself: general vocabulary that is
genuinely easy to misspell at this level (e.g. words with double consonants, tricky vowel
combinations, silent letters, commonly confused homophones, or irregular forms) - not trivially
easy words everyone already spells correctly. If a subject was given, draw the words from that
subject's own vocabulary; otherwise use everyday general-purpose vocabulary appropriate for the
target audience.`;

  return `You create a short spelling diagnostic to find out which words a student struggles to
spell correctly.

Target audience: ${describeProfile(profile)}.
Calibrate difficulty precisely to this target audience. If a school type and/or grade were given,
match them exactly${
    hasMaterial
      ? "; otherwise infer the right level yourself from the material"
      : ' - if neither was given either, and the description above says to estimate from "the material," ignore that (there is none here) and instead pick a reasonably broad general-education level for the subject given, or general everyday vocabulary if no subject was given'
  } - never default to a generic/all-ages level.

${wordSourceInstructions}

For each word, write one natural sentence that uses it in context, with the word itself replaced
by a single blank "___". This tests whether the student can correctly SPELL a word they already
know - not whether they can guess which word is meant - so every item needs an explicit "hint"
on top of the sentence:
- "hint" must, by itself, make the intended word unambiguous: a short synonym, a brief
  definition/description, or (if this is foreign-vocabulary practice) the word's translation into
  the student's other language - never the word itself, a near-spelling of it, or its first
  letter(s)
- the sentence should still use the word naturally in context, but the student must be able to
  identify the exact word from "hint" alone, without needing to guess from the sentence
- "correctSpelling" must be exactly the word/phrase that belongs in the blank, correctly spelled,
  matching the capitalization it would have in that sentence
- vary the sentences so the same word or context isn't repeated

${
  hasMaterial
    ? `Detect the language used in the attached material and write the title and every sentence in
that same language, even if it differs from the language of these instructions - the whole point
is to test spelling IN that language, not another one. If the material's language cannot be
clearly determined, default to ${LANGUAGE_NAMES[locale]}.`
    : `Write the title and every sentence in ${LANGUAGE_NAMES[locale]}, since there is no material
to detect a language from.`
}

Language consistency is critical: mixing two languages within the response - even a single stray
word or one item's sentence ending up in a different language than the rest - is a serious
failure, not a minor slip (the "hint" field is the one exception when it is itself a translation
into another language, by design). Before finalizing, re-read the title and every sentence end to
end and confirm they all use that one same language throughout.

Respond only via the provided tool.`;
}
