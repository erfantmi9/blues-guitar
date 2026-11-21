import { useCallback, useEffect, useState } from "react";
import type { BackingTrack } from "@bg/shared";
import { createBackingEngine, type BackingEngine, type BackingMix, type BackingView } from "@/lib/audio/backing";
import { useStopOnHidden } from "@/lib/hooks/useStopOnHidden";
import { useWakeLock } from "@/lib/hooks/useWakeLock";

export type StopReason = "hidden" | "unavailable";

type Options = { bpm: number; countIn: boolean; mix: BackingMix; visualOffsetMs: number };

/**
 * Connects the backing track engine to React. The view (bar, beat, count-in) comes only
 * from the engine's onView callback, i.e. from the audio clock, not a separate timer.
 */
export function useBackingTrack(track: BackingTrack, { bpm, countIn, mix, visualOffsetMs }: Options) {
  const [engine] = useState<BackingEngine>(() => createBackingEngine({ track, bpm, countIn, mix }));
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState<BackingView | null>(null);
  const [stopReason, setStopReason] = useState<StopReason | null>(null);

  useEffect(() => {
    const offView = engine.onView(setView);
    const offPlaying = engine.onPlayingChange((p) => {
      setPlaying(p);
      if (!p) setView(null);
    });
    return () => {
      offView();
      offPlaying();
      engine.stop();
    };
  }, [engine]);

  // Mid-play changes: BPM without a gap, mix ramps smoothly
  useEffect(() => engine.setTrack(track), [engine, track]);
  useEffect(() => engine.setBpm(bpm), [engine, bpm]);
  useEffect(() => engine.setCountIn(countIn), [engine, countIn]);
  useEffect(() => engine.setMix(mix), [engine, mix]);
  useEffect(() => engine.setVisualOffsetMs(visualOffsetMs), [engine, visualOffsetMs]);

  useStopOnHidden(() => {
    if (engine.isPlaying()) {
      engine.stop();
      setStopReason("hidden");
    }
  });
  useWakeLock(playing);

  /** Must be called from the button's onClick (first sound after user gesture, for iOS) */
  const toggle = useCallback(() => {
    if (engine.isPlaying()) {
      engine.stop();
      return;
    }
    setStopReason(null);
    void engine.start().then((ok) => {
      if (!ok) setStopReason("unavailable");
    });
  }, [engine]);

  return { playing, view, stopReason, toggle };
}
