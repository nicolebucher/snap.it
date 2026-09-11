import { renderToBuffer } from "@react-pdf/renderer";
import { TestDocument } from "@/components/pdf/TestDocument";
import type { Profile, WorksheetData } from "@/types/generation";

export async function renderTestPdf(data: WorksheetData, profile: Profile): Promise<Buffer> {
  return renderToBuffer(<TestDocument data={data} profile={profile} />);
}
