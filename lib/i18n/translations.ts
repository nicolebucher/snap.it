export type Locale = "en" | "de";
export const locales: Locale[] = ["en", "de"];

const en = {
  landing: {
    heading: "Upload your study material – we'll turn it into what you need to practice.",
    subtitle:
      "A photo of your notebook, a script, or a worksheet as PDF: choose whether you want a worksheet, a test, or a learning game — the AI creates it for you.",
    cta: "Get started",
  },
  profile: {
    hint: "All fields are optional — they just help the AI match the right level.",
    age: "Age (optional)",
    grade: "Grade (optional)",
    schoolType: "School type (optional)",
    schoolTypeNone: "No preference",
    subject: "Subject (optional)",
    subjectPlaceholder: "e.g. Math",
  },
  upload: {
    dragText: "Upload your study material (PDF, JPG or PNG) — click or drag & drop",
    compressing: "Optimizing image…",
    errorType: "Please upload a PDF, JPG or PNG file.",
    privacyNote: "Your file is only used to create your material and then deleted automatically.",
  },
  format: {
    heading: "What would you like to create?",
    worksheet: { label: "Worksheet", description: "For practice, with an answer key" },
    test: { label: "Test", description: "Just like a real exam" },
    game: { label: "Learning game", description: "Play through levels and earn points" },
  },
  wizard: {
    submit: "Create material",
    newMaterial: "Create new material",
    done: "Done! 🎉",
    downloadWorksheet: "Download worksheet",
    downloadTest: "Download test",
    preview: "Preview",
  },
  share: {
    button: "Share",
  },
  footer: {
    imprint: "Imprint",
    terms: "Service Agreement",
    feedback: "Feedback",
  },
  feedback: {
    heading: "Feedback & feature requests",
    description: "Got an idea for snap.it, or found something that doesn't work? Let us know below.",
    nameLabel: "Name (optional)",
    emailLabel: "Email (optional, in case we want to follow up)",
    requestLabel: "Your feedback or feature request",
    requestPlaceholder: "e.g. \"It would be great if...\"",
    submit: "Send feedback",
    success: "Thanks! Your feedback has been recorded.",
    error: "Something went wrong. Please try again.",
  },
  loading: {
    title: "Creating your material…",
    subtitle: "This can take up to a minute.",
  },
  error: {
    title: "Oops, that didn't work.",
    retry: "Try again",
  },
  game: {
    download: "Download game",
    back: "Back to level map",
    correct: "Correct! 🎉",
    wrong: "Not quite.",
    next: "Next",
    finishLevel: "Finish level",
    done: "Nice work! 🎉",
    questionOf: (current: number, total: number) => `Question ${current}/${total}`,
    starsCollected: (stars: number, max: number) => `You collected ${stars} of ${max} stars.`,
  },
  difficulty: { leicht: "Easy", mittel: "Medium", schwer: "Hard" } as Record<string, string>,
  pdf: {
    task: "Task",
    points: "points",
    totalPoints: "points total",
    solutions: "Solutions",
    name: "Name",
    date: "Date",
  },
  serverErrors: {
    tooManyRequests: "Too many requests. Please wait a moment and try again.",
    invalidRequest: "Invalid request.",
    invalidFormat: "Invalid format.",
    missingFile: "Please upload a file.",
    fileTooLarge: "The file is too large (max. 10 MB).",
    invalidProfile: "Please check your details.",
    generationFailed: "Generation failed. Please try again.",
  },
};

const de: typeof en = {
  landing: {
    heading: "Lade dein Lernmaterial hoch – wir machen daraus, was du zum Üben brauchst.",
    subtitle:
      "Foto vom Schulheft, ein Skript oder ein Arbeitsblatt als PDF: Wähle aus, ob du ein Arbeitsblatt, eine Testarbeit oder ein Lernspiel möchtest — die KI erstellt es für dich.",
    cta: "Jetzt starten",
  },
  profile: {
    hint: "Alle Angaben sind optional — sie helfen der KI nur, das Niveau besser zu treffen.",
    age: "Alter (optional)",
    grade: "Klasse (optional)",
    schoolType: "Schulart (optional)",
    schoolTypeNone: "Keine Angabe",
    subject: "Fach (optional)",
    subjectPlaceholder: "z.B. Mathematik",
  },
  upload: {
    dragText: "Lernmaterial hochladen (PDF, JPG oder PNG) — per Klick oder Drag & Drop",
    compressing: "Bild wird optimiert…",
    errorType: "Bitte lade eine PDF-, JPG- oder PNG-Datei hoch.",
    privacyNote: "Deine Datei wird nur zur Erstellung genutzt und danach automatisch gelöscht.",
  },
  format: {
    heading: "Was möchtest du erstellen?",
    worksheet: { label: "Arbeitsblatt", description: "Zum Üben mit Musterlösung" },
    test: { label: "Testarbeit", description: "Wie eine echte Klassenarbeit" },
    game: { label: "Lernspiel", description: "Level spielen und Punkte sammeln" },
  },
  wizard: {
    submit: "Material erstellen",
    newMaterial: "Neues Material erstellen",
    done: "Fertig! 🎉",
    downloadWorksheet: "Arbeitsblatt herunterladen",
    downloadTest: "Testarbeit herunterladen",
    preview: "Vorschau",
  },
  share: {
    button: "Teilen",
  },
  footer: {
    imprint: "Impressum",
    terms: "Nutzungsvereinbarung",
    feedback: "Feedback",
  },
  feedback: {
    heading: "Feedback & Funktionswünsche",
    description: "Hast du eine Idee für snap.it oder ist dir etwas aufgefallen, das nicht funktioniert? Schreib es uns.",
    nameLabel: "Name (optional)",
    emailLabel: "E-Mail (optional, falls wir nachfragen möchten)",
    requestLabel: "Dein Feedback oder Funktionswunsch",
    requestPlaceholder: "z.B. \"Es wäre toll, wenn...\"",
    submit: "Feedback senden",
    success: "Danke! Dein Feedback wurde gespeichert.",
    error: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
  },
  loading: {
    title: "Dein Material wird erstellt…",
    subtitle: "Das kann bis zu einer Minute dauern.",
  },
  error: {
    title: "Ups, das hat nicht geklappt.",
    retry: "Erneut versuchen",
  },
  game: {
    download: "Spiel herunterladen",
    back: "Zurück zur Levelkarte",
    correct: "Richtig! 🎉",
    wrong: "Nicht ganz.",
    next: "Weiter",
    finishLevel: "Level abschließen",
    done: "Geschafft! 🎉",
    questionOf: (current: number, total: number) => `Frage ${current}/${total}`,
    starsCollected: (stars: number, max: number) => `Du hast ${stars} von ${max} Sternen gesammelt.`,
  },
  difficulty: { leicht: "Leicht", mittel: "Mittel", schwer: "Schwer" },
  pdf: {
    task: "Aufgabe",
    points: "Punkte",
    totalPoints: "Punkte gesamt",
    solutions: "Lösungen",
    name: "Name",
    date: "Datum",
  },
  serverErrors: {
    tooManyRequests: "Zu viele Anfragen. Bitte warte einen Moment und versuche es erneut.",
    invalidRequest: "Ungültige Anfrage.",
    invalidFormat: "Ungültiges Format.",
    missingFile: "Bitte lade eine Datei hoch.",
    fileTooLarge: "Die Datei ist zu groß (max. 10 MB).",
    invalidProfile: "Bitte prüfe deine Angaben.",
    generationFailed: "Die Generierung ist fehlgeschlagen. Bitte versuche es erneut.",
  },
};

export const translations: Record<Locale, typeof en> = { en, de };

export function t(locale: Locale) {
  return translations[locale];
}
