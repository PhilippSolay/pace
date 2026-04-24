---
id: T02
parent: S02
milestone: M001
provides:
  - ReaderEngine class — framework-agnostic, immutable state snapshots, setTimeout-based scheduler, pub/sub listener model
  - Zustand store (useReaderStore) mirroring engine state reactively for React consumers
  - 11 new engine tests (fake-timer driven) bringing total to 53/53 passing
requires:
  - slice: S02
    provides: types, tokenize, pin, timing (T01)
affects: [S02/T04, S03, S05, S06]
key_files:
  - src/core/reader-engine/engine.ts
  - src/core/reader-engine/store.ts
  - tests/unit/reader-engine/engine.test.ts
  - package.json (adds zustand ^5.0.12)
key_decisions:
  - "Module-scoped engine singleton in store.ts, not kept in Zustand state — class lifecycle stays outside React's render tree; survives StrictMode double-mounts cleanly via explicit destroyEngine()"
  - "Engine uses Set<Listener> for pub/sub — multiple subscribers supported, unsubscribe returned from .onChange / .onFinish"
  - "State snapshot rebuilt fresh on every change (immutable). Engine fields (index, playing) are private; getState() is the read-only view"
  - "updateSettings takes effect on the *next* scheduleNext call, not the current in-flight timeout. Documented in the engine.ts and verified in the test"
  - "seek() past tokens.length triggers finish(); seek() to current index is a no-op (prevents listener spam)"
  - "exactOptionalPropertyTypes workaround in store.initEngine — spread-conditionally (`...(settings !== undefined ? { settings } : {})`) so undefined args don't leak into options"
patterns_established:
  - "Class-based stateful engine + framework-agnostic; Zustand lives only in store.ts"
  - "Fake-timer tests use vi.useFakeTimers() + vi.advanceTimersByTime(ms) with explicit comments for expected tick fires"
drill_down_paths:
  - .gsd/milestones/M001/slices/S02/tasks/T02-PLAN.md
duration: 12min
verification_result: pass
completed_at: 2026-04-25T00:22:00Z
---

# T02: ReaderEngine class + Zustand store

**Stateful reader engine + reactive store shipped. 11 engine tests pass with fake timers; all 53 tests green; build clean.**

## What Happened

Installed Zustand 5. Wrote `engine.ts` with the `ReaderEngine` class — private state (`tokens`, `settings`, `index`, `playing`, `timeoutId`, listener sets, `destroyed`), public methods (`play`, `pause`, `seek`, `jump`, `reset`, `updateSettings`, `onChange`, `onFinish`, `getState`, `destroy`). Scheduler uses `setTimeout` with explicit cancel on pause/seek/destroy; `scheduleNext()` reads `this.settings` each call so updates take effect without mid-tick reconfiguration.

Wrote `store.ts` — a Zustand slice holding engine state as plain fields + action wrappers delegating to a module-scoped engine instance. Included a test-only `__getEngine()` getter for introspection.

Wrote `engine.test.ts` — 11 tests covering initial state, play/pause, timed advance, jump bounds, seek-while-playing reschedule, onFinish, reset, paragraph break with 2.5× multiplier, destroy cleanup, and updateSettings timing semantics.

One test failure on first run: the paragraph-break test used `punctuationPauses: false` but asserted the 2.5× multiplier applied — brief behavior is that `punctuationPauses: false` skips ALL punctuation multipliers including paragraph breaks. Fixed by switching that test to `punctuationPauses: true` and using pair-of-ticks (249 ms then 1 ms) to prove the boundary.

## Deviations

- Changed one test assertion (paragraph-break 2.5× path) to match actual behavior with `punctuationPauses: true`. The `false` path is already covered in `timing.test.ts`.

## Verification

### Observable Truths
| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `npm run test` passes | ✓ PASS | 53/53 tests, 4 files |
| 2 | `npm run typecheck` clean | ✓ PASS | |
| 3 | `npm run lint` clean | ✓ PASS | |
| 4 | `npm run build` succeeds | ✓ PASS | bundle unchanged (store is tree-shaken from app bundle since nothing imports it yet) |
| 5 | ReaderEngine advances through tokens at ms intervals | ✓ PASS | engine.test.ts case 3 verifies 3 ticks at baseMs=100 |
| 6 | pause() cancels in-flight timeout | ✓ PASS | case 4 verifies index doesn't advance after pause |
| 7 | onFinish fires exactly once at end | ✓ PASS | case 7, mock assertion |

### Artifacts
| File | Lines | Status |
|------|-------|--------|
| engine.ts | 177 | ✓ SUBSTANTIVE |
| store.ts | 79 | ✓ SUBSTANTIVE |
| engine.test.ts | 177 | ✓ SUBSTANTIVE |

### Key Links
| From | To | Via | Status |
|------|----|----|--------|
| engine.ts | timing.ts | computeDuration() | ✓ WIRED |
| store.ts | engine.ts | new ReaderEngine(...) | ✓ WIRED |
| engine.test.ts | engine.ts + types.ts | @/core/... imports | ✓ WIRED |

## Files Created/Modified

- `src/core/reader-engine/engine.ts` (new)
- `src/core/reader-engine/store.ts` (new)
- `tests/unit/reader-engine/engine.test.ts` (new)
- `package.json` — zustand ^5.0.12 added
