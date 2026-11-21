import { strict as assert } from "node:assert";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Lesson, LessonProgress, Stage } from "@bg/shared";
import { firstUnfinishedLesson, isNewUser, lessonStarted, lessonsInOrder, routineFromLesson, sumDurations } from "./home";

const EMPTY: LessonProgress = { checkedCriteria: [], completedAt: null, reportDraft: {}, reports: [] };

const lesson = (id: string, stageId: string, session: number, sections: Lesson["sections"] = []): Lesson => ({
  id,
  stageId,
  session,
  title: id,
  goal: "",
  duration: 30,
  sections,
  completion: { criteria: [], minRequired: 0 },
  report: { questions: [] },
});
const stage = (n: number, lessons: Lesson[]): Stage => ({ id: `stage-${n}`, number: n, title: "", goal: "", estimatedSessions: 1, lessons });

// Deliberately out of order: stage 2 listed first, sessions shuffled
const stages: Stage[] = [
  stage(2, [lesson("s2-b", "stage-2", 4), lesson("s2-a", "stage-2", 3)]),
  stage(1, [lesson("s1-b", "stage-1", 2), lesson("s1-a", "stage-1", 1)]),
  stage(3, []),
];

describe("first unfinished lesson", () => {
  it("follows path order: stage number, then session", () => {
    assert.deepEqual(lessonsInOrder(stages).map((l) => l.id), ["s1-a", "s1-b", "s2-a", "s2-b"]);
  });
  it("is the first lesson when nothing is done", () => {
    assert.equal(firstUnfinishedLesson(stages, () => false)?.id, "s1-a");
  });
  it("skips finished lessons, even if a later one was finished first", () => {
    const done = new Set(["s1-a", "s2-a"]);
    assert.equal(firstUnfinishedLesson(stages, (id) => done.has(id))?.id, "s1-b");
  });
  it("is undefined when every available lesson is done (empty stages don't count)", () => {
    assert.equal(firstUnfinishedLesson(stages, () => true), undefined);
  });
});

describe("new user", () => {
  const all = lessonsInOrder(stages);
  const only = (id: string, p: Partial<LessonProgress>) => (lid: string) => (lid === id ? { ...EMPTY, ...p } : EMPTY);

  it("nothing stored → new", () => assert.equal(isNewUser(all, () => EMPTY, 0), true));
  it("a learned glossary term → returning", () => assert.equal(isNewUser(all, () => EMPTY, 1), false));
  it("a ticked criterion → returning", () => assert.equal(isNewUser(all, only("s2-b", { checkedCriteria: ["x"] }), 0), false));
  it("a completed lesson → returning", () => assert.equal(isNewUser(all, only("s1-a", { completedAt: "2026-01-01T00:00:00Z" }), 0), false));
  it("a saved report → returning", () =>
    assert.equal(isNewUser(all, only("s1-a", { reports: [{ id: "r", createdAt: "", answers: {}, checkedCriteria: [] }] }), 0), false));
  it("draft text → returning, but an empty draft does not count", () => {
    assert.equal(isNewUser(all, only("s1-a", { reportDraft: { q: "درد گرفت" } }), 0), false);
    assert.equal(isNewUser(all, only("s1-a", { reportDraft: { q: "  " } }), 0), true);
  });
  it("lessonStarted matches", () => {
    assert.equal(lessonStarted(EMPTY), false);
    assert.equal(lessonStarted({ ...EMPTY, checkedCriteria: ["a"] }), true);
  });
});

describe("routine", () => {
  it("sums durations, as a range when any part is a range", () => {
    assert.equal(sumDurations([5, 8, 7]), 20);
    assert.deepEqual(sumDurations([5, { min: 10, max: 15 }]), { min: 15, max: 20 });
    assert.equal(sumDurations([]), 0);
  });

  it("comes from the real lesson 1 sections, with practice links only", async () => {
    const dir = join(dirname(fileURLToPath(import.meta.url)), "../lessons/content/lessons");
    const lessons: Lesson[] = await Promise.all(
      readdirSync(dir).map(async (f) => (await import(pathToFileURL(join(dir, f)).href)).default as Lesson),
    );
    const s1 = lessons.find((l) => l.id === "s1-l1")!;
    const r = routineFromLesson(s1);
    assert.deepEqual(r.rows.map((x) => x.title), s1.sections.map((s) => s.title));
    assert.deepEqual(r.total, { min: 35, max: 40 });
    assert.equal(r.rows.find((x) => x.id === "single-notes")?.to, "/practice?exercise=s1-string1-frets-1-4");
    assert.equal(r.rows.find((x) => x.id === "tuning")?.to, undefined);
    const s4 = lessons.find((l) => l.id === "s4-l1")!;
    assert.ok(routineFromLesson(s4).rows.some((x) => x.to === "/backing"));
  });
});
