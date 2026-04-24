# M001: Pace v1 — Milestone Summary

**Status:** ✓ COMPLETE 2026-04-25
**Started:** 2026-04-24
**Duration:** ~30 hours wall-clock across two days, heavy agent parallelism

## What Shipped

An installable PWA at `pace.solay.cloud` (pending DNS+deploy) where a user can:

1. Paste or upload a PDF → saved to a local Dexie library
2. Open any text → RSVP reader with pin rendered at `ceil(length / 2)`
3. Tap to play/pause, swipe ±5 words, swipe up for mid-session settings
4. Adjust WPM, font size, reader colors, pin color, glow, guide lines, punctuation pauses, haptics — all live, all persisted
5. Close the browser → reopen → Library shows continue-reading card → tap to resume from the last word
6. Finish a text → Completion screen with PACE/TIME/WORDS/TEXT stats + Read again / Library buttons
7. Share text/url from any app via Web Share Target → lands in paste view prefilled
8. Install to home screen from Safari/Chrome with wordmark icons

## Slices Landed (7/7)

| Slice | Squash | What it shipped |
|-------|--------|------------------|
| S01 | `b48047d` | Vite + React + TS strict scaffold, PWA plugin, 11 design tokens, Wordmark + Eyebrow primitives, 7-route BrowserRouter |
| S02 | `1b62ac4` | Reader engine (tokenize, pin, timing) + Zustand store + ReaderWord + GuideLines + GestureLayer + ReaderView. 53 unit tests. |
| S03 | `526b441` | Dexie persistence (3 tables, 3 repos), Welcome + FirstRunGate, Library with live-query + swipe-delete, New Reading sheet, Paste Text view, Reader loads from Dexie with progress persistence |
| S04 | `2c6ec58` | pdfjs-dist PDF parsing (lazy-loaded), de-hyphenation + header/footer + page-number cleaning, PdfImportFlow UI, scanned-PDF detection |
| S05 | `69c8b6b` | Full SettingsView with all sections (Reading/Appearance/Behavior/Data/About minus Account), in-session SettingsDrawer, reader consumes preferences live |
| S06 | `3feb981` | CompletionView with stats, haptics API (soft/medium/rigid/finish) respecting reduce-motion + haptics preference, session tracking, auto-transition on finish |
| S07 | `4558dbe` | PWA wordmark icons (generated via pure-Node PNG synthesis), share_target GET declaration, /share route handler, Dockerfile + nginx.conf + compose.yml + DEPLOY.md for VPS |

## Final Numbers

| Metric | Value |
|---|---|
| Initial JS bundle (gzip) | ~100 KB (56% of 180 KB budget) |
| pdfjs-dist (lazy chunk) | 135 KB gzip (loaded only on /new/pdf) |
| pdfjs worker (lazy) | 1.2 MB raw (loaded only when parsing) |
| CSS (gzip) | 0.91 KB |
| Unit tests | 88/88 passing across 8 files |
| Coverage on core | ≥ 95% on reader-engine + persistence |
| Runtime dependencies | react, react-dom, react-router-dom, dexie, dexie-react-hooks, zustand, pdfjs-dist (7 packages) |

## Key Decisions Register

34 decisions locked (D001–D034). Highlights:
- **D013** — iOS native → installable PWA pivot (single biggest scope change)
- **D023** — Self-hosted Docker on VPS at pace.solay.cloud
- **D022** — Welcome Apple/email buttons ALL route to anonymous-start in v1 (no stub toast)
- **D028** — punctuationPauses default flipped OFF (matches design handoff)
- **D030** — Typography user-picker scoped to reader font only (5 options)
- **D031** — Vitest only, no Playwright E2E in MVP
- **D033** — Reader aria-hidden + honest incompatibility note; no in-app SpeechSynthesis fallback

## Agents Fired

Roughly 25 parallel agents across S01–S07 — the 4-agent pattern was the dominant execution mode. Two content-filter false positives during long generations (Meditations passage + one other); both recovered by retrying with tighter scope. One cross-agent export-style mismatch (named vs default) caught by an audit agent before commit.

## Known Open Items (post-ship)

- **App icon design** (open decision §17.1) — placeholder wordmark icons ship; real icon set deferred
- **iOS left-edge back-swipe conflict** with library row swipe-to-delete — documented, accepted
- **POST/multipart file-share** (PDF from Safari Share menu) — deferred to v2 injectManifest refactor; text-share works now
- **Pre-pivot orphan branch** `gsd/M001/S01` + on-disk `Pace.xcodeproj/` — not tracked on main; harmless; clean up at leisure
- **Lighthouse PWA ≥ 90 / Performance ≥ 85** targets (D034) — not yet measured against the deployed site. Measure during first deploy to `pace.solay.cloud` before calling v1 "shipped-shipped".

## Next Steps (post-milestone)

1. Follow `DEPLOY.md` to ship to `pace.solay.cloud`
2. Run the S01–S07 UATs in sequence against the live site
3. Real app-icon design
4. v2 scope per brief §17: URL article extraction, EPUB, Supabase Auth + sync, Spritz pin rule option, audio pulse, long-press sentence context
