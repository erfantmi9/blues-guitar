import { strict as assert } from "node:assert";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Lesson, LessonProgress } from "@bg/shared";
import { isNewUser, lessonStarted, lessonsInRecommendedOrder, nextRecommendedLesson, routineFromLesson, sumDurations } from "./home";

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
// Lessons as the registry might list them (file order), deliberately not in the recommended order
const lessons: Lesson[] = [lesson("s3-a", "stage-3", 3), lesson("s1-a", "stage-1", 1), lesson("c1-a", "chords-1", 5), lesson("s2-a", "stage-2", 2)];
const order = ["s1-a", "s3-a", "c1-a", "s2-a"];
const ids = (ls: Lesson[]) => ls.map((l) => l.id);

describe("next recommended lesson", () => {
  it("follows the recommended order, not file, stage or session order", () => {
    assert.deepEqual(ids(lessonsInRecommendedOrder(order, lessons)), ["s1-a", "s3-a", "c1-a", "s2-a"]);
  });
  it("nothing finished → the first lesson in the order", () => {
    assert.equal(nextRecommendedLesson(order, lessons, () => false)?.id, "s1-a");
  });
  it("middle of the order: skips finished lessons, even when a later one was finished first", () => {
    const done = new Set(["s1-a", "c1-a"]);
    assert.equal(nextRecommendedLesson(order, lessons, (id) => done.has(id))?.id, "s3-a");
  });
  it("everything finished → undefined", () => {
    assert.equal(nextRecommendedLesson(order, lessons, () => true), undefined);
  });
  it("a lesson not in the order comes after the ordered ones; unknown and repeated ids are ignored", () => {
    const partial = ["ghost", "s2-a", "s1-a", "s2-a"];
    assert.deepEqual(ids(lessonsInRecommendedOrder(partial, lessons)), ["s2-a", "s1-a", "s3-a", "c1-a"]);
    const done = new Set(["s2-a", "s1-a"]);
    assert.equal(nextRecommendedLesson(partial, lessons, (id) => done.has(id))?.id, "s3-a");
    assert.equal(nextRecommendedLesson([], lessons, () => false)?.id, "s3-a");
  });
});

describe("new user", () => {
  const all = lessons;
  const only = (id: string, p: Partial<LessonProgress>) => (lid: string) => (lid === id ? { ...EMPTY, ...p } : EMPTY);

  it("nothing stored → new", () => assert.equal(isNewUser(all, () => EMPTY, 0), true));
  it("a learned glossary term → returning", () => assert.equal(isNewUser(all, () => EMPTY, 1), false));
  it("a ticked criterion → returning", () => assert.equal(isNewUser(all, only("s2-a", { checkedCriteria: ["x"] }), 0), false));
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
