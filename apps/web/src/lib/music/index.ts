/**
 * Basic music logic. No React or DOM dependency, so it can be tested
 * on its own or used on the server later.
 */
import type { NoteName, Pitch, StringNumber } from "@bg/shared";

export const CHROMATIC: readonly NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export const STRING_COUNT = 6;

/**
 * Standard tuning as MIDI numbers, index = string number - 1.
 * Thinnest to thickest: E4 B3 G3 D3 A2 E2
 */
export const STANDARD_TUNING: readonly number[] = [64, 59, 55, 50, 45, 40];

export const MAX_FRET = 24;

export function isStringNumber(n: number): n is StringNumber {
  return Number.isInteger(n) && n >= 1 && n <= STRING_COUNT;
}

function assertPosition(string: number, fret: number, tuning: readonly number[]) {
  if (!Number.isInteger(string) || string < 1 || string > tuning.length) {
    throw new RangeError(`Invalid string number: ${string}`);
  }
  if (!Number.isInteger(fret) || fret < 0 || fret > MAX_FRET) {
    throw new RangeError(`Invalid fret: ${fret}`);
  }
}

/** MIDI number of the note at this position */
export function midiAt(string: number, fret: number, tuning: readonly number[] = STANDARD_TUNING): number {
  assertPosition(string, fret, tuning);
  return tuning[string - 1]! + fret;
}

export function noteNameFromMidi(midi: number): NoteName {
  return CHROMATIC[((midi % 12) + 12) % 12]!;
}

/** Note name at this position, e.g. noteAt(1, 3) → "G" */
export function noteAt(string: number, fret: number, tuning: readonly number[] = STANDARD_TUNING): NoteName {
  return noteNameFromMidi(midiAt(string, fret, tuning));
}

/** Name + octave + MIDI, e.g. pitchAt(1, 5) → A4 */
export function pitchAt(string: number, fret: number, tuning: readonly number[] = STANDARD_TUNING): Pitch {
  const midi = midiAt(string, fret, tuning);
  return { name: noteNameFromMidi(midi), octave: Math.floor(midi / 12) - 1, midi };
}

/** Equal temperament frequency; A4 (MIDI 69) = 440Hz */
export function midiToFrequency(midi: number, a4 = 440): number {
  return a4 * 2 ** ((midi - 69) / 12);
}

export function frequencyAt(string: number, fret: number, tuning: readonly number[] = STANDARD_TUNING): number {
  return midiToFrequency(midiAt(string, fret, tuning));
}
