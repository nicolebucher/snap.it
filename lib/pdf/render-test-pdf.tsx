import { renderToBuffer } from "@react-pdf/renderer";
import { TestDocument } from "@/components/pdf/TestDocument";
import type { Profile, WorksheetData } from "@/types/generation";
import type { Locale } from "@/lib/i18n/translations";

export async function renderTestPdf(data: WorksheetData, profile: Profile, locale: Locale): Promise<Buffer> {
  return renderToBuffer(<TestDocument data={data} profile={profile} locale={locale} />);
}
