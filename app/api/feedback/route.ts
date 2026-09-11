import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { locales, t, type Locale } from "@/lib/i18n/translations";

export const runtime = "nodejs";

// Prototype-only persistence: appends to a local file. On serverless hosting (e.g. Vercel)
// the filesystem is ephemeral/read-only in production - swap this for a real datastore
// before going live.
const FEEDBACK_FILE = path.join(process.cwd(), "data", "feedback.jsonl");

function parseLocale(value: unknown): Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value) ? (value as Locale) : "en";
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: t("en").serverErrors.invalidRequest }, { status: 400 });
  }

  const { name, email, message, locale } = (body ?? {}) as Record<string, unknown>;
  const messages = t(parseLocale(locale)).feedback;

  if (typeof message !== "string" || message.trim().length < 3) {
    return NextResponse.json({ error: messages.error }, { status: 400 });
  }

  const entry = {
    name: typeof name === "string" && name.trim() ? name.trim().slice(0, 200) : null,
    email: typeof email === "string" && email.trim() ? email.trim().slice(0, 200) : null,
    message: message.trim().slice(0, 4000),
    submittedAt: new Date().toISOString(),
  };

  try {
    await fs.mkdir(path.dirname(FEEDBACK_FILE), { recursive: true });
    await fs.appendFile(FEEDBACK_FILE, JSON.stringify(entry) + "\n", "utf8");
  } catch (error) {
    console.error("Failed to store feedback:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: messages.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
