/**
 * Every page and its lazy import. Pure (no JSX), so the routing itself is unit-tested.
 * To add a section: add a page here and an item in navItems.ts.
 */
import type { ComponentType } from "react";

export type Page = { path: string; load: () => Promise<{ Component: ComponentType }> };

export const pages: Page[] = [
  { path: "", load: async () => ({ Component: (await import("@/features/dashboard/DashboardPage")).DashboardPage }) },
  { path: "path", load: async () => ({ Component: (await import("@/features/lessons/PathPage")).PathPage }) },
  { path: "lesson/:lessonId", load: async () => ({ Component: (await import("@/features/lessons/LessonPage")).LessonPage }) },
  { path: "fretboard", load: async () => ({ Component: (await import("@/features/fretboard/FretboardPage")).FretboardPage }) },
  { path: "practice", load: async () => ({ Component: (await import("@/features/practice/PracticePage")).PracticePage }) },
  { path: "backing", load: async () => ({ Component: (await import("@/features/practice/BackingPage")).BackingPage }) },
  { path: "log", load: async () => ({ Component: (await import("@/features/log/LogPage")).LogPage }) },
  { path: "glossary", load: async () => ({ Component: (await import("@/features/glossary/GlossaryPage")).GlossaryPage }) },
  {
    path: "glossary/instrument",
    load: async () => ({ Component: (await import("@/features/glossary/instrument/InstrumentPage")).InstrumentPage }),
  },
  { path: "glossary/level/:levelId", load: async () => ({ Component: (await import("@/features/glossary/LevelPage")).LevelPage }) },
  { path: "learn", load: async () => ({ Component: (await import("@/features/learn/LearnPage")).LearnPage }) },
  { path: "learn/:articleId", load: async () => ({ Component: (await import("@/features/learn/ArticlePage")).ArticlePage }) },
  { path: "settings", load: async () => ({ Component: (await import("@/features/settings/SettingsPage")).SettingsPage }) },
  { path: "about", load: async () => ({ Component: (await import("@/features/about/AboutPage")).AboutPage }) },
];
