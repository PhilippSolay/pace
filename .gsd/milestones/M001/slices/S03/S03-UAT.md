# S03 · Non-blocking User Acceptance Test

Scope: verify the paste → Library → read → resume loop before S04. Non-blocking — S04 planning doesn't wait.

## Setup

```sh
npm run dev -- --port 5199
# Open http://localhost:5199/ in an incognito/private window to start fresh
```

Or use Chrome DevTools → Application → IndexedDB → `pace` → "Delete database" to reset without closing the window.

## Checks

### 1. First-run flow

1. Fresh session → `/` redirects nowhere (you start at Welcome)
2. **Expected layout:** wordmark "Pace" (accent italic period), subtitle "Read one word at a time.", 3-dot meta row "FOCUSED · NO STREAKS · LOCAL-FIRST", 3 buttons, legal footer
3. Tap any button (including "Use without an account")
4. **Expected:** navigates to `/library`, empty state: "Nothing to read yet." + "Add your first text" accent button + FAB
5. Reload the page → Welcome is NOT shown again (goes straight to Library)

### 2. Paste flow

1. Tap the FAB (bottom-right `+`) or "Add your first text"
2. **Expected:** New Reading sheet slides up with Paste / Upload PDF / From a URL
3. Tap "Paste text"
4. **Expected:** Full-screen paste view with Cancel / Start reading buttons, title input, token counter
5. Paste any long essay (20+ words) — e.g. copy some paragraphs from Wikipedia
6. **Expected:** Token counter updates live; "Start reading" disabled until ≥ 20 words, then becomes accent
7. Optional: type a title; if blank, first line becomes the title at save time
8. Tap Start reading
9. **Expected:** navigates to `/reader/<new-uuid>` and starts on word 0 of the pasted text

### 3. Reading + progress persistence

1. In Reader: tap to play
2. Let 20–30 words cycle
3. Tap to pause
4. Navigate back to `/library` (swipe-down-from-top gesture, or swipe-down then URL back)
5. **Expected:** Library shows the Continue-reading card at the top with a gradient background, accent-color "CONTINUE READING" eyebrow, the title in display font, progress bar filled proportionally, and "X% · Y MIN LEFT" meta
6. Tap the Continue card → returns to Reader at the exact word you paused on
7. Reload the browser (cmd-R / refresh)
8. **Expected:** opens at Library (first-run gate says hasCompletedWelcome=true)
9. Tap the Continue card → Reader resumes at the same word

### 4. Swipe-to-delete

1. In Library with multiple texts: swipe a row from right to left
2. **Expected:** Delete button reveals (accent background, "Delete" white text)
3. Tap Delete → row disappears; live-query updates automatically

### 5. Settings gear (stub)

1. Tap the gear icon in the Library header
2. **Expected:** navigates to `/settings` — S01 stub "SETTINGS · TBD" (S05 replaces this)

### 6. Reader error path

1. Manually visit `/reader/nonexistent-id`
2. **Expected:** "This text is empty or could not be loaded." + "Back to Library" button

### 7. Unit tests

```sh
npm run test           # 75 pass
npm run test:coverage  # persistence + reader-engine both ≥ 95%
```

## Reporting issues

File fixes as tasks on `gsd/M001/S03-fix` or note them in the S04 planning discussion.
