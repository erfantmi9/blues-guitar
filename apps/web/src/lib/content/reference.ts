/**
 * Validation and search for glossary terms and articles. Pure logic: no React, DOM or import.meta,
 * so it runs in unit tests as well as in the content registries.
 */
import type { Article, ContentBlock, GlossaryLevel, GlossaryTerm, QuizQuestion } from "@bg/shared";

export const ARTICLE_MAX_SECTIONS = 4;

export type GlossaryContent = {
  levels: readonly GlossaryLevel[];
  /** In teaching order: level by level, file order within a level */
  terms: readonly GlossaryTerm[];
  quiz: readonly QuizQuestion[];
};

/**
 * Problems in the glossary path; empty = valid. lessonIds = ids of all registered lessons.
 * Checks: unique ids; levels exist and are open; prerequisites and related exist, are not the term itself,
 * have no cycle and (prerequisites) come earlier in the teaching order; related links are mutual;
 * meetAt.lessonId is a lesson; meetAt.stage is 1 to 9; quiz correctIndex is a valid option.
 */
export function validateGlossary({ levels, terms, quiz }: GlossaryContent, lessonIds: ReadonlySet<string>): string[] {
  const p: string[] = [];
  const levelById = new Map<number, GlossaryLevel>();
  for (const l of levels) {
    if (levelById.has(l.id)) p.push(`duplicate level id ${l.id}`);
    levelById.set(l.id, l);
  }

  const ids = new Set<string>();
  const position = new Map<string, number>();
  terms.forEach((t, i) => {
    if (!t.id) p.push(`"${t.term}": id is empty`);
    else if (ids.has(t.id)) p.push(`duplicate id "${t.id}"`);
    ids.add(t.id);
    if (!position.has(t.id)) position.set(t.id, i);
    if (!t.term || !t.fa || !t.definition) p.push(`${t.id}: term, fa and definition are required`);
    const level = levelById.get(t.level);
    if (!level) p.push(`${t.id}: unknown level ${t.level}`);
    else if (!level.available) p.push(`${t.id}: level ${t.level} is not available`);
    const m = t.meetAt;
    if (m?.lessonId !== undefined && !lessonIds.has(m.lessonId)) p.push(`${t.id}: unknown meetAt.lessonId "${m.lessonId}"`);
    if (m?.stage !== undefined && !(Number.isInteger(m.stage) && m.stage >= 1 && m.stage <= 9))
      p.push(`${t.id}: meetAt.stage must be 1 to 9 (${m.stage})`);
    for (const n of t.fretboard?.notes ?? [])
      if (n.string < 1 || n.string > 6 || n.fret < 0 || n.fret > 12) p.push(`${t.id}: fretboard note out of range (string ${n.string}, fret ${n.fret})`);
    for (const n of t.audio ?? [])
      if (n.string < 1 || n.string > 6 || n.fret < 0 || n.fret > 24) p.push(`${t.id}: audio note out of range (string ${n.string}, fret ${n.fret})`);
  });

  const byId = new Map(terms.map((t) => [t.id, t]));
  for (const t of terms) {
    for (const r of t.prerequisites ?? []) {
      if (r === t.id) p.push(`${t.id}: prerequisite of itself`);
      else if (!byId.has(r)) p.push(`${t.id}: unknown prerequisite "${r}"`);
      // "Know these first" only makes sense if they were taught before
      else if (position.get(r)! > position.get(t.id)!) p.push(`${t.id}: prerequisite "${r}" comes later in the teaching order`);
    }
    for (const r of t.related ?? []) {
      if (r === t.id) p.push(`${t.id}: related to itself`);
      else if (!byId.has(r)) p.push(`${t.id}: unknown related id "${r}"`);
      // Links go both ways, so a term reached from another can lead back
      else if (!byId.get(r)!.related?.includes(t.id)) p.push(`${t.id} → ${r}: relation is not mutual`);
    }
  }
  for (const cycle of findPrerequisiteCycles(terms)) p.push(`prerequisite cycle: ${cycle.join(" → ")}`);

  const quizIds = new Set<string>();
  for (const q of quiz) {
    if (quizIds.has(q.id)) p.push(`duplicate quiz id "${q.id}"`);
    quizIds.add(q.id);
    if (!levelById.has(q.level)) p.push(`${q.id}: unknown level ${q.level}`);
    if (q.options.length < 2) p.push(`${q.id}: needs at least 2 options`);
    if (!q.prompt?.trim()) p.push(`${q.id}: prompt is empty`);
    if (!q.explanation?.trim()) p.push(`${q.id}: explanation is required`);
    if (new Set(q.options).size !== q.options.length) p.push(`${q.id}: duplicate option`);
    if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length)
      p.push(`${q.id}: correctIndex ${q.correctIndex} is not a valid option`);
  }
  return p;
}

/** Prerequisite cycles (each as a list of ids, first = last); unknown ids are ignored */
export function findPrerequisiteCycles(terms: readonly GlossaryTerm[]): string[][] {
  const byId = new Map(terms.map((t) => [t.id, t]));
  const state = new Map<string, "visiting" | "done">();
  const cycles: string[][] = [];
  const stack: string[] = [];
  const visit = (id: string) => {
    const s = state.get(id);
    if (s === "done") return;
    if (s === "visiting") {
      cycles.push([...stack.slice(stack.indexOf(id)), id]);
      return;
    }
    state.set(id, "visiting");
    stack.push(id);
    for (const r of byId.get(id)?.prerequisites ?? []) if (byId.has(r)) visit(r);
    stack.pop();
    state.set(id, "done");
  };
  for (const t of terms) visit(t.id);
  return cycles;
}

// ---------- Progress ----------

export type GlossaryProgress = {
  learned: string[];
  /** Best quiz score per level id (as a string key) */
  quizBest: Record<string, number>;
};

/** A level shows as finished when every term is learned and the best quiz score is at least this */
export const QUIZ_PASS = 4;

export function isLevelDone(levelId: number, terms: readonly GlossaryTerm[], progress: GlossaryProgress): boolean {
  const own = terms.filter((t) => t.level === levelId);
  if (own.length === 0) return false;
  const learned = new Set(progress.learned);
  return own.every((t) => learned.has(t.id)) && (progress.quizBest[String(levelId)] ?? 0) >= QUIZ_PASS;
}

/** First term not yet learned, in teaching order */
export function firstUnlearned(terms: readonly GlossaryTerm[], learned: readonly string[]): GlossaryTerm | undefined {
  const set = new Set(learned);
  return terms.find((t) => !set.has(t.id));
}

function validateBlock(b: ContentBlock, at: string, p: string[]) {
  if (b.type === "fretboard") {
    const max = b.frets ?? 12;
    for (const n of b.highlightedNotes)
      if (n.string < 1 || n.string > 6 || n.fret < 0 || n.fret > max) p.push(`${at}: fretboard note out of range (string ${n.string}, fret ${n.fret})`);
  }
  if (b.type === "table" && b.rows.some((r) => r.length !== b.columns.length)) p.push(`${at}: table row length differs from columns`);
}

/** Problems in the articles; empty = valid */
export function validateArticles(articles: readonly Article[]): string[] {
  const p: string[] = [];
  const ids = new Set<string>();
  for (const a of articles) {
    if (!a.id) p.push(`"${a.title}": id is empty`);
    else if (ids.has(a.id)) p.push(`duplicate article id "${a.id}"`);
    ids.add(a.id);
    if (!a.title || !a.summary) p.push(`${a.id}: title and summary are required`);
    if (a.sections.length === 0 || a.sections.length > ARTICLE_MAX_SECTIONS)
      p.push(`${a.id}: must have 1 to ${ARTICLE_MAX_SECTIONS} sections (${a.sections.length})`);
    const sectionIds = a.sections.map((s) => s.id);
    if (new Set(sectionIds).size !== sectionIds.length) p.push(`${a.id}: duplicate section id`);
    for (const s of a.sections) s.blocks.forEach((b, i) => validateBlock(b, `${a.id}/${s.id}/block ${i}`, p));
  }
  return p;
}

// ---------- Search ----------

/**
 * Normalizes text for search: lower case, no backticks, Arabic ي/ك → Persian ی/ک,
 * no zero-width non-joiner or diacritics, and collapsed spaces/hyphens.
 */
export function normalizeForSearch(s: string): string {
  return s
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[‌ً-ٰٟ]/g, "")
    .replace(/[\s\-‐_/()]+/g, " ")
    .trim();
}

/** Does the term match the query (English term or Persian equivalent)? Empty query matches all. */
export function termMatches(t: GlossaryTerm, query: string): boolean {
  const q = normalizeForSearch(query);
  if (!q) return true;
  return [t.term, t.fa].some((field) => normalizeForSearch(field).includes(q));
}

/** Fisher–Yates shuffle of 0..n-1 (for quiz options). random is injectable for tests. */
export function shuffledIndices(n: number, random: () => number = Math.random): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Teaching order: by level; stable, so file order is kept within a level. Never alphabetical. */
export const inTeachingOrder = <T extends { level: number }>(items: readonly T[]): T[] =>
  [...items].sort((a, b) => a.level - b.level);
