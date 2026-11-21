import type { BackingTrack } from "@bg/shared";
import { BPM_MAX, BPM_MIN } from "../metronome";
import { SHUFFLE_SLOTS } from "./pattern";

const isMidi = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 127;

/** Content problems of a backing track; empty = valid */
export function validateBackingTrack(t: BackingTrack): string[] {
  const p: string[] = [];
  if (!t.id) p.push("id is empty");
  if (!t.title) p.push("title is empty");
  if (t.beatsPerBar !== 4) p.push(`beatsPerBar must be 4 (${t.beatsPerBar})`);

  const bpmOk = (n: number) => Number.isInteger(n) && n >= BPM_MIN && n <= BPM_MAX;
  if (!bpmOk(t.bpmMin)) p.push(`bpmMin must be an integer ${BPM_MIN} to ${BPM_MAX} (${t.bpmMin})`);
  if (!bpmOk(t.bpmMax)) p.push(`bpmMax must be an integer ${BPM_MIN} to ${BPM_MAX} (${t.bpmMax})`);
  if (!(t.bpmMin <= t.bpmMax)) p.push(`bpmMin (${t.bpmMin}) is greater than bpmMax (${t.bpmMax})`);
  if (!(Number.isInteger(t.bpmDefault) && t.bpmDefault >= t.bpmMin && t.bpmDefault <= t.bpmMax))
    p.push(`bpmDefault must be in [bpmMin, bpmMax] (${t.bpmDefault})`);

  if (!Array.isArray(t.bars) || t.bars.length === 0) p.push("no bars");
  (t.bars ?? []).forEach((bar, i) => {
    const at = `bar ${i + 1}`;
    if (!bar.chord?.name) p.push(`${at}: chord name is empty`);
    if (!Array.isArray(bar.chord?.midi) || bar.chord.midi.length === 0) p.push(`${at}: chord has no notes`);
    else bar.chord.midi.forEach((m, j) => !isMidi(m) && p.push(`${at}: chord note ${j} is not a valid MIDI number (${m})`));
    if (!Array.isArray(bar.bass) || bar.bass.length !== SHUFFLE_SLOTS.length)
      p.push(`${at}: bass must have ${SHUFFLE_SLOTS.length} notes (${bar.bass?.length})`);
    else bar.bass.forEach((m, j) => m !== null && !isMidi(m) && p.push(`${at}: bass note ${j} is not a valid MIDI number (${m})`));
  });
  return p;
}

export const clampToTrack = (t: Pick<BackingTrack, "bpmMin" | "bpmMax">, bpm: number) =>
  Math.min(t.bpmMax, Math.max(t.bpmMin, Math.round(Number.isFinite(bpm) ? bpm : t.bpmMin)));
