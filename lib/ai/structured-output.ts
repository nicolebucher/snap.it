import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { getClaudeClient, CLAUDE_MODEL } from "./claude-client";

type MessageContent = Anthropic.Messages.MessageParam["content"];

interface StructuredOutputParams<T extends z.ZodTypeAny> {
  system: string;
  userContent: MessageContent;
  schema: T;
  toolName: string;
  toolDescription: string;
  maxTokens?: number;
}

function schemaToToolInputSchema(schema: z.ZodTypeAny): Anthropic.Messages.Tool.InputSchema {
  const raw = z.toJSONSchema(schema, { target: "draft-7" }) as Record<string, unknown>;
  delete raw.$schema;
  return raw as Anthropic.Messages.Tool.InputSchema;
}

/**
 * Erzwingt über tool_choice ein einziges strukturiertes JSON-Ergebnis und validiert es
 * gegen das Zod-Schema. Bei ungültiger Antwort wird einmal mit Fehlerhinweis neu versucht,
 * damit eine leicht abweichende Modellantwort nicht die ganze Generierung crasht.
 */
export async function generateStructuredOutput<T extends z.ZodTypeAny>({
  system,
  userContent,
  schema,
  toolName,
  toolDescription,
  maxTokens = 4096,
}: StructuredOutputParams<T>): Promise<z.infer<T>> {
  const client = getClaudeClient();
  const tool: Anthropic.Messages.Tool = {
    name: toolName,
    description: toolDescription,
    input_schema: schemaToToolInputSchema(schema),
  };

  let lastError: string | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system: lastError
        ? `${system}\n\nDein letzter Versuch war ungültig (${lastError}). Bitte antworte exakt nach dem vorgegebenen Schema.`
        : system,
      tools: [tool],
      tool_choice: { type: "tool", name: toolName },
      messages: [{ role: "user", content: userContent }],
    });

    const toolUse = message.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      lastError = "Keine strukturierte Antwort erhalten";
      continue;
    }

    const result = schema.safeParse(toolUse.input);
    if (result.success) {
      return result.data;
    }
    lastError = result.error.issues.map((issue) => issue.message).join(", ");
  }

  throw new Error(`KI-Antwort entspricht nicht dem erwarteten Format: ${lastError}`);
}
