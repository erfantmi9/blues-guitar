/**
 * Backing track engine. Runs on the metronome's lookahead scheduler (subdivisions = 3,
 * click off): onSchedule gives the exact audio-clock time of each slot, where the
 * drum/bass/chord sounds are scheduled; onBeat fires when that slot is actually heard
 * (output latency + manual offset), for the display. Starting it stops any other
 * engine (metronome, TabPlayer), since they share the same "one active" rule.
 */
import type { BackingTrack } from "@bg/shared";
import type { PlayConfig } from "@/lib/practice";
import { getAudioContext } from "../context";
import { createMetronome } from "../metronome";
import { backingPlayConfig, backingPositionFromTick, eventsAtTick, SLOTS_PER_BEAT, type BackingPosition } from "./pattern";
import { createBackingSynth, INSTRUMENTS, type BackingSynth, type Instrument } from "./synth";
import { clampToTrack } from "./validate";

export type ChannelMix = { on: boolean; volume: number };
export type BackingMix = Record<Instrument, ChannelMix> & { master: number };

export type BackingView = BackingPosition & {
  /** Scheduler tick; changes on every slot (for restarting animations) */
  tick: number;
  secondsPerTick: number;
};

export type BackingEngineOptions = {
  track: BackingTrack;
  bpm?: number;
  countIn?: boolean;
  mix?: BackingMix;
};

export const DEFAULT_MIX: BackingMix = {
  drums: { on: true, volume: 0.8 },
  bass: { on: true, volume: 0.8 },
  chords: { on: true, volume: 0.6 },
  master: 0.8,
};

export function createBackingEngine(options: BackingEngineOptions) {
  let track = options.track;
  let bpm = clampToTrack(track, options.bpm ?? track.bpmDefault);
  let countIn = options.countIn ?? true;
  let mix: BackingMix = options.mix ?? DEFAULT_MIX;
  /** Fixed at start, so toggling count-in mid-play doesn't shift the bar positions */
  let config: PlayConfig = backingPlayConfig(track.bars.length, countIn);
  let synth: BackingSynth | null = null;

  const metro = createMetronome({ bpm, beatsPerBar: 4, subdivisions: SLOTS_PER_BEAT, click: false, accent: false });
  const viewListeners = new Set<(v: BackingView) => void>();

  const applyMix = () => {
    if (!synth) return;
    for (const name of INSTRUMENTS) synth.setBusVolume(name, mix[name].on ? mix[name].volume : 0);
    synth.setMasterVolume(mix.master);
  };

  metro.onSchedule((e) => {
    if (!synth) return;
    const t = e.time;
    const tickSec = e.secondsPerTick;
    for (const ev of eventsAtTick(track, e.tick, config)) {
      switch (ev.kind) {
        case "kick":
        case "snare":
        case "hat":
          if (mix.drums.on) synth[ev.kind](t, ev.velocity);
          break;
        case "bass":
          if (mix.bass.on) synth.bass(ev.midi, t, ev.durationSlots * tickSec * 0.92);
          break;
        case "chord":
          if (mix.chords.on) synth.chord(ev.midi, t, ev.durationSlots * tickSec * 1.4);
          break;
      }
    }
  });

  metro.onBeat((e) => {
    const view: BackingView = { ...backingPositionFromTick(e.tick, config), tick: e.tick, secondsPerTick: e.secondsPerTick };
    viewListeners.forEach((l) => l(view));
  });

  // Notes scheduled in the lookahead window must not sound after stop
  metro.onPlayingChange((p) => {
    if (!p) synth?.stopAll();
  });

  return {
    /** Must be called directly inside a click/tap handler (for iOS) */
    async start(): Promise<boolean> {
      if (metro.isPlaying()) return true;
      const ctx = getAudioContext();
      if (!ctx) return false;
      synth ??= createBackingSynth(ctx);
      applyMix();
      config = backingPlayConfig(track.bars.length, countIn);
      metro.setBpm(bpm);
      return metro.start();
    },
    stop: () => metro.stop(),
    isPlaying: () => metro.isPlaying(),

    /** Mid-play: takes effect on the next slot, without a gap (same as the metronome) */
    setBpm(value: number) {
      bpm = clampToTrack(track, value);
      metro.setBpm(bpm);
    },
    getBpm: () => bpm,

    /** Changing track stops playback */
    setTrack(value: BackingTrack) {
      if (value === track) return;
      metro.stop();
      track = value;
      bpm = clampToTrack(track, bpm);
    },

    /** Applies from the next start */
    setCountIn(value: boolean) {
      countIn = value;
    },

    /** Mid-play: volumes ramp smoothly; turning an instrument off also silences notes already scheduled */
    setMix(value: BackingMix) {
      mix = value;
      applyMix();
    },

    setVisualOffsetMs: (ms: number) => metro.setVisualOffsetMs(ms),

    /** Called when each slot is heard. Returns an unsubscribe function. */
    onView(listener: (v: BackingView) => void) {
      viewListeners.add(listener);
      return () => void viewListeners.delete(listener);
    },
    onPlayingChange: metro.onPlayingChange,
  };
}

export type BackingEngine = ReturnType<typeof createBackingEngine>;
