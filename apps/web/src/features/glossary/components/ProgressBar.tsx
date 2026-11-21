import { faNum } from "@/lib/format";
import styles from "../glossary.module.css";

/** learned / total; the fill grows with transform (not width) */
export function ProgressBar({ value, total, label }: { value: number; total: number; label: string }) {
  const ratio = total > 0 ? value / total : 0;
  return (
    <div className={styles.progress}>
      <div
        className={styles.track}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={value}
        aria-valuetext={`${faNum(value)} از ${faNum(total)}`}
      >
        <div className={styles.fill} style={{ transform: `scaleX(${ratio})` }} />
      </div>
      <span className={styles.progressText}>
        {faNum(value)} از {faNum(total)}
      </span>
    </div>
  );
}
