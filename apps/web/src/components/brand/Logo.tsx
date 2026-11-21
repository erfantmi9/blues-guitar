import styles from "./Logo.module.css";

type Props = {
  /** full = mark + wordmark; mark = the symbol only (narrow headers, favicon) */
  variant?: "full" | "mark";
  /** Height of the mark in px */
  size?: number;
  /** One gentle bend when it first appears (off under prefers-reduced-motion) */
  animate?: boolean;
  /** On narrow screens show only the mark; the name stays readable for screen readers */
  compact?: boolean;
  className?: string;
};

/**
 * Slow Bend logo: one string that rises quickly and settles slowly (a bend), with an amber dot where the
 * finger pushes it. Colors come from tokens: the wood tile and plain-steel string are the same in both themes.
 * The static icon files in public/ are drawn from the same geometry (BEND_PATH, BEND_DOT).
 */
export const BEND_PATH = "M7 33 C16 33 20 15 27 15 C33 15 36 26 42 30";
export const BEND_DOT = { x: 27, y: 15, r: 4.6 } as const;

export function Logo({ variant = "full", size = 32, animate = false, compact = false, className = "" }: Props) {
  return (
    <span className={`${styles.logo} ${compact ? styles.compact : ""} ${className}`}>
      <svg viewBox="0 0 48 48" width={size} height={size} className={styles.mark} aria-hidden focusable="false">
        <rect x={0.5} y={0.5} width={47} height={47} rx={12} fill="var(--wood-1)" stroke="var(--wood-2)" />
        <g className={animate ? styles.bend : undefined}>
          <path d={BEND_PATH} fill="none" stroke="var(--string-plain)" strokeWidth={3.2} strokeLinecap="round" />
          <circle cx={BEND_DOT.x} cy={BEND_DOT.y} r={8} fill="var(--accent)" opacity={0.22} />
          <circle cx={BEND_DOT.x} cy={BEND_DOT.y} r={BEND_DOT.r} fill="var(--accent)" />
        </g>
      </svg>
      {variant === "full" ? (
        <span className={styles.word} dir="ltr">
          Slow <span className={styles.accent}>Bend</span>
        </span>
      ) : (
        <span className={styles.srOnly}>Slow Bend</span>
      )}
    </span>
  );
}
