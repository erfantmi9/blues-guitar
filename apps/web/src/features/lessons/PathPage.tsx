import { Link } from "react-router";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { faNum, formatDuration } from "@/lib/format";
import { useStorageRevision } from "@/lib/storage";
import { stages } from "./content";
import { computeStageStatuses, isLessonDone } from "./progress";
import { RichText } from "./components/RichText";
import { StatusBadge } from "./components/StatusBadge";
import styles from "./lessons.module.css";

export function PathPage() {
  useStorageRevision(); // re-render when progress changes
  const statuses = computeStageStatuses(stages, isLessonDone);

  return (
    <>
      <PageHeader title="مسیر یادگیری" subtitle="از صفر تا اولین سولوی بلوز، در ۹ مرحله" />

      <ol className={styles.stageList}>
        {stages.map((stage) => {
          const status = statuses.get(stage.id) ?? "coming-soon";
          const open = status === "in-progress" || status === "done";
          return (
            <li key={stage.id} className={styles.stage} data-status={status}>
              <div className={styles.stageHead}>
                <span className={styles.stageNum}>{faNum(stage.number)}</span>
                <div className={styles.stageText}>
                  <h2 className={styles.stageTitle}>
                    <RichText text={stage.title} />
                  </h2>
                  <p className={styles.stageGoal}>
                    <RichText text={stage.goal} />
                  </p>
                  <span className={styles.muted}>حدود {faNum(stage.estimatedSessions)} جلسه</span>
                </div>
                <StatusBadge status={status} />
              </div>

              {open && stage.lessons.length > 0 && (
                <ul className={styles.lessonLinks}>
                  {stage.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <Link to={`/lesson/${lesson.id}`} className={styles.lessonLink}>
                        {isLessonDone(lesson.id) && (
                          <CheckCircle2 size={18} className={styles.doneIcon} aria-label="تمام‌شده" />
                        )}
                        <span className={styles.lessonLinkText}>
                          جلسه‌ی {faNum(lesson.session)}: <RichText text={lesson.title} />
                        </span>
                        <span className={styles.muted}>{formatDuration(lesson.duration)}</span>
                        <ChevronLeft size={18} aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
