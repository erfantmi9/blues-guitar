import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { site } from "./src/config/site";

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
  plugins: [react(), siteUrlTags()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          // React must exist exactly once. Without this group, Rolldown (1.2.x) put a second copy of `react`
          // into a shared chunk used by the lazy pages: hooks there failed with "reading 'useContext'" in
          // production only (dev was fine). Checked by apps/web/src/app/bundle.test.ts after a build.
          groups: [{ name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ }],
        },
      },
    },
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // The web app has no connection to apps/api for now (localStorage only).
  // When sync is added, configure the API address via an env variable, not a hard-coded value.
  server: {
    host: true, // reachable from a phone on the same network
  },
});
