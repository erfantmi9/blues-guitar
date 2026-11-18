// Code shared between web and api: types and contracts.

export * from "./lessons";
export * from "./music";
export * from "./practice";

export const API_PREFIX = "/api";

export type HealthResponse = {
  ok: true;
  version: string;
  time: string;
};
