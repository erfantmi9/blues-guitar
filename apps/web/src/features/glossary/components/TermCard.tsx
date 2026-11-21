import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router";
import type { GlossaryTerm } from "@bg/shared";
import { Check, Crosshair, MapPin, Volume2 } from "lucide-react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { getLesson } from "@/features/lessons/content";
import { RichText } from "@/features/lessons/components/RichText";
import { faNum } from "@/lib/format";
import { getTerm, termHref } from "../content";
import { instrumentHref, isOnMap } from "../instrument/parts";
import { playTermNotes } from "../playNotes";
import { termDomId } from "../useHashTarget";
import styles from "../glossary.module.css";

type Props = {
  term: GlossaryTerm;
  learned: ReadonlySet<string>;
  onToggleLearned: (id: string) => void;
  targeted: boolean;
  /** Where prerequisite and related chips lead (default: the term's card on its level page) */
  hrefFor?: (t: GlossaryTerm) => string;
  /** «نشانش بده» for terms drawn on the instrument map (off on the map itself) */
  showOnMap?: boolean;
};

export function TermCard({ term: t, learned, onToggleLearned, targeted, hrefFor = termHref, showOnMap = true }: Props) {
  const isLearned = learned.has(t.id);
  const prerequisites = (t.prerequisites ?? []).map(getTerm).filter((r): r is GlossaryTerm => !!r);
  const related = (t.related ?? []).map(getTerm).filter((r): r is GlossaryTerm => !!r);

  return (
    <li id={termDomId(t.id)} className={styles.term} data-target={targeted || undefined} data-learned={isLearned || undefined}>
      <div className={styles.termHead}>
        <bdi dir="ltr" className={styles.en}>
          {t.term}
        </bdi>
        <span className={styles.fa}>
          <RichText text={t.fa} />
        </span>
      </div>

      <p className={styles.definition}>
        <RichText text={t.definition} />
      </p>

      {prerequisites.length > 0 && (
        <div className={styles.chipRow}>
          <span className={styles.chipLabel}>اول این‌ها را بدان:</span>
          {prerequisites.map((r) => (
            <Link key={r.id} to={hrefFor(r)} className={styles.chip} data-done={learned.has(r.id) || undefined}>
              {learned.has(r.id) && <Check size={14} aria-label="یاد گرفته‌ای" />}
              <RichText text={r.fa} />
            </Link>
          ))}
        </div>
      )}

      <MeetAt term={t} />

      {related.length > 0 && (
        <div className={styles.chipRow}>
          <span className={styles.chipLabel}>مرتبط:</span>
          {related.map((r) => (
            <Link key={r.id} to={hrefFor(r)} className={styles.chip}>
              <RichText text={r.fa} />
            </Link>
          ))}
        </div>
      )}

      {t.fretboard && (
        <figure className={styles.figure}>
          <Fretboard readOnly showNoteNames highlightedNotes={t.fretboard.notes} ariaLabel={`دسته‌ی گیتار: ${t.fa.replace(/`/g, "")}`} />
          {t.fretboard.caption && (
            <figcaption className={styles.caption}>
              <RichText text={t.fretboard.caption} />
            </figcaption>
          )}
        </figure>
      )}

      <div className={styles.actions}>
        {t.audio && t.audio.length > 0 && <ListenButton notes={t.audio} />}
        {showOnMap && isOnMap(t.id) && (
          <Link to={instrumentHref(t.id)} className={styles.listenBtn}>
            <Crosshair size={18} aria-hidden />
            نشانش بده
          </Link>
        )}
        <button
          type="button"
          className={styles.learnedBtn}
          aria-pressed={isLearned}
          onClick={() => onToggleLearned(t.id)}
          title={isLearned ? "دوباره بزن تا برگردد" : undefined}
        >
          <Check size={18} aria-hidden />
          یاد گرفتم
        </button>
      </div>
    </li>
  );
}

/** «کجا بهش می‌رسی» */
function MeetAt({ term: t }: { term: GlossaryTerm }) {
  const m = t.meetAt;
  const lesson = m?.lessonId ? getLesson(m.lessonId) : undefined;
  const lines: ReactNode[] = [];
  if (lesson)
    lines.push(
      <>
        این اصطلاح را در درس «
        <Link to={`/lesson/${lesson.id}`} className={styles.lessonLink}>
          <RichText text={lesson.title} />
        </Link>
        » می‌بینی
      </>,
    );
  if (m?.stage !== undefined) lines.push(<>در مرحله‌ی {faNum(m.stage)}</>);
  if (m?.note) lines.push(<RichText text={m.note} />);
  if (lines.length === 0) lines.push(<>فقط برای آشنایی با ساز؛ در متن درس‌ها مستقیم نیامده</>);

  return (
    <div className={styles.meet}>
      <MapPin size={16} aria-hidden className={styles.meetIcon} />
      <span>
        <span className={styles.srOnly}>کجا بهش می‌رسی: </span>
        {lines.map((l, i) => (
          <span key={i} className={styles.meetLine}>
            {l}
          </span>
        ))}
      </span>
    </div>
  );
}

function ListenButton({ notes }: { notes: NonNullable<GlossaryTerm["audio"]> }) {
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      className={styles.listenBtn}
      disabled={playing}
      onClick={() => {
        const ms = playTermNotes(notes);
        if (!ms) return;
        setPlaying(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setPlaying(false), ms);
      }}
    >
      <Volume2 size={18} aria-hidden />
      {playing ? "در حال پخش…" : "بشنو"}
    </button>
  );
}
