import { renderToBuffer } from "@react-pdf/renderer";
import { WorksheetDocument } from "@/components/pdf/WorksheetDocument";
import type { Profile, WorksheetData } from "@/types/generation";

export async function renderWorksheetPdf(data: WorksheetData, profile: Profile): Promise<Buffer> {
  return renderToBuffer(<WorksheetDocument data={data} profile={profile} />);
}
