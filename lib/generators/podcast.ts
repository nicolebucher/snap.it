import { podcastScriptSchema, type Profile, type PodcastScript } from "@/types/generation";
import { generateStructuredOutput } from "@/lib/ai/structured-output";
import { buildPodcastSystemPrompt } from "@/lib/ai/prompts/podcast.prompt";
import { isMockMode } from "@/lib/env";
import type { ClaudeFileBlock } from "@/lib/files/extract-input";
import type { Locale } from "@/lib/i18n/translations";
import mockPodcastEn from "./mock/mock-podcast.en.json";
import mockPodcastDe from "./mock/mock-podcast.de.json";

const MOCKS: Record<Locale, unknown> = { en: mockPodcastEn, de: mockPodcastDe };

export async function generatePodcastScript(
  profile: Profile,
  fileBlocks: ClaudeFileBlock[],
  locale: Locale
): Promise<PodcastScript> {
  if (isMockMode()) {
    return podcastScriptSchema.parse(MOCKS[locale]);
  }

  return generateStructuredOutput({
    system: buildPodcastSystemPrompt(profile, locale),
    userContent: [...fileBlocks, { type: "text", text: "Write the podcast script for this material." }],
    schema: podcastScriptSchema,
    toolName: "create_podcast_script",
    toolDescription: "Creates a single-narrator podcast script based on the study material.",
    maxTokens: 6000,
  });
}
