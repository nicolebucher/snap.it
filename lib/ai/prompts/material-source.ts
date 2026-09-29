import type { Profile } from "@/types/generation";
import type { Locale } from "@/lib/i18n/translations";

const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", de: "German" };

// Ohne Upload tragen Fach + Notiz den Inhalt - die API stellt sicher, dass mindestens eins davon gesetzt ist.
export function describeTopic(profile: Profile): string {
  return [profile.subject && `subject "${profile.subject}"`, profile.notes && `the student's note "${profile.notes}"`]
    .filter(Boolean)
    .join(" and ");
}

/** Where the level should be inferred from when no school type/grade was given. */
export function levelSource(hasMaterial: boolean): string {
  return hasMaterial ? "the material (see instructions above)" : "the topic";
}

/** The paragraph telling the model what to base the content on. */
export function contentBasis(profile: Profile, hasMaterial: boolean): string {
  if (hasMaterial) {
    return `Use the attached material (one or more files: study material, notes, or photos of school material)
as the content basis. Handwritten or photographed material can contain spelling mistakes or
transcription artifacts - silently use the correct spelling/wording in your output rather than
reproducing an error, unless the error itself is the point of an exercise.`;
  }
  return `No material was uploaded. Base the content on the topic given by the student: ${describeTopic(profile)}.
Treat that as the curriculum topic to cover and draw on standard school-curriculum content for it at
the target level - core facts, rules, methods, and vocabulary a student would typically be taught
and tested on for this topic. Everything you write in place of "the material" below refers to this
topic. Stay strictly on this topic, and keep every fact correct.`;
}

/** The paragraph deciding which language the generated content is written in. */
export function contentLanguage(hasMaterial: boolean, locale: Locale, fields: string): string {
  if (hasMaterial) {
    return `Detect the language used in the attached material and write all content (${fields}) in that same
language, even if it differs from the language of these instructions. If the material's language
cannot be clearly determined (e.g. it's mostly numbers or diagrams), default to ${LANGUAGE_NAMES[locale]}.`;
  }
  return `Write all content (${fields}) in ${LANGUAGE_NAMES[locale]}, since there is no material to detect a
language from - unless the topic itself is learning a foreign language, in which case use that
language for the practiced content the way a school textbook would.`;
}
