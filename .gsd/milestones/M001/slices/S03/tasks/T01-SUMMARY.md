---
id: T01
parent: S03
milestone: M001
provides:
  - Dexie schema with 3 tables (texts, sessions, preferences)
  - Texts repository (7 functions with cascade-delete of sessions)
  - Preferences repository (singleton row with race-safe memoized getter)
  - Sessions repository (start/end + list-for-text)
  - 22 new persistence tests bringing total to 75 passing
  - fake-indexeddb wired as Vitest setup file
requires:
  - slice: S01
    provides: Vite + TS strict scaffold
affects: [S03/T02, S03/T03, S03/T04, S04, S05, S06]
key_files:
  - src/core/persistence/schema.ts
  - src/core/persistence/texts.ts
  - src/core/persistence/preferences.ts
  - src/core/persistence/sessions.ts
  - tests/unit/persistence/texts.test.ts
  - tests/unit/persistence/preferences.test.ts
  - tests/unit/persistence/sessions.test.ts
  - tests/setup.ts
  - vite.config.ts (setupFiles entry)
  - package.json (dexie + dexie-react-hooks + fake-indexeddb)
key_decisions:
  - "4 parallel agents: schema writer, texts-repo writer, prefs+sessions writer, tests writer. The test-writer agent ran tests locally before returning, confirming 22/22 pass and catching that all three source agents landed matching signatures"
  - "Preferences getter memoizes via module-scoped Promise<UserPreferences>; setters invalidate the memo explicitly. db.delete() does NOT invalidate the memo — tests that reset the DB must also reset via resetPreferences() or trigger a setter"
  - "deleteText cascades sessions inside a single rw transaction over both tables"
  - "wordCount computed at createText time via `content.trim().split(/\\s+/u).filter(Boolean).length` — good enough for library meta display; real tokenizer runs at read time"
  - "punctuationPauses default = false (matches D028 and the design handoff's OFF toggle)"
  - "hasCompletedWelcome default = false — drives the first-run gate that lands in T02"
patterns_established:
  - "Persistence repos live at src/core/persistence/*.ts, one file per table"
  - "Dexie singleton 'db' imported from schema.ts — no per-test custom instances"
  - "Tests wipe DB between cases via `await db.delete(); await db.open();` in beforeEach"
  - "Preferences setters invalidate the module-level memo; getter is eventually consistent"
drill_down_paths:
  - .gsd/milestones/M001/slices/S03/tasks/T01-PLAN.md
duration: 3min agents + 1min verify
verification_result: pass
completed_at: 2026-04-25T01:25:00Z
---

# T01: Dexie persistence layer + 22 tests

**IndexedDB-backed persistence shipped: 3 tables, 3 repositories, 22 tests. Total suite 75/75 passing; typecheck + lint + build all clean.**

## What Happened

Installed `dexie` + `dexie-react-hooks` (runtime) and `fake-indexeddb` (dev). Added `tests/setup.ts` with `import 'fake-indexeddb/auto'` and wired it into `vite.config.ts` via `test.setupFiles`.

Dispatched 4 parallel agents:
1. **schema.ts** (123 lines) — `PaceDB` Dexie class, 3 typed Table fields, 3 exported interfaces (`ReadingText`, `ReadingSession`, `UserPreferences`), `SourceType` union, `DEFAULT_PREFERENCES` constant, module-scoped `db` singleton
2. **texts.ts** (78 lines) — 7 functions: `createText`, `getText`, `listTexts` (updatedAt-desc), `updateText`, `updateProgress`, `markCompleted`, `deleteText` (cascades sessions in a transaction)
3. **preferences.ts + sessions.ts** (57 + 45 lines) — singleton memoized preferences with race-safe getter; session helpers with soft failure on missing ids
4. **3 test files** (388 lines, 22 tests) — agent ran the tests locally before returning; all 22 passed

Signatures matched across all 4 agents (test-writer agent confirmed); no integration fixes needed. Full suite reruns clean at 75/75.

## Deviations

- Agent 3 extracted a private `loadOrSeed()` helper and `SINGLETON_ID` constant in preferences.ts (not in the spec but a style-rule win — DRY + no magic strings)
- Agent 2 computes `markCompleted`'s `now` once and reuses it for both `completedAt` and `updatedAt` (avoids 1 ms timestamp skew)
- Agent 4 introduced a `TIMESTAMP_GAP_MS` constant in tests for "newest-first" ordering and a documented inline pattern for memo invalidation through the public API

## Verification

### Observable Truths
| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | typecheck exits 0 | ✓ PASS | clean |
| 2 | lint exits 0 | ✓ PASS | clean |
| 3 | test exits 0 | ✓ PASS | 75/75 passing |
| 4 | build exits 0 | ✓ PASS | bundle unchanged (persistence tree-shaken until imported) |
| 5 | Preferences singleton auto-creates with defaults | ✓ PASS | preferences.test.ts case 1 |
| 6 | Texts round-trip through create+get | ✓ PASS | texts.test.ts cases 1-2 |
| 7 | deleteText cascades sessions | ✓ PASS | texts.test.ts case 10 |

## Files Created/Modified

- `src/core/persistence/schema.ts` (new)
- `src/core/persistence/texts.ts` (new)
- `src/core/persistence/preferences.ts` (new)
- `src/core/persistence/sessions.ts` (new)
- `tests/unit/persistence/{texts,preferences,sessions}.test.ts` (new)
- `tests/setup.ts` (new)
- `vite.config.ts` (setupFiles entry)
- `package.json` (3 deps)
