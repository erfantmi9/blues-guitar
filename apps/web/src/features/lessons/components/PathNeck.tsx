import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router";
import type { Stage, StageStatus } from "@bg/shared";
import { Check, Lock } from "lucide-react";
import { faNum } from "@/lib/format";
import { RichText } from "./RichText";
import styles from "../pathNeck.module.css";

type Props = {
  stages: Stage[];
  statuses: Map<string, StageStatus>;
  isLessonDone: (lessonId: string) => boolean;
};

const STRING_COUNT = 6;

/**
 * Visual map of the path: each stage is one fret on a horizontal neck.
 * Visual only (aria-hidden, not focusable); the stage list below is the semantic
 * alternative for screen readers and keyboard users.
 */
export function PathNeck({ stages, statuses, isLessonDone }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLElement | null>(null);

  // On a phone: put the first in-progress stage in the middle of the view (horizontal scroll only, no page jump)
  useLayoutEffect(() => {
    const box = scrollRef.current;
    const cur = currentRef.current;
    if (!box || !cur || box.scrollWidth <= box.clientWidth) return;
    box.scrollLeft = cur.offsetLeft - (box.clientWidth - cur.offsetWidth) / 2;
  }, []);

  const firstInProgress = stages.find((s) => statuses.get(s.id) === "in-progress")?.id;

  return (
    <div ref={scrollRef} className={styles.scroll} dir="ltr" aria-hidden="true">
      <div className={styles.neck}>
        {/* Strings over the whole width of the neck */}
        <div className={styles.wood}>
          {Array.from({ length: STRING_COUNT }, (_, i) => (
            <span key={i} className={styles.string} style={{ top: `${14 + i * 14.4}%`, blockSize: `${1 + i * 0.35}px` }} />
          ))}
        </div>
        <div className={styles.nut} />

        {stages.map((stage, i) => {
          const status = statuses.get(stage.id) ?? "coming-soon";
          const open = status === "in-progress" || status === "done";
          const target = stage.lessons.find((l) => !isLessonDone(l.id)) ?? stage.lessons[0];
          const marker = (
            <span className={styles.marker}>
              {status === "done" ? (
                <Check size={20} strokeWidth={3} />
              ) : status === "locked" ? (
                <Lock size={16} />
              ) : (
                faNum(stage.number)
              )}
            </span>
          );
          const label = (
            <span className={styles.label}>
              <RichText text={stage.title} />
            </span>
          );
          const common = {
            className: styles.fret,
            "data-status": status,
            // Frets get slightly narrower toward the body, like a real neck
            style: { flexGrow: 2 ** (-i / 24) },
            tabIndex: -1,
            // Several stages can be in progress at once; the view centers on the first one
            ref: stage.id === firstInProgress ? (el: HTMLElement | null) => void (currentRef.current = el) : undefined,
          };

          // Open stage → its next lesson. Locked / coming soon → the same stage in the list below.
          return open && target ? (
            <Link key={stage.id} to={`/lesson/${target.id}`} {...common}>
              {marker}
              {label}
            </Link>
          ) : (
            <a
              key={stage.id}
              href={`#stage-${stage.number}`}
              {...common}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(`stage-${stage.number}`);
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
                el?.focus({ preventScroll: true });
              }}
            >
              {marker}
              {label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
