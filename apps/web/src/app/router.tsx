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
      { path: "log", lazy: async () => ({ Component: (await import("@/features/log/LogPage")).LogPage }) },
      { path: "glossary", lazy: async () => ({ Component: (await import("@/features/glossary/GlossaryPage")).GlossaryPage }) },
      { path: "settings", lazy: async () => ({ Component: (await import("@/features/settings/SettingsPage")).SettingsPage }) },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
