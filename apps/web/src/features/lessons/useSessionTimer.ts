import { useCallback, useEffect, useReducer, useState } from "react";
import { useWakeLock } from "@/lib/hooks/useWakeLock";

export type TimerStatus = "idle" | "running" | "paused" | "finished";

type State = {
  status: TimerStatus;
  index: number;
  /** Timestamp the current section ends (while running) */
  endAt: number | null;
  /** Remaining time (while paused) */
  remainingMs: number;
};

type Action =
  | { type: "start"; now: number }
  | { type: "pause"; now: number }
  | { type: "resume"; now: number }
  | { type: "next"; now: number }
  | { type: "stop" };

const initial: State = { status: "idle", index: 0, endAt: null, remainingMs: 0 };

/**
 * Session timer: schedules sections in order using their suggested durations.
 * Based on timestamps (not counting ticks), so it stays accurate if the phone screen
 * turns off or the tab goes to the background.
 */
export function useSessionTimer(durationsSec: number[]) {
  const reducer = useCallback(
    (s: State, a: Action): State => {
      const ms = (i: number) => (durationsSec[i] ?? 0) * 1000;
      switch (a.type) {
        case "start":
          return { status: "running", index: 0, endAt: a.now + ms(0), remainingMs: ms(0) };
        case "pause":
          if (s.status !== "running" || s.endAt === null) return s;
          return { ...s, status: "paused", endAt: null, remainingMs: Math.max(0, s.endAt - a.now) };
        case "resume":
          if (s.status !== "paused") return s;
          return { ...s, status: "running", endAt: a.now + s.remainingMs };
        case "next": {
          if (s.status === "idle" || s.status === "finished") return s;
          const i = s.index + 1;
          if (i >= durationsSec.length) return { ...s, status: "finished", endAt: null, remainingMs: 0 };
          return s.status === "paused"
            ? { ...s, index: i, remainingMs: ms(i) }
            : { ...s, index: i, endAt: a.now + ms(i), remainingMs: ms(i) };
        }
        case "stop":
          return initial;
      }
    },
    [durationsSec],
  );

  const [state, dispatch] = useReducer(reducer, initial);
  const [now, setNow] = useState(() => Date.now());

  // Tick while running
  useEffect(() => {
    if (state.status !== "running") return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [state.status, state.index]);

  // Auto-advance to the next section when time is up
  useEffect(() => {
    if (state.status === "running" && state.endAt !== null && now >= state.endAt) {
      try {
        navigator.vibrate?.(200);
      } catch {
        /* not supported */
      }
      dispatch({ type: "next", now: Date.now() });
    }
  }, [now, state.status, state.endAt]);

  useWakeLock(state.status === "running");

  const remainingMs =
    state.status === "running" && state.endAt !== null ? Math.max(0, state.endAt - now) : state.remainingMs;
  const currentTotalMs = (durationsSec[state.index] ?? 0) * 1000;

  return {
    status: state.status,
    index: state.index,
    remainingMs,
    /** Progress of the current section, 0..1 */
    progress: currentTotalMs > 0 ? 1 - remainingMs / currentTotalMs : 0,
    start: () => dispatch({ type: "start", now: Date.now() }),
    pause: () => dispatch({ type: "pause", now: Date.now() }),
    resume: () => dispatch({ type: "resume", now: Date.now() }),
    next: () => dispatch({ type: "next", now: Date.now() }),
    stop: () => dispatch({ type: "stop" }),
  };
}
