import type { StorageAdapter } from "./types";

/**
 * localStorage adapter. If localStorage is unavailable or a write fails
 * (private mode, blocked, full), that key's value is kept in memory and takes
 * priority on read. So the app keeps working, just without persistence.
 */
export function createLocalStorageAdapter(prefix: string): StorageAdapter {
  /** Only keys whose localStorage write failed */
  const unsaved = new Map<string, string | null>();
  const full = (key: string) => prefix + key;

  const ls = (): Storage | null => {
    try {
      return typeof window !== "undefined" ? window.localStorage : null;
    } catch {
      return null;
    }
  };

  return {
    read(key) {
      if (unsaved.has(key)) return unsaved.get(key) ?? null;
      try {
        return ls()?.getItem(full(key)) ?? null;
      } catch (err) {
        console.warn("[storage] read failed", key, err);
        return null;
      }
    },

    write(key, raw) {
      try {
        const s = ls();
        if (!s) throw new Error("localStorage unavailable");
        s.setItem(full(key), raw);
        unsaved.delete(key);
      } catch (err) {
        unsaved.set(key, raw);
        console.warn("[storage] write failed (kept in memory)", key, err);
      }
    },

    remove(key) {
      try {
        ls()?.removeItem(full(key));
        unsaved.delete(key);
      } catch (err) {
        unsaved.set(key, null);
        console.warn("[storage] remove failed", key, err);
      }
    },

    replace(entries) {
      const s = ls();
      if (!s) throw new Error("localStorage unavailable");
      const before = new Map(entries.map(({ key }) => [key, s.getItem(full(key))]));
      try {
        // Free replaced values first so a full store can still accept a smaller backup.
        for (const { key } of entries) s.removeItem(full(key));
        for (const { key, raw } of entries) if (raw !== null) s.setItem(full(key), raw);
      } catch (error) {
        // Remove partial writes before restoring, reclaiming the original quota.
        for (const { key } of entries) s.removeItem(full(key));
        for (const [key, raw] of before) if (raw !== null) s.setItem(full(key), raw);
        throw error;
      }
      for (const { key } of entries) unsaved.delete(key);
    },

    onExternalChange(listener) {
      if (typeof window === "undefined") return () => {};
      const handler = (e: StorageEvent) => {
        if (e.key === null) {
          unsaved.clear();
          return listener(null);
        }
        if (e.key.startsWith(prefix)) {
          const key = e.key.slice(prefix.length);
          unsaved.delete(key); // another tab's value is newer
          listener(key);
        }
      };
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    },
  };
}
