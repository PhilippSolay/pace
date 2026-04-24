# M001: Pace v1 — Installable PWA RSVP Reader MVP

**Vision:** Ship a mobile-first installable PWA deployed at `pace.solay.cloud` where a user can paste or upload a text, open it in the Reader (RSVP with pin-at-midpoint anchor), control play/pause and speed, resume across sessions, adjust every setting in brief §12 live, finish the text, and see a completion summary. Installable from Safari/Chrome with Web Share Target integration.

**Success Criteria:**
- User on iOS Safari 16.4+ or Android Chrome can open `pace.solay.cloud`, walk the Welcome anonymously, paste a long-form essay or upload a text PDF, read it at 350 WPM with correct pin placement, pause/resume across browser restarts, adjust every setting in brief §12 live, finish the text, and see accurate completion stats.
- Add-to-home-screen produces an installed PWA that launches standalone.
- Share Sheet from Safari/Chrome can send plain text or a PDF to Pace via Web Share Target.
- Lighthouse PWA audit ≥ 90; Performance ≥ 85 on Moto G4 throttle.
- Zero runtime deps outside: react, react-router-dom, dexie, zustand, pdfjs-dist.
- Deployed via Docker + Traefik on the VPS at `76.13.192.55`, HTTPS via Let's Encrypt.

---

## Slices

- [x] **S01: Scaffold + Design System + Router** `risk:low` `depends:[]` *(done 2026-04-24 — see S01-SUMMARY.md)*
  > After this: `npm run dev` serves an installable app shell with design-system tokens wired, Google Fonts loading, PWA manifest generated, React Router with stub routes for Welcome / Library / Reader / Settings / Completion. (`/_ds` specimen route dropped per scope trim — tokens proven through real-route use.)

- [x] **S02: Reader Engine + Reader View** `risk:high` `depends:[S01]` *(done 2026-04-25 — see S02-SUMMARY.md)*
  > After this: `/reader` plays the hardcoded Marcus Aurelius passage at 350 WPM with correct pin placement, glow, and guide lines; tap toggles play/pause; swipe left/right jumps ±5 words. (Brief Phase 1 exit criteria.)

- [x] **S03: Welcome + Library + Paste + Persistence** `risk:medium` `depends:[S02]` *(done 2026-04-25 — see S03-SUMMARY.md)*
  > After this: first visit shows Welcome (all 3 buttons route to anonymous-start per D022); on second visit Welcome is skipped; paste a text from the New Reading sheet; it appears in Library with meta; tap to read; reload the page; resume from the last word.

- [ ] **S04: PDF Upload + Text Processing** `risk:medium` `depends:[S03]`
  > After this: pick a text-based PDF via the New Reading sheet; it parses (pdfjs-dist), de-hyphenates line breaks, strips repeated headers/footers and page numbers, saves to Library, and reads correctly. Scanned-PDF rejection shows a user-friendly error.

- [ ] **S05: Standalone Settings Screen + In-Session Drawer** `risk:low` `depends:[S02, S03]`
  > After this: Library gear opens Settings with all sections (§6.7); reader bottom-edge swipe opens a two-knob drawer (speed, size, pin color); all preferences persist live to Dexie and apply immediately.

- [ ] **S06: Completion + Haptics + Accessibility** `risk:low` `depends:[S02]`
  > After this: finishing a text auto-transitions to the Completion screen showing Pace/Time/Words/Text stats; `navigator.vibrate` fires on play/pause/paragraph/finish where supported; `prefers-reduced-motion` disables glow + paragraph fade + non-completion haptics; screen-reader fallback reads the full text via `SpeechSynthesisUtterance`.

- [ ] **S07: PWA Install + Share Target + Deploy** `risk:medium` `depends:[S03, S04]`
  > After this: installable to home screen on iOS Safari + Android Chrome with correct icons; shared text or PDF from another app lands in the Paste/PDF flow via Web Share Target; Dockerfile + nginx.conf + Traefik compose entry deployed to `pace.solay.cloud`; HTTPS via Let's Encrypt; first Lighthouse run ≥ 90 on PWA + ≥ 85 on Performance.

---

## Boundary Map

### S01 → S02
Produces:
  `package.json` + `vite.config.ts` → Vite 5 + React 18 + TS strict + vite-plugin-pwa
  `index.html` → Google Fonts link + root div
  `src/main.tsx` → React root + Router
  `src/app/App.tsx` + `src/app/routes/*.tsx` → route stubs
  `src/design-system/tokens.css` → all 11 color vars + font vars + 5 radius vars + spacing scale
  `src/design-system/reset.css`
  `src/design-system/components/Eyebrow.tsx`
  `src/design-system/components/Slider.tsx`
  `src/design-system/components/Toggle.tsx`
  `src/design-system/components/Wordmark.tsx` → "Pace." with accent italic period
  `public/manifest.webmanifest` (via plugin) + icon placeholders
  `/_ds` route → specimen page (throwaway, kept during dev)

Consumes: nothing (leaf node)

### S02 → S03, S05, S06, S07
Produces:
  `src/core/reader-engine/types.ts` → `ReaderToken` interface + engine config types
  `src/core/reader-engine/tokenize.ts` → `tokenize(text: string): ReaderToken[]`
  `src/core/reader-engine/pin.ts` → `pinIndex(word: string): number`
  `src/core/reader-engine/timing.ts` → `computeDuration(token, settings): number`
  `src/core/reader-engine/engine.ts` → `ReaderEngine` class with play/pause/seek/jump/onFinish
  `src/core/reader-engine/store.ts` → Zustand store wrapping a ReaderEngine instance
  `src/design-system/components/ReaderWord.tsx`
  `src/design-system/components/GuideLines.tsx`
  `src/features/reader/ReaderView.tsx` → the full reader surface
  `src/features/reader/GestureLayer.tsx` → pointer-event wrapper for tap + swipe
  `src/core/reader-engine/samples.ts` → hardcoded Marcus Aurelius passage (dev only)

Consumes from S01: design-system tokens, Router

### S03 → S04, S05, S06, S07
Produces:
  `src/core/persistence/schema.ts` → `PaceDB` Dexie instance + `ReadingText` + `ReadingSession` + `UserPreferences` interfaces
  `src/core/persistence/texts.ts` → `createText, updateText, deleteText, listTexts, getText, updateProgress` repository
  `src/core/persistence/preferences.ts` → `getPreferences, setPreference` with singleton row management
  `src/core/persistence/sessions.ts` → `startSession, endSession` helpers
  `src/features/welcome/WelcomeView.tsx`
  `src/features/library/LibraryView.tsx` — live query via `useLiveQuery`
  `src/features/library/ContinueCard.tsx`
  `src/features/library/TextRow.tsx` — swipe-to-delete via pointer events
  `src/features/library/Fab.tsx`
  `src/features/new-reading/NewReadingSheet.tsx`
  `src/features/new-reading/PasteTextView.tsx`
  First-run routing in `App.tsx`: if `!preferences.hasCompletedWelcome`, push `/welcome`

Consumes from S01, S02: design-system, ReaderEngine store, routes

### S04 → S07
Produces:
  `src/core/text-processing/pdf.ts` → `extractText(file: File): Promise<string>` using pdfjs-dist
  `src/core/text-processing/clean.ts` → de-hyphenation, header/footer detection, page-number removal
  `src/features/new-reading/PdfImportFlow.tsx` → hidden file input + progress UI + error surfaces
  Web Worker bundling for pdf.js configured in `vite.config.ts`

Consumes from S03: `createText`, `ReadingText` schema

### S05 → S06, S07
Produces:
  `src/features/settings/SettingsView.tsx` → full §6.7 screen
  `src/features/settings/FontPicker.tsx` → bottom-sheet picker of reader fonts
  `src/features/settings/ColorPicker.tsx` → hex + swatch
  `src/features/settings/PreviewTile.tsx` → live reader-word preview
  `src/features/reader/SettingsDrawer.tsx` → mid-session drawer (speed/size/pin color only)
  `src/features/settings/ExportLibrary.tsx` → JSON download button
  `src/features/settings/ClearAllData.tsx` → destructive with confirm

Consumes from S02, S03: engine settings, `UserPreferences` schema, preferences repo

### S06 → S07
Produces:
  `src/features/completion/CompletionView.tsx` → stats + Library/Read-again actions
  `src/core/haptics/haptics.ts` → `haptics.soft/medium/rigid` with reduce-motion respect
  `src/core/accessibility/speech.ts` → `SpeechSynthesisUtterance` fallback
  `src/core/accessibility/reduce-motion.ts` → `useReduceMotion` hook

Consumes from S02, S03: engine `onFinish`, `ReadingSession` for stats

### S07 → (ship)
Produces:
  `public/icons/` → 192 / 512 / maskable / apple-touch
  `manifest.webmanifest` additions: `share_target` declaration
  `sw.ts` → Workbox service worker extension (share target handler)
  `/share` route component that reads the SW-cached payload and routes to paste or PDF flow
  `Dockerfile` → node:20-alpine build stage + nginx:1.27-alpine serve stage
  `nginx.conf` → SPA fallback, long-cache for `/assets/*`, no-cache for `index.html` + `sw.js`
  `compose.yml` → Traefik-labeled service for `pace.solay.cloud`
  `DEPLOY.md` → local build → `docker save` → `ssh root@76.13.192.55` → `docker load` → `docker compose up -d`

Consumes from all prior slices

---

## Execution Notes

- New work happens on branch `gsd/M001/S01-web` (avoids collision with the orphan iOS `gsd/M001/S01` branch)
- Must-haves per task are observable: static (file exists / export present), command-runnable (`npm run build` exits 0, `npm run test` passes), or behavioral (`npm run dev` flow works in a real browser)
- Interactive verification uses `/browse` (gstack) or user-driven mobile testing on `pace.solay.cloud` once deployed
- Accessibility check uses Lighthouse CI locally in S07
