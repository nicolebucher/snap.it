import Anthropic from "@anthropic-ai/sdk";
import { getRequiredEnv } from "@/lib/env";

export const CLAUDE_MODEL = "claude-sonnet-5";

let client: Anthropic | null = null;

export function getClaudeClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: getRequiredEnv("ANTHROPIC_API_KEY") });
  }
  return client;
}
