import { useEffect } from "react";

/**
 * Keeps the screen on while `active` is true (if the browser supports it).
 * Needs HTTPS or localhost; over http on a local network it does nothing, without error.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      if (sentinel && !sentinel.released) return;
      try {
        const s = await navigator.wakeLock.request("screen");
        if (cancelled) void s.release();
        else sentinel = s;
      } catch {
        /* denied or unsupported */
      }
    };
    // The browser releases the lock when the tab is hidden; re-acquire on return
    const onVisible = () => {
      if (document.visibilityState === "visible") void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void sentinel?.release().catch(() => {});
    };
  }, [active]);
}
