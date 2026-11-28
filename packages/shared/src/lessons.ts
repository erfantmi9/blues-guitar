/**
 * Data model for the learning path.
 *
 * Text convention: anything between two backticks (e.g. `Gain`) is rendered
 * left-to-right (bdi dir="ltr") so English inside Persian sentences doesn't break the layout.
 */

import type { HighlightedNote } from "./music";

/** Suggested time in minutes: a fixed number or a range */
export type Duration = number | { min: number; max: number };

export type ListItem = string | { label: string; text: string };

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "table"; caption?: string; columns: string[]; rows: string[][] }
  | { type: "steps"; title?: string; ordered?: boolean; items: ListItem[] }
  | { type: "callout"; variant: "tip" | "warning" | "note"; title?: string; text: string }
  | {
      type: "fretboard";
      highlightedNotes: HighlightedNote[];
      showNoteNames?: boolean;
      /** Number of frets shown (default 12) */
      frets?: number;
      caption?: string;
    }
  /** Link to another page in the app, e.g. "/practice?exercise=…" */
  | { type: "link"; to: string; text: string }
  /** Preformatted monospace text, left-to-right (e.g. a text tab); line breaks preserved */
  | { type: "pre"; text: string; caption?: string };

export type Section = {
  /** Stable within the lesson */
  id: string;
  title: string;
  duration: Duration;
  blocks: ContentBlock[];
};

export type CompletionCriterion = {
  /** Stable: progress is stored by this id */
  id: string;
  text: string;
};

export type ReportQuestion = {
  id: string;
  question: string;
};

export type Lesson = {
  /** Stable and unique, e.g. "s1-l1" */
  id: string;
  stageId: string;
  /** Session number within the whole path (e.g. "session 1") */
  session: number;
  title: string;
  goal: string;
  duration: Duration;
  sections: Section[];
  completion: {
    criteria: CompletionCriterion[];
    /** Minimum number of checked items to allow completing the lesson */
    minRequired: number;
    note?: string;
  };
  report: {
    questions: ReportQuestion[];
    /** Guide text shown in the post-session form */
    hint?: string;
  };
};

/** The three learning tracks; they advance side by side (see the recommended order) */
export type TrackId = "foundation" | "solo" | "chords";

export type Track = {
  id: TrackId;
  title: string;
  summary: string;
};

export type StageMeta = {
  /** Stable: lessons point to it by stageId, and existing ids are also DOM anchors ("stage-1") */
  id: string;
  trackId: TrackId;
  title: string;
  /** One-line goal / summary */
  goal: string;
  /** Omitted for coming-soon stages that have no lessons yet */
  estimatedSessions?: number;
};

/** Stage plus its lessons (built in the content registry). position = 1-based place within its track. */
export type Stage = StageMeta & { position: number; lessons: Lesson[] };

export type StageStatus = "coming-soon" | "locked" | "in-progress" | "done";

// ---- User progress (stored on the client; synced later) ----

export type LessonReport = {
  id: string;
  /** ISO date */
  createdAt: string;
  answers: Record<string, string>;
  /** Snapshot of the checked criteria when the report was saved */
  checkedCriteria: string[];
};

export type LessonProgress = {
  checkedCriteria: string[];
  /** ISO date, or null if not completed */
  completedAt: string | null;
  /** Unsaved form text, so it isn't lost on refresh */
  reportDraft: Record<string, string>;
  reports: LessonReport[];
};
