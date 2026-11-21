/**
 * Backing track sounds, made entirely with Web Audio (no audio files).
 *
 * Signal path: each instrument → its bus (drums / bass / chords) → master → compressor → speakers.
 * The compressor keeps the sum from clipping when kick, bass and chord land together.
 */
import { midiToFrequency } from "@/lib/music";

export type Instrument = "drums" | "bass" | "chords";
export const INSTRUMENTS: readonly Instrument[] = ["drums", "bass", "chords"];

/** Per-bus loudness at volume 1 (balanced so the guitar has room on top) */
const BUS_LEVEL: Record<Instrument, number> = { drums: 0.9, bass: 0.8, chords: 0.45 };

/** Short ramp for volume changes so there are no clicks */
const SMOOTH = 0.02;

export function createBackingSynth(ctx: AudioContext) {
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -16;
  compressor.knee.value = 10;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.18;
  compressor.connect(ctx.destination);

  const master = ctx.createGain();
  master.gain.value = 0.8;
  master.connect(compressor);

  const buses = Object.fromEntries(
    INSTRUMENTS.map((name) => {
      const g = ctx.createGain();
      g.gain.value = BUS_LEVEL[name];
      g.connect(master);
      return [name, g];
    }),
  ) as Record<Instrument, GainNode>;

  // One second of white noise, reused by snare and hi-hat
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  {
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  /** Sources scheduled but maybe not yet played; stopped on stop() */
  const live = new Set<AudioScheduledSourceNode>();
  function track(src: AudioScheduledSourceNode, ...nodes: AudioNode[]) {
    live.add(src);
    src.onended = () => {
      live.delete(src);
      src.disconnect();
      nodes.forEach((n) => n.disconnect());
    };
  }

  /** Gain with a fast attack and exponential decay to silence */
  function envelope(t: number, peak: number, decay: number, attack = 0.002) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    return g;
  }

  function noiseSource(t: number, length: number) {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    // Random start point so consecutive hits don't sound identical
    src.start(t, Math.random() * 0.5, length);
    return src;
  }

  function kick(t: number, velocity: number) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.11);
    const env = envelope(t, 0.95 * velocity, 0.32);
    osc.connect(env).connect(buses.drums);
    osc.start(t);
    osc.stop(t + 0.4);
    track(osc, env);
  }

  function snare(t: number, velocity: number) {
    const src = noiseSource(t, 0.22);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1400;
    const env = envelope(t, 0.42 * velocity, 0.16);
    src.connect(hp).connect(env).connect(buses.drums);
    track(src, hp, env);

    const body = ctx.createOscillator();
    body.type = "sine";
    body.frequency.setValueAtTime(200, t);
    body.frequency.exponentialRampToValueAtTime(170, t + 0.08);
    const bodyEnv = envelope(t, 0.35 * velocity, 0.08);
    body.connect(bodyEnv).connect(buses.drums);
    body.start(t);
    body.stop(t + 0.12);
    track(body, bodyEnv);
  }

  function hat(t: number, velocity: number) {
    const src = noiseSource(t, 0.06);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7500;
    const env = envelope(t, 0.2 * velocity, 0.035, 0.001);
    src.connect(hp).connect(env).connect(buses.drums);
    track(src, hp, env);
  }

  /**
   * Bass: triangle + a little sawtooth through a lowpass that keeps the first few
   * harmonics, so the line is still heard on small phone speakers that can't play the fundamental.
   */
  function bass(midi: number, t: number, duration: number) {
    const f = midiToFrequency(midi);
    const end = t + Math.max(duration, 0.06);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 0.9;
    lp.frequency.setValueAtTime(Math.min(f * 9, 2200), t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(f * 5, 600), t + Math.min(duration, 0.25));

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(0.5, t + 0.008);
    env.gain.exponentialRampToValueAtTime(0.32, t + Math.min(0.12, duration * 0.6));
    env.gain.setValueAtTime(0.32, Math.max(end - 0.04, t + 0.01));
    env.gain.exponentialRampToValueAtTime(0.0001, end);

    const tri = ctx.createOscillator();
    tri.type = "triangle";
    tri.frequency.value = f;
    const saw = ctx.createOscillator();
    saw.type = "sawtooth";
    saw.frequency.value = f;
    const sawGain = ctx.createGain();
    sawGain.gain.value = 0.28;

    tri.connect(lp);
    saw.connect(sawGain).connect(lp);
    lp.connect(env).connect(buses.bass);
    for (const o of [tri, saw]) {
      o.start(t);
      o.stop(end + 0.02);
    }
    track(tri, lp, env);
    track(saw, sawGain);
  }

  /** Chord stab: short, soft and darkened by a closing lowpass */
  function chord(midis: readonly number[], t: number, duration: number) {
    const len = Math.min(Math.max(duration, 0.12), 0.35);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 0.5;
    lp.frequency.setValueAtTime(2400, t);
    lp.frequency.exponentialRampToValueAtTime(800, t + len);
    const env = envelope(t, 0.7, len, 0.008);
    lp.connect(env).connect(buses.chords);
    const per = 1 / Math.max(1, midis.length);
    midis.forEach((m, i) => {
      const f = midiToFrequency(m);
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "triangle" : "sawtooth";
      osc.frequency.value = f;
      osc.detune.value = (i % 2 ? 1 : -1) * 4; // tiny detune: softer, less "beep"
      const g = ctx.createGain();
      g.gain.value = per * (osc.type === "sawtooth" ? 0.45 : 1);
      osc.connect(g).connect(lp);
      osc.start(t);
      osc.stop(t + len + 0.05);
      track(osc, g, ...(i === 0 ? [lp, env] : []));
    });
  }

  function ramp(param: AudioParam, value: number) {
    const now = ctx.currentTime;
    param.cancelScheduledValues(now);
    param.setTargetAtTime(value, now, SMOOTH);
  }

  return {
    kick,
    snare,
    hat,
    bass,
    chord,
    /** volume 0..1; 0 also mutes notes already scheduled */
    setBusVolume(name: Instrument, volume: number) {
      ramp(buses[name].gain, BUS_LEVEL[name] * Math.min(1, Math.max(0, volume)));
    },
    setMasterVolume(volume: number) {
      ramp(master.gain, Math.min(1, Math.max(0, volume)));
    },
    /** Silences everything already scheduled (on stop) */
    stopAll() {
      for (const src of live) {
        try {
          src.stop();
        } catch {
          /* not started yet or already stopped */
        }
      }
      live.clear();
    },
  };
}

export type BackingSynth = ReturnType<typeof createBackingSynth>;
