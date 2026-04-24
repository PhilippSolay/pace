---
id: S02
milestone: M001
title: "Reader Engine + Reader View"
provides:
  - Pure reader-engine modules (types, tokenize, pin, timing) with 42 unit tests
  - ReaderEngine class + Zustand store with 11 fake-timer tests
  - ReaderWord + GuideLines design-system components (aria-hidden)
  - GestureLayer + ReaderView feature components
  - /reader route playing MARCUS_AURELIUS_PASSAGE at 350 WPM
  - Vitest wired into the project via vite.config.ts + tsconfig include
requires:
  - slice: S01
    provides: design tokens, Wordmark, Eyebrow, router, strict-TS scaffold
produced_commits:
  - T01  reader-engine pure modules + 42 tests
  - T02  ReaderEngine class + Zustand store + 11 tests
  - T03  ReaderWord + GuideLines + sample passage
  - T04  ReaderView + GestureLayer + /reader route
drill_down_paths:
  - .gsd/milestones/M001/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S02/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S02/tasks/T03-SUMMARY.md
  - .gsd/milestones/M001/slices/S02/tasks/T04-SUMMARY.md
verification_result: pass
completed_at: 2026-04-25T00:50:00Z
---

# S02: Reader Engine + Reader View — slice summary

**The product's core loop works: `/reader` plays words at 350 WPM with the pin at `ceil(length ÷ 2)`, tap toggles play/pause, swipes jump ±5 words, timing respects punctuation and long-word caps. 53/53 unit tests pass; bundle 56.55 KB gzip (31% of 180 KB budget).**

## What Happened

Four tasks, four commits on `gsd/M001/S02`:

1. **T01** — 4 parallel agents produced pure modules (types, tokenize, pin, timing) + 42 tests. Vitest wired via `vite.config.ts` (imports from `vitest/config`, not `vite`). Coverage on `src/core/reader-engine/**` = 95.77%.

2. **T02** — ReaderEngine class with private state + setTimeout scheduler + Set-based listener pub/sub. Zustand store with module-scoped engine singleton. 11 fake-timer tests including paragraph-break 2.5× multiplier boundary and destroy cleanup. One test fix mid-run (paragraph-break needs `punctuationPauses: true` for multiplier to apply).

3. **T03** — ReaderWord (absolute-positioned, pin in accent, optional glow via `color-mix(in oklab, accent 35%, transparent)`) + GuideLines (measured pin-width via `useLayoutEffect` + re-measure after `document.fonts.ready`) + Marcus Aurelius passage (George Long 1862 translation, 4 paragraphs, ~300 words). One content-filter false-positive mid-generation; recovered with a tighter follow-up write.

4. **T04** — GestureLayer (Pointer Events, `touch-action: none`, classifies tap / horizontal-swipe / bottom-up-swipe) + ReaderView (composes engine + gestures + components + top chrome + progress bar + hidden a11y note) + Reader.tsx route flipped from S01 stub to `<ReaderView />`. `visibilitychange` auto-pause. `onFinish` logs to console (real Completion lands in S06).

## Bundle Trajectory

| After | JS gzip  | CSS gzip | % of 180 KB budget |
|-------|----------|----------|---------------------|
| S01 end | 52.41 KB | 0.91 KB | 30% |
| S02 T01 | 52.41 KB | 0.91 KB | no app bundle change |
| S02 T02 | 52.41 KB | 0.91 KB | store tree-shaken until imported |
| S02 T03 | 52.41 KB | 0.91 KB | components tree-shaken until imported |
| S02 T04 | **56.55 KB** | 0.91 KB | **31%** |

+4.14 KB for the entire reader engine, store, components, gestures, sample text. Well-budgeted.

## Tests

| File | Tests | File total |
|---|---|---|
| `tokenize.test.ts` | 13 | unchanged |
| `pin.test.ts` | 15 | unchanged |
| `timing.test.ts` | 14 | unchanged |
| `engine.test.ts` | 11 | new in S02 |
| **Total** | **53 passing, 0 failing** |

## Boundary-Map Contract (S02 → downstream)

All produced interfaces match M001-ROADMAP.md boundary map S02 section:

- ✓ `src/core/reader-engine/types.ts` — ReaderToken, ReaderSettings, ReaderEngineState, ReaderEngineOptions
- ✓ `src/core/reader-engine/tokenize.ts` — `tokenize(text): ReaderToken[]`
- ✓ `src/core/reader-engine/pin.ts` — `pinIndex(word): number`
- ✓ `src/core/reader-engine/timing.ts` — `computeDuration(token, settings): number`
- ✓ `src/core/reader-engine/engine.ts` — ReaderEngine class with play/pause/seek/jump/reset/destroy + onChange/onFinish listeners
- ✓ `src/core/reader-engine/store.ts` — `useReaderStore` Zustand slice
- ✓ `src/design-system/components/ReaderWord.tsx`
- ✓ `src/design-system/components/GuideLines.tsx`
- ✓ `src/features/reader/ReaderView.tsx`
- ✓ `src/features/reader/GestureLayer.tsx`
- ✓ `src/core/reader-engine/samples.ts` — dev-only, deleted in S03

## Key Decisions (promoted to DECISIONS.md)

No new register entries needed — all S02 choices followed locked decisions (D014 Vite, D015 React, D019 minimal deps, D021 Zustand + dexie-react-hooks). The exactOptionalPropertyTypes workaround for `ReaderEngineOptions` spread in `store.initEngine` is a pattern worth recording in S03 if persistence bumps into the same constraint.

## Known Issues / Debt

- **No component-level tests** for ReaderView / GestureLayer / ReaderWord / GuideLines. Would need `@testing-library/react` + user-event + mock for Pointer Events — real weight for low signal at this stage. Revisit if regressions appear after S05 settings drawer lands.
- **Paragraph-break ¶ glyph** renders at 25% opacity but without a fade animation. Per D008 the fade is part of the design; S06 polish will add it.
- **`samples.ts` + MARCUS_AURELIUS_PASSAGE** is dev-only and will be deleted in S03 once the Library's Dexie lookup replaces the hardcoded import.
- **Dev server port 5173** occasionally occupied by another project's server; use `npm run dev -- --port 5199` as a workaround.

## Next Slice

**S03: Welcome + Library + Paste + Persistence** (`risk:medium`). Adds Dexie schema (ReadingText, ReadingSession, UserPreferences), Library screen with live-query, New Reading sheet, Paste Text view, first-run Welcome gate. Exits when a pasted text survives a browser restart.
