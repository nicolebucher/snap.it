import { gameSchema, type Profile, type GameData } from "@/types/generation";
import { generateStructuredOutput } from "@/lib/ai/structured-output";
import { buildGameLevelsSystemPrompt } from "@/lib/ai/prompts/game-levels.prompt";
import { isMockMode } from "@/lib/env";
import { shuffleQuestionOptions } from "@/lib/shuffle-options";
import type { ClaudeFileBlock } from "@/lib/files/extract-input";
import type { Locale } from "@/lib/i18n/translations";
import mockLevelsEn from "./mock/mock-levels.en.json";
import mockLevelsDe from "./mock/mock-levels.de.json";

const MOCKS: Record<Locale, unknown> = { en: mockLevelsEn, de: mockLevelsDe };

export async function generateGameLevels(profile: Profile, fileBlocks: ClaudeFileBlock[], locale: Locale): Promise<GameData> {
  const data = isMockMode()
    ? gameSchema.parse(MOCKS[locale])
    : await generateStructuredOutput({
        system: buildGameLevelsSystemPrompt(profile, locale),
        userContent: [...fileBlocks, { type: "text", text: "Create the levels for the learning game from this material." }],
        schema: gameSchema,
        toolName: "create_game_levels",
        toolDescription: "Creates structured quiz levels with questions based on the study material.",
        // Bis zu 5 Level x 15 Fragen (inkl. Erklärungen) können 16k Tokens überschreiten und die
        // Antwort mitten im JSON abschneiden - großzügig bemessen, um Trunkierung zu vermeiden.
        maxTokens: 32000,
      });
  return {
    ...data,
    levels: data.levels.map((level) => ({ ...level, questions: shuffleQuestionOptions(level.questions) })),
  };
}
