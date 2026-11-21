import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { matchRoutes, type RouteObject } from "react-router";
import { isChunkLoadError } from "./errors";
import { pages } from "./pages";

// Same shape as router.tsx: the layout route with every page, then the catch-all 404
const routes: RouteObject[] = [
  {
    path: "/",
    children: [...pages.map((p) => (p.path === "" ? { index: true, id: "home" } : { path: p.path, id: p.path })), { path: "*", id: "404" }],
  },
];
const leaf = (url: string) => matchRoutes(routes, url)?.at(-1)?.route.id;

describe("404 routing", () => {
  it("unknown addresses go to the 404 page", () => {
    for (const url of ["/nope", "/lessons", "/glossary/levels/1", "/glossary/level", "/lesson", "/about/x/y"]) assert.equal(leaf(url), "404", url);
  });

  it("known pages still match (lesson and level ids are checked by their page, which then shows the 404)", () => {
    assert.equal(leaf("/"), "home");
    assert.equal(leaf("/about"), "about");
    assert.equal(leaf("/lesson/s1-l1"), "lesson/:lessonId");
    assert.equal(leaf("/lesson/does-not-exist"), "lesson/:lessonId");
    assert.equal(leaf("/glossary/instrument"), "glossary/instrument");
    assert.equal(leaf("/glossary/level/9"), "glossary/level/:levelId");
  });

  it("every page path is unique", () => {
    const paths = pages.map((p) => p.path);
    assert.equal(new Set(paths).size, paths.length);
  });
});

describe("level id format (LevelPage)", () => {
  const valid = (s: string) => /^(0|[1-9]\d*)$/.test(s);
  it("accepts plain numbers only", () => {
    assert.deepEqual(["0", "2", "6", "12"].map(valid), [true, true, true, true]);
    assert.deepEqual(["", "02", "2.0", "-1", "1e1", "abc", " 1"].map(valid), [false, false, false, false, false, false, false]);
  });
});

describe("chunk load errors", () => {
  it("recognises failed lazy imports in the main browsers", () => {
    assert.ok(isChunkLoadError(new TypeError("Failed to fetch dynamically imported module: https://x/assets/AboutPage-abc.js"))); // Chrome
    assert.ok(isChunkLoadError(new TypeError("error loading dynamically imported module: https://x/a.js"))); // Firefox
    assert.ok(isChunkLoadError(new TypeError("Importing a module script failed."))); // Safari
    assert.ok(isChunkLoadError(new Error("Unable to preload CSS for /assets/a.css"))); // Vite
  });
  it("other errors are not chunk errors", () => {
    assert.equal(isChunkLoadError(new Error("Cannot read properties of undefined")), false);
    assert.equal(isChunkLoadError(null), false);
    assert.equal(isChunkLoadError({ status: 404 }), false);
  });
});
