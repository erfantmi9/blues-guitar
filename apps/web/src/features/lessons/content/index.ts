import type { Lesson, Stage } from "@bg/shared";
import { stageMetas } from "./stages";

/**
 * Lesson registry.
 * To add a lesson: create a file in lessons/ with `export default lesson`.
 * It is picked up automatically; no extra registration line needed.
 */
const modules = import.meta.glob<{ default: Lesson }>("./lessons/*.ts", { eager: true });

const lessons: Lesson[] = Object.values(modules).map((m) => m.default);

export const stages: Stage[] = stageMetas
  .slice()
  .sort((a, b) => a.number - b.number)
  .map((meta) => ({
    ...meta,
    lessons: lessons.filter((l) => l.stageId === meta.id).sort((a, b) => a.session - b.session),
  }));

const lessonById = new Map(lessons.map((l) => [l.id, l]));
const stageById = new Map(stages.map((s) => [s.id, s]));

export const getLesson = (id: string) => lessonById.get(id);
export const getStage = (id: string) => stageById.get(id);

// Catch content mistakes early during development
if (import.meta.env.DEV) {
  const problems: string[] = [];
  if (lessonById.size !== lessons.length) problems.push("duplicate lesson id");
  for (const l of lessons) {
    if (!stageById.has(l.stageId)) problems.push(`${l.id}: unknown stageId "${l.stageId}"`);
    const ids = l.completion.criteria.map((c) => c.id);
    if (new Set(ids).size !== ids.length) problems.push(`${l.id}: duplicate criterion id`);
    if (l.completion.minRequired > ids.length) problems.push(`${l.id}: minRequired > criteria`);
    for (const s of l.sections) {
      for (const b of s.blocks) {
        if (b.type !== "fretboard") continue;
        const max = b.frets ?? 12;
        for (const n of b.highlightedNotes) {
          if (n.string < 1 || n.string > 6 || n.fret < 0 || n.fret > max) {
            problems.push(`${l.id}/${s.id}: fretboard note out of range (string ${n.string}, fret ${n.fret})`);
          }
        }
      }
    }
  }
  if (problems.length) console.error("[lessons] content problems:\n" + problems.join("\n"));
}
