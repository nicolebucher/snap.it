import { gameSchema, type Profile, type GameData } from "@/types/generation";
import { generateStructuredOutput } from "@/lib/ai/structured-output";
import { buildGameLevelsSystemPrompt } from "@/lib/ai/prompts/game-levels.prompt";
import { isMockMode } from "@/lib/env";
import type { ClaudeFileBlock } from "@/lib/files/extract-input";
import type { Locale } from "@/lib/i18n/translations";
import mockLevelsEn from "./mock/mock-levels.en.json";
import mockLevelsDe from "./mock/mock-levels.de.json";

const MOCKS: Record<Locale, unknown> = { en: mockLevelsEn, de: mockLevelsDe };

export async function generateGameLevels(profile: Profile, fileBlocks: ClaudeFileBlock[], locale: Locale): Promise<GameData> {
  if (isMockMode()) {
    return gameSchema.parse(MOCKS[locale]);
  }

  return generateStructuredOutput({
    system: buildGameLevelsSystemPrompt(profile, locale),
    userContent: [...fileBlocks, { type: "text", text: "Create the levels for the learning game from this material." }],
    schema: gameSchema,
    toolName: "create_game_levels",
    toolDescription: "Creates structured quiz levels with questions based on the study material.",
    maxTokens: 16000,
  });
}
