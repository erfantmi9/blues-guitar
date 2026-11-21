import type { Article } from "@bg/shared";
import { validateArticles } from "@/lib/content/reference";

/**
 * Article registry.
 * To add an article: create a file in articles/ with `export default article`.
 * It is picked up automatically; no extra registration line needed.
 */
const modules = import.meta.glob<{ default: Article }>("./articles/*.ts", { eager: true });

const all: Article[] = Object.values(modules)
  .map((m) => m.default)
  .filter(Boolean);

/** Content errors (also shown on the page in development) */
export const articleProblems: readonly string[] = validateArticles(all);
if (articleProblems.length) console.error("[articles] invalid content:\n  - " + articleProblems.join("\n  - "));

/** In reading order (fixed list; unknown ids go last) */
const ORDER = ["notes-and-frets", "why-pentatonic", "beat-and-bar", "how-to-practice"];
const rank = (id: string) => (ORDER.includes(id) ? ORDER.indexOf(id) : ORDER.length);
export const articles: Article[] = [...all].sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id));

const byId = new Map(articles.map((a) => [a.id, a]));
export const getArticle = (id: string | undefined) => (id ? byId.get(id) : undefined);
