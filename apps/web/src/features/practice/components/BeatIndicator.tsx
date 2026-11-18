import { faNum } from "@/lib/format";
import styles from "../practice.module.css";

type Props = {
  beatsPerBar: number;
  /** Last beat heard (from the metronome callback) */
  current: { beat: number; n: number } | null;
  accent: boolean;
};

/** Beat circles; beat 1 is a different color. Musical elements are left-to-right. */
export function BeatIndicator({ beatsPerBar, current, accent }: Props) {
  return (
    <div className={styles.beats} dir="ltr" aria-hidden>
      {Array.from({ length: beatsPerBar }, (_, i) => {
        const active = current?.beat === i;
        return (
          <span
            // Key changes on every beat so the flash animation restarts
            key={active ? `${i}-${current.n}` : i}
            className={styles.beat}
            data-first={i === 0 && accent ? "" : undefined}
            data-active={active ? "" : undefined}
          >
            {faNum(i + 1)}
          </span>
        );
      })}
    </div>
  );
}
