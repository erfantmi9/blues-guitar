import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { caseDuplicates, duplicateModuleProblems, packageCopies } from "./bundleGuard";

// Module ids as the bundler reports them (shapes taken from the real broken build of 2026-11-22)
const up = "C:/Projects/mine/guitar-blues";
const low = "c:/Projects/mine/guitar-blues";
const healthy = [
  `${up}/apps/web/src/main.tsx`,
  `${up}/apps/web/src/features/about/AboutPage.tsx`,
  `${up}/node_modules/react/index.js`,
  `${up}/node_modules/react/cjs/react.production.js`,
  `${up}/node_modules/react/jsx-runtime.js`,
  `${up}/node_modules/react-dom/client.js`,
  `${up}/node_modules/scheduler/index.js`,
  "\0rolldown/runtime.js",
];

describe("bundle guard: duplicate modules", () => {
  it("a healthy bundle has no problems", () => {
    assert.deepEqual(duplicateModuleProblems(healthy), []);
  });

  it("catches the real bug: React under a lowercase and an uppercase drive letter", () => {
    const broken = [...healthy, `${low}/apps/web/src/features/about/AboutPage.tsx`, `${low}/node_modules/react/index.js`];
    assert.deepEqual(caseDuplicates(broken), [
      [`${up}/apps/web/src/features/about/AboutPage.tsx`, `${low}/apps/web/src/features/about/AboutPage.tsx`],
      [`${up}/node_modules/react/index.js`, `${low}/node_modules/react/index.js`],
    ]);
    assert.deepEqual(Object.keys(packageCopies(broken)), ["react"]);
    assert.ok(duplicateModuleProblems(broken).length > 0);
  });

  it("treats backslash and slash paths as the same file", () => {
    assert.equal(caseDuplicates([`${up}/node_modules/react/index.js`, "C:\\Projects\\mine\\guitar-blues\\node_modules\\react\\index.js"]).length, 0);
  });

  it("catches a second copy of a singleton package in a nested node_modules", () => {
    const nested = [...healthy, `${up}/node_modules/some-lib/node_modules/react-dom/client.js`];
    assert.deepEqual(packageCopies(nested), {
      "react-dom": [`${up}/node_modules/react-dom`, `${up}/node_modules/some-lib/node_modules/react-dom`],
    });
  });

  it("does not confuse react with react-dom or react-router", () => {
    assert.deepEqual(packageCopies([...healthy, `${up}/node_modules/react-router/dist/index.js`]), {});
  });
});

describe("bundle guard: wiring", () => {
  const config = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../vite.config.ts"), "utf8");

  it("vite.config.ts runs the guard on every build", () => {
    assert.match(config, /noDuplicateModules\(\)/);
  });

  it("the @ alias resolves through Vite's root, not import.meta.url (the cause of the duplicate React)", () => {
    assert.match(config, /"@":\s*"\/src"/);
  });
});
