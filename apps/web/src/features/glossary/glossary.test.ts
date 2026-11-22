import { strict as assert } from "node:assert";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { GlossaryLevel, GlossaryTerm, Lesson, QuizQuestion } from "@bg/shared";
import {
  findPrerequisiteCycles,
  firstUnlearned,
  inTeachingOrder,
  isLevelDone,
  normalizeForSearch,
  shuffledIndices,
  termMatches,
  validateGlossary,
  type GlossaryContent,
} from "@/lib/content/reference";
import { noteAt } from "@/lib/music";

// Same files the registry loads with import.meta.glob (which only exists in Vite)
const here = dirname(fileURLToPath(import.meta.url));
const contentDir = join(here, "content/glossary");
async function loadFiles<T>(dir: string, match: (f: string) => boolean): Promise<T[]> {
  const files = readdirSync(dir).filter((f) => f.endsWith(".ts") && match(f));
  return Promise.all(files.map(async (f) => (await import(pathToFileURL(join(dir, f)).href)).default as T));
}

const levels = (await loadFiles<GlossaryLevel[]>(contentDir, (f) => f === "levels.ts")).flat();
const terms = inTeachingOrder((await loadFiles<GlossaryTerm[]>(contentDir, (f) => f.startsWith("terms-"))).flat());
const quiz = inTeachingOrder((await loadFiles<QuizQuestion[]>(contentDir, (f) => f.startsWith("quiz-"))).flat());
const lessons = await loadFiles<Lesson>(join(here, "../lessons/content/lessons"), () => true);
const lessonIds = new Set(lessons.map((l) => l.id));
const byId = new Map(terms.map((t) => [t.id, t]));
const content: GlossaryContent = { levels, terms, quiz };

describe("glossary content", () => {
  it("only holds levels, terms-* and quiz-* files (the glob would pick up anything else)", () => {
    const extra = readdirSync(contentDir).filter((f) => !/^(levels|terms-l\d+|quiz-l\d+)\.ts$/.test(f));
    assert.deepEqual(extra, []);
  });

  it("loads all levels without errors", () => {
    assert.deepEqual(validateGlossary(content, lessonIds), []);
    assert.deepEqual(
      levels.map((l) => [l.id, l.available]),
      [[0, true], [1, true], [2, true], [3, false], [4, false], [5, false], [6, false], [7, false]],
    );
  });

  it("has the given number of terms per level, in teaching order (not alphabetical)", () => {
    const count = (level: number) => terms.filter((t) => t.level === level).length;
    assert.deepEqual([count(0), count(1), count(2)], [31, 18, 11]);
    assert.deepEqual(
      terms.filter((t) => t.level === 0).slice(0, 4).map((t) => t.id),
      ["electric-guitar", "body", "neck", "headstock"],
    );
    assert.equal(terms[terms.length - 1]!.id, "octave");
    assert.equal(terms.filter((t) => t.level >= 3).length, 0);
  });

  it("every question has an explanation", () => {
    for (const q of quiz) assert.ok(q.explanation.trim(), q.id);
  });

  it("has 5 questions for each available level, none for the others", () => {
    for (const l of levels) assert.equal(quiz.filter((q) => q.level === l.id).length, l.available ? 5 : 0, `level ${l.id}`);
  });

  it("spot-checks exact text and meetAt", () => {
    assert.equal(byId.get("nut")?.fa, "شیطانک");
    assert.equal(byId.get("upstroke")?.meetAt?.lessonId, "s2-l1");
    assert.equal(byId.get("gauge")?.meetAt?.stage, 5);
    assert.equal(byId.get("truss-rod")?.meetAt?.note, "هنگام تنظیم ساز");
    assert.equal(byId.get("body")?.meetAt, undefined);
    assert.deepEqual(byId.get("amp-input")?.prerequisites, ["amp", "cable"]);
  });
});

describe("fretboards name the notes the spec says (via noteAt)", () => {
  const names = (id: string) => byId.get(id)!.fretboard!.notes.map((n) => noteAt(n.string, n.fret));
  const heard = (id: string) => byId.get(id)!.audio!.map((n) => noteAt(n.string, n.fret));

  it("open strings 1 to 6", () => {
    assert.deepEqual(names("open-string"), ["E", "B", "G", "D", "A", "E"]);
    assert.deepEqual(names("string-names"), ["E", "B", "G", "D", "A", "E"]);
    assert.deepEqual(heard("open-string"), ["E", "A", "D", "G", "B", "E"]); // played 6 → 1
  });
  it("string 1 fret 1 = F, fret 2 = F#", () => {
    assert.deepEqual(names("sharp"), ["F", "F#"]);
    assert.deepEqual(heard("sharp"), ["F", "F#"]);
  });
  it("semitone and whole tone from E", () => {
    assert.deepEqual(names("semitone"), ["E", "F"]);
    assert.deepEqual(names("whole-tone"), ["E", "F#"]);
  });
  it("E–F and B–C: string 2 fret 1 = C", () => {
    assert.deepEqual(names("no-sharp-pairs"), ["E", "F", "B", "C"]);
    assert.deepEqual(heard("no-sharp-pairs"), ["E", "F", "B", "C"]);
  });
  it("chromatic scale on string 1, frets 0 to 12", () => {
    assert.deepEqual(names("chromatic-scale"), ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E"]);
  });
  it("octave: string 5 frets 0 and 12 are both A", () => {
    assert.deepEqual(names("octave"), ["A", "A"]);
  });
  it("fret: string 1 frets 1 to 4; fret-marker: empty neck", () => {
    assert.deepEqual(names("fret"), ["F", "F#", "G", "G#"]);
    assert.deepEqual(names("fret-marker"), []);
  });
  it("string and pitch: low E, then high E", () => {
    assert.deepEqual(byId.get("string")!.audio, [{ string: 6, fret: 0 }, { string: 1, fret: 0 }]);
    assert.deepEqual(byId.get("pitch")!.audio, byId.get("string")!.audio);
  });
});

describe("validation catches mistakes", () => {
  const lv: GlossaryLevel[] = [
    { id: 0, title: "a", summary: "a", available: true },
    { id: 1, title: "b", summary: "b", available: false },
  ];
  const a: GlossaryTerm = { id: "a", level: 0, term: "A", fa: "آ", definition: "x", related: ["b"] };
  const b: GlossaryTerm = { id: "b", level: 0, term: "B", fa: "ب", definition: "y", related: ["a"], prerequisites: ["a"] };
  const q: QuizQuestion = { id: "q", level: 0, prompt: "?", options: ["1", "2"], correctIndex: 0, explanation: "x" };
  const check = (c: Partial<GlossaryContent>) =>
    validateGlossary({ levels: lv, terms: [a, b], quiz: [q], ...c }, lessonIds).join("\n");

  it("valid base", () => assert.equal(check({}), ""));
  it("duplicate term id", () => assert.match(check({ terms: [a, b, { ...a, related: [] }] }), /duplicate id "a"/));
  it("duplicate level id", () => assert.match(check({ levels: [...lv, lv[0]!] }), /duplicate level id 0/));
  it("duplicate quiz id", () => assert.match(check({ quiz: [q, q] }), /duplicate quiz id "q"/));
  it("unknown prerequisite", () => assert.match(check({ terms: [a, { ...b, prerequisites: ["zzz"] }] }), /unknown prerequisite "zzz"/));
  it("prerequisite taught later", () =>
    assert.match(check({ terms: [{ ...a, prerequisites: ["b"] }, { ...b, prerequisites: [] }] }), /prerequisite "b" comes later/));
  it("prerequisite cycle", () => {
    const cyc = [
      { ...a, prerequisites: ["b"] },
      { ...b, prerequisites: ["a"] },
    ];
    assert.match(check({ terms: cyc }), /prerequisite cycle: (a → b → a|b → a → b)/);
    assert.equal(findPrerequisiteCycles([a, b]).length, 0);
  });
  it("self prerequisite", () => assert.match(check({ terms: [{ ...a, prerequisites: ["a"] }, b] }), /prerequisite of itself/));
  it("unknown related id", () => assert.match(check({ terms: [{ ...a, related: ["zzz"] }, b] }), /unknown related id "zzz"/));
  it("one-way relation", () => assert.match(check({ terms: [a, { ...b, related: [] }] }), /a → b: relation is not mutual/));
  it("unknown lessonId in meetAt", () =>
    assert.match(check({ terms: [{ ...a, meetAt: { lessonId: "s9-l9" } }, b] }), /unknown meetAt.lessonId "s9-l9"/));
  it("term in an unavailable or unknown level", () => {
    assert.match(check({ terms: [{ ...a, level: 1 }, b] }), /level 1 is not available/);
    assert.match(check({ terms: [{ ...a, level: 7 }, b] }), /unknown level 7/);
  });
  it("missing or empty explanation", () => {
    assert.match(check({ quiz: [{ ...q, explanation: "  " }] }), /q: explanation is required/);
    const { explanation: _omit, ...noExplanation } = q;
    assert.match(check({ quiz: [noExplanation as QuizQuestion] }), /q: explanation is required/);
  });
  it("correctIndex out of range", () => {
    assert.match(check({ quiz: [{ ...q, correctIndex: 2 }] }), /correctIndex 2 is not a valid option/);
    assert.match(check({ quiz: [{ ...q, correctIndex: -1 }] }), /correctIndex -1/);
    assert.match(check({ quiz: [{ ...q, correctIndex: 0.5 }] }), /correctIndex 0.5/);
  });
});

describe("progress", () => {
  const level0 = terms.filter((t) => t.level === 0).map((t) => t.id);
  it("continue goes to the first unlearned term in teaching order", () => {
    assert.equal(firstUnlearned(terms, [])?.id, "electric-guitar");
    assert.equal(firstUnlearned(terms, ["electric-guitar", "neck"])?.id, "body");
    assert.equal(firstUnlearned(terms, level0)?.id, "string-numbers");
    assert.equal(firstUnlearned(terms, terms.map((t) => t.id)), undefined);
  });
  it("a level is done only with all terms learned and a quiz score of 4 or more", () => {
    assert.equal(isLevelDone(0, terms, { learned: level0, quizBest: { "0": 4 } }), true);
    assert.equal(isLevelDone(0, terms, { learned: level0, quizBest: { "0": 3 } }), false);
    assert.equal(isLevelDone(0, terms, { learned: level0.slice(1), quizBest: { "0": 5 } }), false);
    assert.equal(isLevelDone(3, terms, { learned: [], quizBest: { "3": 5 } }), false); // no terms yet
  });
});

describe("search and shuffle", () => {
  const find = (s: string) => terms.filter((t) => termMatches(t, s)).map((t) => t.id);
  it("finds by English, case-insensitive", () => {
    assert.ok(find("FRET").includes("fret"));
    assert.ok(find("pickup").includes("pickup-selector"));
  });
  it("finds by Persian, ignoring zero-width non-joiner and Arabic letters", () => {
    assert.ok(find("نیم‌پرده").includes("semitone"));
    assert.ok(find("نیمپرده").includes("semitone"));
    assert.ok(find("پيك").includes("pick")); // Arabic ي and ک
    assert.ok(find("شیطانک").includes("nut"));
  });
  it("normalizes backticks", () => assert.equal(normalizeForSearch("`E–F` و `B–C`"), "e–f و b–c"));
  it("shuffledIndices is a permutation", () => {
    for (let i = 0; i < 20; i++) assert.deepEqual([...shuffledIndices(4)].sort(), [0, 1, 2, 3]);
    assert.deepEqual(shuffledIndices(3, () => 0), [1, 2, 0]);
  });
});
