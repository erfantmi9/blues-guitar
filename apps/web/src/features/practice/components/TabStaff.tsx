import { useLayoutEffect, useRef } from "react";
import type { TabExercise, TabNote } from "@bg/shared";
import { playPluck } from "@/lib/audio/pluck";
import { faNum } from "@/lib/format";
import { frequencyAt } from "@/lib/music";
import { activeNotesAt, exerciseLengthBeats } from "@/lib/practice";
import type { PlayerView } from "../useTabPlayer";
import styles from "../tabPlayer.module.css";

// Fixed pixel geometry (not viewBox scaling) so note size stays the same on phones; wide exercises scroll
const BEAT_W = 64;
const PAD_L = 34;
const TOP = 34;
const GAP = 30;
const BOTTOM = TOP + GAP * 5;
const H = BOTTOM + 22;
const STRING_NAMES = ["e", "B", "G", "D", "A", "E"]; // index = string - 1

const x = (pos: number) => PAD_L + BEAT_W / 2 + pos * BEAT_W;
const y = (string: number) => TOP + (6 - string) * GAP; // string 1 at the bottom, like the fretboard

type Props = {
  exercise: TabExercise;
  view: PlayerView;
  subdivisions: number;
  reducedMotion: boolean;
};

export function TabStaff({ exercise, view, subdivisions, reducedMotion }: Props) {
  const total = exerciseLengthBeats(exercise);
  const width = x(total) + 10;
  const scrollRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<SVGGElement>(null);

  const beatPos = view.phase === "play" ? view.beatPos : null;
  const active = beatPos === null ? [] : activeNotesAt(exercise.notes, beatPos);
  const isPast = (n: TabNote) => beatPos !== null && n.beat + n.durationBeats <= beatPos + 1e-9;

  // Playhead: each tick, snap to the exact event position, then (unless reduced motion)
  // glide linearly to the next tick over one tick length. Each tick re-aligns it to the music.
  useLayoutEffect(() => {
    const head = headRef.current;
    const box = scrollRef.current;
    if (!head || !box) return;
    const place = (px: number, seconds: number) => {
      head.style.transition = "none";
      head.style.transform = `translateX(${px}px)`;
      if (seconds > 0) {
        void head.getBoundingClientRect(); // apply the jump before starting the glide
        head.style.transition = `transform ${seconds}s linear`;
      }
    };

    let at: number;
    if (view.phase === "play") {
      at = x(view.beatPos);
      if (reducedMotion) place(at, 0);
      else {
        place(at, view.secondsPerTick);
        head.style.transform = `translateX(${x(view.beatPos + 1 / subdivisions)}px)`;
      }
    } else {
      at = view.phase === "finished" ? x(total) : x(0);
      place(at, 0);
    }

    // Auto-scroll: keep the playhead in view (about a third from the left)
    const left = box.scrollLeft;
    const w = box.clientWidth;
    if (at < left + 24 || at > left + w * 0.7) {
      box.scrollTo({ left: Math.max(0, at - w * 0.3), behavior: reducedMotion ? "auto" : "smooth" });
    }
  }, [view, subdivisions, reducedMotion, total]);

  return (
    <div ref={scrollRef} className={styles.tabScroll} dir="ltr">
      <svg width={width} height={H} className={styles.tabSvg} role="img" aria-label={`تب: ${exercise.title}`}>
        {/* Beat numbers within each bar */}
        {Array.from({ length: total }, (_, b) => (
          <text key={b} x={x(b)} y={TOP - 18} textAnchor="middle" className={styles.beatNum}>
            {faNum((b % exercise.beatsPerBar) + 1)}
          </text>
        ))}

        {/* String lines + names */}
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <g key={s}>
            <text x={12} y={y(s)} dominantBaseline="central" textAnchor="middle" className={styles.stringName}>
              {STRING_NAMES[s - 1]}
            </text>
            <line x1={PAD_L} x2={width - 10} y1={y(s)} y2={y(s)} className={styles.tabLine} />
          </g>
        ))}

        {/* Bar lines; the end has a double line */}
        {Array.from({ length: exercise.bars + 1 }, (_, b) => {
          const bx = PAD_L + b * exercise.beatsPerBar * BEAT_W;
          return <line key={b} x1={bx} x2={bx} y1={y(6)} y2={y(1)} className={styles.barLine} />;
        })}
        <line x1={width - 10} x2={width - 10} y1={y(6)} y2={y(1)} className={styles.barLineEnd} />

        {/* Notes */}
        {exercise.notes.map((n, i) => {
          const isActive = active.includes(n);
          return (
            <g
              key={i}
              transform={`translate(${x(n.beat)} ${y(n.string)})`}
              className={styles.note}
              data-state={isActive ? "active" : isPast(n) ? "past" : undefined}
              onClick={() => playPluck(frequencyAt(n.string, n.fret))}
            >
              <g className={styles.noteInner}>
                <rect x={-15} y={-13} width={30} height={26} rx={7} />
                {/* Fret number in Latin digits, as in standard tab: the Persian zero (۰) looks like a dot */}
                <text dominantBaseline="central" textAnchor="middle">
                  {n.fret}
                </text>
              </g>
            </g>
          );
        })}

        {/* Playhead */}
        <g ref={headRef} className={styles.playhead} data-visible={view.phase !== "idle" || undefined}>
          <line x1={0} x2={0} y1={TOP - 26} y2={BOTTOM + 14} />
        </g>
      </svg>
    </div>
  );
}
