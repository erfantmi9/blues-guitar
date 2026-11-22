/**
 * Tracks → stages → lessons. Pure (no import.meta, React or storage), so it is unit-tested.
 */
import type { Lesson, Stage, StageMeta, Track, TrackId } from "@bg/shared";

/**
 * Stages grouped by track (track display order, then file order within the track),
 * each with its 1-based position in its track and its lessons sorted by session.
 */
export function buildStages(metas: readonly StageMeta[], tracks: readonly Track[], lessons: readonly Lesson[]): Stage[] {
  return tracks.flatMap((track) =>
    metas
      .filter((m) => m.trackId === track.id)
      .map((meta, i) => ({
        ...meta,
        position: i + 1,
        lessons: lessons.filter((l) => l.stageId === meta.id).sort((a, b) => a.session - b.session),
      })),
  );
}

export const stagesOfTrack = (stages: readonly Stage[], trackId: TrackId) => stages.filter((s) => s.trackId === trackId);

/** Finished lessons out of the lessons that exist in this track (coming-soon stages add nothing) */
export function trackProgress(stages: readonly Stage[], trackId: TrackId, isDone: (lessonId: string) => boolean) {
  const lessons = stagesOfTrack(stages, trackId).flatMap((s) => s.lessons);
  return { done: lessons.filter((l) => isDone(l.id)).length, total: lessons.length };
}

/** Structure mistakes (empty list = fine). Checked by tests and, in development, by the registry. */
export function validateStructure(
  metas: readonly StageMeta[],
  tracks: readonly Track[],
  lessons: readonly Lesson[],
  order: readonly string[],
): string[] {
  const p: string[] = [];
  const trackIds = new Set(tracks.map((t) => t.id));
  if (trackIds.size !== tracks.length) p.push("duplicate track id");
  const stageIds = new Set<string>();
  for (const m of metas) {
    if (stageIds.has(m.id)) p.push(`duplicate stage id "${m.id}"`);
    stageIds.add(m.id);
    if (!trackIds.has(m.trackId)) p.push(`${m.id}: unknown trackId "${m.trackId}"`);
  }
  const lessonIds = new Set<string>();
  for (const l of lessons) {
    if (lessonIds.has(l.id)) p.push(`duplicate lesson id "${l.id}"`);
    lessonIds.add(l.id);
    if (!stageIds.has(l.stageId)) p.push(`${l.id}: unknown stageId "${l.stageId}"`);
  }
  const seen = new Set<string>();
  for (const id of order) {
    if (seen.has(id)) p.push(`recommendedOrder: "${id}" appears twice`);
    seen.add(id);
    if (!lessonIds.has(id)) p.push(`recommendedOrder: unknown lesson "${id}"`);
  }
  for (const id of lessonIds) if (!seen.has(id)) p.push(`recommendedOrder: lesson "${id}" is missing`);
  return p;
}
