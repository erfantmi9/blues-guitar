import type { Lesson, LessonReport } from "@bg/shared";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { faNum, formatDateTime } from "@/lib/format";
import { formatReport } from "../report";
import { RichText } from "./RichText";
import { useCopyFeedback } from "./useCopyFeedback";
import styles from "../lessons.module.css";

export function ReportHistory({ lesson, reports }: { lesson: Lesson; reports: LessonReport[] }) {
  return (
    <Card>
      <h2 className={styles.cardTitle}>
        تاریخچه‌ی گزارش‌ها {reports.length > 0 && <span className={styles.muted}>({faNum(reports.length)})</span>}
      </h2>
      {reports.length === 0 ? (
        <p className={styles.muted}>هنوز گزارشی ثبت نشده.</p>
      ) : (
        <div className={styles.history}>
          {reports.map((r) => (
            <ReportItem key={r.id} lesson={lesson} report={r} />
          ))}
        </div>
      )}
    </Card>
  );
}

function ReportItem({ lesson, report }: { lesson: Lesson; report: LessonReport }) {
  const { copy, label } = useCopyFeedback();
  const checked = lesson.completion.criteria.filter((c) => report.checkedCriteria.includes(c.id)).length;

  return (
    <details className={styles.historyItem}>
      <summary>
        <span>{formatDateTime(report.createdAt)}</span>
        <span className={styles.muted}>
          {faNum(checked)}/{faNum(lesson.completion.criteria.length)} معیار
        </span>
      </summary>
      <dl className={styles.answers}>
        {lesson.report.questions.map((q) => (
          <div key={q.id}>
            <dt>
              <RichText text={q.question} />
            </dt>
            <dd>{report.answers[q.id]?.trim() || "—"}</dd>
          </div>
        ))}
      </dl>
      <Button onClick={() => void copy(formatReport(lesson, report))}>
        <Copy size={16} aria-hidden />
        {label("کپی گزارش")}
      </Button>
    </details>
  );
}
