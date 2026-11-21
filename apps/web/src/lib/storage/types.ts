/** Lowest layer: read and write raw strings (localStorage today, other adapters later) */
export interface StorageAdapter {
  read(key: string): string | null;
  write(key: string, raw: string): void;
  remove(key: string): void;
  /** Persistent batch used by imports; must throw on failure rather than fall back to memory. */
  replace?(entries: { key: string; raw: string | null }[]): void;
  /** Changes from outside (e.g. another tab). key=null means "unknown, re-read everything" */
  onExternalChange(listener: (key: string | null) => void): () => void;
}

/** Definition of a key with its schema version */
export type KeyDef<T> = {
  key: string;
  version: number;
  fallback: T;
  /** Convert data from an older version; return undefined to fall back to the default */
  migrate?: (data: unknown, fromVersion: number) => T | undefined;
};

/** What is actually written to storage */
export type Envelope<T> = {
  v: number;
  savedAt: string;
  data: T;
};

export type Updater<T> = T | ((prev: T) => T);
