import type { MiddlewareHandler } from "hono";
import { timingSafeEqual } from "node:crypto";

/**
 * Single-user auth: one shared Bearer token.
 * To move to real accounts later (several users or OAuth), replace this middleware
 * and set `c.set("userId", ...)`. Routes depend only on `userId`.
 */
export type AuthVars = { userId: string };

export function bearerAuth(token: string): MiddlewareHandler<{ Variables: AuthVars }> {
  const expected = Buffer.from(token);
  return async (c, next) => {
    const header = c.req.header("Authorization") ?? "";
    const given = Buffer.from(header.replace(/^Bearer\s+/i, ""));
    const ok = given.length === expected.length && timingSafeEqual(given, expected);
    if (!ok) return c.json({ error: "unauthorized" }, 401);
    c.set("userId", "me");
    await next();
  };
}
