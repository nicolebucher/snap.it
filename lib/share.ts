type ShareResult = "shared" | "downloaded" | "cancelled";

/**
 * Tries the native share sheet (Web Share API, file support) so users can forward the
 * generated file directly to another app/contact. Falls back to a plain download when
 * the browser doesn't support sharing files (most desktop browsers).
 */
export async function shareOrDownloadFile(file: File, title?: string): Promise<ShareResult> {
  const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };

  if (nav.canShare && nav.share && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], title });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
      // fall through to the download fallback on any other failure
    }
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
