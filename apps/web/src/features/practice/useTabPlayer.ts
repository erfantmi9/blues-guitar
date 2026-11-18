import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TabExercise } from "@bg/shared";
import { createMetronome, type BeatEvent, type Metronome } from "@/lib/audio/metronome";
import { playPluck } from "@/lib/audio/pluck";
import { useStopOnHidden } from "@/lib/hooks/useStopOnHidden";
import { useWakeLock } from "@/lib/hooks/useWakeLock";
import { frequencyAt } from "@/lib/music";
import {
  exerciseLengthBeats,
  notesStartingAt,
  positionFromTick,
  requiredSubdivisions,
  tickLimitFinishingPass,
  tickLimitWithoutLoop,
  type PlayConfig,
  type PlayPosition,
} from "@/lib/practice";

export type PlayerView =
  | { phase: "idle" }
  | { phase: "count-in"; count: number }
  | { phase: "play"; beatPos: number; loopIndex: number; secondsPerTick: number; tick: number }
  | { phase: "finished" };

type Options = { bpm: number; sound: boolean; loop: boolean; /** Manual display offset (ms) */ visualOffsetMs?: number };

/**
 * Plays a tab exercise on top of the metronome engine.
 * All view state comes from onBeat (the audio clock); note sounds are scheduled
 * on the same audio clock via onSchedule.
 */
export function useTabPlayer(exercise: TabExercise, { bpm, sound, loop, visualOffsetMs = 0 }: Options) {
  const config: PlayConfig = useMemo(
    () => ({
      beatsPerBar: exercise.beatsPerBar,
      totalBeats: exerciseLengthBeats(exercise),
      subdivisions: requiredSubdivisions(exercise.notes) ?? 1,
      loop,
    }),
    [exercise, loop],
  );

  const [metro] = useState<Metronome>(() => createMetronome({ bpm, accent: true }));
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState<PlayerView>({ phase: "idle" });
  const [stoppedByHidden, setStoppedByHidden] = useState(false);

  // Latest values for the metronome callbacks (without re-subscribing)
  const live = useRef({ config, sound, exercise });
  live.current = { config, sound, exercise };
  const reachedEnd = useRef(false);

  useEffect(() => {
    const toView = (pos: PlayPosition, e: BeatEvent): PlayerView => {
      if (pos.phase === "count-in") return { phase: "count-in", count: pos.count };
      if (pos.phase === "done") return { phase: "finished" };
      return { phase: "play", beatPos: pos.beatPos, loopIndex: pos.loopIndex, secondsPerTick: e.secondsPerTick, tick: e.tick };
    };

    const offBeat = metro.onBeat((e) => {
      const pos = positionFromTick(e.tick, live.current.config);
      setView(toView(pos, e));
    });

    // Note sounds: scheduled at the exact audio-clock time of the tick
    const offSchedule = metro.onSchedule((e) => {
      const { sound: on, exercise: ex, config: c } = live.current;
      if (!on) return;
      const pos = positionFromTick(e.tick, c);
      if (pos.phase !== "play") return;
      for (const n of notesStartingAt(ex.notes, pos.beatPos)) {
        const length = n.durationBeats * e.secondsPerTick * c.subdivisions;
        playPluck(frequencyAt(n.string, n.fret), { at: e.time, duration: Math.min(Math.max(length * 1.3, 0.4), 2) });
      }
    });

    const offPlaying = metro.onPlayingChange((p) => {
      setPlaying(p);
      // Natural stop (end of exercise with loop off) → "finished"; manual stop → idle
      setView(p ? { phase: "idle" } : reachedEnd.current ? { phase: "finished" } : { phase: "idle" });
      reachedEnd.current = false;
    });

    return () => {
      offBeat();
      offSchedule();
      offPlaying();
      metro.stop();
    };
  }, [metro]);

  // Mid-play changes
  useEffect(() => metro.setBpm(bpm), [metro, bpm]);
  useEffect(() => metro.setVisualOffsetMs(visualOffsetMs), [metro, visualOffsetMs]);
  useEffect(() => {
    if (!metro.isPlaying()) return;
    // Loop off: finish the current pass and stop; loop on: no limit
    metro.setTickLimit(loop ? null : tickLimitFinishingPass(metro.getNextTick(), config));
  }, [metro, loop, config]);

  // Changing exercise stops playback
  useEffect(() => {
    metro.stop();
    setView({ phase: "idle" });
  }, [metro, exercise.id]);

  useStopOnHidden(() => {
    if (metro.isPlaying()) {
      metro.stop();
      setStoppedByHidden(true);
    }
  });
  useWakeLock(playing);

  /** Must be called from the button's onClick (first sound after user gesture, for iOS) */
  const toggle = useCallback(() => {
    if (metro.isPlaying()) {
      metro.stop();
      return;
    }
    const c = live.current.config;
    setStoppedByHidden(false);
    reachedEnd.current = false;
    metro.setBeatsPerBar(c.beatsPerBar);
    metro.setSubdivisions(c.subdivisions);
    metro.setTickLimit(c.loop ? null : tickLimitWithoutLoop(c));
    void metro.start();
  }, [metro]);

  // With loop off, the last event is the last note; when the metronome stops itself, mark finished
  useEffect(() => {
    if (view.phase === "play" && !loop) {
      const lastTick = tickLimitWithoutLoop(config) - 1;
      if (view.tick >= lastTick) reachedEnd.current = true;
    }
  }, [view, loop, config]);

  return { playing, view, config, toggle, stoppedByHidden };
}
