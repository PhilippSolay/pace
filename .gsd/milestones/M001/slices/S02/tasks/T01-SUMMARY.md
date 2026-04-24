---
id: T01
parent: S02
milestone: M001
provides:
  - Vitest test runner installed and configured via vite.config.ts
  - tokens/tests/coverage scripts in package.json
  - 4 pure reader-engine modules (types, tokenize, pin, timing) with 42 passing tests
  - 95.77% coverage on src/core/reader-engine/** (above 95% bar)
requires:
  - slice: S01
    provides: Vite + TS strict + path alias @/ + React scaffold
affects: [S02/T02, S02/T03, S02/T04]
key_files:
  - src/core/reader-engine/types.ts
  - src/core/reader-engine/tokenize.ts
  - src/core/reader-engine/pin.ts
  - src/core/reader-engine/timing.ts
  - tests/unit/reader-engine/tokenize.test.ts
  - tests/unit/reader-engine/pin.test.ts
  - tests/unit/reader-engine/timing.test.ts
  - vite.config.ts (switched to vitest/config, added test block)
  - tsconfig.json (added tests/ to include, vitest/globals type)
key_decisions:
  - "Dispatched 4 parallel agents (types, tokenize, pin, timing — each also produced its own tests). Integration done by me after"
  - "Vite config now imports defineConfig from vitest/config (not vite) — picks up test-block types without separate tsconfig"
  - "Used U+E000 Private Use Area sentinel for paragraph-break splitting instead of zero-width chars — guaranteed absent in natural text"
  - "pinIndex handles both leading and trailing punctuation stripping, returns 0-indexed position into original word"
  - "Long-word multiplier uses strict > 12 threshold (not >=); 12-letter words are NOT long"
  - "Magic numbers extracted to named constants in timing.ts (MS_PER_MINUTE, SENTENCE_END_MULTIPLIER, etc.)"
patterns_established:
  - "Pure reader-engine modules live at src/core/reader-engine/*.ts with matching tests at tests/unit/reader-engine/*.test.ts"
  - "Vitest tests use explicit imports (import { describe, it, expect } from 'vitest') even though globals are enabled"
  - "Coverage is enforced by including src/core/** and src/design-system/components/** in vitest coverage config"
drill_down_paths:
  - .gsd/milestones/M001/slices/S02/tasks/T01-PLAN.md
duration: 3min (agents parallel) + 2min integration
verification_result: pass
completed_at: 2026-04-25T00:18:00Z
---

# T01: Core engine pure modules + tests

**4 pure modules + 42 tests + 95.77% coverage on reader-engine. Vitest wired into the project; typecheck, lint, build all clean.**

## What Happened

Installed Vitest + @vitest/coverage-v8 + jsdom. Switched vite.config.ts to import `defineConfig` from `vitest/config` and added a `test` block configured for jsdom + globals + v8 coverage scoped to `src/core/**` and `src/design-system/components/**`. Added `tests` to tsconfig include; added `vitest/globals` to tsconfig types.

Dispatched 4 parallel agents:
- **types.ts** — 5 exports (ReaderToken, ReaderSettings, DEFAULT_READER_SETTINGS, ReaderEngineState, ReaderEngineOptions) with `exactOptionalPropertyTypes`-aware optional field shapes
- **tokenize.ts + test** — 13 tests. Paragraph-break via U+E000 sentinel; CRLF normalization; em-dash + en-dash standalone; Unicode preservation
- **pin.ts + test** — 15 tests. All 10 length→pin mappings from brief §2, plus punctuation + Unicode edge cases
- **timing.ts + test** — 14 tests. Base duration, all 3 punctuation classes, paragraph break, long-word cap (verified 27-char word clamps at 1.5×), punctuationPauses off

Integration wiring: typecheck revealed a bad import in vite.config.ts (`defineConfig` from `vite` doesn't know about `test` block). Fixed by switching to `vitest/config`. All tests pass.

## Deviations

- Timing agent noted one test case description was off by one character (`consequently-itis` is 17 chars not 16). Agent wrote the test to dynamically compute `cleanedLen` from the input so the assertion self-validates. Good defensive practice; accepting.
- Agents produced slightly more tests than the 10 minimum (13, 15, 14). Kept all — no cost beyond test file length.

## Verification

### Observable Truths
| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `npm run test` exits 0 | ✓ PASS | 42/42 tests pass |
| 2 | `npm run typecheck` exits 0 | ✓ PASS | clean |
| 3 | `npm run lint` exits 0 | ✓ PASS | clean |
| 4 | `npm run build` exits 0 | ✓ PASS | bundle unchanged from S01 (no app-code additions yet) |
| 5 | Reader-engine coverage ≥ 95% | ✓ PASS | 95.77% lines |
| 6 | `pinIndex('considered') === 4` | ✓ PASS | pin.test.ts parametrized row confirms |
| 7 | Punctuation multipliers applied | ✓ PASS | timing.test.ts cases 2–7 |
| 8 | Long-word cap at 1.5× | ✓ PASS | timing.test.ts case 11 |

### Artifacts
| File | Expected | Status |
|------|----------|--------|
| types.ts | 5 exports per spec | ✓ SUBSTANTIVE (101 lines) |
| tokenize.ts | Unicode-aware tokenizer | ✓ SUBSTANTIVE (92 lines) |
| pin.ts | 0-indexed pin with leading-punct handling | ✓ SUBSTANTIVE (35 lines) |
| timing.ts | Base + punct + long-word multipliers | ✓ SUBSTANTIVE (173 lines) |
| 3 test files | ≥ 10 tests each | ✓ SUBSTANTIVE (42 tests total) |

### Key Links
| From | To | Via | Status |
|------|----|----|--------|
| tokenize.ts | types.ts | `import type { ReaderToken }` | ✓ WIRED |
| timing.ts | types.ts | `import type { ReaderToken, ReaderSettings }` | ✓ WIRED |
| test files | source | `@/core/reader-engine/*` alias | ✓ WIRED |
| vitest | tokens.css / reset.css | jsdom environment | ✓ WIRED |

## Files Created/Modified

- `src/core/reader-engine/types.ts` (new)
- `src/core/reader-engine/tokenize.ts` (new)
- `src/core/reader-engine/pin.ts` (new)
- `src/core/reader-engine/timing.ts` (new)
- `tests/unit/reader-engine/tokenize.test.ts` (new)
- `tests/unit/reader-engine/pin.test.ts` (new)
- `tests/unit/reader-engine/timing.test.ts` (new)
- `vite.config.ts` — switched to `vitest/config`, added test block
- `tsconfig.json` — added `tests` to include, `vitest/globals` to types
- `package.json` — added test scripts, vitest + coverage + jsdom devDeps
