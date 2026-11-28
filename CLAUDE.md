# CLAUDE.md

## Project
**Slow Bend** («گیتار بلوز، قدم‌به‌قدم»): a public site for learning electric guitar (Blues path) from zero. Persian, right-to-left (RTL).
- Logo: `components/brand/Logo.tsx` (variants full / mark; colors from tokens). The static icons in `public/` (favicon.svg, icons/*.png) are drawn from the same geometry; regenerate them if the mark changes.
- Menu (`app/navItems.ts`): `place: "bar"` items are in the phone's bottom bar, `place: "more"` go into «بیشتر» on a phone; the desktop sidebar shows all. The header holds only the logo.
- Home (`features/dashboard`): logic in `home.ts` (tested). New user = no lesson started (ticked criterion, report, non-empty draft or completion) and no glossary term learned; practice settings don't count. Otherwise: continue the first unfinished lesson in `recommendedOrder` (card shows its track label and a «مسیر دیگری انتخاب کن» link to `/path`), routine built from its Sections (rows link only to `/practice` or `/backing`), stats from stored data only (no streaks or BPM records).

## Structure (npm workspaces monorepo)
- `apps/web`: Vite + React + TypeScript + React Router. The site.
- `apps/api`: Hono. Not used yet.
- `packages/shared`: shared types (lessons, music, tab exercises, backing tracks).
- Only `apps/web` and `packages/shared` are installed and deployed on Vercel (`vercel.json`; `.vercelignore` excludes `apps/api`).

## Commands
- `npm run dev` (web + api; `npm run dev:web` for the site only)
- `npm test` (node:test via tsx; files `apps/web/src/**/*.test.ts`)
- `npm run typecheck`
- `npm run build`

## Conventions
- **Tracks:** three tracks, `foundation` («پایه»), `solo` («سولو»), `chords` («آکورد و ریتم») in `features/lessons/content/tracks.ts`. Every stage in `content/stages.ts` has a `trackId`; stage order within a track = file order, and the displayed stage number is its `position` in its track (no global stage number). Stage and lesson ids never change (progress keys and `#stage-N` anchors depend on them). A stage with no lessons is "به‌زودی". Pure logic and validation in `features/lessons/structure.ts` (tested in `features/lessons/order.test.ts`).
- **Recommended order:** `features/lessons/content/order.ts` (`recommendedOrder`) is the only source of the suggested lesson order across tracks. **Every new lesson must be added to `recommendedOrder`**; the test fails if a registered lesson is missing, an id is unknown, or one repeats. Nothing is locked; the order is only a suggestion (home "continue" card, «پیشنهاد بعدی» on `/path`).
- **`/path`:** jump links to the three tracks (with progress), then one section per track with a progress bar (finished / existing lessons). `PathNeck` is drawn for the solo track only (also on home).
- **Content:** each lesson, tab exercise and backing track is its own file, registered automatically with `import.meta.glob`:
  - lessons: `apps/web/src/features/lessons/content/lessons/`
  - tab exercises: `apps/web/src/features/practice/content/exercises/`
  - backing tracks: `apps/web/src/features/practice/content/backing/`
  - Don't put other `.ts` files (e.g. tests) in these folders: the glob would pick them up.
- **Storage:** only through `apps/web/src/lib/storage` (`defineKey` with a schema `version`, `useStoredValue`). Never use `localStorage` directly.
- **Design tokens:** only in `apps/web/src/styles/global.css` (dark and light themes). No hard-coded colors in components.
- **Animation:** new animations use only `transform`/`opacity` and respect `prefers-reduced-motion`. (Some existing CSS also transitions color/background/border.)
- **Direction:** the page is RTL, but the Fretboard, Tab and every music display use `dir="ltr"`. English inside Persian text goes between backticks (rendered as LTR `bdi`).

## Glossary and concepts
- `/glossary` is an 8-level learning path (ids 0–7) (not alphabetical): `content/glossary/levels.ts`, `terms-l<N>.ts` and `quiz-l<N>.ts` (file order = teaching order); validated in `lib/content/reference.ts` (unique ids, prerequisites earlier and acyclic, `related` mutual, `meetAt.lessonId` exists, valid `correctIndex`). Levels 3–7 are "به‌زودی" (7 = «آکوردها»); nothing is locked.
- Pages: `/glossary` (timeline, search, continue, `?lesson=<id>`) and `/glossary/level/:id` (cards + 5-question quiz). Progress in `glossary:progress` v1 (`learned`, `quizBest`). Terms link by `/glossary/level/<N>#<id>`; the DOM id is `term-<id>` because `#root` is the app's mount node. «بشنو» calls `stopActiveMetronome()` first.
- `/glossary/instrument?view=full|head|body|amp&part=<term id>`: SVG instrument map. Geometry in `features/glossary/instrument/parts.ts` (hotspot `part` = level-0 term id; tested: 44 px touch areas never overlap at 390 px), drawings in `art.tsx`, hotspots are HTML buttons over the SVG. Level-0 cards on the map get «نشانش بده».
- `/learn` and `/learn/:id`: articles in `features/learn/content/articles/` (one file each, at most 4 sections), rendered with the lesson `ContentBlockView`.

## String direction (intentional)
- Tab: string 1 (thinnest, `e`) on the top line (`TabStaff.tsx`).
- Fretboard: string 1 at the bottom, as a guitarist sees the neck (`components/fretboard/geometry.ts`).

## Audio engine
- One shared `AudioContext` (`lib/audio/context.ts`).
- Metronome, TabPlayer and Backing Track all run on `createMetronome` (lookahead scheduler on the audio clock, `lib/audio/metronome.ts`).
- Only one engine plays at a time: `activeMetronome` in `metronome.ts`; starting one stops the others.

## Music content
Lesson and exercise content comes from the user's teacher. Enter the text **exactly** as given; don't rewrite or "improve" it.

## How to work and report
- Before any task, read the actual code. Don't conclude from memory or file names.
- At the end of each task, say honestly what was run and tested, and what was not seen or heard (sound, real phone, Bluetooth, reduced-motion).

## Known limitations
- `tsx` (used by `npm test`) is only declared in `apps/api`; it resolves through workspace hoisting.
- The backing track page shows only the first track (`backingTracks[0]`), with no selector.
- Stage status "locked" and the metronome's `setClick` are not used anywhere.

## Build: duplicate React (fixed 2026-11-22)
- **Symptom:** production build showed the error page on every lazy page ("Cannot read properties of null (reading 'useSyncExternalStore' / 'useContext' / 'useRef')"); layout and menu still rendered; dev mode was fine.
- **Cause:** the `@` alias was an absolute path from `import.meta.url`. When the build was started from a cwd spelled `c:\…` (lowercase, as VS Code opens the folder), Vite's `root` was `C:/…` but the alias was `c:\…\src`. Every module reached through `@/…` (all lazy pages) got a `c:/…` id, so their `react` import resolved to a second module id and React (also react-router) was bundled twice. react-dom only sets the hook dispatcher on its own copy. It depended only on the cwd spelling, so it looked random; present since the first commit (3f74346). Vercel builds on Linux, where this case mismatch cannot occur; the deployed site was not checked.
- **Fix:** `resolve.alias` is `{ "@": "/src" }` (resolved by Vite against `root`, same spelling as every other module). Don't build the alias from `import.meta.url`/absolute paths.
- **Guard:** the `no-duplicate-modules` plugin in `vite.config.ts` fails the build if a file is bundled under ids differing only in case, or if react / react-dom / scheduler come from more than one copy. Logic in `src/app/bundleGuard.ts`, tested in `src/app/bundle.test.ts` (also checks the alias and that the plugin is wired).
- The `react` code-splitting group only makes a separate vendor chunk; it is not what keeps React single.

## Public release configuration
- The site owner must fill `feedbackEmail`, `repoUrl`, and `siteUrl` in `apps/web/src/config/site.ts`. They deliberately stay empty until supplied: no guessed email/domain/repository. Empty values hide feedback/repository links and canonical/og:url tags. No og:image or sitemap yet.
- `/about` is lazy; footer links to `/about#privacy`. Unknown paths and invalid lesson/glossary-level IDs show the Persian 404. Initial lazy import failures are converted into throwing page components so the page boundary renders reliably; retry reloads the document because browsers may cache failed module imports.
- Progress backup lives in settings. Keep existing storage key names/prefixes. Register new progress keys in `features/settings/backupKeys.ts` with schema validation. Imports reject unknown keys, newer schemas and files over 2 MiB, migrate supported older schemas, then ask for explicit replacement confirmation. Empty backups are valid. Imported strings are never rendered as HTML.
- Persistent restore uses the adapter batch method (not normal writes that fall back to memory). It snapshots originals, frees replaced keys, and restores originals on write failure. Synchronous quota-failure rollback is tested; localStorage does not offer crash-safe or cross-tab transactions, so browser termination or simultaneous writes during restore remain limitations.
- Security headers are in `vercel.json`. CSP is deliberately deferred: audio, workers and build asset loading need a separately designed/tested policy.

## Release verification — 2026-11-21
- `npm run typecheck`, `npm test` (106 passing), `npm run build`, and `git diff --check` passed. `npm audit --json`: zero vulnerabilities; no forced dependency updates.
- Chrome headless, production preview, 390 and 1440 px, light/dark: about, settings, footer presence, unknown route, invalid lesson and glossary-level IDs, import summary/confirmation/success, visible keyboard button focus, blocked lazy chunk fallback and reload recovery checked. About screenshots inspected. JavaScript-disabled noscript text checked. Test-origin storage cleared afterward.
- Download generation/round-trip is unit-tested; automated browser download delivery was not confirmed. No axe/Lighthouse available in project; neither installed nor run. Full contrast/accessibility audit, real phone, reduced-motion, audio and Bluetooth were not tested.
- Web source has no console.log or TODO. `apps/api/src/index.ts:9` logs API startup; that app is excluded from web deployment. Content-validation panels are DEV-gated.
- Existing brand mentions (reported, not edited): Strat in `features/glossary/content/glossary/quiz-l0.ts:32`, `terms-l0.ts:118,135,153`, and a drawing comment in `features/glossary/instrument/art.tsx:2`; GuitarTuna/Fender Tune in `features/lessons/content/lessons/s1-l1.ts:60`.
- Both requested level-2 quiz explanations already existed exactly. Lesson s2-l1 duration is 30–35 minutes.
- Initial on-disk dist snapshot was 811,488 bytes (90 files); this predates this continuation and is not a reproducible pre-feature baseline. Compare final size against that snapshot only, not against an assumed clean release.
- Build emits a non-blocking Vite notice about the extensionless site-config import and its future native config loader.
