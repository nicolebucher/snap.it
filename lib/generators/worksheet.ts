import { worksheetSchema, type Profile, type WorksheetData } from "@/types/generation";
import { generateStructuredOutput } from "@/lib/ai/structured-output";
import { buildWorksheetSystemPrompt } from "@/lib/ai/prompts/worksheet.prompt";
import { isMockMode } from "@/lib/env";
import type { ClaudeFileBlock } from "@/lib/files/extract-input";
import type { Locale } from "@/lib/i18n/translations";
import mockWorksheetEn from "./mock/mock-worksheet.en.json";
import mockWorksheetDe from "./mock/mock-worksheet.de.json";

const MOCKS: Record<Locale, unknown> = { en: mockWorksheetEn, de: mockWorksheetDe };

export async function generateWorksheet(
  profile: Profile,
  fileBlock: ClaudeFileBlock,
  locale: Locale
): Promise<WorksheetData> {
  if (isMockMode()) {
    return worksheetSchema.parse(MOCKS[locale]);
  }

  return generateStructuredOutput({
    system: buildWorksheetSystemPrompt(profile, locale),
    userContent: [fileBlock, { type: "text", text: "Create a matching worksheet from this material." }],
    schema: worksheetSchema,
    toolName: "create_worksheet",
    toolDescription: "Creates a structured practice worksheet based on the study material.",
  });
}
