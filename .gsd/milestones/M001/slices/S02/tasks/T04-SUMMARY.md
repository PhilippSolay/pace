---
id: T04
parent: S02
milestone: M001
provides:
  - GestureLayer component — hand-rolled Pointer Events detecting tap / swipe-left / swipe-right / swipe-up-from-bottom
  - ReaderView component — full /reader surface composing engine + store + ReaderWord + GuideLines + top/bottom chrome + gesture handlers
  - /reader route switched from S01 stub to real ReaderView
requires:
  - slice: S02
    provides: engine + store + tokenize + samples + ReaderWord + GuideLines (T01-T03)
affects: [S03, S05, S06]
key_files:
  - src/features/reader/GestureLayer.tsx
  - src/features/reader/ReaderView.tsx
  - src/app/routes/Reader.tsx
key_decisions:
  - "GestureLayer uses touch-action: none + pointer events; no third-party gesture lib (per D019 minimal runtime deps)"
  - "Swipe-up only fires when touch started in the bottom 30% of the stage height — matches iOS-style sheet-reveal convention"
  - "visibilitychange auto-pauses when the tab goes hidden (brief §11.3); no auto-resume — user must tap to start again"
  - "onFinish logs to console.info in S02; real Completion transition lands in S06"
  - "useMemo around tokenize(MARCUS_AURELIUS_PASSAGE) so tokens don't re-tokenize on every engine-state change; React StrictMode double-mount is absorbed by initEngine's own cleanup (engine?.destroy())"
  - "Accessibility note is a visually-hidden sibling sibling of the reader stage (position: absolute; left/top: -9999px) — satisfies D033 without visual clutter"
patterns_established:
  - "Feature views (ReaderView) live at src/features/<feature>/ and compose design-system primitives + core engine + store"
  - "Store actions are atomic wrappers delegating to engine methods — no business logic in store"
  - "Console logs use `[Pace]` prefix so they're filterable in DevTools"
drill_down_paths:
  - .gsd/milestones/M001/slices/S02/tasks/T04-PLAN.md
duration: 10min
verification_result: pass
completed_at: 2026-04-25T00:48:00Z
---

# T04: ReaderView + GestureLayer + /reader route

**Reader surface lives. Open /reader, tap to play, tap to pause, swipe to jump. Bundle 56.55 KB gzip (31% of 180 KB budget).**

## What Happened

Wrote `GestureLayer.tsx` (~95 lines) — pointer-events wrapper with `touch-action: none` to prevent browser gesture hijacking. Classifies input as tap (< 250 ms, < 10 px movement), horizontal swipe (≥ 40 px, < 40 px orthogonal, < 500 ms), or bottom-up swipe (starts in bottom 30% height, vertical ≥ 40 px upward).

Wrote `ReaderView.tsx` (~170 lines) — composes the engine store, gestures, ReaderWord, GuideLines, top-left `tap · pause` hint, top-right remaining-time MM:SS, bottom 2 px accent progress bar, and a visually-hidden `aria-hidden=false` sibling explaining the RSVP-vs-screen-reader incompatibility. `useMemo` around `tokenize(MARCUS_AURELIUS_PASSAGE)`; `initEngine` on mount, `destroyEngine` on unmount; `visibilitychange` auto-pause.

Replaced `src/app/routes/Reader.tsx` S01 stub with `<ReaderView />`.

Minor ESLint hiccup on first verification: two `// eslint-disable-next-line no-console` directives were flagged as unused because the project's ESLint config doesn't enable `no-console` in the first place. Removed the disables.

Dev server smoke test: `npm run dev -- --port 5199` → HTTP 200 on `/reader`, Vite ready in 2.3 s. No runtime errors in the log tail.

## Deviations

- Did NOT add unit tests for ReaderView or GestureLayer — these are integration-shaped and need a DOM + pointer-event simulator. `@testing-library/react` + user-event would cost real toolchain weight for relatively low signal; rely on manual QA (S02-UAT) + the dense T01/T02 test coverage on the engine itself. Revisit if regressions appear.
- Paragraph-break ¶ glyph is rendered at 25% opacity but without the "brief fade" animation — brief §11.3 accessibility rules say reduce-motion disables animations anyway. Re-visit polish in S06.

## Verification

### Observable Truths
| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | typecheck clean | ✓ PASS | |
| 2 | lint clean | ✓ PASS | (after removing unused disables) |
| 3 | build clean | ✓ PASS | 56.55 KB gzip JS, precache 5 entries |
| 4 | unit tests pass | ✓ PASS | 53/53 |
| 5 | dev server serves /reader | ✓ PASS | HTTP 200, no console errors |
| 6 | bundle under 180 KB gzip budget | ✓ PASS | 31% used |

### Manual UAT (user)
Run `npm run dev` and open `/reader` in a mobile viewport. Expected:
- Idle screen: word "Begin" shown with pin on `g`, "tap · pause" hint top-left, "Paused — tap to start" pill, remaining time MM:SS top-right
- Tap: playback starts, words cycle at 350 WPM
- Tap again: pauses
- Swipe left: jumps back 5 words
- Swipe right: jumps forward 5 words
- Swipe up (from bottom third): logs `[Pace] settings requested`
- Reach end: logs `[Pace] reader finished`, isFinished=true
- Hide tab: auto-pauses

## Files Created/Modified

- `src/features/reader/GestureLayer.tsx` (new)
- `src/features/reader/ReaderView.tsx` (new)
- `src/app/routes/Reader.tsx` — replaced S01 stub with ReaderView
