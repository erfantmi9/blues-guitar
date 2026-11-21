import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout";
import { NotFoundPage } from "./NotFoundPage";
import { pages } from "./pages";
import { RouteError } from "./RouteError";

/**
 * Each page is loaded lazily, so heavy dependencies such as Tone.js only load when that page is opened.
 * Every page has its own error boundary (inside the layout, so the menu stays): a failed chunk download
 * shows «صفحه بارگذاری نشد» instead of a blank page.
 */
export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      ...pages.map(({ path, load }) => {
        const lazy = async () => {
          try {
            return await load();
          } catch (error) {
            // Render failures through the page boundary, including initial lazy-load failures.
            return { Component: () => { throw error; } };
          }
        };
        return path === "" ? { index: true, lazy, errorElement: <RouteError /> } : { path, lazy, errorElement: <RouteError /> };
      }),
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
