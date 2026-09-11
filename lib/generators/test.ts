import { testSchema, type Profile, type WorksheetData } from "@/types/generation";
import { generateStructuredOutput } from "@/lib/ai/structured-output";
import { buildTestSystemPrompt } from "@/lib/ai/prompts/test.prompt";
import { isMockMode } from "@/lib/env";
import { shuffleTaskOptions } from "@/lib/shuffle-options";
import type { ClaudeFileBlock } from "@/lib/files/extract-input";
import type { Locale } from "@/lib/i18n/translations";
import mockTestEn from "./mock/mock-test.en.json";
import mockTestDe from "./mock/mock-test.de.json";

const MOCKS: Record<Locale, unknown> = { en: mockTestEn, de: mockTestDe };

export async function generateTest(profile: Profile, fileBlocks: ClaudeFileBlock[], locale: Locale): Promise<WorksheetData> {
  const data = isMockMode()
    ? testSchema.parse(MOCKS[locale])
    : await generateStructuredOutput({
        system: buildTestSystemPrompt(profile, locale),
        userContent: [...fileBlocks, { type: "text", text: "Create a matching test from this material." }],
        schema: testSchema,
        toolName: "create_test",
        toolDescription: "Creates a structured test (classroom exam) based on the study material.",
      });
  return { ...data, tasks: shuffleTaskOptions(data.tasks) };
}
