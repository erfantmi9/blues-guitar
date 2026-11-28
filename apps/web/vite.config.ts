import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { site } from "./src/config/site";
import { duplicateModuleProblems } from "./src/app/bundleGuard";

/**
 * Fails the build if a module is bundled twice (same file under ids differing in case, or a second
 * copy of react / react-dom / scheduler). A second React broke every page in production; see
 * src/app/bundleGuard.ts and its test src/app/bundle.test.ts.
 */
function noDuplicateModules(): Plugin {
  return {
    name: "no-duplicate-modules",
    apply: "build",
    generateBundle(_options, bundle) {
      const ids = Object.values(bundle).flatMap((out) => (out.type === "chunk" ? out.moduleIds : []));
      const problems = duplicateModuleProblems(ids);
      if (problems.length) this.error(`Duplicate modules in the bundle:\n- ${problems.join("\n- ")}`);
    },
  };
}

/** Adds <link rel="canonical"> and og:url only once site.siteUrl is set (no guessed address) */
function siteUrlTags(): Plugin {
  return {
    name: "site-url-tags",
    transformIndexHtml() {
      if (!site.siteUrl) return [];
      const url = `${site.siteUrl.replace(/\/+$/, "")}/`;
      return [
        { tag: "link", attrs: { rel: "canonical", href: url }, injectTo: "head" },
        { tag: "meta", attrs: { property: "og:url", content: url }, injectTo: "head" },
      ];
    },
  };
}

export default defineConfig({
  // Served from the domain root (Vercel); routes like /practice are rewritten to index.html
  base: "/",
  plugins: [react(), siteUrlTags(), noDuplicateModules()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          // A separate, long-cached vendor chunk for React. This group is NOT what keeps React single:
          // the duplicate React (2026-11) came from the "@" alias path case (see resolve.alias) and is now
          // blocked by the no-duplicate-modules plugin above. Without this group React simply goes into index.
          groups: [{ name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ }],
        },
      },
    },
  },
  resolve: {
    // "/src" is resolved by Vite against `root`, so "@/…" imports get exactly the same path spelling as
    // every other module. An absolute path built from import.meta.url can differ in drive-letter case on
    // Windows ("c:\" vs Vite's "C:/"): then each file reached through "@/" (all lazy pages) and their
    // `react` import became separate modules, React was bundled twice and every page failed in production.
    alias: { "@": "/src" },
  },
  // The web app has no connection to apps/api for now (localStorage only).
  // When sync is added, configure the API address via an env variable, not a hard-coded value.
  server: {
    host: true, // reachable from a phone on the same network
  },
});
