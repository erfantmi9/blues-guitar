import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import type { GlossaryTerm } from "@bg/shared";
import { CheckCircle2, ChevronLeft, PlayCircle, Search, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLesson } from "@/features/lessons/content";
import { RichText } from "@/features/lessons/components/RichText";
import { firstUnlearned, isLevelDone, termMatches, type GlossaryProgress } from "@/lib/content/reference";
import { faNum } from "@/lib/format";
import { getLevel, glossary, glossaryProblems, levels, quizOfLevel, termHref, termsForLesson, termsOfLevel } from "./content";
import { MapLink } from "./components/MapLink";
import { ProgressBar } from "./components/ProgressBar";
import { useGlossaryProgress } from "./progress";
import styles from "./glossary.module.css";

/** /glossary: the 7-level path, search across all terms, and ?lesson=<id> (terms met in one lesson) */
export function GlossaryPage() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const { progress } = useGlossaryProgress();
  const lessonId = params.get("lesson");

  const results = useMemo(() => (query.trim() ? glossary.filter((t) => termMatches(t, query)) : null), [query]);
  const next = firstUnlearned(glossary, progress.learned);

  return (
    <>
      <PageHeader title="اصطلاحات" subtitle="از صفر، قدم‌به‌قدم: اول ساز، بعد سیم‌ها، بعد نت‌ها" />

      {import.meta.env.DEV && glossaryProblems.length > 0 && (
        <Card className={styles.devErrors} role="alert">
          <strong>خطای محتوای اصطلاحات (فقط در حالت توسعه دیده می‌شود)</strong>
          <ul dir="ltr">
            {glossaryProblems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className={styles.toolbar}>
        <label className={styles.search}>
          <Search size={18} aria-hidden className={styles.searchIcon} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو: فارسی یا English"
            aria-label="جستجوی اصطلاح"
            enterKeyHint="search"
          />
        </label>
      </div>

      {results ? (
        <SearchResults results={results} />
      ) : lessonId !== null ? (
        <LessonTerms lessonId={lessonId} onClear={() => setParams({}, { replace: true })} />
      ) : (
        <>
          <div className={styles.topActions}>
            {next ? (
              <Link to={termHref(next)} className={styles.continue}>
                <PlayCircle size={22} aria-hidden />
                <span className={styles.continueText}>
                  ادامه از جایی که بودی
                  <span className={styles.continueSub}>
                    سطح {faNum(next.level)} · <RichText text={next.fa} />
                  </span>
                </span>
              </Link>
            ) : (
              <p className={styles.allLearned}>
                <CheckCircle2 size={20} aria-hidden />
                همه‌ی اصطلاح‌های موجود را یاد گرفته‌ای.
              </p>
            )}
            <MapLink />
          </div>
          <Timeline progress={progress} />
        </>
      )}
    </>
  );
}

function Timeline({ progress }: { progress: GlossaryProgress }) {
  const learned = new Set(progress.learned);
  return (
    <ol className={styles.timeline} aria-label="مسیر اصطلاحات">
      {levels.map((level) => {
        const terms = termsOfLevel(level.id);
        const learnedCount = terms.filter((t) => learned.has(t.id)).length;
        const best = progress.quizBest[String(level.id)];
        const total = quizOfLevel(level.id).length;
        const done = isLevelDone(level.id, glossary, progress);
        const status = !level.available
          ? "به‌زودی"
          : done
            ? "تمام‌شده"
            : learnedCount > 0 || best !== undefined
              ? "در حال یادگیری"
              : "شروع نشده";
        const body = (
          <span className={styles.stepBody}>
            <span className={styles.levelTop}>
              <span className={styles.levelName}>
                <RichText text={level.title} />
              </span>
              <span className={styles.status} data-status={done ? "done" : level.available ? undefined : "soon"}>
                {status}
              </span>
            </span>
            {level.available && (
              <>
                <span className={styles.levelSummary}>
                  <RichText text={level.summary} />
                </span>
                <ProgressBar value={learnedCount} total={terms.length} label={`سطح ${faNum(level.id)}: اصطلاح‌های یاد گرفته`} />
                <span className={styles.muted}>
                  {best !== undefined ? `بهترین نمره‌ی کوییز: ${faNum(best)} از ${faNum(total)}` : "کوییز: هنوز نزده‌ای"}
                </span>
              </>
            )}
          </span>
        );
        return (
          <li key={level.id} className={styles.step} data-soon={!level.available || undefined} data-done={done || undefined}>
            <span className={styles.node} aria-hidden>
              {done ? <CheckCircle2 size={18} /> : faNum(level.id)}
            </span>
            {level.available ? (
              <Link to={`/glossary/level/${level.id}`} className={styles.stepCard}>
                {body}
                <ChevronLeft size={20} aria-hidden className={styles.chevron} />
              </Link>
            ) : (
              <div className={styles.stepCard}>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function TermRow({ t }: { t: GlossaryTerm }) {
  const level = getLevel(t.level);
  return (
    <li>
      <Link to={termHref(t)} className={styles.resultRow}>
        <span className={styles.resultMain}>
          <bdi dir="ltr" className={styles.en}>
            {t.term}
          </bdi>
          <span className={styles.fa}>
            <RichText text={t.fa} />
          </span>
        </span>
        <span className={styles.resultLevel}>
          سطح {faNum(t.level)}
          {level && (
            <>
              : <RichText text={level.title} />
            </>
          )}
        </span>
      </Link>
    </li>
  );
}

function SearchResults({ results }: { results: GlossaryTerm[] }) {
  return (
    <>
      <p className={styles.count} aria-live="polite">
        {faNum(results.length)} نتیجه
      </p>
      {results.length === 0 ? (
        <Card>چیزی پیدا نشد. املای دیگری را امتحان کن.</Card>
      ) : (
        <ul className={styles.results}>
          {results.map((t) => (
            <TermRow key={t.id} t={t} />
          ))}
        </ul>
      )}
    </>
  );
}

function LessonTerms({ lessonId, onClear }: { lessonId: string; onClear: () => void }) {
  const lesson = getLesson(lessonId);
  const terms = lesson ? termsForLesson(lesson.id) : [];
  return (
    <>
      <div className={styles.lessonFilter}>
        <span>
          {lesson ? (
            <>
              اصطلاحات درس «
              <Link to={`/lesson/${lesson.id}`} className={styles.lessonLink}>
                <RichText text={lesson.title} />
              </Link>
              »
            </>
          ) : (
            "این درس پیدا نشد."
          )}
        </span>
        <button type="button" className={styles.filterChip} onClick={onClear}>
          مسیر کامل
          <X size={16} aria-hidden />
        </button>
      </div>
      {lesson && terms.length === 0 && <Card>برای این درس اصطلاحی ثبت نشده.</Card>}
      {terms.length > 0 && (
        <>
          <p className={styles.count}>{faNum(terms.length)} اصطلاح</p>
          <ul className={styles.results}>
            {terms.map((t) => (
              <TermRow key={t.id} t={t} />
            ))}
          </ul>
        </>
      )}
    </>
  );
}
