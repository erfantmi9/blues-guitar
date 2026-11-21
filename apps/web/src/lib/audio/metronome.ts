/**
 * Accurate metronome using a lookahead scheduler.
 *
 * Why not setInterval for each beat? JS timers jitter by tens of milliseconds and
 * are throttled in the background. Instead, a short timer (~25ms) runs and schedules
 * beats in the next ~120ms on the audio clock (AudioContext.currentTime) via
 * osc.start(when). The timer only has to "wake up in time"; the exact moment of the
 * sound is set by the audio clock.
 *
 * Visual sync: scheduled beats go into a queue; a requestAnimationFrame loop
 * calls onBeat when the audio clock (plus output latency) reaches each beat.
 * So the animation follows the sound, not a separate timer.
 *
 * Subdivision: with subdivisions > 1 each beat is split into equal ticks
 * (e.g. 2 = eighth notes). All ticks are on the same audio clock; clicks are
 * only on full beats. Default 1 = previous behavior.
 */
import { getAudioContext } from "./context";

export const BPM_MIN = 40;
export const BPM_MAX = 200;
export const BEATS_MIN = 2;
export const BEATS_MAX = 7;
export const SUBDIVISIONS_MAX = 6;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
export const clampBpm = (bpm: number) => clamp(Math.round(Number.isFinite(bpm) ? bpm : 0), BPM_MIN, BPM_MAX);
export const clampBeats = (n: number) => clamp(Math.round(Number.isFinite(n) ? n : 0), BEATS_MIN, BEATS_MAX);
const clampSub = (n: number) => clamp(Math.round(Number.isFinite(n) ? n : 1), 1, SUBDIVISIONS_MAX);

/** Spacing between two beats in seconds; 120 BPM → 0.5 */
export const secondsPerBeat = (bpm: number) => 60 / clampBpm(bpm);

// ---------- Pure logic (testable without a browser) ----------

export type ScheduledBeat = {
  /** Beat index within the bar, from 0 */
  beat: number;
  /** Subdivision index within the beat, from 0 (always 0 when subdivisions=1) */
  sub: number;
  /** Total tick count since start (0, 1, 2, …); used to compute position and loop */
  tick: number;
  /** Time on the audio clock (seconds) */
  time: number;
};

export type SchedulerState = {
  /** Time of the next tick not yet scheduled */
  nextTime: number;
  nextBeat: number;
  nextSub: number;
  nextTick: number;
};

export const initialSchedulerState = (startTime: number): SchedulerState => ({
  nextTime: startTime,
  nextBeat: 0,
  nextSub: 0,
  nextTick: 0,
});

/** All ticks before `until` (end of the lookahead window) and below tickLimit, plus the new state */
export function scheduleWindow(
  state: SchedulerState,
  until: number,
  bpm: number,
  beatsPerBar: number,
  subdivisions = 1,
  tickLimit = Infinity,
): { beats: ScheduledBeat[]; state: SchedulerState } {
  const subs = clampSub(subdivisions);
  const step = secondsPerBeat(bpm) / subs;
  const bar = clampBeats(beatsPerBar);
  const beats: ScheduledBeat[] = [];
  let { nextTime, nextBeat, nextSub, nextTick } = state;
  nextBeat %= bar;
  if (nextSub >= subs) nextSub = 0;
  while (nextTime < until && nextTick < tickLimit) {
    beats.push({ beat: nextBeat, sub: nextSub, tick: nextTick, time: nextTime });
    nextTime += step;
    nextTick++;
    nextSub++;
    if (nextSub >= subs) {
      nextSub = 0;
      nextBeat = (nextBeat + 1) % bar;
    }
  }
  return { beats, state: { nextTime, nextBeat, nextSub, nextTick } };
}

/**
 * Tempo change mid-play: the next tick is placed after the last scheduled tick
 * using the new spacing, so the change is heard right away and nothing stops.
 */
export function retime(
  state: SchedulerState,
  lastTime: number | null,
  bpm: number,
  now: number,
  subdivisions = 1,
): SchedulerState {
  if (lastTime === null) return state;
  return { ...state, nextTime: Math.max(lastTime + secondsPerBeat(bpm) / clampSub(subdivisions), now) };
}

// ---------- Audio engine ----------

export type BeatEvent = ScheduledBeat & {
  accent: boolean;
  /** Length of this tick in seconds (for smooth animation up to the next tick) */
  secondsPerTick: number;
};

export type MetronomeOptions = {
  bpm?: number;
  beatsPerBar?: number;
  /** Louder and higher sound on beat 1 */
  accent?: boolean;
  /** Ticks per beat (default 1) */
  subdivisions?: number;
  /**
   * Play the click sound on beats (default true). The backing track turns it off
   * and uses the scheduler only as a clock (onSchedule/onBeat still fire).
   */
  click?: boolean;
  /** How often the scheduler wakes up (ms) */
  lookaheadMs?: number;
  /** How far ahead it schedules (seconds) */
  scheduleAheadSec?: number;
};

export type Metronome = ReturnType<typeof createMetronome>;

/**
 * Only one engine plays at a time: the metronome, the TabPlayer and the backing track all
 * run on this scheduler, so starting any of them stops the others.
 */
let activeMetronome: { stop: () => void } | null = null;

export function createMetronome(options: MetronomeOptions = {}) {
  let bpm = clampBpm(options.bpm ?? 80);
  let beatsPerBar = clampBeats(options.beatsPerBar ?? 4);
  let accent = options.accent ?? true;
  let subdivisions = clampSub(options.subdivisions ?? 1);
  let click = options.click ?? true;
  let tickLimit = Infinity;
  const lookaheadMs = options.lookaheadMs ?? 25;
  const aheadSec = options.scheduleAheadSec ?? 0.12;
  /** Manual display offset (seconds): positive = visuals later, negative = earlier. Sound is unchanged. */
  let visualOffset = 0;

  let ctx: AudioContext | null = null;
  let playing = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  let raf: number | null = null;
  let state: SchedulerState = initialSchedulerState(0);
  let lastTime: number | null = null;
  let lastStep = 0;
  const queue: BeatEvent[] = [];
  const pending = new Set<OscillatorNode>();

  const beatListeners = new Set<(e: BeatEvent) => void>();
  const scheduleListeners = new Set<(e: BeatEvent) => void>();
  const playingListeners = new Set<(playing: boolean) => void>();
  const setPlaying = (p: boolean) => {
    playing = p;
    playingListeners.forEach((l) => l(p));
  };

  function playClick(c: AudioContext, time: number, accented: boolean) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "triangle";
    osc.frequency.value = accented ? 1760 : 1100;
    const peak = accented ? 0.9 : 0.5;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    osc.connect(gain).connect(c.destination);
    osc.start(time);
    osc.stop(time + 0.06);
    pending.add(osc);
    osc.onended = () => {
      pending.delete(osc);
      gain.disconnect();
    };
  }

  function tick() {
    if (!ctx || !playing) return;
    const step = secondsPerBeat(bpm) / subdivisions;
    // With a negative offset, events must be in the queue earlier, so look further ahead
    const horizon = aheadSec + Math.max(0, -visualOffset);
    const res = scheduleWindow(state, ctx.currentTime + horizon, bpm, beatsPerBar, subdivisions, tickLimit);
    for (const b of res.beats) {
      const accented = accent && b.beat === 0 && b.sub === 0;
      if (b.sub === 0 && click) playClick(ctx, b.time, accented);
      const event: BeatEvent = { ...b, accent: accented, secondsPerTick: step };
      scheduleListeners.forEach((l) => l(event));
      queue.push(event);
      lastTime = b.time;
      lastStep = step;
    }
    state = res.state;
  }

  function draw() {
    if (!ctx || !playing) return;
    // Time the sound actually reaches the speaker (matters for Bluetooth)
    // + manual offset (e.g. Bluetooth latency the browser doesn't report correctly)
    const heard = ctx.currentTime - (ctx.outputLatency || 0) - (ctx.baseLatency || 0) - visualOffset;
    let latest: BeatEvent | undefined;
    while (queue.length && queue[0]!.time <= heard) latest = queue.shift();
    // If several are overdue (e.g. a dropped frame), only show the last one
    if (latest) beatListeners.forEach((l) => l(latest!));
    // Reached the tick limit: stop once the last tick has finished
    if (state.nextTick >= tickLimit && queue.length === 0 && lastTime !== null && heard >= lastTime + lastStep) {
      api.stop();
      return;
    }
    raf = requestAnimationFrame(draw);
  }

  /** Silent sound inside the user gesture: unlocks audio on iOS */
  function unlock(c: AudioContext) {
    try {
      const src = c.createBufferSource();
      src.buffer = c.createBuffer(1, 1, c.sampleRate);
      src.connect(c.destination);
      src.start(0);
    } catch {
      /* ignore */
    }
  }

  const api = {
    /**
     * Must be called directly inside a click/tap handler (for iOS).
     * Returns false if audio is unavailable.
     */
    async start(): Promise<boolean> {
      if (playing) return true;
      ctx = getAudioContext();
      if (!ctx) return false;
      unlock(ctx);
      if (activeMetronome && activeMetronome !== api) activeMetronome.stop();
      activeMetronome = api;
      setPlaying(true);
      if (ctx.state !== "running") {
        try {
          await ctx.resume();
        } catch {
          /* checked below */
        }
      }
      if (!playing) return false; // stopped while waiting
      if (ctx.state !== "running") {
        setPlaying(false);
        return false;
      }
      queue.length = 0;
      lastTime = null;
      state = initialSchedulerState(ctx.currentTime + 0.08);
      tick();
      timer = setInterval(tick, lookaheadMs);
      raf = requestAnimationFrame(draw);
      return true;
    },

    stop() {
      if (timer !== null) clearInterval(timer);
      if (raf !== null) cancelAnimationFrame(raf);
      timer = null;
      raf = null;
      queue.length = 0;
      // Already-scheduled beats that haven't sounded yet must not play
      for (const osc of pending) {
        try {
          osc.stop();
        } catch {
          /* already stopped */
        }
      }
      pending.clear();
      if (activeMetronome === api) activeMetronome = null;
      if (playing) setPlaying(false);
    },

    setBpm(value: number) {
      bpm = clampBpm(value);
      if (playing && ctx) state = retime(state, lastTime, bpm, ctx.currentTime, subdivisions);
    },

    setBeatsPerBar(value: number) {
      beatsPerBar = clampBeats(value);
      if (state.nextBeat >= beatsPerBar) state = { ...state, nextBeat: 0 };
    },

    setAccent(value: boolean) {
      accent = value;
    },

    /** Click sound on/off (scheduling and callbacks are unchanged) */
    setClick(value: boolean) {
      click = value;
    },

    /** Ticks per beat; set before start */
    setSubdivisions(value: number) {
      subdivisions = clampSub(value);
    },

    /** Ticks at or after this number are not scheduled; when the last one ends, playback stops. null = no limit */
    setTickLimit(value: number | null) {
      tickLimit = value === null ? Infinity : Math.max(0, Math.floor(value));
    },

    /** Number of the next tick not yet scheduled */
    getNextTick: () => state.nextTick,

    /** Display offset in milliseconds (-200..+200); positive = visuals later than the computed time */
    setVisualOffsetMs(ms: number) {
      visualOffset = Math.min(200, Math.max(-200, Number.isFinite(ms) ? ms : 0)) / 1000;
    },

    /** Called when each tick is heard (for animation). Returns an unsubscribe function. */
    onBeat(listener: (e: BeatEvent) => void) {
      beatListeners.add(listener);
      return () => void beatListeners.delete(listener);
    },

    /**
     * Called when each tick is scheduled (≈120ms before it is heard), with its
     * exact audio-clock time. For scheduling extra sounds (e.g. notes) in sync.
     */
    onSchedule(listener: (e: BeatEvent) => void) {
      scheduleListeners.add(listener);
      return () => void scheduleListeners.delete(listener);
    },

    onPlayingChange(listener: (playing: boolean) => void) {
      playingListeners.add(listener);
      return () => void playingListeners.delete(listener);
    },

    isPlaying: () => playing,
    getBpm: () => bpm,
    getBeatsPerBar: () => beatsPerBar,
  };

  return api;
}
