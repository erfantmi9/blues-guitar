/**
 * Shape checks for each backed-up key, and the summary shown before a restore. Pure (types only), unit-tested.
 * A check is strict on types, so a hand-edited or broken file cannot put odd values into storage.
 */
import type { LessonProgress } from "@bg/shared";
import type { RestoreEntry } from "@/lib/storage/backup";
import type { GlossaryProgress } from "@/lib/content/reference";

const isObject = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);
const isStringArray = (x: unknown): x is string[] => Array.isArray(x) && x.every((s) => typeof s === "string");
const isRecordOf = (x: unknown, item: (v: unknown) => boolean) => isObject(x) && Object.values(x).every(item);
const isString = (x: unknown) => typeof x === "string";
const isFiniteNumber = (x: unknown) => typeof x === "number" && Number.isFinite(x);
const isBool = (x: unknown) => typeof x === "boolean";

export function isLessonProgress(x: unknown): x is LessonProgress {
  return (
    isObject(x) &&
    isStringArray(x.checkedCriteria) &&
    (x.completedAt === null || isString(x.completedAt)) &&
    isRecordOf(x.reportDraft, isString) &&
    Array.isArray(x.reports) &&
    x.reports.every(
      (r) => isObject(r) && isString(r.id) && isString(r.createdAt) && isRecordOf(r.answers, isString) && isStringArray(r.checkedCriteria),
    )
  );
}

export function isGlossaryProgress(x: unknown): x is GlossaryProgress {
  return (
    isObject(x) &&
    isStringArray(x.learned) &&
    isRecordOf(x.quizBest, (n) => isFiniteNumber(n) && Number.isInteger(n) && (n as number) >= 0)
  );
}

export const isMetronomeSettings = (x: unknown) =>
  isObject(x) && isFiniteNumber(x.bpm) && isFiniteNumber(x.beatsPerBar) && isBool(x.accent);

const isChannel = (c: unknown) => isObject(c) && isBool(c.on) && isFiniteNumber(c.volume);
export const isBackingSettings = (x: unknown) =>
  isObject(x) &&
  isRecordOf(x.bpmById, isFiniteNumber) &&
  isBool(x.countIn) &&
  isObject(x.mix) &&
  isFiniteNumber(x.mix.master) &&
  ["drums", "bass", "chords"].every((k) => isChannel((x.mix as Record<string, unknown>)[k]));

export const isExerciseSettings = (x: unknown) =>
  isObject(x) &&
  (x.selectedId === null || isString(x.selectedId)) &&
  isRecordOf(x.bpmById, isFiniteNumber) &&
  isBool(x.sound) &&
  isBool(x.loop) &&
  isFiniteNumber(x.visualOffsetMs);

export const LESSON_KEY_PREFIX = "lesson-progress:";
export const GLOSSARY_KEY = "glossary:progress";

export type BackupSummary = { lessonsDone: number; reports: number; termsLearned: number; settings: number };

/** What a set of entries contains: shown before restoring, next to the same numbers for the current data */
export function summarize(entries: readonly RestoreEntry[]): BackupSummary {
  const s: BackupSummary = { lessonsDone: 0, reports: 0, termsLearned: 0, settings: 0 };
  for (const { def, value } of entries) {
    if (def.key.startsWith(LESSON_KEY_PREFIX)) {
      const p = value as LessonProgress;
      if (p.completedAt) s.lessonsDone++;
      s.reports += p.reports.length;
    } else if (def.key === GLOSSARY_KEY) {
      s.termsLearned += new Set((value as GlossaryProgress).learned).size;
    } else s.settings++;
  }
  return s;
}
