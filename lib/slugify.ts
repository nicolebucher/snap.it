/** Baut aus einem Titel einen dateinamentauglichen Slug, damit Downloads nicht denselben
 * generischen Namen teilen und sich beim Speichern gegenseitig überschreiben. */
export function slugify(text: string): string {
  const diacriticStart = String.fromCodePoint(0x0300);
  const diacriticEnd = String.fromCodePoint(0x036f);
  const diacritics = new RegExp(`[${diacriticStart}-${diacriticEnd}]`, "g");
  const slug = text
    .normalize("NFKD")
    .replace(diacritics, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "material";
}
