import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  // Served from the domain root (Vercel); routes like /practice are rewritten to index.html
  base: "/",
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // The web app has no connection to apps/api for now (localStorage only).
  // When sync is added, configure the API address via an env variable, not a hard-coded value.
  server: {
    host: true, // reachable from a phone on the same network
  },
});
