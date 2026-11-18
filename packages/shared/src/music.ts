/** Music types shared across the app. Logic lives in apps/web/src/lib/music. */

/** The 12 chromatic notes, sharp spelling */
export type NoteName = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B";

/** String number: 1 = thinnest (high E), 6 = thickest (low E) */
export type StringNumber = 1 | 2 | 3 | 4 | 5 | 6;

/** A position on the neck; fret 0 means the open string */
export type FretPosition = {
  string: StringNumber;
  fret: number;
};

export type HighlightedNote = FretPosition & {
  /** Text inside the dot (e.g. finger number); if unset and note names are on, the note name is shown */
  label?: string;
  /** Any CSS color; default is the theme accent color. If set, overrides variant's color */
  color?: string;
  /**
   * Display style only (no effect on logic):
   * active = the note being played now (amber glow), root = root note (red),
   * preview = next note (faded), faded = previous note (very faded). Default: a normal amber dot.
   */
  variant?: "active" | "root" | "preview" | "faded";
};

export type Pitch = {
  name: NoteName;
  /** Scientific octave (A4 = 440Hz) */
  octave: number;
  midi: number;
};
