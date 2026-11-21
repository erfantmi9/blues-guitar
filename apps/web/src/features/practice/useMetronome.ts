import { useCallback, useEffect, useState } from "react";
import { createMetronome, clampBeats, clampBpm, type Metronome } from "@/lib/audio/metronome";
import { useStopOnHidden } from "@/lib/hooks/useStopOnHidden";
import { useWakeLock } from "@/lib/hooks/useWakeLock";
import { defineKey, useStoredValue } from "@/lib/storage";

export type MetronomeSettings = {
  bpm: number;
  beatsPerBar: number;
  accent: boolean;
};

const settingsKey = defineKey<MetronomeSettings>("practice:metronome", {
  version: 1,
  fallback: { bpm: 70, beatsPerBar: 4, accent: true },
});

export type StopReason = "hidden" | "unavailable";

/** Connects the metronome engine to React: settings in storage, wake lock, stop on hidden tab */
export function useMetronome() {
  const [settings, setSettings] = useStoredValue(settingsKey);
  // One engine per component lifetime
  const [metro] = useState<Metronome>(() => createMetronome(settings));
  const [playing, setPlaying] = useState(false);
  /** Last beat heard; n changes so the animation restarts */
  const [current, setCurrent] = useState<{ beat: number; n: number } | null>(null);
  const [stopReason, setStopReason] = useState<StopReason | null>(null);

  useEffect(() => {
    const offBeat = metro.onBeat((e) => setCurrent((c) => ({ beat: e.beat, n: (c?.n ?? 0) + 1 })));
    const offPlaying = metro.onPlayingChange((p) => {
      setPlaying(p);
      if (!p) setCurrent(null);
    });
    return () => {
      offBeat();
      offPlaying();
      metro.stop();
    };
  }, [metro]);

  // Settings → engine (BPM changes apply mid-play without stopping)
  useEffect(() => metro.setBpm(settings.bpm), [metro, settings.bpm]);
  useEffect(() => metro.setBeatsPerBar(settings.beatsPerBar), [metro, settings.beatsPerBar]);
  useEffect(() => metro.setAccent(settings.accent), [metro, settings.accent]);

  // In the background, timers are throttled and beats become irregular, so we stop and say why
  useStopOnHidden(() => {
    if (metro.isPlaying()) {
      metro.stop();
      setStopReason("hidden");
    }
  });

  useWakeLock(playing);

  /** Must be called from the button's onClick (first sound after user gesture, for iOS) */
  const toggle = useCallback(() => {
    if (metro.isPlaying()) {
      metro.stop();
      return;
    }
    setStopReason(null);
    void metro.start().then((ok) => {
      if (!ok) setStopReason("unavailable");
    });
  }, [metro]);

  const setBpm = useCallback((u: number | ((b: number) => number)) => {
    setSettings((s) => ({ ...s, bpm: clampBpm(typeof u === "function" ? u(s.bpm) : u) }));
  }, [setSettings]);

  const setBeatsPerBar = useCallback(
    (n: number) => setSettings((s) => ({ ...s, beatsPerBar: clampBeats(n) })),
    [setSettings],
  );

  const setAccent = useCallback((a: boolean) => setSettings((s) => ({ ...s, accent: a })), [setSettings]);

  return { settings, playing, current, stopReason, toggle, setBpm, setBeatsPerBar, setAccent };
}

/** For backup/restore (features/settings) */
export { settingsKey as metronomeSettingsKey };
