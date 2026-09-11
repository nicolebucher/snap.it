// Splits a fill-in-the-blank sentence around its single "___" gap, for rendering an inline
// text input where the gap sits. Used by both the spelling diagnostic and the game's
// "lueckentext" question type.
export function splitBlank(sentence: string): [string, string] {
  const gapIndex = sentence.indexOf("___");
  if (gapIndex === -1) return [sentence, ""];
  return [sentence.slice(0, gapIndex), sentence.slice(gapIndex + 3)];
}
