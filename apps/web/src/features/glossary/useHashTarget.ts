import { useEffect } from "react";
import { useLocation } from "react-router";

/** DOM id of a term card. Not the bare id: an id like "root" would clash with the app's #root. */
export const termDomId = (id: string) => `term-${id}`;

/**
 * The #id in the URL (a term id, or "quiz"), scrolled into view after render.
 * Returned so the page can highlight it (:target does not follow client-side navigation).
 */
export function useHashTarget(ready: unknown): string {
  const { hash } = useLocation();
  const target = decodeURIComponent(hash.slice(1));
  useEffect(() => {
    if (!target) return;
    // Next frame: after the router's own scroll reset on navigation
    const raf = requestAnimationFrame(() =>
      document.getElementById(target === "quiz" ? "level-quiz" : termDomId(target))?.scrollIntoView({ block: "start" }),
    );
    return () => cancelAnimationFrame(raf);
  }, [target, ready]);
  return target;
}
