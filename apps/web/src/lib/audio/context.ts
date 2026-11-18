/**
 * One shared AudioContext for the whole app (the metronome and backing track use it too).
 * Browsers only allow sound after a user gesture (click/tap), so it is created
 * lazily and resumed on every play.
 */
let ctx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch (err) {
      console.warn("[audio] AudioContext unavailable", err);
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}
