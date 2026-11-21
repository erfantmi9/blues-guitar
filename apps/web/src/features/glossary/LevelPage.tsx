import { useMemo } from "react";
import { Link, useParams } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RichText } from "@/features/lessons/components/RichText";
import { isLevelDone, QUIZ_PASS } from "@/lib/content/reference";
import { faNum } from "@/lib/format";
import { glossary, getLevel, levels, quizOfLevel, termsOfLevel } from "./content";
import { MapLink } from "./components/MapLink";
import { ProgressBar } from "./components/ProgressBar";
import { Quiz } from "./components/Quiz";
import { TermCard } from "./components/TermCard";
import { useGlossaryProgress } from "./progress";
import { useHashTarget } from "./useHashTarget";
import styles from "./glossary.module.css";

export function LevelPage() {
  const { levelId } = useParams();
  const id = Number(levelId);
  const level = levelId !== undefined && Number.isInteger(id) ? getLevel(id) : undefined;
  const { progress, toggleLearned, recordQuiz } = useGlossaryProgress();
  const learned = useMemo(() => new Set(progress.learned), [progress.learned]);
  const terms = useMemo(() => termsOfLevel(id), [id]);
  const questions = useMemo(() => quizOfLevel(id), [id]);
  const target = useHashTarget(id);

  const back = (
    <Link to="/glossary" className={styles.back}>
      <ChevronRight size={18} aria-hidden />
      مسیر اصطلاحات
    </Link>
  );

  if (!level) {
    return (
      <>
        {back}
        <Card>این سطح پیدا نشد.</Card>
      </>
    );
  }

  const learnedCount = terms.filter((t) => learned.has(t.id)).length;
  const best = progress.quizBest[String(level.id)];
  const done = isLevelDone(level.id, glossary, progress);
  const prev = levels.find((l) => l.id === level.id - 1);
  const next = levels.find((l) => l.id === level.id + 1);

  return (
    <>
      {back}
      <header className={styles.levelHeader}>
        <p className={styles.levelKicker}>سطح {faNum(level.id)}</p>
        <h1 className={styles.levelTitle}>
          <RichText text={level.title} />
        </h1>
      </header>

      {!level.available ? (
        <Card>
          <span className={styles.soonBadge}>به‌زودی</span> محتوای این سطح هنوز آماده نیست.
        </Card>
      ) : (
        <>
          <Card className={styles.intro}>
            <p className={styles.introText}>
              <RichText text={level.summary} />
            </p>
            <p className={styles.muted}>
              {faNum(terms.length)} اصطلاح، به ترتیب یادگیری. هر کدام را فهمیدی «یاد گرفتم» را بزن. در آخر یک کوییز{" "}
              {faNum(questions.length)} سؤالی هست.
            </p>
            <ProgressBar value={learnedCount} total={terms.length} label="اصطلاح‌های یاد گرفته" />
            <div className={styles.introFoot}>
              {done && <span className={styles.doneBadge}>تمام‌شده</span>}
              {level.id === 0 && <MapLink />}
            </div>
          </Card>

          <ol className={styles.terms}>
            {terms.map((t) => (
              <TermCard key={t.id} term={t} learned={learned} onToggleLearned={toggleLearned} targeted={t.id === target} />
            ))}
          </ol>

          <section id="level-quiz" className={styles.quizSection} aria-labelledby="quiz-title">
            <h2 id="quiz-title" className={styles.sectionTitle}>
              کوییز سطح {faNum(level.id)}
            </h2>
            <p className={styles.muted}>
              {best !== undefined
                ? `بهترین نمره: ${faNum(best)} از ${faNum(questions.length)}`
                : `با دست‌کم ${faNum(QUIZ_PASS)} جواب درست، و اگر همه‌ی اصطلاح‌ها را یاد گرفته باشی، سطح «تمام‌شده» می‌شود.`}
            </p>
            <Quiz key={level.id} questions={questions} best={best} onFinish={(score) => recordQuiz(level.id, score)} />
          </section>
        </>
      )}

      <nav className={styles.levelNav} aria-label="سطح‌ها">
        {prev ? (
          <Link to={`/glossary/level/${prev.id}`} className={styles.levelNavLink}>
            <ChevronRight size={18} aria-hidden />
            سطح {faNum(prev.id)}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/glossary/level/${next.id}`} className={styles.levelNavLink}>
            سطح {faNum(next.id)}
            <ChevronLeft size={18} aria-hidden />
          </Link>
        )}
      </nav>
    </>
  );
}
