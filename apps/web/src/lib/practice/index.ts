/**
 * Logic for playing tab exercises. No React or DOM dependency.
 *
 * Time model: the metronome emits a sequence of ticks from 0. The first bar is
 * the count-in; after that each tick maps to a position in the exercise (in beats).
 * Loop = modulo the exercise length, so wrapping to the start has no gap or repeat
 * by construction.
 */
import type { TabExercise, TabNote } from "@bg/shared";

const EPS = 1e-9;
const isWhole = (n: number) => Math.abs(n - Math.round(n)) < EPS;

export const exerciseLengthBeats = (ex: Pick<TabExercise, "bars" | "beatsPerBar">) => ex.bars * ex.beatsPerBar;

/** Order of notes: by start beat, and for simultaneous notes from string 6 (thickest) to 1 */
export function sortNotes(notes: readonly TabNote[]): TabNote[] {
  return [...notes].sort((a, b) => a.beat - b.beat || b.string - a.string);
}

/**
 * Smallest number of subdivisions per beat that puts every start and end of a note
 * exactly on a tick. 1 = whole beats, 2 = eighths, 3 = triplets (shuffle), 4 = sixteenths.
 * null = not representable (e.g. beat 0.3).
 */
export function requiredSubdivisions(notes: readonly TabNote[]): number | null {
  for (const s of [1, 2, 3, 4, 6]) {
    if (notes.every((n) => isWhole(n.beat * s) && isWhole((n.beat + n.durationBeats) * s))) return s;
  }
  return null;
}

// ---------- Validation ----------

export function validateExercise(ex: TabExercise): string[] {
  const p: string[] = [];
  const at = (n: TabNote, i: number) => `note ${i} (beat ${n.beat}, string ${n.string})`;
  const total = exerciseLengthBeats(ex);

  if (!ex.id) p.push("id is empty");
  if (!Number.isInteger(ex.bars) || ex.bars < 1) p.push(`bars must be a positive integer (${ex.bars})`);
  if (!Number.isInteger(ex.beatsPerBar) || ex.beatsPerBar < 2 || ex.beatsPerBar > 7)
    p.push(`beatsPerBar must be 2 to 7 (${ex.beatsPerBar})`);
  if (!(ex.bpmDefault >= 40 && ex.bpmDefault <= 200)) p.push(`bpmDefault must be 40 to 200 (${ex.bpmDefault})`);
  if (ex.notes.length === 0) p.push("no notes");

  ex.notes.forEach((n, i) => {
    if (!Number.isInteger(n.string) || n.string < 1 || n.string > 6) p.push(`${at(n, i)}: string must be 1 to 6`);
    if (!Number.isInteger(n.fret) || n.fret < 0 || n.fret > 12) p.push(`${at(n, i)}: fret must be 0 to 12 (${n.fret})`);
    if (!(n.beat >= 0 && n.beat < total)) p.push(`${at(n, i)}: beat must be in [0, ${total})`);
    if (!(n.durationBeats > 0)) p.push(`${at(n, i)}: durationBeats must be positive`);
    else if (n.beat + n.durationBeats > total + EPS) p.push(`${at(n, i)}: extends past the end of the exercise`);
    if (n.finger !== undefined && ![1, 2, 3, 4].includes(n.finger)) p.push(`${at(n, i)}: finger must be 1 to 4`);
    if (n.finger !== undefined && n.fret === 0) p.push(`${at(n, i)}: open string must not have a finger`);
  });

  // Overlap on one string: one string can't play two notes at once
  for (let s = 1; s <= 6; s++) {
    const onString = sortNotes(ex.notes.filter((n) => n.string === s));
    for (let i = 1; i < onString.length; i++) {
      const prev = onString[i - 1]!;
      const cur = onString[i]!;
      if (cur.beat < prev.beat + prev.durationBeats - EPS) {
        p.push(`overlap on string ${s}: note at beat ${prev.beat} (length ${prev.durationBeats}) and note at beat ${cur.beat}`);
      }
    }
  }

  if (ex.notes.length && requiredSubdivisions(ex.notes) === null)
    p.push("note timing can't be represented with subdivisions 1/2/3/4/6");

  return p;
}

// ---------- Position in time ----------

export type PlayConfig = {
  beatsPerBar: number;
  /** Exercise length in beats */
  totalBeats: number;
  subdivisions: number;
  loop: boolean;
  /** Count-in bars (default 1) */
  countInBars?: number;
};

export type PlayPosition =
  | { phase: "count-in"; /** 1..beatsPerBar */ count: number; onBeat: boolean }
  | { phase: "play"; /** Position in the exercise in beats */ beatPos: number; loopIndex: number }
  | { phase: "done" };

export const countInTicks = (c: PlayConfig) => (c.countInBars ?? 1) * c.beatsPerBar * c.subdivisions;
export const exerciseTicks = (c: PlayConfig) => c.totalBeats * c.subdivisions;

export function positionFromTick(tick: number, c: PlayConfig): PlayPosition {
  const ci = countInTicks(c);
  if (tick < ci) {
    return { phase: "count-in", count: (Math.floor(tick / c.subdivisions) % c.beatsPerBar) + 1, onBeat: tick % c.subdivisions === 0 };
  }
  const t = tick - ci;
  const total = exerciseTicks(c);
  if (!c.loop && t >= total) return { phase: "done" };
  return { phase: "play", beatPos: (t % total) / c.subdivisions, loopIndex: Math.floor(t / total) };
}

/** Tick count after which playback must stop with loop off (count-in + one full pass) */
export const tickLimitWithoutLoop = (c: PlayConfig) => countInTicks(c) + exerciseTicks(c);

/**
 * If loop is turned off mid-play: playback continues to the end of the current pass, then stops.
 * nextTick = first tick not yet scheduled.
 */
export function tickLimitFinishingPass(nextTick: number, c: PlayConfig): number {
  const ci = countInTicks(c);
  const total = exerciseTicks(c);
  const passes = Math.max(1, Math.ceil((nextTick - ci) / total));
  return ci + passes * total;
}

// ---------- Which note is active ----------

/** Notes sounding at position pos: beat ≤ pos < beat + duration */
export function activeNotesAt(notes: readonly TabNote[], pos: number): TabNote[] {
  return notes.filter((n) => n.beat <= pos + EPS && pos < n.beat + n.durationBeats - EPS);
}

/** Notes that start exactly at pos (to play their sound) */
export function notesStartingAt(notes: readonly TabNote[], pos: number): TabNote[] {
  return notes.filter((n) => Math.abs(n.beat - pos) < EPS);
}

export type Neighbors = {
  current: TabNote[];
  previous: TabNote | null;
  next: TabNote | null;
};

/**
 * Current, previous and next note (for the fretboard preview).
 * With loop on, after the last note "next" is the first note of the exercise.
 */
export function neighborsAt(sortedNotes: readonly TabNote[], pos: number, loop: boolean): Neighbors {
  const current = activeNotesAt(sortedNotes, pos);
  const startOfCurrent = current.length ? Math.min(...current.map((n) => n.beat)) : pos;
  const endOfCurrent = current.length ? Math.max(...current.map((n) => n.beat)) : pos;

  let previous: TabNote | null = null;
  for (const n of sortedNotes) if (n.beat < startOfCurrent - EPS) previous = n;
  let next = sortedNotes.find((n) => n.beat > endOfCurrent + EPS) ?? null;

  if (loop && sortedNotes.length) {
    if (!next) next = sortedNotes[0]!;
    if (!previous) previous = sortedNotes[sortedNotes.length - 1]!;
  }
  return { current, previous, next };
}
