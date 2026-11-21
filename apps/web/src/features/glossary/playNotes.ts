import type { GlossaryTerm } from "@bg/shared";
import { getAudioContext } from "@/lib/audio/context";
import { stopActiveMetronome } from "@/lib/audio/metronome";
import { playPluck } from "@/lib/audio/pluck";
import { frequencyAt } from "@/lib/music";

/** Gap between notes of «بشنو» (seconds) */
export const NOTE_GAP = 0.7;
const NOTE_LENGTH = 1.2;

/**
 * Plays a term's notes one after another on the shared AudioContext.
 * Stops the metronome / TabPlayer / backing track first, so only one thing sounds.
 * Must be called inside a click handler. Returns how long it lasts in ms (0 = no audio).
 */
export function playTermNotes(notes: NonNullable<GlossaryTerm["audio"]>): number {
  const ctx = getAudioContext();
  if (!ctx || notes.length === 0) return 0;
  stopActiveMetronome();
  const start = ctx.currentTime + 0.05;
  notes.forEach((n, i) => playPluck(frequencyAt(n.string, n.fret), { at: start + i * NOTE_GAP, duration: NOTE_LENGTH }));
  return Math.round(((notes.length - 1) * NOTE_GAP + NOTE_LENGTH) * 1000);
}
