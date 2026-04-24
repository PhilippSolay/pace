# S02 · Non-blocking User Acceptance Test

Scope: verify the reader loop actually works before starting S03. Non-blocking — S03 planning doesn't wait.

## Setup

```sh
npm run dev -- --port 5199   # or default port if free
# open http://localhost:5199/reader in a mobile-sized browser window
#   (Chrome DevTools → Device Toolbar → iPhone 14, or real phone on LAN)
```

## Checks

### 1. Idle state

Navigate to `/reader`.

**Expected:**
- Dark stage (`--reader`), word **Begin** shown centered with pin on the `g` (4th letter, 0-indexed 3)
- Top-left: small mono uppercase `tap · pause` hint at low opacity
- Top-right: remaining time like `00:52` (depends on passage length ÷ WPM)
- Bottom-center pill: `Paused — tap to start`
- 2 px progress bar at the very bottom (0% filled initially)
- Guide lines: two thin 30%-white bars above and below the pin character

### 2. Play / pause via tap

Tap anywhere on the stage.

**Expected:**
- Hint fades out
- "Paused — tap to start" pill disappears
- Words cycle rapidly (350 WPM default → ~171 ms/word)
- Progress bar fills from left
- Top-right remaining time counts down

Tap again.

**Expected:**
- Cycling stops immediately
- Current word stays visible

### 3. Jump via swipe (horizontal)

With reader paused:
- Swipe left (drag from mid-screen to left edge quickly) → index jumps back 5 words
- Swipe right → index jumps forward 5 words

**Expected:**
- Progress bar width updates immediately
- Current word changes correspondingly

Try the same while playing — it should reschedule the next tick from the new position.

### 4. Settings swipe (placeholder)

Swipe up starting from the bottom third of the stage (your finger should start below the 70%-height line).

**Expected:**
- DevTools Console shows `[Pace] settings requested`
- The real drawer will land in S05; S02 just proves the gesture is wired

### 5. Paragraph break visual

Let the reader play through a paragraph boundary (the sample has 3 breaks around words 50, 120, 200).

**Expected:**
- At each break you see a large 48 px `¶` glyph at 25% opacity for 250 ms (`2.5× base` at default WPM)
- Then playback resumes with the next word

### 6. Finish

Let the reader play until the final word or jump to near the end and play out.

**Expected:**
- DevTools Console shows `[Pace] reader finished`
- State transitions to `isFinished: true` (use `useReaderStore.getState().isFinished` in Console to verify)
- No transition to Completion — that screen lands in S06

### 7. Auto-pause on tab hide

While playing, switch to another tab.

**Expected:**
- Playback pauses
- Coming back to the tab shows the same paused state — no auto-resume

### 8. Unit tests (headless)

```sh
npm run test
# expect: 53 passed (42 engine + 11 stateful engine)

npm run test:coverage
# reader-engine coverage ≥ 95%
```

## Reporting issues

If any check fails, file as a fix task under `gsd/M001/S02-fix` branch or call them out in the S03 planning conversation — S03 can incorporate fixes inline.
