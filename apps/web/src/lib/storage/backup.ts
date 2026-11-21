/**
 * Backup file of the learner's progress: build it from stored keys, and read one back with full validation.
 * Pure logic: storage access is passed in, so it is unit-tested. Nothing from the file is ever rendered;
 * the UI shows only counts computed from validated data.
 */
import type { KeyDef } from "./types";

export const BACKUP_APP = "slow-bend";
export const BACKUP_FORMAT = 1;
export const BACKUP_MAX_BYTES = 2 * 1024 * 1024;

export type BackupFile = {
  app: typeof BACKUP_APP;
  format: typeof BACKUP_FORMAT;
  /** ISO date */
  exportedAt: string;
  /** Storage key → its schema version and data */
  data: Record<string, { v: number; data: unknown }>;
};

/** A key that may be backed up, with a shape check for its (current-version) data */
export type BackupKey = { def: KeyDef<unknown>; validate: (data: unknown) => boolean };

export type RestoreEntry = { def: KeyDef<unknown>; value: unknown };

export type BackupError =
  | "too-large"
  | "not-json"
  | "wrong-app"
  | "newer-format"
  | "wrong-format"
  | "no-data"
  | "newer-version"
  | "invalid-data"
  | "unknown-key"
  | "nothing-known";

export type ParsedBackup =
  | { ok: true; entries: RestoreEntry[]; ignoredKeys: number; exportedAt: string | null }
  | { ok: false; error: BackupError };

const isObject = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

/** Every known key that has a readable stored value; corrupt or unreadable values are left out */
export function buildBackup(keys: readonly BackupKey[], readRaw: (key: string) => string | null, now = new Date()): BackupFile {
  const data: BackupFile["data"] = {};
  for (const { def } of keys) {
    const raw = readRaw(def.key);
    if (raw === null) continue;
    try {
      const env: unknown = JSON.parse(raw);
      if (isObject(env) && Number.isInteger(env.v) && "data" in env) data[def.key] = { v: env.v as number, data: env.data };
    } catch {
      /* corrupt value: not exported */
    }
  }
  return { app: BACKUP_APP, format: BACKUP_FORMAT, exportedAt: now.toISOString(), data };
}

/** e.g. slow-bend-backup-2026-11-21.json (local date) */
export function backupFileName(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `slow-bend-backup-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.json`;
}

/**
  * Validates a backup file. Unknown keys reject the whole file. A newer schema version or format is
 * rejected; an older version goes through the key's own migrate. Any invalid known entry rejects the whole file.
 */
export function parseBackup(text: string, byteSize: number, keys: readonly BackupKey[]): ParsedBackup {
  if (byteSize > BACKUP_MAX_BYTES || new TextEncoder().encode(text).byteLength > BACKUP_MAX_BYTES) return { ok: false, error: "too-large" };
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "not-json" };
  }
  if (!isObject(json) || json.app !== BACKUP_APP) return { ok: false, error: "wrong-app" };
  if (typeof json.format === "number" && json.format > BACKUP_FORMAT) return { ok: false, error: "newer-format" };
  if (json.format !== BACKUP_FORMAT) return { ok: false, error: "wrong-format" };
  if (!isObject(json.data)) return { ok: false, error: "no-data" };

  const byKey = new Map(keys.map((k) => [k.def.key, k]));
  const entries: RestoreEntry[] = [];
  let ignoredKeys = 0;
  for (const [key, env] of Object.entries(json.data)) {
    const known = byKey.get(key);
    if (!known) {
      return { ok: false, error: "unknown-key" };
    }
    if (!isObject(env) || !Number.isInteger(env.v) || (env.v as number) < 1 || !("data" in env)) return { ok: false, error: "invalid-data" };
    const v = env.v as number;
    const { def, validate } = known;
    if (v > def.version) return { ok: false, error: "newer-version" };
    let value: unknown;
    try {
      value = v === def.version ? env.data : def.migrate?.(env.data, v);
    } catch {
      return { ok: false, error: "invalid-data" };
    }
    if (value === undefined || !validate(value)) return { ok: false, error: "invalid-data" };
    entries.push({ def, value });
  }
  const exportedAt = typeof json.exportedAt === "string" && !Number.isNaN(Date.parse(json.exportedAt)) ? json.exportedAt : null;
  return { ok: true, entries, ignoredKeys, exportedAt };
}

/** Keys to delete on restore: known keys that exist now but are not in the file (restore replaces everything) */
export function keysToRemove(keys: readonly BackupKey[], entries: readonly RestoreEntry[], exists: (key: string) => boolean): KeyDef<unknown>[] {
  const restored = new Set(entries.map((e) => e.def.key));
  return keys.filter((k) => !restored.has(k.def.key) && exists(k.def.key)).map((k) => k.def);
}
