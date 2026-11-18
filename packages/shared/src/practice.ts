import type { StringNumber } from "./music";

export type Finger = 1 | 2 | 3 | 4;

export type TabNote = {
  /** Start position in beats from the beginning of the exercise (0-based); may be fractional, e.g. 1.5 */
  beat: number;
  string: StringNumber;
  /** 0 = open string */
  fret: number;
  /** Left-hand finger; omit for open strings */
  finger?: Finger;
  durationBeats: number;
};

export type TabExercise = {
  /** Stable and unique; used in URLs and storage */
  id: string;
  title: string;
  description?: string;
  bpmDefault: number;
  beatsPerBar: number;
  bars: number;
  notes: TabNote[];
};
