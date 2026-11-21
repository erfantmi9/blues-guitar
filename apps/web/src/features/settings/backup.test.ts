import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import type { LessonProgress } from "@bg/shared";
import { glossaryProgressKey } from "@/features/glossary/progress";
import { exerciseSettingsKey } from "@/features/practice/exerciseSettings";
import { defineKey } from "@/lib/storage";
import {
  BACKUP_MAX_BYTES,
  backupFileName,
  buildBackup,
  keysToRemove,
  parseBackup,
  type BackupKey,
} from "@/lib/storage/backup";
import { createStore } from "@/lib/storage/store";
import { createLocalStorageAdapter } from "@/lib/storage/localStorageAdapter";
import type { KeyDef, StorageAdapter } from "@/lib/storage/types";
import { isExerciseSettings, isGlossaryProgress, isLessonProgress, summarize } from "./backupSchema";

/** In-memory adapter; optionally throws on the n-th write (to test rollback) */
function memoryAdapter(failOnWrite?: number): StorageAdapter & { map: Map<string, string> } {
  const map = new Map<string, string>();
  let writes = 0;
  return {
    map,
    read: (k) => map.get(k) ?? null,
    write: (k, raw) => {
      writes++;
      if (failOnWrite && writes === failOnWrite) throw new Error("disk full");
      map.set(k, raw);
    },
    remove: (k) => void map.delete(k),
    onExternalChange: () => () => {},
  };
}

const lessonKey = (id: string) => defineKey<LessonProgress>(`lesson-progress:${id}`, { version: 1, fallback: EMPTY });
const EMPTY: LessonProgress = { checkedCriteria: [], completedAt: null, reportDraft: {}, reports: [] };
const L1 = lessonKey("s1-l1");
const L2 = lessonKey("s2-l1");
const as = <T,>(d: KeyDef<T>) => d as KeyDef<unknown>;
const KEYS: BackupKey[] = [
  { def: as(L1), validate: isLessonProgress },
  { def: as(L2), validate: isLessonProgress },
  { def: as(glossaryProgressKey), validate: isGlossaryProgress },
  { def: as(exerciseSettingsKey), validate: isExerciseSettings },
];

const done: LessonProgress = {
  checkedCriteria: ["a"],
  completedAt: "2026-11-01T10:00:00.000Z",
  reportDraft: {},
  reports: [{ id: "r1", createdAt: "2026-11-01T10:00:00.000Z", answers: { q: "خوب بود" }, checkedCriteria: ["a"] }],
};

function seeded() {
  const adapter = memoryAdapter();
  const store = createStore(adapter);
  store.set(L1, done);
  store.set(glossaryProgressKey, { learned: ["fret", "nut"], quizBest: { "0": 4 } });
  store.set(exerciseSettingsKey, { selectedId: null, bpmById: { x: 70 }, sound: false, loop: true, visualOffsetMs: 20 });
  return { adapter, store };
}
const fileText = (o: unknown) => JSON.stringify(o);
const parse = (text: string) => parseBackup(text, text.length, KEYS);

describe("backup round trip", () => {
  it("exports only stored keys, with their schema version, and restores them into an empty browser", () => {
    const { store } = seeded();
    const file = buildBackup(KEYS, store.readRaw, new Date("2026-11-21T08:00:00Z"));
    assert.equal(file.app, "slow-bend");
    assert.equal(file.format, 1);
    assert.equal(file.exportedAt, "2026-11-21T08:00:00.000Z");
    assert.deepEqual(Object.keys(file.data).sort(), ["glossary:progress", "lesson-progress:s1-l1", "practice:exercises"]);
    assert.equal(file.data["practice:exercises"]!.v, 2);

    const parsed = parse(fileText(file));
    assert.ok(parsed.ok);
    const fresh = createStore(memoryAdapter());
    fresh.replace(parsed.entries);
    assert.deepEqual(fresh.get(L1), done);
    assert.deepEqual(fresh.get(glossaryProgressKey), { learned: ["fret", "nut"], quizBest: { "0": 4 } });
    assert.equal(fresh.get(exerciseSettingsKey).visualOffsetMs, 20);
    assert.deepEqual(summarize(parsed.entries), { lessonsDone: 1, reports: 1, termsLearned: 2, settings: 1 });
  });

  it("restore replaces: known keys missing from the file are removed", () => {
    const { store } = seeded();
    store.set(L2, { ...EMPTY, checkedCriteria: ["x"] });
    const only = parse(fileText({ app: "slow-bend", format: 1, exportedAt: "x", data: { "lesson-progress:s1-l1": { v: 1, data: EMPTY } } }));
    assert.ok(only.ok);
    assert.equal(only.exportedAt, null); // invalid date is dropped, not shown
    const removes = keysToRemove(KEYS, only.entries, (k) => store.readRaw(k) !== null);
    assert.deepEqual(removes.map((d) => d.key).sort(), ["glossary:progress", "lesson-progress:s2-l1", "practice:exercises"]);
    store.replace(only.entries, removes);
    assert.deepEqual(store.get(L1), EMPTY);
    assert.equal(store.readRaw("lesson-progress:s2-l1"), null);
    assert.equal(store.readRaw("glossary:progress"), null);
  });

  it("is atomic: if a write fails, every key keeps its previous value", () => {
    const adapter = memoryAdapter(5); // writes 1-3 seed the data, 4 succeeds, 5 throws
    const store = createStore(adapter);
    store.set(L1, done);
    store.set(L2, EMPTY);
    store.set(glossaryProgressKey, { learned: ["fret"], quizBest: {} });
    const before = new Map(adapter.map);
    const parsed = parse(
      fileText({
        app: "slow-bend",
        format: 1,
        data: {
          "lesson-progress:s1-l1": { v: 1, data: EMPTY },
          "lesson-progress:s2-l1": { v: 1, data: done },
          "glossary:progress": { v: 1, data: { learned: [], quizBest: {} } },
        },
      }),
    );
    assert.ok(parsed.ok);
    assert.throws(() => store.replace(parsed.entries), /disk full/);
    assert.deepEqual(adapter.map, before);
    assert.deepEqual(store.get(L1), done);
  });

  it("file name has the date", () => {
    assert.equal(backupFileName(new Date(2026, 10, 21)), "slow-bend-backup-2026-11-21.json");
  });
});

describe("backup validation", () => {
  const ok = (data: Record<string, unknown>) => fileText({ app: "slow-bend", format: 1, exportedAt: "2026-11-21T08:00:00Z", data });

  it("corrupt file → not-json; wrong app or format → rejected", () => {
    assert.deepEqual(parse("{ not json"), { ok: false, error: "not-json" });
    assert.deepEqual(parse(""), { ok: false, error: "not-json" });
    assert.deepEqual(parse("[]"), { ok: false, error: "wrong-app" });
    assert.deepEqual(parse(fileText({ app: "other", format: 1, data: {} })), { ok: false, error: "wrong-app" });
    assert.deepEqual(parse(fileText({ app: "slow-bend", format: 2, data: {} })), { ok: false, error: "newer-format" });
    assert.deepEqual(parse(fileText({ app: "slow-bend", format: "1", data: {} })), { ok: false, error: "wrong-format" });
    assert.deepEqual(parse(fileText({ app: "slow-bend", format: 1, data: [] })), { ok: false, error: "no-data" });
  });

  it("unknown keys reject the entire file", () => {
    const r = parse(ok({ "lesson-progress:s1-l1": { v: 1, data: done }, "evil:key": { v: 1, data: "<img src=x onerror=alert(1)>" }, __proto__x: {} }));
    assert.deepEqual(r, { ok: false, error: "unknown-key" });
    assert.deepEqual(parse(ok({ "evil:key": { v: 1, data: {} } })), { ok: false, error: "unknown-key" });
  });

  it("an empty browser's backup can round trip", () => {
    const result = parse(fileText(buildBackup(KEYS, () => null)));
    assert.ok(result.ok);
    assert.deepEqual(result.entries, []);
  });

  it("a newer schema version is rejected", () => {
    assert.deepEqual(parse(ok({ "lesson-progress:s1-l1": { v: 2, data: done } })), { ok: false, error: "newer-version" });
  });

  it("an older version goes through the key's migrate (practice:exercises v1 → v2)", () => {
    const v1 = { selectedId: "s1-open-strings", bpmById: { a: 60 }, sound: true, loop: false };
    const r = parse(ok({ "practice:exercises": { v: 1, data: v1 } }));
    assert.ok(r.ok);
    assert.deepEqual(r.entries[0]!.value, { ...v1, visualOffsetMs: 0 });
    // An older version with no migrate path is invalid
    assert.deepEqual(parse(ok({ "practice:exercises": { v: 0, data: v1 } })), { ok: false, error: "invalid-data" });
  });

  it("a known key with the wrong shape rejects the whole file", () => {
    assert.deepEqual(parse(ok({ "lesson-progress:s1-l1": { v: 1, data: { ...done, completedAt: 5 } } })), { ok: false, error: "invalid-data" });
    assert.deepEqual(parse(ok({ "glossary:progress": { v: 1, data: { learned: [1], quizBest: {} } } })), { ok: false, error: "invalid-data" });
    assert.deepEqual(parse(ok({ "glossary:progress": { v: 1, data: { learned: [], quizBest: { "0": -1 } } } })), { ok: false, error: "invalid-data" });
    assert.deepEqual(parse(ok({ "lesson-progress:s1-l1": { data: done } })), { ok: false, error: "invalid-data" });
    assert.deepEqual(
      parse(ok({ "lesson-progress:s1-l1": { v: 1, data: done }, "lesson-progress:s2-l1": { v: 1, data: null } })),
      { ok: false, error: "invalid-data" },
    );
  });

  it("a file over 2 MB is rejected before parsing", () => {
    assert.deepEqual(parseBackup("{}", BACKUP_MAX_BYTES + 1, KEYS), { ok: false, error: "too-large" });
    const big = ok({ "lesson-progress:s1-l1": { v: 1, data: { ...done, reportDraft: { q: "x".repeat(BACKUP_MAX_BYTES) } } } });
    assert.deepEqual(parse(big), { ok: false, error: "too-large" });
  });
});

describe("persistent restore", () => {
  it("rolls back real-adapter quota failures without an in-memory success", () => {
    const values = new Map<string, string>();
    let fail = false;
    const fakeStorage = {
      getItem: (key: string) => values.get(key) ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, raw: string) => {
        if (fail && key.endsWith(L2.key)) {
          fail = false;
          throw new Error("quota exceeded");
        }
        values.set(key, raw);
      },
    };
    const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
    Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: fakeStorage, addEventListener() {} } });
    try {
      const store = createStore(createLocalStorageAdapter("test:"));
      store.set(L1, done);
      store.set(L2, EMPTY);
      const before = new Map(values);
      fail = true;
      assert.throws(() => store.replace([{ def: as(L1), value: EMPTY }, { def: as(L2), value: done }]), /quota/);
      assert.deepEqual(values, before);
      assert.deepEqual(store.get(L1), done);
    } finally {
      if (previous) Object.defineProperty(globalThis, "window", previous);
      else Reflect.deleteProperty(globalThis, "window");
    }
  });
});
