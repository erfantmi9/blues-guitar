/**
 * Home page logic. Pure: no React, DOM or storage access (progress is passed in), so it is unit-tested.
 */
import type { Duration, Lesson, LessonProgress, Section } from "@bg/shared";

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

/**
 * Lessons in the recommended order (content/order.ts). Ids that don't exist are skipped.
 * A lesson missing from the order (a test forbids this, but just in case) goes at the end,
 * in its given order, so it is never hidden.
 */
export function lessonsInRecommendedOrder(order: readonly string[], lessons: readonly Lesson[]): Lesson[] {
  const byId = new Map(lessons.map((l) => [l.id, l]));
  const listed = [...new Set(order)].flatMap((id) => byId.get(id) ?? []);
  const inOrder = new Set(listed.map((l) => l.id));
  return [...listed, ...lessons.filter((l) => !inOrder.has(l.id))];
}

/** "Continue with the next session": first lesson not completed, in the recommended order; undefined when all are done */
export function nextRecommendedLesson(
  order: readonly string[],
  lessons: readonly Lesson[],
  isDone: (lessonId: string) => boolean,
): Lesson | undefined {
  return lessonsInRecommendedOrder(order, lessons).find((l) => !isDone(l.id));
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
