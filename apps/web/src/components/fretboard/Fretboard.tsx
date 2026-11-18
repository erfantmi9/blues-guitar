import { useMemo, useState, type KeyboardEvent } from "react";
import type { FretPosition, HighlightedNote, NoteName, StringNumber } from "@bg/shared";
import { playPluck } from "@/lib/audio/pluck";
import { faNum } from "@/lib/format";
import { frequencyAt, noteAt } from "@/lib/music";
import { createGeometry, DOT_R } from "./geometry";
import styles from "./Fretboard.module.css";

export type NoteClickEvent = FretPosition & { note: NoteName };

export type FretboardProps = {
  highlightedNotes?: HighlightedNote[];
  /** Show note names inside highlighted dots (if they have no label) */
  showNoteNames?: boolean;
  onNoteClick?: (e: NoteClickEvent) => void;
  /**
   * For lessons: only highlighted dots are clickable (name + sound);
   * empty cells don't react. Default: every cell on the neck is clickable.
   */
  readOnly?: boolean;
  /** Number of frets (default 12) */
  frets?: number;
  /** Play a sound on click (default true) */
  sound?: boolean;
  ariaLabel?: string;
};

const STRINGS: StringNumber[] = [1, 2, 3, 4, 5, 6];
const SINGLE_INLAYS = [3, 5, 7, 9, 15, 17, 19, 21];
const DOUBLE_INLAYS = [12, 24];

const keyOf = (p: FretPosition) => `${p.string}:${p.fret}`;

export function Fretboard({
  highlightedNotes = [],
  showNoteNames = false,
  onNoteClick,
  readOnly = false,
  frets = 12,
  sound = true,
  ariaLabel = "دسته‌ی گیتار",
}: FretboardProps) {
  const g = useMemo(() => createGeometry(frets), [frets]);
  const visible = useMemo(
    () => highlightedNotes.filter((n) => n.fret >= 0 && n.fret <= frets),
    [highlightedNotes, frets],
  );
  const highlightedKeys = useMemo(() => new Set(visible.map(keyOf)), [visible]);

  /** Highlighted dots clicked once: their note name stays visible */
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());
  /** Last clicked empty cell (interactive mode only) */
  const [tapped, setTapped] = useState<FretPosition | null>(null);
  /** Ring effect on click; n changes so the animation restarts */
  const [ping, setPing] = useState<{ key: string; n: number } | null>(null);

  const activate = (pos: FretPosition) => {
    const key = keyOf(pos);
    const note = noteAt(pos.string, pos.fret);
    if (sound) playPluck(frequencyAt(pos.string, pos.fret));
    if (highlightedKeys.has(key)) {
      setRevealed((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
    } else {
      setTapped(pos);
    }
    setPing((p) => ({ key, n: (p?.n ?? 0) + 1 }));
    onNoteClick?.({ ...pos, note });
  };

  const onKey = (e: KeyboardEvent, pos: FretPosition) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate(pos);
    }
  };

  const midY = (g.stringY(3) + g.stringY(4)) / 2;
  const fretCenters = Array.from({ length: frets }, (_, i) => g.noteX(i + 1));

  const renderDot = (
    pos: FretPosition,
    opts: { text: string | null; color?: string; delayMs: number; variant: "highlight" | "tapped" },
  ) => {
    const key = keyOf(pos);
    const note = noteAt(pos.string, pos.fret);
    const posLabel = pos.fret === 0 ? "سیم باز" : `فرت ${faNum(pos.fret)}`;
    return (
      <g
        key={`${opts.variant}-${key}`}
        transform={`translate(${g.noteX(pos.fret)} ${g.stringY(pos.string)})`}
        className={styles.dotHit}
        role="button"
        tabIndex={0}
        aria-label={`سیم ${faNum(pos.string)}، ${posLabel}، نت ${note}`}
        onClick={() => activate(pos)}
        onKeyDown={(e) => onKey(e, pos)}
        style={opts.color ? { color: opts.color } : undefined}
      >
        <g className={`${styles.dot} ${styles[opts.variant]}`} style={{ animationDelay: `${opts.delayMs}ms` }}>
          <circle r={DOT_R} />
          {opts.text && (
            <text className={styles.dotText} dominantBaseline="central" textAnchor="middle">
              {opts.text}
            </text>
          )}
        </g>
        {ping?.key === key && <circle key={ping.n} r={DOT_R} className={styles.ping} />}
      </g>
    );
  };

  return (
    <div className={styles.wrap} dir="ltr">
      <svg viewBox={`0 0 ${g.W} ${g.H}`} className={styles.svg} role="group" aria-label={ariaLabel}>
        {/* Wood of the neck */}
        <rect x={g.nutX} y={g.top - 20} width={g.endX - g.nutX} height={g.bottom - g.top + 40} rx={4} className={styles.wood} />

        {/* Inlay dots */}
        {SINGLE_INLAYS.filter((f) => f <= frets).map((f) => (
          <circle key={f} cx={g.noteX(f)} cy={midY} r={10} className={styles.inlay} />
        ))}
        {DOUBLE_INLAYS.filter((f) => f <= frets).map((f) => (
          <g key={f}>
            <circle cx={g.noteX(f)} cy={(g.stringY(2) + g.stringY(3)) / 2} r={10} className={styles.inlay} />
            <circle cx={g.noteX(f)} cy={(g.stringY(4) + g.stringY(5)) / 2} r={10} className={styles.inlay} />
          </g>
        ))}

        {/* Frets and nut */}
        {g.fretX.slice(1).map((x, i) => (
          <line key={i} x1={x} x2={x} y1={g.top - 20} y2={g.bottom + 20} className={styles.fretWire} />
        ))}
        <rect x={g.nutX - 5} y={g.top - 20} width={7} height={g.bottom - g.top + 40} rx={2} className={styles.nut} />

        {/* Strings: thicker toward string 6 */}
        {STRINGS.map((s) => (
          <line
            key={s}
            x1={g.openX - 22}
            x2={g.endX}
            y1={g.stringY(s)}
            y2={g.stringY(s)}
            className={styles.string}
            strokeWidth={0.9 + (s - 1) * 0.45}
          />
        ))}

        {/* String numbers */}
        {STRINGS.map((s) => (
          <text key={s} x={g.labelX} y={g.stringY(s)} className={styles.stringLabel} dominantBaseline="central" textAnchor="middle">
            {faNum(s)}
          </text>
        ))}

        {/* Fret numbers */}
        {fretCenters.map((x, i) => {
          const f = i + 1;
          const marked = SINGLE_INLAYS.includes(f) || DOUBLE_INLAYS.includes(f);
          return (
            <text
              key={f}
              x={x}
              y={g.bottom + 38}
              textAnchor="middle"
              className={`${styles.fretNum} ${marked ? styles.fretNumMarked : ""}`}
            >
              {faNum(f)}
            </text>
          );
        })}

        {/* Click areas for empty cells (interactive mode only) */}
        {!readOnly &&
          STRINGS.flatMap((s) =>
            Array.from({ length: frets + 1 }, (_, f) => {
              const pos = { string: s, fret: f };
              if (highlightedKeys.has(keyOf(pos))) return null;
              const x0 = f === 0 ? g.openX - 22 : g.fretX[f - 1]!;
              const x1 = f === 0 ? g.nutX - 5 : g.fretX[f]!;
              return (
                <rect
                  key={`hit-${s}-${f}`}
                  x={x0}
                  y={g.stringY(s) - g.gap / 2}
                  width={x1 - x0}
                  height={g.gap}
                  className={styles.cell}
                  onClick={() => activate(pos)}
                  aria-hidden
                />
              );
            }),
          )}

        {/* Last tapped cell */}
        {tapped &&
          !highlightedKeys.has(keyOf(tapped)) &&
          renderDot(tapped, { text: noteAt(tapped.string, tapped.fret), delayMs: 0, variant: "tapped" })}

        {/* Highlighted dots */}
        {visible.map((n, i) => {
          const key = keyOf(n);
          const name = noteAt(n.string, n.fret);
          const text = revealed.has(key) ? name : (n.label ?? (showNoteNames ? name : null));
          return renderDot(n, { text, color: n.color, delayMs: i * 60, variant: "highlight" });
        })}
      </svg>
    </div>
  );
}
