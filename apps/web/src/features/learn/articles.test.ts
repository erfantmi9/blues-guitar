import { strict as assert } from "node:assert";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Article, ContentBlock } from "@bg/shared";
import { ARTICLE_MAX_SECTIONS, validateArticles } from "@/lib/content/reference";
import { noteAt, STANDARD_TUNING, noteNameFromMidi } from "@/lib/music";

const here = dirname(fileURLToPath(import.meta.url));
const dir = join(here, "content/articles");
const articles: Article[] = await Promise.all(
  readdirSync(dir)
    .filter((f) => f.endsWith(".ts"))
    .map(async (f) => (await import(pathToFileURL(join(dir, f)).href)).default as Article),
);
const byId = new Map(articles.map((a) => [a.id, a]));
const blocks = (a: Article) => a.sections.flatMap((s) => s.blocks);
const plain = (s: string) => s.replace(/`/g, "").trim();

describe("articles", () => {
  it("are valid and have the 4 expected ids", () => {
    assert.deepEqual(validateArticles(articles), []);
    assert.deepEqual([...byId.keys()].sort(), ["beat-and-bar", "how-to-practice", "notes-and-frets", "why-pentatonic"]);
  });

  it(`have at most ${ARTICLE_MAX_SECTIONS} sections`, () => {
    for (const a of articles) assert.ok(a.sections.length <= ARTICLE_MAX_SECTIONS, a.id);
  });

  it("validation rejects too many sections and duplicate ids", () => {
    const a = byId.get("beat-and-bar")!;
    const big: Article = { ...a, sections: [...a.sections, { ...a.sections[0]!, id: "extra" }] };
    assert.match(validateArticles([big]).join("\n"), /must have 1 to 4 sections/);
    assert.match(validateArticles([a, a]).join("\n"), /duplicate article id/);
  });

  it("beat-and-bar has a left-to-right count block", () => {
    const pre = blocks(byId.get("beat-and-bar")!).find((b) => b.type === "pre");
    assert.ok(pre && pre.type === "pre" && pre.text.includes("1 trip let"));
  });
});

describe("notes-and-frets: notes and frets are correct", () => {
  const a = byId.get("notes-and-frets")!;
  const table = blocks(a).find((b): b is Extract<ContentBlock, { type: "table" }> => b.type === "table")!;

  it("string 1 table: every row matches noteAt(1, fret), frets 0 to 12", () => {
    assert.equal(table.rows.length, 13);
    table.rows.forEach(([fretCell, noteCell], i) => {
      const fret = parseInt(fretCell!, 10);
      assert.equal(fret, i);
      assert.equal(plain(noteCell!), noteAt(1, fret), `fret ${fret}`);
    });
  });

  it("fretboard block shows string 1 from open to fret 12 with names, A (fret 5) as root", () => {
    const fb = blocks(a).find((b) => b.type === "fretboard");
    assert.ok(fb && fb.type === "fretboard" && fb.showNoteNames);
    assert.deepEqual(
      fb.highlightedNotes.map((n) => [n.string, n.fret]),
      Array.from({ length: 13 }, (_, f) => [1, f]),
    );
    for (const n of fb.highlightedNotes) if (n.variant === "root") assert.equal(noteAt(n.string, n.fret), "A");
  });

  it("text claims: string 1 frets 1-4 = F F# G G#", () => {
    const text = blocks(a).map((b) => (b.type === "paragraph" ? b.text : "")).join(" ");
    ["F", "F#", "G", "G#"].forEach((name, i) => {
      assert.equal(noteAt(1, i + 1), name);
      assert.ok(text.includes(`فرت ${"۱۲۳۴"[i]} = \`${name}\``), `text mentions fret ${i + 1} = ${name}`);
    });
  });

  it("the 12 notes listed are the chromatic scale, with no sharp between E-F and B-C", () => {
    const first = blocks(a).find((b) => b.type === "paragraph")!;
    const listed = [...(first.type === "paragraph" ? first.text : "").matchAll(/`([A-G]#?)`/g)].map((m) => m[1]);
    // 12 notes from C, then "and again C"
    assert.deepEqual(listed, [...Array.from({ length: 12 }, (_, i) => noteNameFromMidi(60 + i)), "C"]);
    assert.ok(!listed.includes("E#") && !listed.includes("B#"));
  });

  it("fret 5 equals the next open string, except G (fret 4 = open B); fret 12 = open string", () => {
    for (let s = 6; s >= 2; s--) {
      const fret = s === 3 ? 4 : 5;
      assert.equal(noteAt(s, fret), noteAt(s - 1, 0), `string ${s}`);
      assert.equal(STANDARD_TUNING[s - 1]! + fret, STANDARD_TUNING[s - 2], `same pitch, string ${s}`);
    }
    assert.notEqual(noteAt(3, 5), noteAt(2, 0));
    for (let s = 1; s <= 6; s++) assert.equal(noteAt(s, 12), noteAt(s, 0));
  });

  it("A roots: string 6 fret 5, string 1 fret 5, string 4 fret 7", () => {
    assert.equal(noteAt(6, 5), "A");
    assert.equal(noteAt(1, 5), "A");
    assert.equal(noteAt(4, 7), "A");
  });
});

describe("why-pentatonic", () => {
  it("A minor pentatonic notes are A C D E G, and the shape from fret 7 is B", () => {
    const fb = blocks(byId.get("why-pentatonic")!).find((b) => b.type === "fretboard");
    assert.ok(fb && fb.type === "fretboard");
    const names = new Set(fb.highlightedNotes.map((n) => noteAt(n.string, n.fret)));
    assert.deepEqual([...names].sort(), ["A", "C", "D", "E", "G"]);
    // Moved up 2 frets: root on string 6 fret 7
    assert.equal(noteAt(6, 7), "B");
  });
});
