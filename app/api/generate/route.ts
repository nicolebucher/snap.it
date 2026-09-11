import { NextRequest, NextResponse } from "next/server";
import { profileSchema, outputFormats, type OutputFormat } from "@/types/generation";
import { ALLOWED_MIME_TYPES, MAX_FILES, MAX_TOTAL_SIZE, filesToClaudeBlocks } from "@/lib/files/extract-input";
import { generateWorksheet } from "@/lib/generators/worksheet";
import { generateTest } from "@/lib/generators/test";
import { generateGameLevels } from "@/lib/generators/game-levels";
import { renderWorksheetPdf } from "@/lib/pdf/render-worksheet-pdf";
import { renderTestPdf } from "@/lib/pdf/render-test-pdf";
import { checkRateLimit } from "@/lib/rate-limit";
import { slugify } from "@/lib/slugify";
import { locales, t, type Locale } from "@/lib/i18n/translations";

export const runtime = "nodejs";
export const maxDuration = 60;

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
  const files = formData.getAll("file").filter((entry): entry is File => entry instanceof File);

  if (!isOutputFormat(format)) {
    return NextResponse.json({ error: messages.invalidFormat }, { status: 400 });
  }
  if (files.length === 0) {
    return NextResponse.json({ error: messages.missingFile }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: messages.tooManyFiles }, { status: 400 });
  }
  if (files.some((file) => !ALLOWED_MIME_TYPES.has(file.type))) {
    return NextResponse.json({ error: messages.fileTypeInvalid }, { status: 400 });
  }
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > MAX_TOTAL_SIZE) {
    return NextResponse.json({ error: messages.fileTooLarge }, { status: 400 });
  }

  const profileResult = profileSchema.safeParse({
    schoolType: nullToUndefined(formData.get("schoolType")),
    grade: nullToUndefined(formData.get("grade")),
    subject: nullToUndefined(formData.get("subject")),
    notes: nullToUndefined(formData.get("notes")),
  });
  if (!profileResult.success) {
    return NextResponse.json({ error: messages.invalidProfile }, { status: 400 });
  }
  const profile = profileResult.data;

  try {
    const fileBlocks = await filesToClaudeBlocks(files);

    if (format === "worksheet") {
      const data = await generateWorksheet(profile, fileBlocks, locale);
      const pdf = await renderWorksheetPdf(data, profile);
      const filename = `${slugify(data.title)}.pdf`;
      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "X-Filename": filename,
        },
      });
    }

    if (format === "test") {
      const data = await generateTest(profile, fileBlocks, locale);
      const pdf = await renderTestPdf(data, profile);
      const filename = `${slugify(data.title)}.pdf`;
      return new NextResponse(new Uint8Array(pdf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "X-Filename": filename,
        },
      });
    }

    const game = await generateGameLevels(profile, fileBlocks, locale);
    return NextResponse.json({ game });
  } catch (error) {
    console.error("Generation failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: messages.generationFailed }, { status: 500 });
  }
}
