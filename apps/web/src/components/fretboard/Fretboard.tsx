import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { FretPosition, HighlightedNote, NoteName, StringNumber } from "@bg/shared";
import { playPluck } from "@/lib/audio/pluck";
import { faNum } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
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
/** Strings 3 to 6 are wound (bronze), 1 and 2 are plain steel */
const isWound = (s: number) => s >= 3;

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
  const uid = useId().replace(/:/g, "");
  const g = useMemo(() => createGeometry(frets), [frets]);
  const visible = useMemo(
    () => highlightedNotes.filter((n) => n.fret >= 0 && n.fret <= frets),
    [highlightedNotes, frets],
  );
  const highlightedKeys = useMemo(() => new Set(visible.map(keyOf)), [visible]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  // On a narrow screen the neck scrolls. If the highlighted notes are out of view (e.g. a scale
  // on frets 5 to 8), scroll so they are visible. If they're already visible, don't scroll.
  const positionsSig = visible.map(keyOf).join("|");
  const didInitialScroll = useRef(false);
  useLayoutEffect(() => {
    const box = wrapRef.current;
    const svg = box?.querySelector("svg");
    if (!box || !svg || !visible.length || box.scrollWidth <= box.clientWidth) return;
    const k = svg.clientWidth / g.W; // viewBox units → pixels
    const xs = visible.map((n) => g.noteX(n.fret) * k);
    const pad = DOT_R * k * 1.6;
    const lo = Math.min(...xs) - pad;
    const hi = Math.max(...xs) + pad;
    const view = box.clientWidth;
    if (lo >= box.scrollLeft && hi <= box.scrollLeft + view) return;
    const left = hi - lo <= view ? (lo + hi) / 2 - view / 2 : lo;
    const instant = reducedMotion || !didInitialScroll.current;
    box.scrollTo({ left: Math.max(0, left), behavior: instant ? "auto" : "smooth" });
    didInitialScroll.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionsSig, g]);

  /** Highlighted dots clicked once: their note name stays visible */
  const [revealed, setRevealed] = useState<ReadonlySet<string>>(new Set());
  /** Last clicked empty cell (interactive mode only) */
  const [tapped, setTapped] = useState<FretPosition | null>(null);
  /** Ring effect on click; n changes so the animation restarts */
  const [ping, setPing] = useState<{ key: string; n: number } | null>(null);
  /** String vibration: per-string counter; each change replays the animation */
  const [plucked, setPlucked] = useState<Record<number, number>>({});
  const pluckString = (s: number) => setPlucked((p) => ({ ...p, [s]: (p[s] ?? 0) + 1 }));

  // When the "active" note changes (e.g. in TabPlayer), its string vibrates
  const activeSig = visible
    .filter((n) => n.variant === "active")
    .map(keyOf)
    .join("|");
  const prevSig = useRef("");
  useEffect(() => {
    if (activeSig && activeSig !== prevSig.current) {
      activeSig.split("|").forEach((k) => pluckString(Number(k.split(":")[0])));
    }
    prevSig.current = activeSig;
  }, [activeSig]);

  const activate = (pos: FretPosition) => {
    const key = keyOf(pos);
    const note = noteAt(pos.string, pos.fret);
    if (sound) playPluck(frequencyAt(pos.string, pos.fret));
    pluckString(pos.string);
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
  const neckTop = g.top - 20;
  const neckH = g.bottom - g.top + 40;

  // A few faint wood-grain lines (deterministic; same shape on every render)
  const grain = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const y = neckTop + 6 + (i * (neckH - 12)) / 8;
        const a = 2 + (i % 3);
        const w = g.endX - g.nutX;
        return `M ${g.nutX} ${y} C ${g.nutX + w * 0.3} ${y - a}, ${g.nutX + w * 0.6} ${y + a}, ${g.endX} ${y - a / 2}`;
      }),
    [g, neckTop, neckH],
  );

  const renderDot = (
    pos: FretPosition,
    opts: {
      text: string | null;
      color?: string;
      delayMs: number;
      kind: "highlight" | "tapped";
      variant?: HighlightedNote["variant"];
    },
  ) => {
    const key = keyOf(pos);
    const note = noteAt(pos.string, pos.fret);
    const posLabel = pos.fret === 0 ? "سیم باز" : `فرت ${faNum(pos.fret)}`;
    return (
      <g
        key={`${opts.kind}-${key}`}
        transform={`translate(${g.noteX(pos.fret)} ${g.stringY(pos.string)})`}
        className={styles.dotHit}
        data-variant={opts.variant}
        role="button"
        tabIndex={0}
        aria-label={`سیم ${faNum(pos.string)}، ${posLabel}، نت ${note}`}
        onClick={() => activate(pos)}
        onKeyDown={(e) => onKey(e, pos)}
        style={opts.color ? { color: opts.color } : undefined}
      >
        {/* Amber glow behind the active note: a gradient circle (cheaper than CSS blur/filter) */}
        {opts.variant === "active" && <circle r={DOT_R * 2} className={styles.glow} fill={`url(#glow-${uid})`} />}
        <g className={`${styles.dot} ${styles[opts.kind]}`} style={{ animationDelay: `${opts.delayMs}ms` }}>
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
    <div ref={wrapRef} className={styles.wrap} dir="ltr">
      <svg viewBox={`0 0 ${g.W} ${g.H}`} className={styles.svg} role="group" aria-label={ariaLabel}>
        <defs>
          {/* Dark wood: darker toward the edges of the neck */}
          <linearGradient id={`wood-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--wood-1)" }} />
            <stop offset="0.5" style={{ stopColor: "var(--wood-2)" }} />
            <stop offset="1" style={{ stopColor: "var(--wood-1)" }} />
          </linearGradient>
          {/* Nut: bone */}
          <linearGradient id={`nut-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" style={{ stopColor: "var(--nut)" }} />
            <stop offset="1" style={{ stopColor: "var(--fret-wire)" }} />
          </linearGradient>
          <radialGradient id={`glow-${uid}`}>
            <stop offset="0.35" style={{ stopColor: "var(--accent)", stopOpacity: 0.55 }} />
            <stop offset="1" style={{ stopColor: "var(--accent)", stopOpacity: 0 }} />
          </radialGradient>
        </defs>

        {/* Wood of the neck + grain */}
        <rect x={g.nutX} y={neckTop} width={g.endX - g.nutX} height={neckH} rx={5} fill={`url(#wood-${uid})`} />
        <g className={styles.grain}>
          {grain.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>

        {/* Inlay dots (mother-of-pearl) */}
        {SINGLE_INLAYS.filter((f) => f <= frets).map((f) => (
          <circle key={f} cx={g.noteX(f)} cy={midY} r={10} className={styles.inlay} />
        ))}
        {DOUBLE_INLAYS.filter((f) => f <= frets).map((f) => (
          <g key={f}>
            <circle cx={g.noteX(f)} cy={(g.stringY(2) + g.stringY(3)) / 2} r={10} className={styles.inlay} />
            <circle cx={g.noteX(f)} cy={(g.stringY(4) + g.stringY(5)) / 2} r={10} className={styles.inlay} />
          </g>
        ))}

        {/* Fret wires (metal with a thin highlight) and the nut */}
        {g.fretX.slice(1).map((x, i) => (
          <g key={i}>
            <line x1={x} x2={x} y1={neckTop} y2={neckTop + neckH} className={styles.fretWire} />
            <line x1={x - 1} x2={x - 1} y1={neckTop} y2={neckTop + neckH} className={styles.fretShine} />
          </g>
        ))}
        <rect x={g.nutX - 6} y={neckTop} width={8} height={neckH} rx={2} fill={`url(#nut-${uid})`} />

        {/* Strings: plain steel (1-2) / bronze wound (3-6); played string vibrates briefly */}
        {STRINGS.map((s) => {
          const y = g.stringY(s);
          const w = 0.9 + (s - 1) * 0.45;
          const n = plucked[s] ?? 0;
          return (
            <g key={`${s}-${n}`} className={n ? styles.vibrate : undefined}>
              <line
                x1={g.openX - 22}
                x2={g.endX}
                y1={y}
                y2={y}
                className={isWound(s) ? styles.stringWound : styles.stringPlain}
                strokeWidth={w}
              />
              {/* Winding texture of wound strings */}
              {isWound(s) && (
                <line x1={g.nutX} x2={g.endX} y1={y} y2={y} className={styles.winding} strokeWidth={w} />
              )}
            </g>
          );
        })}

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
          renderDot(tapped, { text: noteAt(tapped.string, tapped.fret), delayMs: 0, kind: "tapped" })}

        {/* Highlighted dots */}
        {visible.map((n, i) => {
          const key = keyOf(n);
          const name = noteAt(n.string, n.fret);
          const text = revealed.has(key) ? name : (n.label ?? (showNoteNames ? name : null));
          return renderDot(n, { text, color: n.color, delayMs: i * 60, kind: "highlight", variant: n.variant });
        })}
      </svg>
    </div>
  );
}
