import { useMemo } from "react";
import type { Lesson, LessonProgress, Stage, StageStatus } from "@bg/shared";
import { defineKey, storage, useStoredValue, type KeyDef } from "@/lib/storage";

const EMPTY: LessonProgress = {
  checkedCriteria: [],
  completedAt: null,
  reportDraft: {},
  reports: [],
};

const keyCache = new Map<string, KeyDef<LessonProgress>>();

/** One key per lesson: "lesson-progress:<id>" */
export function progressKey(lessonId: string): KeyDef<LessonProgress> {
  let def = keyCache.get(lessonId);
  if (!def) {
    def = defineKey<LessonProgress>(`lesson-progress:${lessonId}`, { version: 1, fallback: EMPTY });
    keyCache.set(lessonId, def);
  }
  return def;
}

export const getLessonProgress = (lessonId: string) => storage.get(progressKey(lessonId));

export const isLessonDone = (lessonId: string) => getLessonProgress(lessonId).completedAt !== null;

export function canComplete(lesson: Lesson, progress: LessonProgress): boolean {
  const valid = progress.checkedCriteria.filter((id) => lesson.completion.criteria.some((c) => c.id === id));
  return valid.length >= lesson.completion.minRequired;
}

export function useLessonProgress(lesson: Lesson) {
  const [progress, set] = useStoredValue(progressKey(lesson.id));

  const actions = useMemo(
    () => ({
      toggleCriterion(criterionId: string) {
        set((p) => ({
          ...p,
          checkedCriteria: p.checkedCriteria.includes(criterionId)
            ? p.checkedCriteria.filter((id) => id !== criterionId)
            : [...p.checkedCriteria, criterionId],
        }));
      },
      markCompleted() {
        set((p) => (canComplete(lesson, p) ? { ...p, completedAt: new Date().toISOString() } : p));
      },
      unmarkCompleted() {
        set((p) => ({ ...p, completedAt: null }));
      },
      setDraftAnswer(questionId: string, text: string) {
        set((p) => ({ ...p, reportDraft: { ...p.reportDraft, [questionId]: text } }));
      },
      /** Saves the current draft as a dated report and clears the form */
      submitReport() {
        set((p) => ({
          ...p,
          reports: [
            {
              id: crypto.randomUUID?.() ?? String(Date.now()),
              createdAt: new Date().toISOString(),
              answers: { ...p.reportDraft },
              checkedCriteria: [...p.checkedCriteria],
            },
            ...p.reports,
          ],
          reportDraft: {},
        }));
      },
    }),
    [lesson, set],
  );

  return { progress, ...actions };
}

/**
 * Stage status, in path order:
 * - no lessons → coming soon
 * - previous stage not done → locked
 * - all lessons done → done, otherwise in progress
 */
export function computeStageStatuses(stages: Stage[], done: (lessonId: string) => boolean): Map<string, StageStatus> {
  const result = new Map<string, StageStatus>();
  let previousDone = true;
  for (const stage of stages) {
    let status: StageStatus;
    if (stage.lessons.length === 0) status = "coming-soon";
    else if (!previousDone) status = "locked";
    else if (stage.lessons.every((l) => done(l.id))) status = "done";
    else status = "in-progress";
    result.set(stage.id, status);
    previousDone = status === "done";
  }
  return result;
}
