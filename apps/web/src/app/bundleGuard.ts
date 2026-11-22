/**
 * Build guard: finds modules that ended up in the bundle more than once.
 * Pure (no Node or Vite imports): used by the `no-duplicate-modules` plugin in vite.config.ts
 * and unit-tested in bundle.test.ts.
 *
 * Why: on Windows the same file can get two module ids that differ only in case
 * ("c:/…" and "C:/…"). The bundler treats them as two modules, so React was bundled twice
 * and every hook in the lazy pages failed in production with
 * "Cannot read properties of null (reading 'useSyncExternalStore')".
 */

/** Packages that must exist exactly once (a second React has its own, never-set hook dispatcher) */
export const SINGLETON_PACKAGES = ["react", "react-dom", "scheduler"] as const;

const normalize = (id: string) => id.replace(/\\/g, "/");

/** Ids that point to the same file but differ in letter case (always a bug on a case-insensitive file system) */
export function caseDuplicates(ids: readonly string[]): string[][] {
  const groups = new Map<string, Set<string>>();
  for (const raw of ids) {
    if (raw.startsWith("\0")) continue; // virtual modules
    const id = normalize(raw);
    const key = id.toLowerCase();
    if (!groups.has(key)) groups.set(key, new Set());
    groups.get(key)!.add(id);
  }
  return [...groups.values()].filter((g) => g.size > 1).map((g) => [...g].sort());
}

/** Directory of a package's copy, e.g. ".../node_modules/react", for an id inside that package */
function packageDir(id: string, pkg: string): string | undefined {
  const m = normalize(id).match(new RegExp(`^(.*/node_modules/${pkg.replace("/", "\\/")})/`));
  return m?.[1];
}

/** Singleton packages bundled from more than one copy (different paths, e.g. a nested node_modules or a different case) */
export function packageCopies(ids: readonly string[], packages: readonly string[] = SINGLETON_PACKAGES): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const pkg of packages) {
    const dirs = new Set(ids.flatMap((id) => packageDir(id, pkg) ?? []));
    if (dirs.size > 1) result[pkg] = [...dirs].sort();
  }
  return result;
}

/** Human-readable problems; empty = the bundle is fine */
export function duplicateModuleProblems(ids: readonly string[]): string[] {
  const problems = caseDuplicates(ids).map((g) => `same file under ids differing only in case: ${g.join("  |  ")}`);
  for (const [pkg, dirs] of Object.entries(packageCopies(ids))) problems.push(`"${pkg}" bundled ${dirs.length} times: ${dirs.join("  |  ")}`);
  return problems;
}
