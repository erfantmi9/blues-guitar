import { useEffect, useRef } from "react";

/**
 * When the tab goes to the background (tab switch, phone lock), calls onHidden.
 * For audio players: browser timers are throttled in the background and rhythm breaks,
 * so it's better to stop and tell the user why.
 */
export function useStopOnHidden(onHidden: () => void) {
  const ref = useRef(onHidden);
  ref.current = onHidden;
  useEffect(() => {
    const handler = () => {
      if (document.hidden) ref.current();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, []);
}
