# T04: ReaderView + GestureLayer + route wiring

**Slice:** S02
**Milestone:** M001

## Goal

Wire T01 engine + T02 store + T03 components into the `/reader` route with a hand-rolled gesture layer. Slice exits when the user can tap/swipe the stage and observe correct behavior.

## Must-Haves

### Truths
- `npm run dev` → open `/reader` → a paused "Meditations" word 1 appears with pin highlighting
- Tap stage → playback starts, words cycle at 350 WPM
- Tap again → pauses; current word stays visible
- Swipe left → jumps back 5 tokens
- Swipe right → jumps forward 5 tokens
- Swipe up from the bottom third → dispatches `onSettingsRequest` event (placeholder; the real drawer lands in S05)
- Reaching the final token triggers a console.log "finished" message (Completion-screen transition is S06)

### Artifacts
- `src/features/reader/GestureLayer.tsx` — Pointer Events → `{ onTap, onSwipeLeft, onSwipeRight, onSwipeUp }` callbacks
- `src/features/reader/ReaderView.tsx` — composes engine store + GestureLayer + ReaderWord + GuideLines + top overlays + bottom progress bar
- `src/app/routes/Reader.tsx` — replace S01 stub with `<ReaderView />`

### Key Links
- `ReaderView` → `useReaderStore` from T02 store
- `ReaderView` → `<ReaderWord>`, `<GuideLines>` from T03
- `ReaderView` → `<GestureLayer>` callbacks → store actions
- Reader route → `<ReaderView>`

## Steps

1. Write `GestureLayer.tsx`:
   - `onPointerDown` records start `(x, y, t)`
   - `onPointerUp` computes `dx`, `dy`, `dt`
   - Tap: `dt < 250ms`, `|dx| < 10`, `|dy| < 10` → `onTap()`
   - Swipe left: `dx < -40`, `|dy| < 40`, `dt < 500ms` → `onSwipeLeft()`
   - Swipe right: `dx > 40`, `|dy| < 40`, `dt < 500ms` → `onSwipeRight()`
   - Swipe up from bottom 30%: `dy < -40`, `|dx| < 40`, `dt < 500ms`, start-y > `0.7 * height` → `onSwipeUp()`
   - `touch-action: none` on the wrapper so browser doesn't steal gestures
2. Write `ReaderView.tsx`:
   - On mount: `initEngine(tokenize(MARCUS_AURELIUS_PASSAGE), defaultSettings)`
   - On unmount: `engine.destroy()`
   - Render `<div>` fullscreen with `background: var(--reader)`
   - Top-left "tap · pause" hint (mono, `--ink-3`, only shown on initial idle)
   - Top-right remaining time — compute from `(tokens.length - index) / wpm` in MM:SS
   - Center: if paragraph break → show ¶ glyph at 25% opacity briefly; else `<ReaderWord>` + `<GuideLines>`
   - Bottom: 2 px accent progress bar, width = `(index / tokens.length) * 100%`
   - `<GestureLayer>` wrapping the stage, wired to store actions
3. Update `src/app/routes/Reader.tsx` to import and render `<ReaderView />` (drop the S01 stub)
4. Run `npm run dev` on port 5199, manually verify the core loop in a real browser (iPhone viewport in DevTools) — minimum: tap starts, tap pauses, swipe-left jumps back
5. Run `npm run typecheck` / `lint` / `build` — all clean
6. Commit + T04-SUMMARY

## Context

- `touch-action: none` is required on the gesture wrapper; without it, iOS Safari consumes the swipe for back-navigation or scroll
- Keep the GestureLayer dumb — it only emits events. The decision logic (what +5 means in the store) lives in the store actions
- Paragraph-break ¶ glyph is optional in S02 (T02 already paces the pause via timing.ts). Polish visual can slip to S06
- `onSettingsRequest` is a placeholder — the drawer UI lands in S05. S02 just proves the gesture hooks are wired
- Finish path: wire `engine.onFinish(() => console.log('finished'))` in ReaderView's initEngine call. Real transition is S06.

## Manual Verification Checklist (before committing)
- [ ] Open `/reader` on mobile viewport
- [ ] Paused word 1 shown
- [ ] Tap → playback starts, words cycle
- [ ] Tap → pauses
- [ ] Swipe left → jumps back
- [ ] Swipe right → jumps forward
- [ ] Swipe up (from bottom) → console logs "settings requested"
- [ ] Let it play to the end → console logs "finished"
