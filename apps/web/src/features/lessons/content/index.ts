import type { Lesson, Stage, TrackId } from "@bg/shared";
import { buildStages, stagesOfTrack, validateStructure } from "../structure";
import { recommendedOrder } from "./order";
import { stageMetas } from "./stages";
import { tracks } from "./tracks";

/**
 * Lesson registry.
 * To add a lesson: create a file in lessons/ with `export default lesson`.
 * It is picked up automatically, but it must also be added to recommendedOrder (order.ts).
 */
const modules = import.meta.glob<{ default: Lesson }>("./lessons/*.ts", { eager: true });

const lessons: Lesson[] = Object.values(modules).map((m) => m.default);

/** All stages, grouped by track (foundation, solo, chords), each in teaching order */
export const stages: Stage[] = buildStages(stageMetas, tracks, lessons);

/** Every registered lesson (file order; use recommendedOrder for the suggested order) */
export { lessons, recommendedOrder, tracks };

const lessonById = new Map(lessons.map((l) => [l.id, l]));
const stageById = new Map(stages.map((s) => [s.id, s]));

export const getLesson = (id: string) => lessonById.get(id);
export const getStage = (id: string) => stageById.get(id);
export const getTrack = (id: TrackId) => tracks.find((t) => t.id === id);
export const trackStages = (id: TrackId) => stagesOfTrack(stages, id);
/** Track of a lesson (via its stage) */
export const trackOfLesson = (lesson: Lesson) => {
  const stage = stageById.get(lesson.stageId);
  return stage ? getTrack(stage.trackId) : undefined;
};

// Catch content mistakes early during development
if (import.meta.env.DEV) {
  const problems: string[] = validateStructure(stageMetas, tracks, lessons, recommendedOrder);
  for (const l of lessons) {
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
