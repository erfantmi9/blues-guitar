import { useState } from "react";
import type { Lesson, LessonProgress } from "@bg/shared";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { faNum, formatDateTime } from "@/lib/format";
import { canComplete } from "../progress";
import { RichText } from "./RichText";
import styles from "../lessons.module.css";

type Props = {
  lesson: Lesson;
  progress: LessonProgress;
  onToggle: (criterionId: string) => void;
  onComplete: () => void;
  onUncomplete: () => void;
};

export function CompletionChecklist({ lesson, progress, onToggle, onComplete, onUncomplete }: Props) {
  const { criteria, minRequired, note } = lesson.completion;
  const checkedCount = criteria.filter((c) => progress.checkedCriteria.includes(c.id)).length;
  const ready = canComplete(lesson, progress);
  const done = progress.completedAt !== null;
  /** Only right after clicking "complete" (not when the page reopens) is there a small celebration */
  const [celebrate, setCelebrate] = useState(false);

  return (
    <Card>
      <h2 className={styles.cardTitle}>معیارهای تموم‌شدن</h2>
      <ul className={styles.checklist}>
        {criteria.map((c) => {
          const checked = progress.checkedCriteria.includes(c.id);
          return (
            <li key={c.id}>
              <label className={styles.checkItem} data-checked={checked || undefined}>
                <input type="checkbox" checked={checked} onChange={() => onToggle(c.id)} />
                <span>
                  <RichText text={c.text} />
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {note && (
        <p className={styles.muted}>
          <RichText text={note} />
        </p>
      )}

      {done ? (
        <div className={styles.doneBox} data-celebrate={celebrate || undefined}>
          <span className={styles.doneMark}>
            <CheckCircle2 size={26} aria-hidden />
          </span>
          <div>
            <strong>این درس تمام شده</strong>
            <div className={styles.muted}>{formatDateTime(progress.completedAt!)}</div>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setCelebrate(false);
              onUncomplete();
            }}
          >
            برگرداندن
          </Button>
        </div>
      ) : (
        <>
          <Button
            variant="primary"
            block
            disabled={!ready}
            onClick={() => {
              setCelebrate(true);
              onComplete();
            }}
          >
            علامت‌گذاری درس به‌عنوان تمام‌شده
          </Button>
          <p className={styles.hint}>
            {faNum(checkedCount)} از {faNum(criteria.length)} مورد تیک خورده
            {!ready && ` · حداقل ${faNum(minRequired)} مورد لازم است`}
          </p>
        </>
      )}
    </Card>
  );
}
