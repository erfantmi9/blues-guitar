/**
 * Every storage key that belongs to the learner's progress, with its shape check. Storage keys are unchanged;
 * this only lists them. When a new key is added with defineKey, add it here too or it won't be backed up.
 */
import type { KeyDef } from "@/lib/storage";
import type { BackupKey } from "@/lib/storage/backup";
import { glossaryProgressKey } from "@/features/glossary/progress";
import { stages } from "@/features/lessons/content";
import { progressKey } from "@/features/lessons/progress";
import { backingSettingsKey } from "@/features/practice/backingSettings";
import { exerciseSettingsKey } from "@/features/practice/exerciseSettings";
import { metronomeSettingsKey } from "@/features/practice/useMetronome";
import { isBackingSettings, isExerciseSettings, isGlossaryProgress, isLessonProgress, isMetronomeSettings } from "./backupSchema";

const k = <T,>(def: KeyDef<T>, validate: (x: unknown) => boolean): BackupKey => ({ def: def as KeyDef<unknown>, validate });

export const backupKeys: BackupKey[] = [
  ...stages.flatMap((s) => s.lessons.map((l) => k(progressKey(l.id), isLessonProgress))),
  k(glossaryProgressKey, isGlossaryProgress),
  k(metronomeSettingsKey, isMetronomeSettings),
  k(exerciseSettingsKey, isExerciseSettings),
  k(backingSettingsKey, isBackingSettings),
];
