# S02: Reader Engine + Reader View

**Goal:** The core reading surface works. Tap `/reader` → a hardcoded Marcus Aurelius passage plays at 350 WPM with the pin rendered at `ceil(length ÷ 2)`, tap toggles play/pause, swipe left/right jumps ±5 words, swipe up reveals a (placeholder) settings drawer trigger.

**Demo (slice exit):** Open `http://localhost:5173/reader` in a mobile-sized viewport (iPhone 14 / 390 × 844). Tap the stage. Words cycle. Pin character renders in accent color, glow on, guide lines on. Current-word timing respects `. ! ?` at 2.3× and `, ; :` at 1.55×. Swipe left: word jumps back 5. Swipe right: word jumps forward 5. Final word triggers `onFinish` (wired to console.log in S02; Completion screen lands in S06).

## Must-Haves

### Core engine (framework-agnostic, pure where possible)
- `src/core/reader-engine/types.ts` — `ReaderToken`, `ReaderSettings`, `ReaderEngineState` interfaces
- `src/core/reader-engine/tokenize.ts` — `tokenize(text: string): ReaderToken[]` with Unicode-aware splitting, paragraph-break detection, em-dash handling
- `src/core/reader-engine/pin.ts` — `pinIndex(word: string): number` returning 0-indexed position within original word (skipping leading punctuation)
- `src/core/reader-engine/timing.ts` — `computeDuration(token, settings): number` (ms) with base WPM + punctuation multipliers + long-word stretch
- `src/core/reader-engine/engine.ts` — `ReaderEngine` class with `play() / pause() / seek(index) / jump(delta) / reset()` and an `onChange` / `onFinish` event model
- `src/core/reader-engine/store.ts` — Zustand store exposing `{ index, isPlaying, word, progress, settings }` + thin action wrappers calling the engine
- `src/core/reader-engine/samples.ts` — hardcoded Marcus Aurelius passage (dev only; deleted in S03 once Library lands)

### Components (design-system layer)
- `src/design-system/components/ReaderWord.tsx` — renders a word with pin character in accent color, optional glow, size prop
- `src/design-system/components/GuideLines.tsx` — two 1 × 22 px bars positioned to the measured pin-glyph width, `useLayoutEffect` for measurement

### Feature (Reader surface)
- `src/features/reader/ReaderView.tsx` — full `/reader` surface with engine connected, top hint + remaining-time, bottom progress bar
- `src/features/reader/GestureLayer.tsx` — pointer-events wrapper detecting tap, swipe-left, swipe-right, swipe-up; no third-party deps

### Integration
- `src/app/routes/Reader.tsx` — replace the S01 stub with `<ReaderView />`

### Tests (Vitest — now installed)
- `tests/unit/reader-engine/tokenize.test.ts` — ≥ 8 cases covering empty input, single word, punctuation attached, em-dash standalone, paragraph breaks, unicode
- `tests/unit/reader-engine/pin.test.ts` — all 9 length→pin mappings from brief §2, plus leading/trailing punctuation, unicode letters
- `tests/unit/reader-engine/timing.test.ts` — base duration math, each punctuation multiplier, paragraph break, long-word cap, `punctuationPauses: false`
- `tests/unit/reader-engine/engine.test.ts` — play/pause/seek/jump using Vitest fake timers

**Intentionally NOT in S02** (deferred to later slices):
- Completion-screen transition — S06
- Settings drawer contents — S05 (S02 only exposes the up-swipe gesture hook)
- Haptics on play/pause — S06
- Resume-position persistence — S03 (needs Dexie)
- Font-size / background-color / pin-color settings from UserPreferences — S05
- Paragraph-break ¶ glyph fade — S06 polish

## Tasks

- [x] **T01: Core engine pure modules + tests** *(done — T01-SUMMARY.md)*
  Install Vitest + configure. Write `types.ts`, `tokenize.ts`, `pin.ts`, `timing.ts` as pure functions. Write full unit tests for each. Exit: `npm run test` passes, 0 failing, coverage > 95% on these 4 files.

- [x] **T02: ReaderEngine class + Zustand store** *(done — T02-SUMMARY.md)*
  Install Zustand. Write `engine.ts` — class wrapping the pure modules, timer via `setTimeout` with cancel tokens, event emitter for index changes + onFinish. Write `store.ts` — Zustand slice exposing reactive view of engine state. Unit-test engine with fake timers.

- [x] **T03: ReaderWord + GuideLines + sample text** *(done — T03-SUMMARY.md)*
  Write `ReaderWord.tsx` matching brief §7.5 (absolute-positioned left/pin/right spans + optional glow). Write `GuideLines.tsx` with measured pin-width via `useLayoutEffect`. Write `samples.ts` with a ~300-word Marcus Aurelius passage.

- [x] **T04: ReaderView + GestureLayer + route wiring** *(done — T04-SUMMARY.md)*
  Write `GestureLayer.tsx` — hand-rolled Pointer Events detecting tap / swipe-left / swipe-right / swipe-up. Write `ReaderView.tsx` using the store + components. Replace the S01 stub at `src/app/routes/Reader.tsx` with `<ReaderView />`. Smoke-test in a real browser.

## Files Likely Touched

- `src/core/reader-engine/{types,tokenize,pin,timing,engine,store,samples}.ts` (new)
- `src/design-system/components/{ReaderWord,GuideLines}.tsx` (new)
- `src/features/reader/{ReaderView,GestureLayer}.tsx` (new)
- `src/app/routes/Reader.tsx` (rewrite from S01 stub)
- `tests/unit/reader-engine/*.test.ts` (new)
- `package.json` (add vitest + zustand)
- `vite.config.ts` (vitest config)
- `vitest.setup.ts` or similar (optional — only if needed)

## Risks

- **Timer accuracy on throttled browsers** — iOS Safari throttles `setTimeout` aggressively when a page isn't focused. Mitigation: `visibilitychange` → auto-pause (spec'd in brief §11.3, implement in S02 T02). Non-focus timing isn't a real concern since reader requires focus by definition.
- **Guide-line measurement race** — `useLayoutEffect` runs after DOM mount but before paint. If fonts haven't loaded yet, the measurement is wrong. Mitigation: await `document.fonts.ready` in a ref-captured effect before committing measured width. Fallback to `size * 0.35` (from the handoff's reader.jsx) is acceptable if fonts fail.
- **Gesture conflicts with browser pull-to-refresh / back-swipe** — partially mitigated by `overscroll-behavior: none` in reset.css (S01). Back-swipe on iOS Safari will still trigger if you start at the left edge; accept as a known limitation and document in S02 summary.
- **`exactOptionalPropertyTypes`** makes engine API tricky (e.g. `ReaderSettings` optional fields). Accept the friction; use `Partial<>` with full defaults at the engine boundary.
