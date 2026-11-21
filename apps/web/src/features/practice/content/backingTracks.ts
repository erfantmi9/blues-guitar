import type { BackingTrack } from "@bg/shared";
import { validateBackingTrack } from "@/lib/audio/backing";

/**
 * Backing track registry.
 * To add a track: create a file in backing/ with `export default track`.
 * It is picked up automatically; no extra registration line needed.
 */
const modules = import.meta.glob<{ default: BackingTrack }>("./backing/*.ts", { eager: true });

export type BackingTrackProblem = { file: string; id: string; problems: string[] };

const problems: BackingTrackProblem[] = [];
const seen = new Set<string>();
const valid: BackingTrack[] = [];

for (const [file, mod] of Object.entries(modules)) {
  const t = mod.default;
  const list = t ? validateBackingTrack(t) : ["file has no default export"];
  if (t && seen.has(t.id)) list.push(`duplicate id "${t.id}"`);
  if (list.length) {
    problems.push({ file, id: t?.id ?? "?", problems: list });
    continue; // invalid tracks are not shown
  }
  seen.add(t.id);
  valid.push(t);
}

if (problems.length) {
  console.error(
    "[backing] invalid content:\n" +
      problems.map((p) => `  ${p.file} (${p.id}):\n    - ${p.problems.join("\n    - ")}`).join("\n"),
  );
}

export const backingTracks: BackingTrack[] = valid.sort((a, b) => a.id.localeCompare(b.id));

/** Content errors; shown in the UI only in development */
export const backingTrackProblems: readonly BackingTrackProblem[] = problems;

const byId = new Map(backingTracks.map((t) => [t.id, t]));
export const getBackingTrack = (id: string | null | undefined) => (id ? byId.get(id) : undefined);
