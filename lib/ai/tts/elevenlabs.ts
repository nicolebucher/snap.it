import { getOptionalEnv, getRequiredEnv } from "@/lib/env";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";
// Premade ElevenLabs voice, multilingual-capable model - overridable via env if desired.
const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
// Konservatives Limit pro Request, damit ein einzelner Chunk sicher unter ElevenLabs'
// Zeichenlimit bleibt; Absätze werden dabei nicht mitten im Satz zerschnitten.
const MAX_CHUNK_CHARS = 1800;

function chunkScript(script: string): string[] {
  const paragraphs = script
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length + 2 > MAX_CHUNK_CHARS) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [script];
}

async function synthesizeChunk(text: string): Promise<Buffer> {
  const apiKey = getRequiredEnv("ELEVENLABS_API_KEY");
  const voiceId = getOptionalEnv("ELEVENLABS_VOICE_ID") ?? DEFAULT_VOICE_ID;

  const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75, use_speaker_boost: true },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`ElevenLabs TTS request failed (${response.status}): ${errorText.slice(0, 300)}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Wandelt ein (potenziell langes) Skript in Sprache um. Wird in Absatz-Chunks aufgeteilt und
 * sequenziell an ElevenLabs geschickt; die resultierenden mp3-Buffer werden aneinandergehängt -
 * für eine einzelne Erzählstimme ohne Übergänge/Musik funktioniert einfaches Concat ausreichend
 * gut, ohne dass dafür ffmpeg nötig wäre.
 */
export async function synthesizeSpeech(script: string): Promise<Buffer> {
  const chunks = chunkScript(script);
  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    buffers.push(await synthesizeChunk(chunk));
  }
  return Buffer.concat(buffers);
}
