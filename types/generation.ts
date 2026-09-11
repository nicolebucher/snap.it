import { z } from "zod";

export const schoolTypes = [
  "Grundschule",
  "Hauptschule",
  "Realschule",
  "Gesamtschule",
  "Gymnasium",
  "Berufsschule",
] as const;

export const outputFormats = ["worksheet", "test", "game"] as const;
export type OutputFormat = (typeof outputFormats)[number];

// Alle Profilangaben sind bewusst optional - das Lernmaterial im Upload trägt den
// eigentlichen Inhalt, Alter/Klasse/Schulart/Fach dienen nur der Feinabstimmung.
export const profileSchema = z.object({
  age: z.coerce.number().int().min(5).max(21).optional(),
  schoolType: z.enum(schoolTypes).optional(),
  grade: z.coerce.number().int().min(1).max(13).optional(),
  subject: z.string().trim().min(2).max(60).optional(),
});
export type Profile = z.infer<typeof profileSchema>;

// Nur für den (englischen) System-Prompt gedacht - beschreibt die Zielgruppe fürs Modell,
// unabhängig von der später gewählten Ausgabesprache des generierten Inhalts.
export function describeProfile(profile: Profile): string {
  const parts: string[] = [];
  if (profile.age !== undefined) parts.push(`${profile.age} years old`);
  if (profile.schoolType) parts.push(profile.schoolType);
  if (profile.grade !== undefined) parts.push(`grade ${profile.grade}`);
  if (profile.subject) parts.push(`subject: ${profile.subject}`);
  return parts.length > 0
    ? parts.join(", ")
    : "no specific target-audience details provided - choose a level that is broadly accessible for students";
}

// Nutzersichtbare Meta-Zeile auf dem PDF - hier zählt die UI-Sprache.
export function formatProfileMeta(profile: Profile, locale: "en" | "de"): string {
  const gradeLabel = locale === "de" ? "Klasse" : "Grade";
  return [profile.subject, profile.schoolType, profile.grade !== undefined ? `${gradeLabel} ${profile.grade}` : undefined]
    .filter((part): part is string => !!part)
    .join(" · ");
}

export const taskSchema = z.object({
  number: z.number(),
  question: z.string(),
  type: z.enum(["offen", "multiple-choice", "lueckentext"]),
  options: z.array(z.string()).optional(),
  points: z.number(),
  answer: z.string(),
});
export type Task = z.infer<typeof taskSchema>;

// Arbeitsblatt: bewusst umfangreich (mind. 3 PDF-Seiten gewünscht).
export const worksheetSchema = z.object({
  title: z.string(),
  introduction: z.string(),
  tasks: z.array(taskSchema).min(16).max(24),
});
export type WorksheetData = z.infer<typeof worksheetSchema>;

// Testarbeit bleibt in realistischer Klassenarbeits-Länge (separates Schema, gleiche Form).
export const testSchema = z.object({
  title: z.string(),
  introduction: z.string(),
  tasks: z.array(taskSchema).min(6).max(10),
});

export const questionSchema = z.object({
  prompt: z.string(),
  options: z.array(z.string()).min(2).max(5),
  correctIndex: z.number().int().min(0),
  explanation: z.string(),
});
export type Question = z.infer<typeof questionSchema>;

// Level bewusst länger (mind. 10 Aufgaben je Level).
export const levelSchema = z.object({
  id: z.number(),
  title: z.string(),
  difficulty: z.enum(["leicht", "mittel", "schwer"]),
  questions: z.array(questionSchema).min(10).max(15),
});
export type Level = z.infer<typeof levelSchema>;

export const gameSchema = z.object({
  gameTitle: z.string(),
  subject: z.string(),
  levels: z.array(levelSchema).min(2).max(5),
});
export type GameData = z.infer<typeof gameSchema>;
