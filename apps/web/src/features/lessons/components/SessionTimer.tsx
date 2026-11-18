import type { Section } from "@bg/shared";
import { Pause, Play, SkipBack, Square, Timer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { faNum, formatClock } from "@/lib/format";
import type { useSessionTimer } from "../useSessionTimer";
import { RichText } from "./RichText";
import styles from "../lessons.module.css";

type Props = {
  sections: Section[];
  totalLabel: string;
  timer: ReturnType<typeof useSessionTimer>;
};

/**
 * In idle state: a card with the start button.
 * While active: a fixed bar at the bottom of the screen (above the nav), so it stays
 * visible while you scroll and read the text in front of the guitar.
 */
export function SessionTimer({ sections, totalLabel, timer }: Props) {
  const { status, index, remainingMs, progress } = timer;

  if (status === "idle" || status === "finished") {
    return (
      <Card className={styles.timerCard}>
        <div className={styles.timerIntro}>
          <Timer size={22} aria-hidden />
          <div>
            <strong>{status === "finished" ? "جلسه تمام شد 👏" : "تایمر جلسه"}</strong>
            <div className={styles.muted}>
              {status === "finished"
                ? "حالا چک‌لیست و گزارش پایین صفحه را پر کن."
                : `${faNum(sections.length)} بخش · ${totalLabel} · بخش‌ها به ترتیب زمان‌بندی می‌شوند.`}
            </div>
          </div>
        </div>
        <Button variant="primary" onClick={timer.start}>
          <Play size={18} aria-hidden />
          {status === "finished" ? "شروع دوباره" : "شروع جلسه"}
        </Button>
      </Card>
    );
  }

  const section = sections[index];
  const isLast = index === sections.length - 1;

  return (
    <div className={styles.timerBar} role="timer" aria-live="off">
        <div className={styles.timerProgress} style={{ transform: `scaleX(${progress})` }} />
        <div className={styles.timerRow}>
          <div className={styles.timerInfo}>
            <span className={styles.muted}>
              بخش {faNum(index + 1)} از {faNum(sections.length)}
              {status === "paused" && " · متوقف"}
            </span>
            <strong className={styles.timerSection}>{section && <RichText text={section.title} />}</strong>
          </div>
          <span className={styles.clock} dir="ltr">
            {formatClock(remainingMs)}
          </span>
        </div>
        <div className={styles.timerControls}>
          {status === "running" ? (
            <Button onClick={timer.pause} aria-label="توقف">
              <Pause size={18} aria-hidden /> توقف
            </Button>
          ) : (
            <Button variant="primary" onClick={timer.resume} aria-label="ادامه">
              <Play size={18} aria-hidden /> ادامه
            </Button>
          )}
          <Button onClick={timer.next}>
            {/* In RTL, "next" points left */}
            <SkipBack size={18} aria-hidden /> {isLast ? "پایان جلسه" : "بخش بعدی"}
          </Button>
          <Button variant="ghost" onClick={timer.stop} aria-label="لغو جلسه" title="لغو جلسه">
            <Square size={16} aria-hidden />
          </Button>
        </div>
    </div>
  );
}
