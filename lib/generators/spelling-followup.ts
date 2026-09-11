import { worksheetSchema, type Profile, type SpellingItem, type WorksheetData } from "@/types/generation";
import { generateStructuredOutput } from "@/lib/ai/structured-output";
import { buildSpellingFollowupSystemPrompt } from "@/lib/ai/prompts/spelling-followup.prompt";
import { isMockMode } from "@/lib/env";
import { shuffleTaskOptions } from "@/lib/shuffle-options";
import type { ClaudeFileBlock } from "@/lib/files/extract-input";
import type { Locale } from "@/lib/i18n/translations";
import mockWorksheetEn from "./mock/mock-worksheet.en.json";
import mockWorksheetDe from "./mock/mock-worksheet.de.json";

const MOCKS: Record<Locale, unknown> = { en: mockWorksheetEn, de: mockWorksheetDe };

// Der Follow-up ist inhaltlich ein normales Arbeitsblatt (gleiches Schema, gleicher Renderer,
// gleiche Download/Practice-UI) - nur der Prompt und die Eingabe (die falsch beantworteten
// Diagnose-Items statt nur das Upload-Material) unterscheiden sich vom normalen Arbeitsblatt.
export async function generateSpellingFollowup(
  profile: Profile,
  fileBlocks: ClaudeFileBlock[],
  locale: Locale,
  missedItems: SpellingItem[]
): Promise<WorksheetData> {
  const data = isMockMode()
    ? worksheetSchema.parse(MOCKS[locale])
    : await generateStructuredOutput({
        system: buildSpellingFollowupSystemPrompt(profile, locale, missedItems),
        userContent: [...fileBlocks, { type: "text", text: "Create the targeted spelling practice worksheet." }],
        schema: worksheetSchema,
        toolName: "create_worksheet",
        toolDescription: "Creates a structured worksheet drilling the specific words a student got wrong in a spelling diagnostic.",
      });
  return { ...data, tasks: shuffleTaskOptions(data.tasks) };
}
