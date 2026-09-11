import { NextRequest, NextResponse } from "next/server";
import { profileSchema, outputFormats, type OutputFormat } from "@/types/generation";
import { fileToClaudeBlock } from "@/lib/files/extract-input";
import { generateWorksheet } from "@/lib/generators/worksheet";
import { generateTest } from "@/lib/generators/test";
import { generateGameLevels } from "@/lib/generators/game-levels";
import { renderWorksheetPdf } from "@/lib/pdf/render-worksheet-pdf";
import { renderTestPdf } from "@/lib/pdf/render-test-pdf";
import { checkRateLimit } from "@/lib/rate-limit";
import { locales, t, type Locale } from "@/lib/i18n/translations";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function isOutputFormat(value: unknown): value is OutputFormat {
  return typeof value === "string" && (outputFormats as readonly string[]).includes(value);
}

function nullToUndefined(value: FormDataEntryValue | null): FormDataEntryValue | undefined {
  if (value === null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

function parseLocale(value: FormDataEntryValue | null): Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value) ? (value as Locale) : "en";
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: t("en").serverErrors.invalidRequest }, { status: 400 });
  }

  const locale = parseLocale(formData.get("locale"));
  const messages = t(locale).serverErrors;

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: messages.tooManyRequests }, { status: 429 });
  }

  const format = formData.get("format");
  const file = formData.get("file");

  if (!isOutputFormat(format)) {
    return NextResponse.json({ error: messages.invalidFormat }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: messages.missingFile }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: messages.fileTooLarge }, { status: 400 });
  }

  const profileResult = profileSchema.safeParse({
    age: nullToUndefined(formData.get("age")),
    schoolType: nullToUndefined(formData.get("schoolType")),
    grade: nullToUndefined(formData.get("grade")),
    subject: nullToUndefined(formData.get("subject")),
  });
  if (!profileResult.success) {
    return NextResponse.json({ error: messages.invalidProfile }, { status: 400 });
  }
  const profile = profileResult.data;

  try {
    const fileBlock = await fileToClaudeBlock(file);

    if (format === "worksheet") {
      const data = await generateWorksheet(profile, fileBlock, locale);
      const pdf = await renderWorksheetPdf(data, profile, locale);
      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="worksheet.pdf"',
        },
      });
    }

    if (format === "test") {
      const data = await generateTest(profile, fileBlock, locale);
      const pdf = await renderTestPdf(data, profile, locale);
      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="test.pdf"',
        },
      });
    }

    const game = await generateGameLevels(profile, fileBlock, locale);
    return NextResponse.json({ game });
  } catch (error) {
    console.error("Generation failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: messages.generationFailed }, { status: 500 });
  }
}
