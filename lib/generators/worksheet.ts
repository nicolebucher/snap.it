import { worksheetSchema, type Profile, type WorksheetData } from "@/types/generation";
import { generateStructuredOutput } from "@/lib/ai/structured-output";
import { buildWorksheetSystemPrompt } from "@/lib/ai/prompts/worksheet.prompt";
import { isMockMode } from "@/lib/env";
import { shuffleTaskOptions } from "@/lib/shuffle-options";
import type { ClaudeFileBlock } from "@/lib/files/extract-input";
import type { Locale } from "@/lib/i18n/translations";
import mockWorksheetEn from "./mock/mock-worksheet.en.json";
import mockWorksheetDe from "./mock/mock-worksheet.de.json";

const MOCKS: Record<Locale, unknown> = { en: mockWorksheetEn, de: mockWorksheetDe };

export async function generateWorksheet(
  profile: Profile,
  fileBlocks: ClaudeFileBlock[],
  locale: Locale
): Promise<WorksheetData> {
  const data = isMockMode()
    ? worksheetSchema.parse(MOCKS[locale])
    : await generateStructuredOutput({
        system: buildWorksheetSystemPrompt(profile, locale, fileBlocks.length > 0),
        userContent: [...fileBlocks, { type: "text", text: fileBlocks.length > 0 ? "Create a matching worksheet from this material." : "Create the worksheet for this topic." }],
        schema: worksheetSchema,
        toolName: "create_worksheet",
        toolDescription: "Creates a structured practice worksheet based on the study material.",
      });
  return { ...data, tasks: shuffleTaskOptions(data.tasks) };
}
