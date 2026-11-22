import { strict as assert } from "node:assert";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Lesson } from "@bg/shared";
import { recommendedOrder } from "./content/order";
import { stageMetas } from "./content/stages";
import { tracks } from "./content/tracks";
import { buildStages, stagesOfTrack, trackProgress, validateStructure } from "./structure";

// Same files import.meta.glob registers (content/lessons/*.ts)
const dir = join(dirname(fileURLToPath(import.meta.url)), "content/lessons");
const lessons: Lesson[] = await Promise.all(
  readdirSync(dir)
    .filter((f) => f.endsWith(".ts"))
    .map(async (f) => (await import(pathToFileURL(join(dir, f)).href)).default as Lesson),
);
const lessonIds = new Set(lessons.map((l) => l.id));
const stages = buildStages(stageMetas, tracks, lessons);
const titles = (trackId: "foundation" | "solo" | "chords") => stagesOfTrack(stages, trackId).map((s) => s.title);

describe("recommended order", () => {
  it("every id is a registered lesson", () => {
    for (const id of recommendedOrder) assert.ok(lessonIds.has(id), `unknown lesson "${id}"`);
  });
  it("has no duplicates", () => {
    assert.equal(new Set(recommendedOrder).size, recommendedOrder.length);
  });
  it("lists every registered lesson (add a new lesson to content/order.ts)", () => {
    for (const id of lessonIds) assert.ok(recommendedOrder.includes(id), `lesson "${id}" is missing from recommendedOrder`);
  });
  it("is currently s1-l1, s2-l1, s3-l1, s4-l1", () => {
    assert.deepEqual(recommendedOrder, ["s1-l1", "s2-l1", "s3-l1", "s4-l1"]);
  });
});

describe("tracks and stages", () => {
  it("the real content has no structure problems", () => {
    assert.deepEqual(validateStructure(stageMetas, tracks, lessons, recommendedOrder), []);
  });

  it("validation catches mistakes", () => {
    const l = lessons[0]!;
    const p = validateStructure(
      [...stageMetas, { ...stageMetas[0]!, trackId: "x" as never }],
      tracks,
      [...lessons, { ...l, id: "orphan", stageId: "nope" }],
      [...recommendedOrder, "s1-l1", "ghost"],
    ).join("\n");
    assert.match(p, /duplicate stage id "stage-1"/);
    assert.match(p, /unknown trackId "x"/);
    assert.match(p, /orphan: unknown stageId "nope"/);
    assert.match(p, /"s1-l1" appears twice/);
    assert.match(p, /unknown lesson "ghost"/);
    assert.match(p, /lesson "orphan" is missing/);
  });

  it("keeps the existing stage ids (saved progress and anchors depend on them)", () => {
    assert.deepEqual(stagesOfTrack(stages, "foundation").slice(0, 2).map((s) => s.id), ["stage-1", "stage-2"]);
    assert.deepEqual(stagesOfTrack(stages, "solo").map((s) => s.id), [3, 4, 5, 6, 7, 8, 9].map((n) => `stage-${n}`));
  });

  it("has the requested stages, in order, numbered within each track", () => {
    assert.deepEqual(tracks.map((t) => [t.id, t.title]), [["foundation", "پایه"], ["solo", "سولو"], ["chords", "آکورد و ریتم"]]);
    assert.deepEqual(titles("foundation").slice(2), ["نت‌های سیم‌ها تا فرت ۵", "پیک", "زمان‌بندی نت‌ها"]);
    assert.deepEqual(titles("chords"), [
      "آکوردهای باز",
      "استرام ساده",
      "آکوردهای بلوز (`A7 D7 E7`)",
      "شافل با آکورد و بلوز ۱۲ میزانی",
      "پاور کورد و پالم‌میوت",
      "آکوردهای بارره",
      "ریتم‌های بلوز (۱۲/۸ و بوگی)",
      "ریتم‌های پیشرفته (۱۶ام و سنکوپ)",
      "آکوردهای پیشرفته (۹، `sus`، ترن‌اراند)",
    ]);
    for (const t of tracks) assert.deepEqual(stagesOfTrack(stages, t.id).map((s) => s.position), stagesOfTrack(stages, t.id).map((_, i) => i + 1));
    const newIds = ["foundation-notes", "foundation-pick", "foundation-timing", ...stagesOfTrack(stages, "chords").map((s) => s.id)];
    for (const id of newIds) assert.equal(stages.find((s) => s.id === id)?.lessons.length, 0, `${id} should be coming soon`);
  });

  it("track progress counts finished lessons out of existing ones", () => {
    const done = new Set(["s1-l1"]);
    assert.deepEqual(trackProgress(stages, "foundation", (id) => done.has(id)), { done: 1, total: 2 });
    assert.deepEqual(trackProgress(stages, "solo", (id) => done.has(id)), { done: 0, total: 2 });
    assert.deepEqual(trackProgress(stages, "chords", () => true), { done: 0, total: 0 });
  });
});
