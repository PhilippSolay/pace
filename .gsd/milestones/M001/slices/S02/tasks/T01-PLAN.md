# T01: Core engine pure modules + tests

**Slice:** S02
**Milestone:** M001

## Goal

Land the 4 pure-function modules that the `ReaderEngine` class will compose, plus full unit-test coverage, plus Vitest installed and configured.

## Must-Haves

### Truths
- `npm run test` exits 0 with all tests passing
- Coverage on the 4 core modules (tokenize/pin/timing/types) is ≥ 95% lines
- `npm run typecheck` and `npm run lint` remain clean
- `tokenize(' ')` returns `[]`; `tokenize('A B C')` returns 3 tokens with correct indices
- `pinIndex('cat')` returns 1; `pinIndex('the')` returns 1; `pinIndex('considered')` returns 5
- `computeDuration` applies the 2.3× / 1.55× multipliers and caps long-word at 1.5×

### Artifacts
- `src/core/reader-engine/types.ts` — exported interfaces
- `src/core/reader-engine/tokenize.ts` — pure function
- `src/core/reader-engine/pin.ts` — pure function
- `src/core/reader-engine/timing.ts` — pure function
- `tests/unit/reader-engine/tokenize.test.ts` — ≥ 8 tests
- `tests/unit/reader-engine/pin.test.ts` — ≥ 10 tests (all 9 lengths + edge cases)
- `tests/unit/reader-engine/timing.test.ts` — ≥ 8 tests
- `vitest.config.ts` or `vitest` block in `vite.config.ts` — jsdom environment, coverage enabled
- `package.json` — `test` + `test:coverage` scripts

### Key Links
- `types.ts` → consumed by tokenize, pin, timing (they all import `ReaderToken`, `ReaderSettings`)
- `timing.ts` → uses `pinIndex` from `pin.ts`? No — timing is independent of pin position
- `tokenize.ts` + `pin.ts` are leaf modules; `timing.ts` only depends on `types.ts`

## Steps

1. Install Vitest: `npm install -D vitest @vitest/coverage-v8 jsdom`
2. Configure vitest inside `vite.config.ts` (via reference-types workaround) or standalone `vitest.config.ts` — include `test: { environment: 'jsdom', globals: true, coverage: { provider: 'v8', include: ['src/core/reader-engine/**'] } }`
3. Add scripts: `test: vitest run`, `test:watch: vitest`, `test:coverage: vitest run --coverage`
4. Dispatch 4 parallel agents (see plan above) — types, tokenize, pin, timing — each with tests
5. Wait for agent results, verify each file exists and compiles
6. Run `npm run typecheck` — expect 0 errors
7. Run `npm run lint` — expect 0 errors
8. Run `npm run test` — expect all pass
9. Run `npm run test:coverage` — confirm ≥ 95% on the 4 modules
10. Commit + write T01-SUMMARY

## Context

**Reader-engine spec** from brief §7:

```ts
interface ReaderToken {
  text: string;              // "word," or "word." or "—"
  isParagraphBreak: boolean;
  index: number;             // position in token array
}

function tokenize(text: string): ReaderToken[];
function pinIndex(word: string): number;
function computeDuration(token: ReaderToken, settings: ReaderSettings): number; // ms
```

**Pin rule (§2 + §7.2):** `pinPosition(len) = ceil(len / 2)` 1-indexed → convert to 0-indexed; skip leading punctuation. Strip leading/trailing non-letter/non-digit before counting length.

**Timing (§7.3):**
- `baseMs = 60_000 / wpm`
- Trailing `.`, `!`, `?` → 2.3×
- Trailing `,`, `;`, `:`, `—`, `–` → 1.55×
- Paragraph break → 2.5× (no char — the token itself is the paragraph break)
- Long word: cleaned length > 12 → multiply by `1 + (len - 12) × 0.05`, capped at `1.5×`
- `punctuationPauses: false` → skip all punctuation multipliers

**Settings:**
```ts
interface ReaderSettings {
  wpm: number;                      // 150–800
  punctuationPauses: boolean;
  // font/color props live here too but don't affect duration — keep type accurate anyway
}
```

Each agent's brief should include the relevant excerpt + file path + full test list. Agents should NOT share state — each writes one file (or one source + one test file if given both responsibilities).
