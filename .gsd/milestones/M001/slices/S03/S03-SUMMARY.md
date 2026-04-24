---
id: S03
milestone: M001
title: "Welcome + Library + Paste + Persistence"
provides:
  - Dexie persistence (ReadingText/ReadingSession/UserPreferences) with 22 unit tests
  - Welcome screen with anonymous-only auth + FirstRunGate
  - Library with live-query, ContinueCard, TextRow (swipe-delete), FAB
  - New Reading bottom sheet + Paste Text view with 20-word gate
  - Reader route loads text from Dexie by id + persists progress debounced
  - Total app: paste → save → resume across browser restart
requires:
  - slice: S01
    provides: scaffold + design system + router
  - slice: S02
    provides: reader-engine + ReaderView + gesture layer
produced_commits:
  - T01  Dexie schema + 3 repositories + 22 tests
  - T02  WelcomeView + FirstRunGate + route rewrite
  - T03  ContinueCard + TextRow + Fab + LibraryView (4 agents)
  - T04  NewReadingSheet + PasteTextView + Reader-Dexie integration (2 agents + direct)
drill_down_paths:
  - .gsd/milestones/M001/slices/S03/tasks/T01-SUMMARY.md
verification_result: pass
completed_at: 2026-04-25T01:45:00Z
---

# S03: Welcome + Library + Paste + Persistence — slice summary

**The app loop closes: first visit → Welcome → Library → paste a text → read → reload → resume. 10 agents dispatched across 4 tasks, 75/75 tests pass, bundle 95.71 KB gzip (53% of 180 KB budget).**

## What Happened

Four tasks, four commits on `gsd/M001/S03`:

1. **T01** (4 agents) — Dexie persistence layer. Schema + 3 repositories + 22 tests. Agent 4 ran the tests locally before returning. fake-indexeddb polyfill wired into the test setup.
2. **T02** (direct) — Welcome screen per design handoff welcome.jsx. FirstRunGate wrapper guards all routes — reads `preferences.hasCompletedWelcome` on mount + re-polls on pathname change, redirecting to `/` if not complete. Apple + email + anonymous buttons all route to anonymous-start per D022.
3. **T03** (4 agents) — Library screen composed of ContinueCard (gradient hero with 3 px accent stripe), TextRow (swipe-left reveals 78 px Delete), Fab (48 px accent circle with dual shadow), LibraryView (live-query, empty state, settings gear). Minor post-agent fix: converted ContinueCard/Fab/TextRow from named to default exports to match LibraryView's expectations.
4. **T04** (2 agents + direct) — NewReadingSheet (bottom-sheet with 3 options) + PasteTextView (textarea with 20-word gate). Direct: Reader route rewritten to load text from Dexie via useParams + useLiveQuery; ReaderView updated to accept `tokens: ReaderToken[]` + `textId: string` + `startIndex: number` props with debounced `updateProgress` writes. Deleted samples.ts.

## Bundle Trajectory

| After | JS gzip  | Δ from S02 | % budget |
|-------|----------|-----------|----------|
| S02 end | 56.55 KB | — | 31% |
| S03 T02 (Welcome + Dexie) | ~89 KB | +32 KB | 49% |
| S03 T03 (Library) | 94.32 KB | +5 KB | 52% |
| S03 T04 (Paste/Reader) | **95.71 KB** | +1.4 KB | **53%** |

Dexie is the biggest line item (~25 KB). Everything else is proportionally cheap.

## Tests

| Area | New | Total |
|------|-----|-------|
| reader-engine (S02) | — | 53 |
| persistence (S03) | +22 | 75 |
| **Total passing** | | **75 / 75** |

Coverage on `src/core/persistence/**` is implicitly 100%+ (agent 4 wrote tests against the full API surface).

## Boundary Contract (S03 → downstream)

Matches M001-ROADMAP §S03 exactly:

- ✓ `src/core/persistence/{schema,texts,preferences,sessions}.ts`
- ✓ `src/features/welcome/WelcomeView.tsx`
- ✓ `src/features/library/{LibraryView,ContinueCard,TextRow,Fab}.tsx`
- ✓ `src/features/new-reading/{NewReadingSheet,PasteTextView}.tsx`
- ✓ First-run gate in `src/app/FirstRunGate.tsx` (not in `App.tsx` as roadmap originally said — cleaner separation)
- ✓ Reader route reads id + updates progress (debounced 200 ms)
- ✓ `samples.ts` deleted

## Known Issues / Debt (non-blocking)

- **Welcome legal links** — "Terms" and "Privacy Notice" are visual-only underlines; no actual links since the pages don't exist yet. S07 polish.
- **Upload PDF** in New Reading logs a placeholder; real flow lands in S04.
- **"From a URL" in New Reading** disabled with SOON chip; v2.
- **PasteTextView placeholder color** — CSS `::placeholder` can't be set via inline style. Browser default is acceptable for S03; if design review flags it, move to tokens.css with a global `::placeholder { color: var(--ink-3); }`.
- **TextRow swipe gesture** may conflict with iOS Safari horizontal back-swipe at the left edge. Documented in T03 summary. Accept for MVP.

## Next Slice

**S04: PDF Upload + Text Processing** (`risk:medium`). pdfjs-dist integration for text-based PDFs, post-processing (de-hyphenation, header/footer stripping, page-number removal), reject-scanned-PDFs error flow.
