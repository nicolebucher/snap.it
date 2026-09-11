import { spellingDiagnosticSchema, type Profile, type SpellingDiagnostic } from "@/types/generation";
import { generateStructuredOutput } from "@/lib/ai/structured-output";
import { buildSpellingDiagnosticSystemPrompt } from "@/lib/ai/prompts/spelling-diagnostic.prompt";
import { isMockMode } from "@/lib/env";
import type { ClaudeFileBlock } from "@/lib/files/extract-input";
import type { Locale } from "@/lib/i18n/translations";
import mockSpellingDiagnosticEn from "./mock/mock-spelling-diagnostic.en.json";
import mockSpellingDiagnosticDe from "./mock/mock-spelling-diagnostic.de.json";

const MOCKS: Record<Locale, unknown> = { en: mockSpellingDiagnosticEn, de: mockSpellingDiagnosticDe };

export async function generateSpellingDiagnostic(
  profile: Profile,
  fileBlocks: ClaudeFileBlock[],
  locale: Locale
): Promise<SpellingDiagnostic> {
  if (isMockMode()) {
    return spellingDiagnosticSchema.parse(MOCKS[locale]);
  }

  const hasMaterial = fileBlocks.length > 0;
  return generateStructuredOutput({
    system: buildSpellingDiagnosticSystemPrompt(profile, locale, hasMaterial),
    userContent: [
      ...fileBlocks,
      {
        type: "text",
        text: hasMaterial ? "Create the spelling diagnostic from this material." : "Create the spelling diagnostic.",
      },
    ],
    schema: spellingDiagnosticSchema,
    toolName: "create_spelling_diagnostic",
    toolDescription: "Creates a short spelling diagnostic (fill-in-the-blank sentences) based on the study material.",
  });
}
