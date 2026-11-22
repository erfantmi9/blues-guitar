import { Link } from "react-router";
import type { Stage, StageStatus, Track } from "@bg/shared";
import { BookOpen, CheckCircle2, ChevronLeft, Lightbulb, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/features/glossary/components/ProgressBar";
import { nextRecommendedLesson } from "@/features/dashboard/home";
import { faNum, formatDuration } from "@/lib/format";
import { useStorageRevision } from "@/lib/storage";
import { lessons, recommendedOrder, stages, tracks } from "./content";
import { computeStageStatuses, isLessonDone } from "./progress";
import { stagesOfTrack, trackProgress } from "./structure";
import { RichText } from "./components/RichText";
import { PathNeck } from "./components/PathNeck";
import { StatusBadge } from "./components/StatusBadge";
import styles from "./lessons.module.css";

/**
 * Three tracks (foundation, solo, chords & rhythm) that advance side by side.
 * Top: one jump link per track with its progress. Below: one section per track.
 * Nothing is locked; "next" only marks the recommended lesson.
 */
export function PathPage() {
  useStorageRevision(); // re-render when progress changes
  const statuses = computeStageStatuses(stages, isLessonDone);
  const nextId = nextRecommendedLesson(recommendedOrder, lessons, isLessonDone)?.id;

  return (
    <>
      <PageHeader title="مسیر یادگیری" subtitle="سه مسیر که کنار هم پیش می‌روند؛ هیچ درسی قفل نیست." />

      <nav className={styles.refLinks} aria-label="یادگیری">
        <Link to="/learn" className={styles.refLink}>
          <Lightbulb size={18} aria-hidden />
          مفاهیم
        </Link>
        <Link to="/glossary" className={styles.refLink}>
          <BookOpen size={18} aria-hidden />
          اصطلاحات
        </Link>
      </nav>

      <nav aria-label="مسیرها" className={styles.trackNav}>
        {tracks.map((track) => {
          const { done, total } = trackProgress(stages, track.id, isLessonDone);
          return (
            <a key={track.id} href={`#track-${track.id}`} className={styles.trackChip}>
              <span className={styles.trackChipTitle}>{track.title}</span>
              <span className={styles.muted}>{total > 0 ? `${faNum(done)} از ${faNum(total)} درس` : "به‌زودی"}</span>
            </a>
          );
        })}
      </nav>

      <div className={styles.tracks}>
        {tracks.map((track) => (
          <TrackSection key={track.id} track={track} statuses={statuses} nextId={nextId} />
        ))}
      </div>
    </>
  );
}

function TrackSection({ track, statuses, nextId }: { track: Track; statuses: Map<string, StageStatus>; nextId?: string }) {
  const trackStages = stagesOfTrack(stages, track.id);
  const { done, total } = trackProgress(stages, track.id, isLessonDone);
  const headingId = `track-${track.id}-title`;

  return (
    <section id={`track-${track.id}`} tabIndex={-1} className={styles.track} aria-labelledby={headingId}>
      <header className={styles.trackHead}>
        <h2 id={headingId} className={styles.trackTitle}>
          {track.title}
        </h2>
        <p className={styles.trackSummary}>
          <RichText text={track.summary} />
        </p>
        {total > 0 ? (
          <ProgressBar value={done} total={total} label={`مسیر ${track.title}: درس‌های تمام‌شده`} />
        ) : (
          <p className={styles.muted}>هنوز درسی ندارد؛ به‌زودی.</p>
        )}
      </header>

      {/* Visual map (aria-hidden), solo track only. The list below is the semantic alternative. */}
      {track.id === "solo" && <PathNeck stages={trackStages} statuses={statuses} isLessonDone={isLessonDone} />}

      <ol className={styles.stageList}>
        {trackStages.map((stage) => (
          <StageItem key={stage.id} stage={stage} status={statuses.get(stage.id) ?? "coming-soon"} nextId={nextId} />
        ))}
      </ol>
    </section>
  );
}

function StageItem({ stage, status, nextId }: { stage: Stage; status: StageStatus; nextId?: string }) {
  const open = status === "in-progress" || status === "done";
  return (
    // id = stage id: existing stages keep their old "#stage-N" anchors
    <li id={stage.id} tabIndex={-1} className={styles.stage} data-status={status}>
      <div className={styles.stageHead}>
        <span className={styles.stageNum}>{faNum(stage.position)}</span>
        <div className={styles.stageText}>
          <h3 className={styles.stageTitle}>
            <RichText text={stage.title} />
          </h3>
          <p className={styles.stageGoal}>
            <RichText text={stage.goal} />
          </p>
          {stage.estimatedSessions !== undefined && (
            <span className={styles.muted}>حدود {faNum(stage.estimatedSessions)} جلسه</span>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      {open && stage.lessons.length > 0 && (
        <ul className={styles.lessonLinks}>
          {stage.lessons.map((lesson) => (
            <li key={lesson.id}>
              <Link to={`/lesson/${lesson.id}`} className={styles.lessonLink} data-next={lesson.id === nextId || undefined}>
                {isLessonDone(lesson.id) && <CheckCircle2 size={18} className={styles.doneIcon} aria-label="تمام‌شده" />}
                <span className={styles.lessonLinkText}>
                  جلسه‌ی {faNum(lesson.session)}: <RichText text={lesson.title} />
                </span>
                {lesson.id === nextId && (
                  <span className={styles.nextTag}>
                    <Sparkles size={14} aria-hidden />
                    پیشنهاد بعدی
                  </span>
                )}
                <span className={styles.muted}>{formatDuration(lesson.duration)}</span>
                <ChevronLeft size={18} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
