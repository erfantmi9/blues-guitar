import type { TabExercise } from "@bg/shared";
import { sortNotes, validateExercise } from "@/lib/practice";

/**
 * Tab exercise registry.
 * To add an exercise: create a file in exercises/ with `export default exercise`.
 * It is picked up automatically; no extra registration line needed.
 */
const modules = import.meta.glob<{ default: TabExercise }>("./exercises/*.ts", { eager: true });

export type ExerciseProblem = { file: string; id: string; problems: string[] };

const problems: ExerciseProblem[] = [];
const seen = new Set<string>();
const valid: TabExercise[] = [];

for (const [file, mod] of Object.entries(modules)) {
  const ex = mod.default;
  const list = ex ? validateExercise(ex) : ["file has no default export"];
  if (ex && seen.has(ex.id)) list.push(`duplicate id "${ex.id}"`);
  if (list.length) {
    problems.push({ file, id: ex?.id ?? "?", problems: list });
    continue; // invalid exercises are not shown
  }
  seen.add(ex.id);
  valid.push({ ...ex, notes: sortNotes(ex.notes) });
}

if (problems.length) {
  console.error(
    "[exercises] invalid content:\n" +
      problems.map((p) => `  ${p.file} (${p.id}):\n    - ${p.problems.join("\n    - ")}`).join("\n"),
  );
}

/** Sorted by id (ids start with the session number, e.g. s1-…) so order is stable */
export const exercises: TabExercise[] = valid.sort((a, b) => a.id.localeCompare(b.id));

/** Content errors; shown in the UI only in development */
export const exerciseProblems: readonly ExerciseProblem[] = problems;

const byId = new Map(exercises.map((e) => [e.id, e]));
export const getExercise = (id: string | null | undefined) => (id ? byId.get(id) : undefined);
