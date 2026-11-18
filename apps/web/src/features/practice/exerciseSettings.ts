import { useCallback } from "react";
import { clampBpm } from "@/lib/audio/metronome";
import { defineKey, useStoredValue } from "@/lib/storage";

export type ExerciseSettings = {
  selectedId: string | null;
  /** Last BPM per exercise */
  bpmById: Record<string, number>;
  /** Default silent: the user plays their own guitar */
  sound: boolean;
  loop: boolean;
  /** Manual display delay compensation in ms (-200..+200); positive = visuals later */
  visualOffsetMs: number;
};

export const VISUAL_OFFSET_LIMIT = 200;

const key = defineKey<ExerciseSettings>("practice:exercises", {
  version: 2,
  fallback: { selectedId: null, bpmById: {}, sound: false, loop: true, visualOffsetMs: 0 },
  // v1 → v2: visualOffsetMs added; keep the rest of the previous settings
  migrate: (data, from) =>
    from === 1 && data && typeof data === "object"
      ? { ...(data as Omit<ExerciseSettings, "visualOffsetMs">), visualOffsetMs: 0 }
      : undefined,
});

const clampOffset = (ms: number) =>
  Math.round(Math.min(VISUAL_OFFSET_LIMIT, Math.max(-VISUAL_OFFSET_LIMIT, Number.isFinite(ms) ? ms : 0)));

export function useExerciseSettings() {
  const [settings, set] = useStoredValue(key);
  return {
    settings,
    select: useCallback((id: string) => set((s) => ({ ...s, selectedId: id })), [set]),
    setBpm: useCallback(
      (id: string, bpm: number) => set((s) => ({ ...s, bpmById: { ...s.bpmById, [id]: clampBpm(bpm) } })),
      [set],
    ),
    /** Relative change against the latest stored value (so fast taps aren't lost) */
    stepBpm: useCallback(
      (id: string, delta: number, fallback: number) =>
        set((s) => ({ ...s, bpmById: { ...s.bpmById, [id]: clampBpm((s.bpmById[id] ?? fallback) + delta) } })),
      [set],
    ),
    resetBpm: useCallback(
      (id: string) =>
        set((s) => {
          const { [id]: _removed, ...rest } = s.bpmById;
          return { ...s, bpmById: rest };
        }),
      [set],
    ),
    setSound: useCallback((sound: boolean) => set((s) => ({ ...s, sound })), [set]),
    setLoop: useCallback((loop: boolean) => set((s) => ({ ...s, loop })), [set]),
    setVisualOffsetMs: useCallback((ms: number) => set((s) => ({ ...s, visualOffsetMs: clampOffset(ms) })), [set]),
    /** Relative change against the latest stored value (so fast taps aren't lost) */
    stepVisualOffsetMs: useCallback(
      (delta: number) => set((s) => ({ ...s, visualOffsetMs: clampOffset((s.visualOffsetMs ?? 0) + delta) })),
      [set],
    ),
  };
}
