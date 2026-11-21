/** Scale shapes shown on the fretboard in more than one place (lessons, backing track page). */
import type { HighlightedNote } from "@bg/shared";

/**
 * A minor pentatonic, position 1 (frets 5 to 8): two notes per string;
 * the label is the finger number and roots (A) use the root color.
 */
export const A_MINOR_PENTATONIC_POS1: readonly HighlightedNote[] = [
  { string: 6, fret: 5, label: "۱", variant: "root" },
  { string: 6, fret: 8, label: "۴" },
  { string: 5, fret: 5, label: "۱" },
  { string: 5, fret: 7, label: "۳" },
  { string: 4, fret: 5, label: "۱" },
  { string: 4, fret: 7, label: "۳", variant: "root" },
  { string: 3, fret: 5, label: "۱" },
  { string: 3, fret: 7, label: "۳" },
  { string: 2, fret: 5, label: "۱" },
  { string: 2, fret: 8, label: "۴" },
  { string: 1, fret: 5, label: "۱", variant: "root" },
  { string: 1, fret: 8, label: "۴" },
];
