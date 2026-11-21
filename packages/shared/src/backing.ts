/**
 * Backing track data. Time grid: 4 beats per bar, each beat split into 3 slots
 * (12 slots per bar, 0..11). Shuffle = melodic events only on the 1st and 3rd slot
 * of each beat (slots 0, 2, 3, 5, 6, 8, 9, 11). The drum pattern is shared code,
 * not data (see apps/web/src/lib/audio/backing).
 */

export type BackingChord = {
  /** Display name, e.g. "A7" */
  name: string;
  /** MIDI notes of the chord stab */
  midi: number[];
};

export type BackingBar = {
  chord: BackingChord;
  /** 8 MIDI notes, one per shuffle slot of the bar; null = silence */
  bass: (number | null)[];
};

export type BackingTrack = {
  /** Stable and unique; used in URLs and storage */
  id: string;
  title: string;
  description?: string;
  bpmDefault: number;
  bpmMin: number;
  bpmMax: number;
  beatsPerBar: 4;
  bars: BackingBar[];
};
