import type { Envelope, KeyDef, StorageAdapter, Updater } from "./types";

type Listener = (key: string | null) => void;

/**
 * Storage with schema versioning, parse caching and change notifications.
 * Components never touch localStorage directly; they use this API or the useStoredValue hook.
 * To add sync later, wrap set() or swap the adapter.
 */
export function createStore(adapter: StorageAdapter) {
  // Cache keyed by key name plus the definition object, since two definitions
  // (different version/migrate) can decode the same key differently.
  const cache = new Map<string, WeakMap<KeyDef<unknown>, { raw: string | null; value: unknown }>>();
  const listeners = new Set<Listener>();
  let revision = 0;

  const emit = (key: string | null) => {
    revision++;
    listeners.forEach((l) => l(key));
  };

  adapter.onExternalChange((key) => {
    if (key === null) cache.clear();
    else cache.delete(key);
    emit(key);
  });

  function decode<T>(def: KeyDef<T>, raw: string | null): T {
    if (raw == null) return def.fallback;
    try {
      const env = JSON.parse(raw) as Partial<Envelope<unknown>>;
      if (typeof env !== "object" || env === null || !("data" in env)) return def.fallback;
      if (env.v === def.version) return env.data as T;
      if (def.migrate && typeof env.v === "number") return def.migrate(env.data, env.v) ?? def.fallback;
      return def.fallback;
    } catch (err) {
      console.warn("[storage] corrupt value, using fallback", def.key, err);
      return def.fallback;
    }
  }

  function get<T>(def: KeyDef<T>): T {
    const raw = adapter.read(def.key);
    const byDef = cache.get(def.key) ?? new WeakMap();
    cache.set(def.key, byDef);
    const hit = byDef.get(def as KeyDef<unknown>);
    // Same raw → same object (stable reference for React)
    if (hit && hit.raw === raw) return hit.value as T;
    const value = decode(def, raw);
    byDef.set(def as KeyDef<unknown>, { raw, value });
    return value;
  }

  function set<T>(def: KeyDef<T>, updater: Updater<T>): void {
    const prev = get(def);
    const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
    if (Object.is(next, prev)) return;
    let raw: string;
    try {
      raw = JSON.stringify({ v: def.version, savedAt: new Date().toISOString(), data: next } satisfies Envelope<T>);
    } catch (err) {
      console.error("[storage] could not serialize", def.key, err);
      return;
    }
    adapter.write(def.key, raw);
    const byDef = new WeakMap<KeyDef<unknown>, { raw: string | null; value: unknown }>();
    byDef.set(def as KeyDef<unknown>, { raw, value: next });
    cache.set(def.key, byDef);
    emit(def.key);
  }

  function remove<T>(def: KeyDef<T>): void {
    adapter.remove(def.key);
    cache.delete(def.key);
    emit(def.key);
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  return {
    get,
    set,
    remove,
    subscribe,
    /** Increments on every change; useful for views that read several keys */
    getRevision: () => revision,
  };
}

export type Store = ReturnType<typeof createStore>;
