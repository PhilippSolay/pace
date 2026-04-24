# S03: Welcome + Library + Paste + Persistence

**Goal:** First visit shows Welcome (any button starts anonymous). Library shows pasted texts with live-query. Paste a text → it appears in Library → tap to read → close browser → reopen → resume from the last word.

**Demo (slice exit):**
1. Open a fresh browser session to `/` → Welcome renders
2. Tap any "Continue" button → routed to `/library` (empty state)
3. Tap `+` FAB → New Reading sheet opens
4. Tap "Paste text" → Paste Text view
5. Paste a long essay → "Start reading" enables at ≥ 20 words
6. Tap "Start reading" → `/reader/:id` plays the pasted text
7. Pause mid-read, navigate back to Library → the text appears with a Continue-reading card showing progress
8. Close and reopen the browser → Library still has the text → tap it → Reader resumes at the last token

## Must-Haves

### Persistence layer
- `src/core/persistence/schema.ts` — `PaceDB` Dexie instance + `ReadingText`, `ReadingSession`, `UserPreferences` interfaces
- `src/core/persistence/texts.ts` — `createText, getText, listTexts, updateText, deleteText, updateProgress`
- `src/core/persistence/preferences.ts` — `getPreferences, setPreference, resetPreferences` (singleton row)
- `src/core/persistence/sessions.ts` — `startSession, endSession` (thin helpers)
- `tests/unit/persistence/*.test.ts` — fake-indexeddb tests for each repo

### Features
- `src/features/welcome/WelcomeView.tsx` — matches design handoff welcome.jsx; all 3 buttons call `markWelcomeComplete` + navigate to `/library`
- `src/features/library/LibraryView.tsx` — `useLiveQuery` over texts, composes ContinueCard + TextRow + Fab
- `src/features/library/ContinueCard.tsx` — shown when any text has `0 < progress < 1`
- `src/features/library/TextRow.tsx` — title + meta row + thin progress bar; swipe-left reveals Delete
- `src/features/library/Fab.tsx` — floating `+` button
- `src/features/new-reading/NewReadingSheet.tsx` — bottom-sheet over Library backdrop
- `src/features/new-reading/PasteTextView.tsx` — TextEditor with 20-word validation

### Routing + integration
- `src/app/routes/Welcome.tsx` — replace S01 stub with `<WelcomeView />`
- `src/app/routes/Library.tsx` — replace S01 stub with `<LibraryView />`
- `src/app/routes/NewReading.tsx` — replace S01 stub with `<NewReadingSheet />`
- `src/app/routes/Reader.tsx` — read `:id` param, look up text in Dexie, pass tokens to engine store (drops MARCUS_AURELIUS_PASSAGE dep)
- `src/app/App.tsx` — first-run gate: if `!preferences.hasCompletedWelcome`, redirect `/` (except if already on `/`)
- `src/core/reader-engine/samples.ts` — deleted

### Progress persistence
- Reader's `useEffect(() => { updateProgress(id, index) }, [id, index])` writes the current token index to the text row on every change (debounced to ~200 ms to avoid hammering IndexedDB)

**Intentionally NOT in S03:**
- PDF upload → S04
- Standalone Settings screen → S05
- Completion screen → S06
- Share Target → S07
- Haptics on swipe-delete → S06
- Empty-state illustrations beyond basic copy → S07 polish

## Tasks

- [ ] **T01: Persistence layer (Dexie schema + 3 repos + tests)** — 4 agents in parallel
- [ ] **T02: Welcome view + first-run gate**
- [ ] **T03: Library + ContinueCard + TextRow + Fab** — 4 agents in parallel
- [ ] **T04: NewReadingSheet + PasteTextView + /reader Dexie integration**

## Files Likely Touched

- `src/core/persistence/*.ts` (new)
- `src/features/welcome/WelcomeView.tsx` (new)
- `src/features/library/{LibraryView,ContinueCard,TextRow,Fab}.tsx` (new)
- `src/features/new-reading/{NewReadingSheet,PasteTextView}.tsx` (new)
- `src/app/routes/*.tsx` (rewrites)
- `src/app/App.tsx` (first-run gate effect)
- `src/core/reader-engine/samples.ts` (deleted)
- `src/features/reader/ReaderView.tsx` (accept tokens prop; no longer imports sample)
- `package.json` (adds `dexie`, `dexie-react-hooks`, devDep `fake-indexeddb`)
- `tests/unit/persistence/*.test.ts` (new)

## Risks

- **React StrictMode double-effects + IndexedDB writes** — first-run gate effect may run twice and create two preferences rows. Mitigate with a `.where('id').equals('singleton').first()` guard before the initial `.put()`.
- **SSR/hydration not relevant** (SPA), but live-query hooks should render a skeleton on first paint to avoid layout flash.
- **Progress-write debounce** on reader → chose 200 ms because IndexedDB writes are cheap on modern browsers and we want durability if the user backgrounds at any moment. Lower if QA surfaces perf issues.
- **Welcome screen's Apple/email buttons** — all route to `markWelcomeComplete + /library` in v1 (D022). No auth wiring in this slice.
