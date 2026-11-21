import type { GlossaryLevel, GlossaryTerm, QuizQuestion } from "@bg/shared";
import { stages } from "@/features/lessons/content";
import { inTeachingOrder, validateGlossary } from "@/lib/content/reference";
import levelList from "./glossary/levels";

/**
 * Glossary path registry.
 * - levels: glossary/levels.ts
 * - terms: glossary/terms-l<N>.ts (export default GlossaryTerm[]), order in the file = teaching order
 * - quiz: glossary/quiz-l<N>.ts (export default QuizQuestion[])
 * New files matching these names are picked up automatically.
 */
const termModules = import.meta.glob<{ default: GlossaryTerm[] }>("./glossary/terms-*.ts", { eager: true });
const quizModules = import.meta.glob<{ default: QuizQuestion[] }>("./glossary/quiz-*.ts", { eager: true });

export const levels: GlossaryLevel[] = [...levelList].sort((a, b) => a.id - b.id);
/** All terms in teaching order */
export const glossary: GlossaryTerm[] = inTeachingOrder(Object.values(termModules).flatMap((m) => m.default ?? []));
const quiz: QuizQuestion[] = inTeachingOrder(Object.values(quizModules).flatMap((m) => m.default ?? []));

const lessonIds = new Set(stages.flatMap((s) => s.lessons.map((l) => l.id)));

/** Content errors (also shown on the page in development) */
export const glossaryProblems: readonly string[] = validateGlossary({ levels, terms: glossary, quiz }, lessonIds);
if (glossaryProblems.length) console.error("[glossary] invalid content:\n  - " + glossaryProblems.join("\n  - "));

const byId = new Map(glossary.map((t) => [t.id, t]));
export const getTerm = (id: string) => byId.get(id);
export const getLevel = (id: number) => levels.find((l) => l.id === id);
export const termsOfLevel = (levelId: number) => glossary.filter((t) => t.level === levelId);
export const quizOfLevel = (levelId: number) => quiz.filter((q) => q.level === levelId);
export const termsForLesson = (lessonId: string) => glossary.filter((t) => t.meetAt?.lessonId === lessonId);

/** URL of a term's card */
export const termHref = (t: GlossaryTerm) => `/glossary/level/${t.level}#${t.id}`;
