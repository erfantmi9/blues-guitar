import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { API_PREFIX } from "@bg/shared";
import type { Env } from "./env.js";
import { bearerAuth, type AuthVars } from "./middleware/auth.js";
import { healthRoutes } from "./routes/health.js";

/**
 * Builds the app independent of the runtime, so the same code can later run on
 * Cloudflare Workers, Bun or Deno. index.ts is only the Node entry point.
 *
 * To add a feature: create a router in routes/ and register it here.
 */
export function createApp(env: Env) {
  const app = new Hono().basePath(API_PREFIX);

  app.use("*", logger());
  app.use("*", cors({ origin: env.CORS_ORIGINS, allowHeaders: ["Authorization", "Content-Type"] }));

  // Public
  app.route("/health", healthRoutes);

  // Protected: every route below requires a token
  const secured = new Hono<{ Variables: AuthVars }>();
  secured.use("*", bearerAuth(env.API_TOKEN));
  secured.get("/me", (c) => c.json({ userId: c.get("userId") }));
  // step 2: secured.route("/sync", syncRoutes(db));
  app.route("/", secured);

  app.notFound((c) => c.json({ error: "not_found" }, 404));
  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "internal_error" }, 500);
  });

  return app;
}
