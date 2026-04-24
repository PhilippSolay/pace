# T02: ReaderEngine class + Zustand store

**Slice:** S02
**Milestone:** M001

## Goal

Wrap the pure T01 modules in a stateful `ReaderEngine` class with timer control and events, then expose it via a Zustand store for React consumers.

## Must-Haves

### Truths
- `new ReaderEngine(tokens, settings).play()` cycles through tokens at the specified WPM ±20 ms
- Calling `pause()` mid-play immediately cancels the pending timeout
- `jump(+5)` advances the index by 5; `jump(-5)` retreats by 5 (clamped to bounds)
- `seek(7)` sets index to 7; if playing, reschedules for the new token
- `onFinish` callback fires when the last token completes
- Zustand store reflects engine state reactively in React components (tested via a small render test)

### Artifacts
- `src/core/reader-engine/engine.ts` — `ReaderEngine` class (≥ 80 lines)
- `src/core/reader-engine/store.ts` — Zustand store (≥ 40 lines)
- `tests/unit/reader-engine/engine.test.ts` — timer-based tests using `vi.useFakeTimers()`
- `package.json` — adds `zustand` dep

### Key Links
- `engine.ts` → imports from `tokenize`, `pin` (for render), `timing` — T01 contracts
- `store.ts` → imports `ReaderEngine`, creates singleton or per-instance store

## Steps

1. `npm install zustand`
2. Write `engine.ts`:
   - Private `timeoutId` field
   - `play()`: guard if already playing; set `isPlaying = true`; `scheduleNext()`
   - `pause()`: clear timeout; `isPlaying = false`; emit change
   - `scheduleNext()`: computeDuration(current), setTimeout(() => { advance; scheduleNext(); }, ms)
   - `advance()`: `index += 1`; emit; if `index >= tokens.length` → `onFinish`; stop
   - `seek(i)`: clamp to [0, tokens.length - 1]; if playing, cancel + reschedule
   - `jump(delta)`: `seek(index + delta)`
   - `reset()`: seek(0); pause
   - `destroy()`: cancel timer, clear listeners
   - Event subscription: `onChange((state) => void)`, `onFinish(() => void)` — array-of-listeners pattern
3. Write `store.ts`:
   - `useReaderStore = create((set) => ({ engine: null, index: 0, isPlaying: false, totalTokens: 0, progress: 0, word: '', initEngine, play, pause, jump, seek }))`
   - `initEngine(tokens, settings)` constructs a new `ReaderEngine`, subscribes to its change events, pipes state into the store
4. Write `tests/unit/reader-engine/engine.test.ts`:
   - `vi.useFakeTimers()` setup + cleanup
   - play/pause toggles isPlaying
   - advance happens after computed duration
   - pause mid-sequence cancels pending
   - jump clamps at bounds
   - onFinish fires at end
5. `npm run test` — expect new tests pass + existing T01 tests pass
6. `npm run typecheck` / `lint` / `build` — expect all clean
7. Commit + T02-SUMMARY

## Context

- Brief §7.4 shows a reference implementation — follow the shape, adjust for TS strict mode
- `exactOptionalPropertyTypes` means `onFinish?: () => void` needs `{ onFinish: undefined }` or omission, not both forms. Use a constructor-options interface with all fields defined.
- Zustand 4.x — use `create<T>()(set => ...)` for inferred types
- Don't block on tests having perfect ±20 ms timing — fake timers are exact; real-world accuracy is verified manually in T04
