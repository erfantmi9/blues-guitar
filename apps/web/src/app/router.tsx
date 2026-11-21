import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { NotFoundPage } from "./NotFoundPage";

/**
 * Each page is loaded lazily, so heavy dependencies such as Tone.js
 * only load when that page is opened.
 */
export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, lazy: async () => ({ Component: (await import("@/features/dashboard/DashboardPage")).DashboardPage }) },
      { path: "path", lazy: async () => ({ Component: (await import("@/features/lessons/PathPage")).PathPage }) },
      { path: "lesson/:lessonId", lazy: async () => ({ Component: (await import("@/features/lessons/LessonPage")).LessonPage }) },
      { path: "fretboard", lazy: async () => ({ Component: (await import("@/features/fretboard/FretboardPage")).FretboardPage }) },
      { path: "practice", lazy: async () => ({ Component: (await import("@/features/practice/PracticePage")).PracticePage }) },
      { path: "backing", lazy: async () => ({ Component: (await import("@/features/practice/BackingPage")).BackingPage }) },
      { path: "log", lazy: async () => ({ Component: (await import("@/features/log/LogPage")).LogPage }) },
      { path: "glossary", lazy: async () => ({ Component: (await import("@/features/glossary/GlossaryPage")).GlossaryPage }) },
      { path: "glossary/instrument", lazy: async () => ({ Component: (await import("@/features/glossary/instrument/InstrumentPage")).InstrumentPage }) },
      { path: "glossary/level/:levelId", lazy: async () => ({ Component: (await import("@/features/glossary/LevelPage")).LevelPage }) },
      { path: "learn", lazy: async () => ({ Component: (await import("@/features/learn/LearnPage")).LearnPage }) },
      { path: "learn/:articleId", lazy: async () => ({ Component: (await import("@/features/learn/ArticlePage")).ArticlePage }) },
      { path: "settings", lazy: async () => ({ Component: (await import("@/features/settings/SettingsPage")).SettingsPage }) },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
