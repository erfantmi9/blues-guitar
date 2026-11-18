import { getAudioContext } from "./context";

type PluckOptions = {
  /** seconds */
  duration?: number;
  /** 0..1 */
  volume?: number;
  /** Play time on the audio clock (AudioContext.currentTime); default now */
  at?: number;
};

/**
 * Simple plucked-string sound, made entirely with Web Audio (no audio file):
 * sawtooth + quieter octave triangle → lowpass filter that closes over time
 * (bright at the attack, darker as it fades) → decay envelope.
 */
export function playPluck(frequency: number, { duration = 1.4, volume = 0.22, at }: PluckOptions = {}): void {
  const ctx = getAudioContext();
  if (!ctx || !Number.isFinite(frequency) || frequency <= 0) return;

  const t = Math.max(ctx.currentTime, at ?? 0);
  const end = t + duration;

  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(volume, t + 0.004);
  out.gain.exponentialRampToValueAtTime(0.0001, end);

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.7;
  filter.frequency.setValueAtTime(Math.min(frequency * 10, 9000), t);
  filter.frequency.exponentialRampToValueAtTime(Math.max(frequency * 1.5, 250), t + duration * 0.7);

  const body = ctx.createOscillator();
  body.type = "sawtooth";
  body.frequency.value = frequency;

  const shimmer = ctx.createOscillator();
  shimmer.type = "triangle";
  shimmer.frequency.value = frequency * 2;
  const shimmerGain = ctx.createGain();
  shimmerGain.gain.value = 0.25;

  body.connect(filter);
  shimmer.connect(shimmerGain).connect(filter);
  filter.connect(out).connect(ctx.destination);

  body.start(t);
  shimmer.start(t);
  body.stop(end + 0.05);
  shimmer.stop(end + 0.05);
  body.onended = () => {
    out.disconnect();
    filter.disconnect();
    shimmerGain.disconnect();
  };
}
