import { Link } from "react-router";
import type { Lesson } from "@bg/shared";
import { AudioLines, BookOpen, ChevronLeft, Drum, GraduationCap, Map as MapIcon, Play, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { glossary, termHref } from "@/features/glossary/content";
import { ProgressBar } from "@/features/glossary/components/ProgressBar";
import { useGlossaryProgress } from "@/features/glossary/progress";
import { firstUnlearned } from "@/lib/content/reference";
import { stages } from "@/features/lessons/content";
import { PathNeck } from "@/features/lessons/components/PathNeck";
import { RichText } from "@/features/lessons/components/RichText";
import { computeStageStatuses, getLessonProgress, isLessonDone } from "@/features/lessons/progress";
import { faNum, formatDuration } from "@/lib/format";
import { useStorageRevision } from "@/lib/storage";
import { firstUnfinishedLesson, isNewUser, lessonsInOrder, routineFromLesson } from "./home";
import styles from "./Dashboard.module.css";

const allLessons = lessonsInOrder(stages);

/** Home: a welcome for new learners, "continue where you were" for returning ones. Both read real stored progress. */
export function DashboardPage() {
  useStorageRevision(); // re-render when lesson progress changes
  const { progress: glossaryProgress } = useGlossaryProgress();
  const learnedTerms = glossaryProgress.learned.filter((id) => glossary.some((t) => t.id === id)).length;

  return isNewUser(allLessons, getLessonProgress, learnedTerms) ? <NewHome /> : <ReturningHome learnedTerms={learnedTerms} />;
}

// ---------- New learner ----------

function NewHome() {
  const first = allLessons[0];
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroText}>
          <p className={styles.kicker}>گیتار بلوز، قدم‌به‌قدم</p>
          <h1 id="home-title" className={styles.brandTitle}>
            <span dir="ltr">
              Slow <span className={styles.accent}>Bend</span>
            </span>
          </h1>
          <p className={styles.lead}>از صفر، با گیتار الکتریک، قدم‌به‌قدم تا اولین سولوی بلوز</p>
          <div className={styles.actions}>
            {first && (
              <Link to={`/lesson/${first.id}`} className={styles.primary}>
                <Play size={20} aria-hidden />
                شروع از جلسه‌ی ۱
              </Link>
            )}
            <Link to="/glossary/instrument" className={styles.secondary}>
              <MapIcon size={20} aria-hidden />
              اول با ساز آشنا شو
            </Link>
          </div>
        </div>
        <Logo variant="mark" size={168} animate className={styles.heroMark} />
      </section>

      <section aria-labelledby="how-title">
        <h2 id="how-title" className={styles.sectionTitle}>
          چطور کار می‌کند
        </h2>
        <ul className={styles.how}>
          <li>
            <Link to="/path" className={styles.howCard}>
              <GraduationCap size={26} aria-hidden className={styles.howIcon} />
              <span>درس‌های کوتاه ۳۰ تا ۴۰ دقیقه‌ای</span>
            </Link>
          </li>
          <li>
            <Link to="/practice" className={styles.howCard}>
              <Drum size={26} aria-hidden className={styles.howIcon} />
              <span>
                <RichText text="تمرین با `Tab` متحرک و مترونوم و بکینگ‌ترک" />
              </span>
            </Link>
          </li>
          <li>
            <Link to="/glossary" className={styles.howCard}>
              <BookOpen size={26} aria-hidden className={styles.howIcon} />
              <span>اصطلاحات و نقشه‌ی ساز</span>
            </Link>
          </li>
        </ul>
      </section>

      <section aria-label="مسیر ۹ مرحله‌ای" className={styles.neck}>
        <PathNeck stages={stages} statuses={computeStageStatuses(stages, isLessonDone)} isLessonDone={isLessonDone} />
      </section>

      <div className={styles.notes}>
        <p className={styles.note}>
          <GraduationCap size={18} aria-hidden />
          فعلاً مرحله‌های ۱ تا ۴ آماده‌اند و مرحله‌های ۵ تا ۹ به‌زودی می‌آیند.
        </p>
        <p className={styles.note}>
          <ShieldCheck size={18} aria-hidden />
          پیشرفت تو فقط در مرورگر خودت ذخیره می‌شود.
        </p>
      </div>
    </div>
  );
}

// ---------- Returning learner ----------

function ReturningHome({ learnedTerms }: { learnedTerms: number }) {
  const current = firstUnfinishedLesson(stages, isLessonDone);
  const statuses = computeStageStatuses(stages, isLessonDone);
  const doneCount = allLessons.filter((l) => isLessonDone(l.id)).length;
  const reports = allLessons.reduce((n, l) => n + getLessonProgress(l.id).reports.length, 0);

  return (
    <div className={styles.page}>
      {current ? (
        <section className={styles.hero} aria-labelledby="home-title">
          <div className={styles.heroText}>
            <p className={styles.kicker}>{formatDuration(current.duration)}</p>
            <h1 id="home-title" className={styles.continueTitle}>
              ادامه‌ی جلسه‌ی {faNum(current.session)}: <RichText text={current.title} />
            </h1>
            <div className={styles.actions}>
              <Link to={`/lesson/${current.id}`} className={styles.primary}>
                <Play size={20} aria-hidden />
                ادامه
              </Link>
            </div>
          </div>
          <Logo variant="mark" size={120} className={styles.heroMark} />
        </section>
      ) : (
        <section className={styles.hero} aria-labelledby="home-title">
          <div className={styles.heroText}>
            <h1 id="home-title" className={styles.continueTitle}>
              همه‌ی درس‌های فعلی را تمام کردی
            </h1>
            <div className={styles.actions}>
              <Link to="/path" className={styles.primary}>
                <GraduationCap size={20} aria-hidden />
                مرور درس‌ها
              </Link>
              <Link to="/practice" className={styles.secondary}>
                <Drum size={20} aria-hidden />
                تمرین
              </Link>
            </div>
          </div>
          <Logo variant="mark" size={120} className={styles.heroMark} />
        </section>
      )}

      <section aria-label="مسیر ۹ مرحله‌ای" className={styles.neck}>
        <PathNeck stages={stages} statuses={statuses} isLessonDone={isLessonDone} />
        <Link to="/path" className={styles.more}>
          همه‌ی مرحله‌ها
          <ChevronLeft size={18} aria-hidden />
        </Link>
      </section>

      <div className={styles.grid} data-solo={!current || undefined}>
        {current && <Routine lesson={current} />}

        <div className={styles.side}>
          <section aria-labelledby="stats-title" className={styles.card}>
            <h2 id="stats-title" className={styles.cardTitle}>
              پیشرفت تو
            </h2>
            <dl className={styles.stats}>
              <div className={styles.stat}>
                <dt>درس‌های تمام‌شده</dt>
                <dd>
                  {faNum(doneCount)} <span className={styles.of}>از {faNum(allLessons.length)}</span>
                </dd>
              </div>
              <div className={styles.stat}>
                <dt>گزارش‌های ثبت‌شده</dt>
                <dd>{faNum(reports)}</dd>
              </div>
              <div className={styles.stat}>
                <dt>اصطلاح‌های یادگرفته</dt>
                <dd>
                  {faNum(learnedTerms)} <span className={styles.of}>از {faNum(glossary.length)}</span>
                </dd>
              </div>
            </dl>
          </section>

          <Basics learnedTerms={learnedTerms} />
        </div>
      </div>
    </div>
  );
}

function Routine({ lesson }: { lesson: Lesson }) {
  const { rows, total } = routineFromLesson(lesson);
  return (
    <section aria-labelledby="routine-title" className={styles.card}>
      <h2 id="routine-title" className={styles.cardTitle}>
        روتین امروز · <bdi>{formatDuration(total)}</bdi>
      </h2>
      <ol className={styles.routine}>
        {rows.map((r) => {
          const body = (
            <>
              <span className={styles.rowTitle}>
                <RichText text={r.title} />
              </span>
              <span className={styles.min}>{formatDuration(r.duration)}</span>
              {r.to && <ChevronLeft size={16} aria-hidden className={styles.rowChevron} />}
            </>
          );
          return (
            <li key={r.id}>
              {r.to ? (
                <Link to={r.to} className={styles.row}>
                  {r.to.startsWith("/backing") ? <AudioLines size={16} aria-hidden /> : <Drum size={16} aria-hidden />}
                  {body}
                </Link>
              ) : (
                <div className={styles.row}>
                  <span className={styles.rowDot} aria-hidden />
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Basics({ learnedTerms }: { learnedTerms: number }) {
  const { progress } = useGlossaryProgress();
  const next = firstUnlearned(glossary, progress.learned);
  return (
    <section aria-labelledby="basics-title" className={styles.card}>
      <h2 id="basics-title" className={styles.cardTitle}>
        مبانی
      </h2>
      <ProgressBar value={learnedTerms} total={glossary.length} label="اصطلاح‌های یادگرفته" />
      <div className={styles.links}>
        <Link to={next ? termHref(next) : "/glossary"} className={styles.linkBtn}>
          <BookOpen size={18} aria-hidden />
          ادامه‌ی اصطلاحات
        </Link>
        <Link to="/glossary/instrument" className={styles.linkBtn}>
          <MapIcon size={18} aria-hidden />
          نقشه‌ی ساز
        </Link>
      </div>
    </section>
  );
}
