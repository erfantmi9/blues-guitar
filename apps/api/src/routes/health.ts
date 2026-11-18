import { Hono } from "hono";
import type { HealthResponse } from "@bg/shared";

export const healthRoutes = new Hono().get("/", (c) =>
  c.json<HealthResponse>({ ok: true, version: "0.1.0", time: new Date().toISOString() }),
);
