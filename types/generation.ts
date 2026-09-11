import { z } from "zod";

export const schoolTypes = [
  "Grundschule",
  "Hauptschule",
  "Realschule",
  "Gesamtschule",
  "Gymnasium",
  "Berufsschule",
] as const;

export const outputFormats = ["worksheet", "test", "game", "podcast", "spelling"] as const;
export type OutputFormat = (typeof outputFormats)[number];

// Alle Profilangaben sind bewusst optional - das Lernmaterial im Upload trägt den
// eigentlichen Inhalt, Alter/Klasse/Schulart/Fach dienen nur der Feinabstimmung.
export const profileSchema = z.object({
  schoolType: z.enum(schoolTypes).optional(),
  grade: z.coerce.number().int().min(1).max(13).optional(),
  subject: z.string().trim().min(2).max(60).optional(),
  notes: z.string().trim().min(1).max(300).optional(),
});
export type Profile = z.infer<typeof profileSchema>;

// Nur für den (englischen) System-Prompt gedacht - beschreibt die Zielgruppe fürs Modell,
// unabhängig von der später gewählten Ausgabesprache des generierten Inhalts. Wenn Angaben
// fehlen: Oberschule (allgemeine Sekundarstufe) als Standardannahme, Klasse aus dem Material schätzen.
export function describeProfile(profile: Profile): string {
  const parts: string[] = [];
  parts.push(
    profile.schoolType
      ? profile.schoolType
      : "no school type given - assume a general secondary school (\"Oberschule\") student"
  );
  parts.push(
    profile.grade !== undefined
      ? `grade ${profile.grade}`
      : "grade not given - estimate the appropriate grade level yourself from the complexity/topic of the uploaded material"
  );
  if (profile.subject) parts.push(`subject: ${profile.subject}`);
  if (profile.notes) parts.push(`the student's own note/request: "${profile.notes}" (take this into account for topic focus and content selection, as long as it doesn't conflict with the instructions above)`);
  return parts.join(", ");
}

// Nutzersichtbare Meta-Zeile auf dem PDF - die Wortwahl kommt von der KI (data.labels.grade),
// passend zur Sprache des generierten Inhalts statt zur UI-Sprache.
export function formatProfileMeta(profile: Profile, gradeLabel: string): string {
  return [profile.subject, profile.schoolType, profile.grade !== undefined ? `${gradeLabel} ${profile.grade}` : undefined]
    .filter((part): part is string => !!part)
    .join(" · ");
}

export const taskSchema = z
  .object({
    number: z.number(),
    question: z.string(),
    type: z.enum(["offen", "multiple-choice", "lueckentext", "unterstreichen", "zuordnen"]),
    // multiple-choice: die Antwortoptionen. unterstreichen: die Wörter/Phrasen zum Ankreuzen/Unterstreichen.
    options: z.array(z.string()).optional(),
    // nur für type "zuordnen": linke/rechte Spalte zum Zuordnen (rechte Spalte wird beim Rendern gemischt).
    pairs: z.array(z.object({ left: z.string(), right: z.string() })).optional(),
    points: z.number(),
    answer: z.string(),
  })
  // Verhindert eine Lösung, die nicht zur Aufgabe passt: bei multiple-choice/unterstreichen muss
  // "answer" wortgleich eine der "options" sein, statt z.B. ein Buchstabe oder eine Umschreibung -
  // sonst schlägt die Validierung fehl und der Retry in structured-output.ts fordert eine Korrektur an.
  .refine(
    (task) => {
      if (task.type === "multiple-choice" || task.type === "unterstreichen") {
        return !!task.options && task.options.includes(task.answer);
      }
      return true;
    },
    {
      message:
        'For a "multiple-choice" or "unterstreichen" task, "answer" must be an exact, verbatim copy of one of the "options" strings - not a letter, index, or paraphrase.',
      path: ["answer"],
    }
  );
export type Task = z.infer<typeof taskSchema>;

// Von der KI in derselben Sprache wie der restliche Inhalt zurückgegebene Beschriftungen -
// dadurch passen die PDF-Überschriften zur Dokumentsprache, unabhängig vom UI-Sprachschalter.
export const pdfLabelsSchema = z.object({
  task: z.string(),
  points: z.string(),
  totalPoints: z.string(),
  solutions: z.string(),
  name: z.string(),
  date: z.string(),
  grade: z.string(),
});
export type PdfLabels = z.infer<typeof pdfLabelsSchema>;

// Arbeitsblatt: bewusst umfangreich (mind. 3 PDF-Seiten gewünscht).
export const worksheetSchema = z.object({
  title: z.string(),
  introduction: z.string(),
  tasks: z.array(taskSchema).min(16).max(24),
  labels: pdfLabelsSchema,
});
export type WorksheetData = z.infer<typeof worksheetSchema>;

// Testarbeit bleibt in realistischer Klassenarbeits-Länge (separates Schema, gleiche Form).
export const testSchema = z.object({
  title: z.string(),
  introduction: z.string(),
  tasks: z.array(taskSchema).min(6).max(10),
  labels: pdfLabelsSchema,
});

export const questionSchema = z
  .object({
    type: z.enum(["multiple-choice", "lueckentext"]),
    prompt: z.string(),
    // nur "multiple-choice":
    options: z.array(z.string()).min(2).max(5).optional(),
    correctIndex: z.number().int().min(0).optional(),
    // nur "lueckentext": "prompt" enthält eine "___"-Lücke, der Schüler tippt die Antwort.
    correctAnswer: z.string().optional(),
    explanation: z.string(),
  })
  // Verhindert eine Lösung, die nicht zur Aufgabe passt (fehlende/inkonsistente Felder je Typ).
  .refine(
    (q) => {
      if (q.type === "multiple-choice") {
        return !!q.options && q.correctIndex !== undefined && q.correctIndex < q.options.length;
      }
      return !!q.correctAnswer && q.correctAnswer.trim() !== "" && q.prompt.includes("___");
    },
    {
      message:
        'A "multiple-choice" question needs "options" and a valid "correctIndex"; a "lueckentext" question needs "correctAnswer" and a "___" gap in "prompt".',
    }
  );
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

// Ein-Sprecher-Skript (bewusst kein Multi-Speaker-Dialog, damit kein Audio-Mixing/ffmpeg
// nötig ist). "script" enthält die vollständige Erzählung, in Absätze gegliedert.
export const podcastScriptSchema = z.object({
  title: z.string(),
  script: z.string(),
});
export type PodcastScript = z.infer<typeof podcastScriptSchema>;

// Rechtschreib-Diagnose: ein Satz mit Lücke ("___") an der Stelle des zu übenden Worts, plus
// dessen korrekte Schreibweise. Der Schüler tippt die Antwort selbst (Produktion statt bloßer
// Erkennung) - das eigentliche Problem laut Lehrer-Feedback ist ja das Schreiben, nicht das
// Wiedererkennen unter Auswahlmöglichkeiten.
export const spellingItemSchema = z.object({
  number: z.number(),
  sentence: z.string(),
  correctSpelling: z.string(),
});
export type SpellingItem = z.infer<typeof spellingItemSchema>;

export const spellingDiagnosticSchema = z.object({
  title: z.string(),
  items: z.array(spellingItemSchema).min(10).max(15),
});
export type SpellingDiagnostic = z.infer<typeof spellingDiagnosticSchema>;
