/**
 * Reference content: the glossary learning path (levels, terms, quizzes) and short concept articles.
 * Text convention as in lessons: English inside Persian text goes between backticks.
 */
import type { ContentBlock } from "./lessons";
import type { HighlightedNote, StringNumber } from "./music";

/** One step of the glossary path (beginner → advanced). Levels are never locked. */
export type GlossaryLevel = {
  id: number;
  title: string;
  summary: string;
  /** false = shown faded with "به‌زودی" and has no terms yet */
  available: boolean;
};

export type GlossaryTerm = {
  /** Stable and unique; the #anchor on /glossary/level/:id */
  id: string;
  /** GlossaryLevel.id */
  level: number;
  /** English term */
  term: string;
  /** Persian equivalent */
  fa: string;
  definition: string;
  /** Terms to know first; must come earlier in the teaching order */
  prerequisites?: string[];
  /** Related terms; links are mutual */
  related?: string[];
  /** Where the learner meets the term in the course */
  meetAt?: { lessonId?: string; stage?: number; note?: string };
  /** Display-only fretboard; note names come from noteAt at render time */
  fretboard?: { notes: HighlightedNote[]; caption?: string };
  /** Notes played in order by «بشنو» */
  audio?: { string: StringNumber; fret: number }[];
};

export type QuizQuestion = {
  id: string;
  level: number;
  prompt: string;
  options: string[];
  correctIndex: number;
  /** Shown right after answering; required */
  explanation: string;
};

export type ArticleSection = {
  /** Stable within the article */
  id: string;
  title: string;
  blocks: ContentBlock[];
};

export type Article = {
  /** Stable and unique; used in the URL /learn/:id */
  id: string;
  title: string;
  summary: string;
  /** At most 4 */
  sections: ArticleSection[];
};
