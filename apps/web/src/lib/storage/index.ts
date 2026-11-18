import { useCallback, useSyncExternalStore } from "react";
import { createLocalStorageAdapter } from "./localStorageAdapter";
import { createStore } from "./store";
import type { KeyDef, Updater } from "./types";

export type { KeyDef, Updater } from "./types";

/** The app's single storage instance */
export const storage = createStore(createLocalStorageAdapter("bg:"));

export function defineKey<T>(key: string, opts: Omit<KeyDef<T>, "key">): KeyDef<T> {
  return { key, ...opts };
}

/** Reads and writes one key; re-renders on changes (including from other tabs) */
export function useStoredValue<T>(def: KeyDef<T>): [T, (u: Updater<T>) => void] {
  const value = useSyncExternalStore(
    storage.subscribe,
    () => storage.get(def),
    () => def.fallback,
  );
  const set = useCallback((u: Updater<T>) => storage.set(def, u), [def]);
  return [value, set];
}

/** For views that read several keys: re-renders on any change */
export function useStorageRevision(): number {
  return useSyncExternalStore(storage.subscribe, storage.getRevision, storage.getRevision);
}
