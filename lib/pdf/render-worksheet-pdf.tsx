import { renderToBuffer } from "@react-pdf/renderer";
import { WorksheetDocument } from "@/components/pdf/WorksheetDocument";
import type { Profile, WorksheetData } from "@/types/generation";
import type { Locale } from "@/lib/i18n/translations";

export async function renderWorksheetPdf(data: WorksheetData, profile: Profile, locale: Locale): Promise<Buffer> {
  return renderToBuffer(<WorksheetDocument data={data} profile={profile} locale={locale} />);
}
