/**
 * Was this error a failed download of a lazy page chunk? Happens with an old tab open after a new deploy
 * (the old file names are gone) or a dropped connection. Pure, unit-tested.
 */
export function isChunkLoadError(err: unknown): boolean {
  const text = err instanceof Error ? `${err.name} ${err.message}` : typeof err === "string" ? err : "";
  return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|ChunkLoadError|Loading (CSS )?chunk [\w-]+ failed|Unable to preload CSS/i.test(
    text,
  );
}
