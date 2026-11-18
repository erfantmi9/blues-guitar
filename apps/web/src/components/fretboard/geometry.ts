import type { StringNumber } from "@bg/shared";

/**
 * Fretboard geometry in viewBox units (independent of real size; the SVG scales).
 * Headstock on the left, string 1 (thinnest) at the bottom, like a guitarist looking down at the neck.
 */
export type FretboardGeometry = ReturnType<typeof createGeometry>;

// Sized for phones: at the minimum width (640px), dots are about 28px.
export const DOT_R = 19;

export function createGeometry(frets: number) {
  const W = 900;
  const top = 30; // y of string 6
  const gap = 48; // string spacing
  const bottom = top + gap * 5; // y of string 1
  const H = bottom + 46; // room for fret numbers

  const labelX = 12; // string numbers
  const openX = 42; // open-string column
  const nutX = 76;
  const endX = W - 14;

  // Real frets shrink by 2^(-1/12); we use half that taper (2^(-1/24))
  // so the higher frets stay readable on a phone.
  const widths = Array.from({ length: frets }, (_, i) => 2 ** (-(i + 1) / 24));
  const total = widths.reduce((a, b) => a + b, 0);
  const fretX: number[] = [nutX];
  for (const w of widths) fretX.push(fretX[fretX.length - 1]! + (w / total) * (endX - nutX));

  const stringY = (s: StringNumber | number) => top + (6 - s) * gap;
  /** Dot center: middle of the space between two frets, or the open column for fret 0 */
  const noteX = (fret: number) => (fret === 0 ? openX : (fretX[fret - 1]! + fretX[fret]!) / 2);

  return { W, H, top, bottom, gap, labelX, openX, nutX, endX, fretX, frets, stringY, noteX };
}
