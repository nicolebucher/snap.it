import { describeProfile, type Profile, type SpellingItem } from "@/types/generation";
import type { Locale } from "@/lib/i18n/translations";

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", de: "German" };

export function buildSpellingFollowupSystemPrompt(
  profile: Profile,
  locale: Locale,
  missedItems: SpellingItem[]
): string {
  const missedList = missedItems
    .map((item) => `- "${item.sentence.replace("___", item.correctSpelling)}" (correct spelling: "${item.correctSpelling}")`)
    .join("\n");

  return `A student just took a short spelling diagnostic and got these items wrong:
${missedList}

You now build a worksheet that specifically drills exactly these words and the underlying
spelling pattern each one represents (e.g. if they missed a double-consonant word, include more
words with the same double-consonant pattern; if they missed a homophone, include more of that
same homophone pair) - this worksheet exists to fix these specific gaps, not to cover the topic
in general.

Target audience: ${describeProfile(profile)}.
Calibrate difficulty precisely to this target audience. If a school type and/or grade were given,
match them exactly; otherwise infer the right level yourself - never default to a generic/all-ages
level.

If material is attached, you may use it for topical flavor/context, but the missed words above are
what this worksheet must actually drill - do not drift away from them onto unrelated content.
Build a focused practice worksheet with 16 to 24 tasks:
- a genuinely varied mix of task types, using ALL of these where they fit the missed words:
  - "lueckentext": a sentence (reuse or closely vary the missed sentences, plus new ones with the
    same pattern) with a "___" gap for the tricky word
  - "unterstreichen": a sentence containing a small set of candidate spellings in "options" (the
    correct one plus 2-4 plausible near-miss misspellings of the SAME word), the student
    underlines the correctly spelled one (do NOT format this as a multiple-choice list)
  - "multiple-choice": "options" (3-5 choices) are different spellings of the same word, exactly
    one correct
  - "offen": a short free-recall prompt (e.g. "Write the correct spelling of the word meaning ...")
- for "unterstreichen"/"multiple-choice", the wrong options must be plausible, realistic
  misspellings of that exact word (the kind of mistake this student or a peer might actually make)
  - not random unrelated words
- "answer" must be an exact, verbatim copy of the correct spelling for every task
- a short, encouraging introduction (2-3 sentences) that names this as targeted practice based on
  the diagnostic, without being discouraging about the mistakes

Detect the language used in the missed words/sentences above and write all content in that same
language, even if it differs from the language of these instructions - the whole point is to
practice spelling IN that language. If it cannot be clearly determined, default to
${LANGUAGE_NAMES[locale]}.

Language consistency is critical: mixing two languages in one response - even a single stray
word, an option, or the "labels" object ending up in a different language than everything else -
is a serious failure, not a minor slip. Before finalizing, re-read the ENTIRE response end to end
(introduction, every task's question/options/answer, and labels) and confirm every single field
uses that one same language throughout.

Also return a "labels" object with these words translated into that SAME content language (used
as printed headings on the worksheet): task (e.g. "Task"), points (e.g. "points"), totalPoints
(e.g. "points total"), solutions (e.g. "Solutions"), name (e.g. "Name"), date (e.g. "Date"), grade
(e.g. "Grade" - the word for a school grade/year level).

Respond only via the provided tool.`;
}
