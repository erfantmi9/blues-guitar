/**
 * Home page logic. Pure: no React, DOM or storage access (progress is passed in), so it is unit-tested.
 */
import type { Duration, Lesson, LessonProgress, Section, Stage } from "@bg/shared";

/** Has the learner done anything in this lesson? (a ticked criterion, a report, draft text, or completion) */
export function lessonStarted(p: LessonProgress): boolean {
  return (
    p.completedAt !== null ||
    p.checkedCriteria.length > 0 ||
    p.reports.length > 0 ||
    Object.values(p.reportDraft).some((v) => v.trim() !== "")
  );
}

/** New learner: no lesson started or finished and no glossary term marked learned. Practice settings don't count. */
export function isNewUser(lessons: readonly Lesson[], progressOf: (id: string) => LessonProgress, learnedTerms: number): boolean {
  return learnedTerms === 0 && !lessons.some((l) => lessonStarted(progressOf(l.id)));
}

/** All lessons in path order (stage number, then session) */
export const lessonsInOrder = (stages: readonly Stage[]): Lesson[] =>
  [...stages].sort((a, b) => a.number - b.number).flatMap((s) => [...s.lessons].sort((a, b) => a.session - b.session));

/** First lesson not completed, in path order; undefined when every available lesson is done */
export function firstUnfinishedLesson(stages: readonly Stage[], isDone: (lessonId: string) => boolean): Lesson | undefined {
  return lessonsInOrder(stages).find((l) => !isDone(l.id));
}

/** Sum of durations; a range if any part is a range */
export function sumDurations(ds: readonly Duration[]): Duration {
  let min = 0;
  let max = 0;
  for (const d of ds) {
    min += typeof d === "number" ? d : d.min;
    max += typeof d === "number" ? d : d.max;
  }
  return min === max ? min : { min, max };
}

export type RoutineRow = { id: string; title: string; duration: Duration; to?: string };

/** Pages a routine row may link to: practice tools only */
const PRACTICE_LINK = /^\/(practice|backing)(\/|\?|$)/;

/** A row's link: the section's first link block that opens the practice page or the backing track */
export function sectionLink(s: Section): string | undefined {
  for (const b of s.blocks) if (b.type === "link" && PRACTICE_LINK.test(b.to)) return b.to;
  return undefined;
}

/** Today's routine = the sections of the current lesson, with their durations and the total */
export function routineFromLesson(lesson: Lesson): { rows: RoutineRow[]; total: Duration } {
  const rows = lesson.sections.map((s) => ({ id: s.id, title: s.title, duration: s.duration, to: sectionLink(s) }));
  return { rows, total: sumDurations(rows.map((r) => r.duration)) };
}
