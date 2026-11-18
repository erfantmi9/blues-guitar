import { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router";
import type { Lesson } from "@bg/shared";
import { ChevronRight, Target } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { durationToSeconds, faNum, formatDuration } from "@/lib/format";
import { getLesson, getStage } from "./content";
import { useLessonProgress } from "./progress";
import { useSessionTimer } from "./useSessionTimer";
import { CompletionChecklist } from "./components/CompletionChecklist";
import { ReportForm } from "./components/ReportForm";
import { ReportHistory } from "./components/ReportHistory";
import { RichText } from "./components/RichText";
import { SectionView } from "./components/SectionView";
import { SessionTimer } from "./components/SessionTimer";
import styles from "./lessons.module.css";

export function LessonPage() {
  const { lessonId = "" } = useParams();
  const lesson = getLesson(lessonId);

  if (!lesson) {
    return (
      <>
        <PageHeader title="درس پیدا نشد" />
        <Link to="/path">بازگشت به مسیر</Link>
      </>
    );
  }
  // key: switching lessons resets the timer state
  return <LessonView key={lesson.id} lesson={lesson} />;
}

function LessonView({ lesson }: { lesson: Lesson }) {
  const stage = getStage(lesson.stageId);
  const { progress, toggleCriterion, markCompleted, unmarkCompleted, setDraftAnswer, submitReport } =
    useLessonProgress(lesson);

  const durations = useMemo(() => lesson.sections.map((s) => durationToSeconds(s.duration)), [lesson]);
  const timer = useSessionTimer(durations);
  const active = timer.status === "running" || timer.status === "paused";

  // Scroll to the current section when it changes
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  useEffect(() => {
    if (!active) return;
    sectionRefs.current[timer.index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [active, timer.index]);

  return (
    <div className={styles.lessonPage}>
      <Link to="/path" className={styles.backLink}>
        <ChevronRight size={18} aria-hidden />
        مسیر یادگیری
      </Link>

      <PageHeader
        title={`جلسه‌ی ${faNum(lesson.session)}: ${lesson.title.replace(/`/g, "")}`}
        subtitle={`${stage ? `مرحله‌ی ${faNum(stage.number)} · ` : ""}${formatDuration(lesson.duration)}`}
      />

      <Card className={styles.goal}>
        <Target size={20} aria-hidden className={styles.goalIcon} />
        <div>
          <strong>هدف: </strong>
          <RichText text={lesson.goal} />
        </div>
      </Card>

      <SessionTimer sections={lesson.sections} totalLabel={formatDuration(lesson.duration)} timer={timer} />

      <div className={styles.sections}>
        {lesson.sections.map((section, i) => (
          <SectionView
            key={section.id}
            ref={(el) => {
              sectionRefs.current[i] = el;
            }}
            section={section}
            index={i}
            active={active && timer.index === i}
          />
        ))}
      </div>

      <CompletionChecklist
        lesson={lesson}
        progress={progress}
        onToggle={toggleCriterion}
        onComplete={markCompleted}
        onUncomplete={unmarkCompleted}
      />

      <ReportForm lesson={lesson} progress={progress} onChange={setDraftAnswer} onSubmit={submitReport} />

      <ReportHistory lesson={lesson} reports={progress.reports} />
    </div>
  );
}
