import { useState } from "react";
import type { Lesson, LessonProgress } from "@bg/shared";
import { Copy, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatReport, hasAnyAnswer } from "../report";
import { RichText } from "./RichText";
import { useCopyFeedback } from "./useCopyFeedback";
import styles from "../lessons.module.css";

type Props = {
  lesson: Lesson;
  progress: LessonProgress;
  onChange: (questionId: string, text: string) => void;
  onSubmit: () => void;
};

/** Post-session report form. Typed text is saved as a draft immediately so it isn't lost. */
export function ReportForm({ lesson, progress, onChange, onSubmit }: Props) {
  const { copy, label } = useCopyFeedback();
  const [saved, setSaved] = useState(false);
  const draft = progress.reportDraft;
  const canSubmit = hasAnyAnswer(draft);

  const currentText = () =>
    formatReport(lesson, {
      createdAt: new Date().toISOString(),
      answers: draft,
      checkedCriteria: progress.checkedCriteria,
    });

  return (
    <Card>
      <h2 className={styles.cardTitle}>گزارش بعد از جلسه</h2>
      {lesson.report.hint && (
        <p className={styles.hint}>
          <RichText text={lesson.report.hint} />
        </p>
      )}

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          onSubmit();
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2500);
        }}
      >
        {lesson.report.questions.map((q) => (
          <label key={q.id} className={styles.field}>
            <span className={styles.fieldLabel}>
              <RichText text={q.question} />
            </span>
            <textarea
              rows={2}
              value={draft[q.id] ?? ""}
              onChange={(e) => onChange(q.id, e.target.value)}
              className={styles.textarea}
            />
          </label>
        ))}

        <div className={styles.actions}>
          <Button type="submit" variant="primary" disabled={!canSubmit}>
            <Save size={18} aria-hidden />
            {saved ? "ثبت شد ✓" : "ثبت گزارش"}
          </Button>
          <Button onClick={() => void copy(currentText())} disabled={!canSubmit}>
            <Copy size={18} aria-hidden />
            {label("کپی گزارش")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
