import { useCallback } from "react";
import type { BackingTrack } from "@bg/shared";
import { clampToTrack, DEFAULT_MIX, type BackingMix, type Instrument } from "@/lib/audio/backing";
import { defineKey, useStoredValue } from "@/lib/storage";

export type BackingSettings = {
  /** Last BPM per track (no entry = the track's default) */
  bpmById: Record<string, number>;
  countIn: boolean;
  mix: BackingMix;
};

const key = defineKey<BackingSettings>("practice:backing", {
  version: 1,
  fallback: { bpmById: {}, countIn: true, mix: DEFAULT_MIX },
});

const clamp01 = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));

export function useBackingSettings() {
  const [settings, set] = useStoredValue(key);
  return {
    settings,
    setBpm: useCallback(
      (t: BackingTrack, bpm: number) => set((s) => ({ ...s, bpmById: { ...s.bpmById, [t.id]: clampToTrack(t, bpm) } })),
      [set],
    ),
    /** Relative change against the latest stored value (so fast taps aren't lost) */
    stepBpm: useCallback(
      (t: BackingTrack, delta: number) =>
        set((s) => ({
          ...s,
          bpmById: { ...s.bpmById, [t.id]: clampToTrack(t, (s.bpmById[t.id] ?? t.bpmDefault) + delta) },
        })),
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
    setCountIn: useCallback((countIn: boolean) => set((s) => ({ ...s, countIn })), [set]),
    setChannel: useCallback(
      (name: Instrument, patch: Partial<BackingMix[Instrument]>) =>
        set((s) => {
          const ch = { ...s.mix[name], ...patch };
          return { ...s, mix: { ...s.mix, [name]: { on: !!ch.on, volume: clamp01(ch.volume) } } };
        }),
      [set],
    ),
    setMaster: useCallback((v: number) => set((s) => ({ ...s, mix: { ...s.mix, master: clamp01(v) } })), [set]),
  };
}
