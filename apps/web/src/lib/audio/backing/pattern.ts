/**
 * Backing track timing and events. Pure logic: no Web Audio, React or DOM.
 *
 * Grid: 4 beats per bar × 3 slots per beat = 12 slots (0..11). The metronome
 * scheduler runs with subdivisions = 3, so one tick = one slot.
 * Shuffle: melodic events (bass) only on the 1st and 3rd slot of each beat
 * ("long-short"), i.e. slots 0, 2, 3, 5, 6, 8, 9, 11.
 */
import type { BackingTrack } from "@bg/shared";
import { positionFromTick, type PlayConfig } from "@/lib/practice";

export const BEATS_PER_BAR = 4;
export const SLOTS_PER_BEAT = 3;
export const SLOTS_PER_BAR = BEATS_PER_BAR * SLOTS_PER_BEAT;

/** Slots of a bar that carry shuffle notes; index in this list = index in BackingBar.bass */
export const SHUFFLE_SLOTS: readonly number[] = [0, 2, 3, 5, 6, 8, 9, 11];

export const isShuffleSlot = (slot: number) => SHUFFLE_SLOTS.includes(slot);
export const isBeatSlot = (slot: number) => slot % SLOTS_PER_BEAT === 0;

/** Slots where the chord stab plays: beats 2 and 4 */
export const CHORD_SLOTS: readonly number[] = [3, 9];

// ---------- Shared shuffle drum pattern (code, not data) ----------

export type DrumKind = "kick" | "snare" | "hat";

/** Hits of one slot, in the order kick, snare, hat. Velocity 0..1 */
export function drumHitsAt(slot: number): { kind: DrumKind; velocity: number }[] {
  const hits: { kind: DrumKind; velocity: number }[] = [];
  if (slot === 0 || slot === 6) hits.push({ kind: "kick", velocity: slot === 0 ? 1 : 0.85 }); // beats 1 and 3
  if (slot === 3 || slot === 9) hits.push({ kind: "snare", velocity: 1 }); // beats 2 and 4
  if (isShuffleSlot(slot)) hits.push({ kind: "hat", velocity: isBeatSlot(slot) ? 1 : 0.6 }); // a bit louder on the beat
  return hits;
}

// ---------- Events of one slot ----------

export type BackingEvent =
  | { kind: DrumKind; velocity: number }
  /** durationSlots: until the next shuffle slot (2 = long, 1 = short) */
  | { kind: "bass"; midi: number; durationSlots: number }
  | { kind: "chord"; midi: number[]; name: string; durationSlots: number };

/** Number of slots from this shuffle slot to the next one (wrapping into the next bar) */
export function slotsUntilNextShuffle(slot: number): number {
  const next = SHUFFLE_SLOTS.find((s) => s > slot) ?? SHUFFLE_SLOTS[0]! + SLOTS_PER_BAR;
  return next - slot;
}

/** Everything that sounds on this slot of this bar, in order kick, snare, hat, bass, chord */
export function slotEvents(track: Pick<BackingTrack, "bars">, barIndex: number, slot: number): BackingEvent[] {
  const bar = track.bars[barIndex];
  const events: BackingEvent[] = drumHitsAt(slot);
  if (!bar) return events;
  const bassIndex = SHUFFLE_SLOTS.indexOf(slot);
  const midi = bassIndex >= 0 ? bar.bass[bassIndex] : null;
  if (midi != null) events.push({ kind: "bass", midi, durationSlots: slotsUntilNextShuffle(slot) });
  if (CHORD_SLOTS.includes(slot) && bar.chord.midi.length) {
    events.push({ kind: "chord", midi: bar.chord.midi, name: bar.chord.name, durationSlots: 1 });
  }
  return events;
}

/** Count-in bar: hi-hat on each of the 4 beats */
export function countInEvents(slot: number): BackingEvent[] {
  return isBeatSlot(slot) ? [{ kind: "hat", velocity: slot === 0 ? 1 : 0.8 }] : [];
}

// ---------- Position in time ----------

export type BackingPosition =
  | { phase: "count-in"; /** 0..3 */ beat: number; slot: number }
  | { phase: "play"; bar: number; /** 0..3 */ beat: number; slot: number; loopIndex: number };

/** Same time model as tab exercises (lib/practice): count-in first, then loop by modulo */
export const backingPlayConfig = (barCount: number, countIn: boolean): PlayConfig => ({
  beatsPerBar: BEATS_PER_BAR,
  totalBeats: barCount * BEATS_PER_BAR,
  subdivisions: SLOTS_PER_BEAT,
  loop: true,
  countInBars: countIn ? 1 : 0,
});

export function backingPositionFromTick(tick: number, config: PlayConfig): BackingPosition {
  const pos = positionFromTick(tick, config);
  if (pos.phase === "count-in") {
    return { phase: "count-in", beat: pos.count - 1, slot: tick % SLOTS_PER_BAR };
  }
  if (pos.phase === "done") throw new Error("backing track always loops");
  // Integer slot index within the track (beatPos is k / 3)
  const s = Math.round(pos.beatPos * SLOTS_PER_BEAT);
  const slot = s % SLOTS_PER_BAR;
  return { phase: "play", bar: Math.floor(s / SLOTS_PER_BAR), beat: Math.floor(slot / SLOTS_PER_BEAT), slot, loopIndex: pos.loopIndex };
}

/** Events for a scheduler tick */
export function eventsAtTick(track: Pick<BackingTrack, "bars">, tick: number, config: PlayConfig): BackingEvent[] {
  const pos = backingPositionFromTick(tick, config);
  return pos.phase === "count-in" ? countInEvents(pos.slot) : slotEvents(track, pos.bar, pos.slot);
}
