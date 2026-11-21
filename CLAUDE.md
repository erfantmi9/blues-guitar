# CLAUDE.md

## Project
Personal site for learning electric guitar (Blues path). Persian, right-to-left (RTL).

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
- **Content:** each lesson, tab exercise and backing track is its own file, registered automatically with `import.meta.glob`:
  - lessons: `apps/web/src/features/lessons/content/lessons/`
  - tab exercises: `apps/web/src/features/practice/content/exercises/`
  - backing tracks: `apps/web/src/features/practice/content/backing/`
  - Don't put other `.ts` files (e.g. tests) in these folders: the glob would pick them up.
- **Storage:** only through `apps/web/src/lib/storage` (`defineKey` with a schema `version`, `useStoredValue`). Never use `localStorage` directly.
- **Design tokens:** only in `apps/web/src/styles/global.css` (dark and light themes). No hard-coded colors in components.
- **Animation:** new animations use only `transform`/`opacity` and respect `prefers-reduced-motion`. (Some existing CSS also transitions color/background/border.)
- **Direction:** the page is RTL, but the Fretboard, Tab and every music display use `dir="ltr"`. English inside Persian text goes between backticks (rendered as LTR `bdi`).

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
