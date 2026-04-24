# Pace — Developer Brief

**Version:** 2.0
**Date:** April 24, 2026
**Status:** Ready for implementation
**Supersedes:** `pin_dev_brief.md` v1.0 (kept at repo root for history)

---

## Changelog from v1.0

- **Platform pivot:** iOS native (SwiftUI/SwiftData) → **mobile web app (installable PWA)**. Reason: faster ship, cross-device, no App Store gate, no native toolchain friction, preserves 100% of the reader UX on mobile browsers.
- **App name confirmed:** Pace (closes v1 §17.1 open question).
- **Design handoff integrated:** 6 screens now fully specified including previously-missing Welcome and standalone Settings screens.
- **Color tokens expanded:** 9 → 11 (adds `--page-bg #030303`, splits old Surface into `--surface` + `--surface-2`).
- **Typography flexibility:** user-pickable alternatives for display/reader/UI/mono families (was fixed 4-family set).
- **Completion screen:** v1 spec retained even though the handoff doesn't mock it — still in scope.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Core Concept — RSVP & The Pin](#2-core-concept--rsvp--the-pin)
3. [Target User](#3-target-user)
4. [MVP Scope](#4-mvp-scope)
5. [Information Architecture](#5-information-architecture)
6. [Screen Specifications](#6-screen-specifications)
7. [Reader Engine — Technical Spec](#7-reader-engine--technical-spec)
8. [Text Input Pipeline](#8-text-input-pipeline)
9. [Data Model](#9-data-model)
10. [Visual Design System](#10-visual-design-system)
11. [Interaction Model](#11-interaction-model)
12. [Settings Schema](#12-settings-schema)
13. [Technical Architecture](#13-technical-architecture)
14. [Performance Requirements](#14-performance-requirements)
15. [Accessibility](#15-accessibility)
16. [Deployment](#16-deployment)
17. [Development Roadmap](#17-development-roadmap)
18. [Open Decisions](#18-open-decisions)

---

## 1. Product Overview

### Vision

A focused reading instrument — not a social product. Pace displays any text one word at a time, each word pinned to a fixed point on the screen so the eye never moves. The result is faster reading with deeper focus, on a surface that feels like a well-made tool rather than an app.

### Positioning

Pace is not competing with e-readers or read-it-later apps. It is a **reading mode** — an alternative way to move through a text when focus matters more than comfort browsing. Use cases include long-form essays, philosophical texts, technical articles, and any content the reader wants to actually finish rather than save forever.

### Core hypothesis

Most reading time is spent moving the eye between words (saccades), not processing meaning. By eliminating eye movement and anchoring each word at the optimal recognition point, a trained reader can comfortably move from ~250 WPM to 400–600 WPM without comprehension loss — provided punctuation and structure are preserved.

### Non-goals

- Social features (no streaks, no leaderboards, no sharing UX)
- Recommendations, feeds, or content discovery
- Highlighting, annotation, or note-taking
- DRM-protected content (EPUBs, Kindle)
- Training courses or gamified comprehension quizzes

---

## 2. Core Concept — RSVP & The Pin

### RSVP (Rapid Serial Visual Presentation)

Text is tokenized into words. Each word is displayed alone at the center of the stage for a duration determined by target WPM. The reader does not move their eyes.

### The pin rule

Each word has a single **pin character** — the glyph placed at the stage's horizontal center. The rule:

```
pinPosition(length) = ceil(length ÷ 2)   // 1-indexed
```

| Word length | Pin position (1-indexed) |
|-------------|--------------------------|
| 1           | 1st                      |
| 2           | 1st                      |
| 3           | 2nd                      |
| 4           | 2nd                      |
| 5           | 3rd                      |
| 6           | 3rd                      |
| 7           | 4th                      |
| 8           | 4th                      |
| 9           | 5th                      |

**Geometric behavior:** The pin character's left edge sits on the stage's vertical centerline. Left-of-pin characters hang leftward via absolute positioning; right-of-pin characters flow rightward in normal flow. On even-length words this places more visual mass to the right of the centerline, producing the "slightly left" feel in the reference design.

### Why this rule (versus alternatives)

Spritz-style ORP biases further left as words grow longer. Pace's rule is more symmetric — the pin sits at the word's midpoint, or one-step-left on even-length words. A Spritz-style variant may be added as a setting in v2.

### Pin visual treatment

Pin character renders in the user-configurable pin color (default `#D94050`). Two optional overlays reinforce focus:

- **Pin glow:** `radial-gradient(ellipse at center, color-mix(in oklab, var(--accent) 35%, transparent) 0%, transparent 65%)` centered on the pin; ellipse sized `1.6× × 1.2×` the word font size.
- **Guide lines:** two 1 px × 22 px bars at `rgba(255,255,255,0.3)`, top and bottom of the pin character, centered on the *measured* pin-glyph width (not on the stage centerline — the pin width is non-uniform across fonts so this must be computed at render time).

---

## 3. Target User

### Primary persona

**The focused reader.** 30–50, educated, knowledge worker or creative. Has a backlog of articles and essays they want to read but rarely finishes. Already tries to block distractions. Curious about cognitive tools.

### Use cases (ranked)

1. **Finish the essay** — Reading long-form pieces end-to-end without tab-hopping
2. **Process the backlog** — Clearing a stack of saved PDFs and pasted articles
3. **Re-read with attention** — Revisiting a text they've already skimmed, slowly and focused
4. **Study a dense passage** — Reading technical or philosophical material at reduced WPM to force attention

### Anti-persona

Speed-reading hobbyists chasing WPM records. Pace should feel like a comfortable reading mode, not a performance tool. The WPM indicator informs, does not gamify.

---

## 4. MVP Scope

### In scope

- **Installable mobile web app (PWA)** — Safari on iOS, Chrome on Android, desktop browsers as a bonus
- Three input sources: **paste text**, **upload PDF**, **Web Share Target** (receive text/PDF from other apps on iOS 16.4+ / Android)
- Reader with all controls specified in §7
- Library with persistence (IndexedDB) and resume position
- Full **Settings screen** + in-reader **settings drawer** (drawer is a subset for quick tweaks)
- **Welcome screen** with Apple / email sign-in stubs + anonymous "Use without an account" path
- Completion summary
- Offline-capable after first load (service worker caches app shell + reader engine)

### Out of scope (v1)

- URL article extraction (v2)
- EPUB support (v2)
- Cross-device sync (v2 — Supabase Auth + row-sync)
- Audio/haptic pulse mode (v2)
- Apple Watch / wearable companion (v3)
- Native iOS/Android apps (not planned — PWA is the product)

---

## 5. Information Architecture

### Screen inventory

| # | Screen              | Purpose                                    | Navigation                    |
|---|---------------------|--------------------------------------------|-------------------------------|
| 1 | Welcome             | First run: sign-in choice or anonymous     | Root when no account and no prefs yet |
| 2 | Library             | List of saved texts, continue reading      | Root after first-run          |
| 3 | New Reading Sheet   | Choose input source                        | Bottom sheet from Library `+` |
| 4 | Paste Text          | Compose/paste text to read                 | Push from New Reading         |
| 5 | PDF Picker          | Native `<input type="file" accept=".pdf">` | Triggered from New Reading    |
| 6 | Reader              | The reading surface                        | Push from Library or Paste    |
| 7 | In-session Settings | Adjust while reading                       | Swipe-up drawer over Reader   |
| 8 | Settings (global)   | Account / defaults / appearance / behavior / data / about | Push from Library gear |
| 9 | Completion          | Session summary                            | Auto-shown at text end        |

### Navigation model

- **Client-side router** (React Router 6) with Library at root after first-run
- Reader pushes onto the history stack; Completion is a modal-style view that replaces the reader once finished
- In-session settings is a bottom drawer implemented with absolute-positioned `<div>` + backdrop blur (no native sheet API)
- Web Share Target lands on `/share` which routes to Paste-Text (for text) or PDF-import flow (for files)

---

## 6. Screen Specifications

### 6.1 Welcome

**Layout (top to bottom)**

1. Centered hero: wordmark "Pace" at Fraunces 96 px, `letter-spacing: -0.04em`; the trailing `.` is accent, italic, weight 300, with a −2 px left margin nudge
2. Italic subtitle "Read one word at a time." — Fraunces italic 300, 16 px, `--ink-2`, 20 px below wordmark
3. Dot-separated metadata row 64 px below subtitle: `FOCUSED · NO STREAKS · LOCAL-FIRST` — Mono 8.5 px, `letter-spacing: 0.22em`, `--ink-3`
4. Action stack pinned 14 px above the safe-area bottom:
   - **Continue with Apple** — primary button, `--ink` background, black foreground, Apple glyph 13×15 px + label
   - **Continue with email** — secondary button, transparent bg + `--line-2` border
   - **Use without an account** — ghost link, `--ink-2`, 12 px
5. Legal footnote 9.5 px `--ink-3` with underlined "Terms" and "Privacy Notice" at `--ink-2`

**v1 behavior**

- "Continue with Apple" and "Continue with email" both open a bottom-sheet toast: *"Sign-in is coming soon. You can use Pace without an account — everything stays on your device."* with a dismiss button.
- "Use without an account" creates a local anonymous profile (see §9.2) and routes to Library. A flag `hasCompletedWelcome` in `UserPreferences` prevents re-showing.

### 6.2 Library

**Layout (top to bottom)**

1. Safe-area spacer (44 px)
2. Header row — wordmark "Pace." on left (display 26 px, accent italic `.`), right cluster: text count (`7 TEXTS`, UI 9.5 px `--ink-3`, `letter-spacing: 0.2em`) + settings gear (16 × 16 px stroke icon)
3. Continue-reading card — only when any text has `0 < progress < 1`. Background `linear-gradient(145deg, #1A1418 0%, #0F0A0C 100%)`, 1 px `--line-2` border, `--r-lg` radius, 3 px accent left stripe. Content: mono eyebrow "CONTINUE READING" (uppercase, 8 px, accent, 0.2em letter-spacing), title in display 15 px, progress bar row (2 px track, `width: progress%`, `25% · 11 MIN LEFT` meta).
4. Eyebrow "LIBRARY" — UI 9.5 px, `letter-spacing: 0.28em`, `--ink-3`, 32 px top margin
5. Text list — each row:
   - Title in display 13.5 px (dimmed to `--ink-2` when `progress === 1`)
   - Meta row 4 px below, UI 9 px, `letter-spacing: 0.08em`, `--ink-2`: `SOURCE · 4,280 WORDS · 17 MIN [· READ accent]`
   - Thin progress bar (1 px, `--line-2` track, 0.8-opacity accent fill) when `0 < progress < 1`
   - Row separator: bottom 1 px `--line`
6. Floating `+` button — 48 × 48 px circle (`--r-fab`), `--accent` background, 18 × 18 px plus glyph, dual shadow `0 8px 24px rgba(217,64,80,0.3), 0 2px 6px rgba(0,0,0,0.5)`, positioned `right: 20px; bottom: 34px`

**Interactions**

- Tap row → Reader at last position
- Swipe row left → reveals 78 px wide accent-bg Delete action with haptic (`navigator.vibrate(20)` on supporting devices)
- Tap gear → push Settings screen
- Tap `+` → present New Reading sheet

**Empty state** (no texts yet)

Fraunces italic 18 px `--ink-2`: *"Nothing to read yet."* Centered. Accent button below: "Add your first text" — opens New Reading.

### 6.3 New Reading Sheet

**Presentation:** fixed overlay. Backdrop is the library screen at `filter: blur(2px); opacity: 0.35` with a `rgba(3,3,3,0.55)` dim layer. Bottom sheet on top: 6 px left/right inset, full width otherwise, `--surface-2` background, `--r-xl` top corners, `--line-2` border on top/left/right, 30 px bottom padding.

**Content**

- 36 × 3 px drag handle at `--ink-3`, 0.5 opacity, 10 px from top
- Title "New reading" — display 19 px
- Subtitle "Choose a source." — UI 11 px `--ink-2`
- Three rows (icon + title + description + chevron/badge):
  - **Paste text** — "Drop in anything from the clipboard" — accent pencil icon
  - **Upload PDF** — "Text-based PDFs only for now" — `--ink-2` doc icon
  - **From a URL** — "Article extraction" — `--ink-3` globe icon, `SOON` chip on right

**Interactions**

- Tap "Paste text" → push Paste Text screen
- Tap "Upload PDF" → trigger hidden `<input type="file" accept="application/pdf">` and parse on result

### 6.4 Paste Text

- `<textarea>` filling the visible viewport minus a 60 px bottom action bar
- Placeholder: *"Paste or type here…"*
- Optional title field above textarea (auto-generates from first line if empty and first line < 80 chars)
- Bottom action bar: **Cancel** (ghost link `--ink-2`) / **Start reading** (primary button, disabled below 20 tokenized words)

### 6.5 Reader

**The primary surface.** Full-stage dark canvas.

**Elements**

- Stage background (`--reader: #0A0A0A` default, user-configurable)
- Current word with pin character at screen horizontal center — absolute-positioned, `left: 50%; top: 50%; transform: translate(0, -50%)` on the container, left-of-pin span `position: absolute; right: 100%`
- Pin glow (see §2) when enabled + not in settings variant
- Guide lines (see §2) when enabled
- Top-left hint "tap · pause" — mono 8 px, 0.28em letter-spacing, `rgba(255,255,255,0.22)`, shown in idle state only, fades out on first tap
- Top-right remaining time `MM:SS` — mono 9 px, 0.12em letter-spacing, opacity depends on state
- Bottom edge — 2 px progress bar, accent fill to `progress%`
- Status bar (browser chrome) is always visible; we do not request fullscreen in MVP

**Interactions**

- Tap stage → toggle play/pause
- Swipe left → −5 words
- Swipe right → +5 words
- Swipe up from bottom ~30% → open settings drawer
- Swipe down from top ~15% → dismiss session (confirm if progress would be lost). On PWA, `history.back()` works too.
- Long-press (v2) — pause + show sentence context

**States**

- **Idle** — word 1 rendered, paused, "Paused — tap to start" pill shown bottom-centered (`rgba(255,255,255,0.06)` bg, 1 px `rgba(255,255,255,0.12)` border, 8 px backdrop blur, UI 9.5 px label, 0.22em letter-spacing, uppercase)
- **Playing** — words cycle at target WPM; hint fades out
- **Paused** — current word held; no pill (the idle pill is first-run only)
- **Finished** — auto-transitions to Completion

### 6.6 In-session Settings Drawer

**Presentation:** bottom sheet overlay. 6 px left/right inset, full width, `rgba(22,22,28,0.96)` background, 16 px backdrop blur, `--r-xl` top corners, `--line-2` border on top/left/right, padding `10px 20px 26px`. Reader word beneath is dimmed to 0.55 opacity.

**Sections**

1. **READING** eyebrow, then:
   - Speed: label + mono value "420 WPM" on right, custom slider below (2 px track, 10 px thumb, accent fill)
   - Size: label + "72 PX" + slider
2. **PIN · CRIMSON** eyebrow (pin color name updates when selected), then 5 preset swatches + a dashed "custom" swatch (opens color input)

Full appearance settings (font family, background color, text color, behavior toggles) live in the Settings screen, not the drawer. Drawer is for the two knobs you'd touch mid-session.

### 6.7 Settings (global)

**Layout**

1. Safe-area spacer, then header row: back-chevron (9 × 15 px) + "Settings" title (display 22 px)
2. Scrollable content padded 20 px, sections separated by 28 px:

#### ACCOUNT
- Current email + mode badge — UI 13 px + mono 9 px `PACE · LOCAL`. For anonymous users, shows "Anonymous session" and a `Create account` CTA row instead of email.
- Sign out — UI 13 px `--ink-2` (only when signed in)

#### READING
- Default speed — slider 150–800 WPM, mono value display
- Default font size — slider 36–120 px, mono value display
- Default font — chevron row, opens font-family picker sheet

#### APPEARANCE
- Preview tile — 100 px high, `--reader` bg, 1 px `--line-2` border, `--r-lg`, `PREVIEW` mono eyebrow top-left, a live `ReaderWord size={28}` showing the word "preview" with current settings applied
- Background — row with mono hex "#0A0A0A" + 24 px swatch
- Text — row with mono hex + swatch
- Pin — row with mono hex + swatch
Each opens a color-picker sheet.

#### BEHAVIOR
- Highlight pinned character (toggle, default ON)
- Show center guide lines (toggle, default ON)
- Punctuation pauses (toggle, default OFF)
- Haptics (toggle, default ON where supported)

#### DATA
- Export library — JSON download of all texts + sessions + preferences (no passwords)
- Clear all data — accent-colored destructive action; confirms before wiping IndexedDB

#### ABOUT
- Version — mono `1.0.0 · 240` (semver · build number)
- Privacy policy — chevron → external link
- Terms — chevron → external link
- Acknowledgements — chevron → push a view listing open-source components and fonts

### 6.8 Completion

**Layout**

- Eyebrow: `FINISHED` — mono, accent
- Display title: *"That's it — you're through."* — Fraunces italic 40 px
- Stats list with horizontal rules between each row:
  - Pace (WPM)
  - Time (MM:SS)
  - Words (count)
  - Text (title)
- Action stack:
  - **Library** — secondary button
  - **Read again** — primary (accent)

No gamification. No shareables. The reader finished — that is enough.

---

## 7. Reader Engine — Technical Spec

TypeScript, framework-agnostic. Lives under `src/core/reader-engine/`.

### 7.1 Tokenization

```ts
interface ReaderToken {
  text: string;           // "word," or "word." or "—"
  isParagraphBreak: boolean;
  index: number;          // position in token array
}

function tokenize(text: string): ReaderToken[];
```

Rules:
- Split on Unicode whitespace (`/\s+/u`), preserve punctuation attached to words
- Collapse multiple whitespace; treat blank lines (`\n\s*\n+`) as paragraph breaks
- Em-dashes surrounded by spaces become standalone tokens

### 7.2 Pin character calculation

```ts
function pinIndex(word: string): number {
  const cleaned = word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
  const len = Math.max(cleaned.length, 1);
  const oneBased = Math.ceil(len / 2);
  const leadingPunct = word.length - word.trimStart().replace(/^[^\p{L}\p{N}]*/u, '').length;
  return leadingPunct + (oneBased - 1);
}
```

Returns the 0-indexed position within the original word string.

### 7.3 Timing

Base per-word duration: `baseMs = 60_000 / wpm`.

**Punctuation multipliers** (applied when toggle is on):

| Trailing character  | Multiplier |
|---------------------|-----------|
| `.` `!` `?`         | 2.3×      |
| `,` `;` `:` `—` `–` | 1.55×     |
| Paragraph break     | 2.5× + brief ¶ glyph at 25% opacity |

**Long-word handling:** Words with cleaned `length > 12` receive a multiplier of `1 + (length - 12) × 0.05`, capped at `1.5×`.

### 7.4 Timer implementation

Use `setTimeout` with an abort signal and a tight coupling to the engine's `isPlaying` state. `requestAnimationFrame` is the wrong hook — we don't need frame-sync; we need millisecond-accurate one-shot delays.

```ts
class ReaderEngine {
  private timeoutId: number | null = null;

  play(): void {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.scheduleNext();
  }

  pause(): void {
    this.isPlaying = false;
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private scheduleNext(): void {
    if (!this.isPlaying || this.currentIndex >= this.tokens.length) {
      if (this.currentIndex >= this.tokens.length) this.onFinish();
      return;
    }
    const token = this.tokens[this.currentIndex];
    const ms = this.computeDuration(token);
    this.timeoutId = window.setTimeout(() => {
      this.currentIndex += 1;
      this.emit();
      this.scheduleNext();
    }, ms);
  }
}
```

Target accuracy: ±20 ms per word. Acceptable on modern browsers; confirm on iOS Safari in Low Power Mode (throttles `setTimeout` in background; reader only matters foreground so this is fine).

### 7.5 Rendering strategy

React component `<ReaderWord word={string} size={number} glow={boolean} />`. Layout:

- Container: `position: absolute; top: 50%; left: 50%; transform: translate(0, -50%); display: flex; align-items: baseline`
- Left span: `position: absolute; right: 100%; white-space: pre;` — renders `word.slice(0, pinIndex)`
- Pin span: inline, `color: var(--accent); position: relative; z-index: 1;` — renders the pin character
- Right span: inline flow, renders `word.slice(pinIndex + 1)`
- Glow (optional): absolute-positioned ellipse radial-gradient, `width: size × 1.6; height: size × 1.2`, centered at the container origin, `z-index: 0`

Guide lines are a separate component `<GuideLines word size />` that uses `useLayoutEffect` + a hidden measurer span to pull the pin character's rendered width, then positions two 1 × 22 px bars at `left: calc(50% + measuredWidth/2)`.

---

## 8. Text Input Pipeline

### 8.1 Paste text

- Accept plain text
- Strip leading/trailing whitespace
- Normalize line endings to `\n`
- Collapse sequences of `\n\n\n+` to `\n\n`
- Detect title: if first line ends without punctuation and is < 80 chars, treat as title
- Reject if fewer than 20 tokens post-tokenization

### 8.2 PDF parsing

Use **pdfjs-dist** (Mozilla). Import the worker as a module so Vite bundles it correctly:

```ts
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

async function extractText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((it: any) => it.str).join(' '));
  }
  return pages.join('\n\n');
}
```

**Post-processing:**

- **De-hyphenate line breaks:** `word-\nword` → `wordword` (preserve legitimate hyphens)
- **Remove headers/footers:** if a short line (< 40 chars) repeats on > 30% of pages, strip it
- **Remove page numbers:** purely-numeric lines at page boundaries
- **Collapse column artifacts:** multi-column PDFs may produce out-of-order text; accept degraded quality in v1 and flag to the user
- **Reject scanned PDFs:** if the joined text is empty or < 50 chars across all pages, show error: *"This PDF looks like scanned images. OCR support coming soon."*

### 8.3 Web Share Target

Declared in `manifest.webmanifest`:

```json
"share_target": {
  "action": "/share",
  "method": "POST",
  "enctype": "multipart/form-data",
  "params": {
    "title": "title",
    "text": "text",
    "url": "url",
    "files": [{ "name": "file", "accept": ["application/pdf", "text/plain"] }]
  }
}
```

Service worker intercepts `POST /share`, extracts the payload, stores in IndexedDB temp table, then `Response.redirect('/new?from=share')`. The New Reading flow reads the temp entry and routes to paste or PDF import accordingly.

Supported on Android Chrome and iOS Safari 16.4+ (after add-to-home-screen).

---

## 9. Data Model

### 9.1 Persistence

**Dexie.js** on top of IndexedDB. Single local database `pace`.

### 9.2 Schema

```ts
// src/core/persistence/schema.ts
import Dexie, { Table } from 'dexie';

export interface ReadingText {
  id: string;                       // UUID v4
  title: string;
  content: string;                  // raw text, post-processed
  sourceType: 'paste' | 'pdf' | 'share' | 'url';
  createdAt: number;                // epoch ms
  updatedAt: number;
  wordCount: number;
  currentTokenIndex: number;
  isCompleted: boolean;
  completedAt?: number;
}

export interface ReadingSession {
  id: string;
  textId: string;                   // FK to ReadingText.id
  startedAt: number;
  endedAt?: number;
  tokensRead: number;
  averageWPM: number;
}

export interface UserPreferences {
  id: 'singleton';                  // always 'singleton'
  wpm: number;                      // default 350
  fontFamily: string;               // default 'EB Garamond'
  fontSize: number;                 // default 72
  backgroundColor: string;          // hex, default '#0A0A0A'
  textColor: string;                // hex, default '#F0F0F2'
  pinColor: string;                 // hex, default '#D94050'
  highlightPin: boolean;            // default true
  showGuideLines: boolean;          // default true
  punctuationPauses: boolean;       // default false (off by default in design; was true in v1 brief)
  haptics: boolean;                 // default true
  hasCompletedWelcome: boolean;     // default false
  accountMode: 'anonymous' | 'apple' | 'email';  // default 'anonymous' in v1
  accountEmail?: string;            // populated in v2 when Supabase Auth lands
}

export class PaceDB extends Dexie {
  texts!: Table<ReadingText, string>;
  sessions!: Table<ReadingSession, string>;
  preferences!: Table<UserPreferences, string>;

  constructor() {
    super('pace');
    this.version(1).stores({
      texts: 'id, updatedAt, isCompleted',
      sessions: 'id, textId, startedAt',
      preferences: 'id',
    });
  }
}

export const db = new PaceDB();
```

### 9.3 Derived values

- **`estimatedMinutes`:** `wordCount / currentWPM`
- **`progressPercent`:** `currentTokenIndex / tokenCount` — note: `tokenCount` is re-derived from `content` on demand (or cached in `ReadingText.tokenCount` if perf demands)
- **`isInProgress`:** `0 < progressPercent < 1`

---

## 10. Visual Design System

### 10.1 Colors (11 tokens)

| CSS variable   | Value       | Usage                                |
|----------------|-------------|--------------------------------------|
| `--page-bg`    | `#030303`   | Root page background (outside stage) |
| `--stage`      | `#080809`   | App chrome, Library background       |
| `--reader`     | `#0A0A0A`   | Reader stage (user-configurable)     |
| `--surface`    | `#101014`   | Primary surface                      |
| `--surface-2`  | `#16161C`   | Elevated surface (sheets, cards)     |
| `--line`       | `#1E1E26`   | Hairline dividers                    |
| `--line-2`     | `#2A2A34`   | Borders on elevated surfaces         |
| `--ink`        | `#F0F0F2`   | Primary text (user-configurable)     |
| `--ink-2`      | `#9A9AA6`   | Secondary text                       |
| `--ink-3`      | `#5A5A66`   | Tertiary text, placeholders          |
| `--accent`     | `#D94050`   | Pin · accent (user-configurable)     |

### 10.2 Typography

Loaded via Google Fonts CSS import. Weights kept minimal to reduce payload.

| CSS variable    | Default             | Options                                                               |
|-----------------|---------------------|-----------------------------------------------------------------------|
| `--font-display`| Fraunces            | Fraunces, Newsreader, Spectral, EB Garamond                           |
| `--font-reader` | EB Garamond         | EB Garamond, Newsreader, Lora, Crimson Pro, Spectral, Fraunces        |
| `--font-ui`     | Inter               | Inter, Manrope                                                        |
| `--font-mono`   | JetBrains Mono      | JetBrains Mono, IBM Plex Mono                                         |

Google Fonts import (one `<link>` in `index.html`):

```
family=EB+Garamond:ital,wght@0,400;0,500;1,400
&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,400
&family=Inter:wght@300;400;500;600
&family=JetBrains+Mono:wght@400;500
&family=Spectral:ital,wght@0,400;0,500;1,400
&family=Lora:ital,wght@0,400;0,500;1,400
&family=Crimson+Pro:ital,wght@0,400;0,500;1,400
&family=Manrope:wght@400;500;600
&family=IBM+Plex+Mono:wght@400;500
&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400
&display=swap
```

### 10.3 Spacing scale

Base 4 px. Scale: 4, 8, 12, 16, 20, 24, 32, 48, 64.

### 10.4 Radii

| CSS variable | Value  | Usage                        |
|--------------|--------|------------------------------|
| `--r-xl`     | 20 px  | Bottom sheets, top corners   |
| `--r-lg`     | 14 px  | Cards, surfaces              |
| `--r-md`     | 10 px  | Buttons                      |
| `--r-sm`     | 6 px   | Chips, swatches              |
| `--r-fab`    | 50%    | Floating action button       |

### 10.5 Elevation

Flat design. No drop shadows on surfaces. **Exceptions:**
- FAB: `0 8px 24px rgba(217,64,80,0.3), 0 2px 6px rgba(0,0,0,0.5)`
- Settings slider thumb: `0 0 0 1px var(--accent)`

---

## 11. Interaction Model

### 11.1 Gestures (Reader)

| Gesture                     | Action                                          |
|-----------------------------|-------------------------------------------------|
| Tap anywhere                | Toggle play/pause                               |
| Swipe left                  | Rewind 5 words                                  |
| Swipe right                 | Fast-forward 5 words                            |
| Swipe down from top edge    | Dismiss session (confirm if progress)           |
| Swipe up from bottom edge   | Open settings drawer                            |
| Long-press                  | (v2) Show sentence context                      |

Implemented via Pointer Events (`pointerdown/move/up`) with a shared `<GestureDetector>` wrapper; no third-party gesture library.

### 11.2 Haptics

Use `navigator.vibrate(ms)` where supported (Android Chrome yes, iOS Safari no — graceful no-op).

- **Soft (10 ms)** — on play/pause toggle
- **Medium (20 ms)** — on paragraph break
- **Rigid (30 + 10 + 30 pattern)** — on session completion

Respects `(prefers-reduced-motion: reduce)` — disable all haptics except completion.

### 11.3 Edge cases

- **Page backgrounded / tab hidden:** `visibilitychange` → auto-pause. Save `currentTokenIndex` immediately.
- **Incoming phone call (iOS):** same as backgrounded.
- **Device rotation:** responsive; portrait is the primary layout, landscape works on larger screens as a stretched version.
- **Font not loaded yet:** fall back to `serif` / `sans-serif` / `monospace` via CSS font stacks. Use `font-display: swap`.
- **Offline:** service worker caches app shell + fonts + previously-loaded reader tokens. Library queries IndexedDB regardless of network state.

---

## 12. Settings Schema

All settings persist in `UserPreferences` (see §9.2). Changes apply live and write-through to Dexie on every change.

| Key                    | Type       | Default          | Range / Values                |
|------------------------|------------|------------------|-------------------------------|
| `wpm`                  | number     | 350              | 150–800, step 10              |
| `fontFamily`           | string     | `EB Garamond`    | 6 options (see §10.2 reader)  |
| `fontSize`             | number     | 72               | 36–120, step 2                |
| `backgroundColor`      | hex string | `#0A0A0A`        | any                           |
| `textColor`            | hex string | `#F0F0F2`        | any                           |
| `pinColor`             | hex string | `#D94050`        | any                           |
| `highlightPin`         | boolean    | true             |                               |
| `showGuideLines`       | boolean    | true             |                               |
| `punctuationPauses`    | boolean    | false            | was `true` in v1 — design default is OFF |
| `haptics`              | boolean    | true             |                               |
| `hasCompletedWelcome`  | boolean    | false            | bootstrap gate                |
| `accountMode`          | enum       | `anonymous`      | `anonymous` / `apple` / `email` (v2) |
| `accountEmail`         | string?    | undefined        | v2                            |

---

## 13. Technical Architecture

### 13.1 Stack

- **Build:** Vite 5
- **Language:** TypeScript 5, strict mode
- **UI:** React 18
- **Router:** React Router 6 (client-only)
- **PWA:** vite-plugin-pwa (Workbox under the hood — manifest, service worker, Web Share Target)
- **State:** Zustand for reader + settings; direct Dexie queries via `dexie-react-hooks` for library data
- **Persistence:** Dexie.js (IndexedDB wrapper)
- **PDF:** pdfjs-dist (Mozilla)
- **Styling:** vanilla CSS with CSS variables (no Tailwind, no CSS-in-JS runtime)
- **Testing:** Vitest (unit) + Playwright (E2E)
- **Lint:** ESLint + Prettier (no TSLint — dead project)

### 13.2 Module boundaries

```
pace/
├─ index.html                   ← Google Fonts <link>, SVG favicon
├─ public/
│  ├─ manifest.webmanifest      ← generated by vite-plugin-pwa
│  └─ icons/                    ← PWA icons (192, 512, maskable)
├─ src/
│  ├─ main.tsx                  ← React mount + router
│  ├─ app/
│  │  ├─ App.tsx                ← top-level routes
│  │  └─ routes/                ← route components
│  ├─ features/
│  │  ├─ welcome/
│  │  ├─ library/
│  │  ├─ new-reading/
│  │  ├─ reader/
│  │  ├─ settings/
│  │  └─ completion/
│  ├─ core/
│  │  ├─ reader-engine/         ← tokenizer, pin calc, timing, engine class
│  │  ├─ text-processing/       ← PDF extraction, cleanup
│  │  ├─ persistence/           ← Dexie schema, repository functions
│  │  ├─ gestures/              ← shared pointer-event wrapper
│  │  └─ haptics/               ← vibrate wrapper with RM respect
│  ├─ design-system/
│  │  ├─ tokens.css             ← CSS variables for colors / fonts / radii
│  │  ├─ reset.css              ← minimal reset
│  │  └─ components/            ← <Slider/>, <Toggle/>, <Eyebrow/>, <ReaderWord/>, <GuideLines/>
│  └─ types/
├─ tests/
│  ├─ unit/                     ← Vitest
│  └─ e2e/                      ← Playwright
└─ Dockerfile                   ← nginx-based static serve for VPS (§16)
```

### 13.3 Dependencies

**Runtime:**
- react, react-dom
- react-router-dom
- dexie, dexie-react-hooks
- zustand
- pdfjs-dist

**Build/dev:**
- vite, @vitejs/plugin-react
- vite-plugin-pwa
- typescript, @types/react, @types/react-dom
- vitest, @vitest/ui
- playwright, @playwright/test
- eslint, prettier

No UI-component libraries. No CSS framework. Keep it lean.

### 13.4 Testing strategy

- **Unit:** reader-engine (pin calc, tokenization, timing math), text-processing (PDF de-hyphenation, header detection)
- **Integration:** Dexie round-trip (texts, sessions, preferences), Web Share Target handler
- **E2E (Playwright):** critical path — open app, paste text, start reader, pause, resume after reload, complete

---

## 14. Performance Requirements

| Metric                                | Target       | Notes                                    |
|---------------------------------------|--------------|------------------------------------------|
| Cold first load to Library (LTE)      | < 2.5 s      | Measured via Lighthouse on Moto G4 throttle |
| Repeat visit (SW cached) to Library   | < 500 ms     | Service worker hits                      |
| Library scroll FPS                    | 60 fps       | Even with 100+ texts                     |
| PDF parse (10-page text PDF)          | < 3 s        | pdf.js is slower than PDFKit; tradeoff for web |
| PDF parse (100-page text PDF)         | < 25 s       | Progress spinner above 500 ms            |
| Word render latency (tap to play)     | < 50 ms      | First word should feel instant           |
| Word display timing accuracy          | ±20 ms       | Critical for perceived smoothness        |
| JS bundle (gzip) initial load         | < 180 KB     | Without pdf.js, which is route-lazy       |
| LCP on reader route (3G)              | < 1.8 s      |                                          |

---

## 15. Accessibility

### 15.1 Dynamic Type / user zoom

- UI chrome respects browser zoom and OS text-size setting (`rem`-based sizing for UI text)
- Reader surface does NOT scale with zoom — the user's chosen font size is explicit

### 15.2 Reduce Motion

On `(prefers-reduced-motion: reduce)`:
- Disable pin glow radial-gradient
- Disable paragraph-break ¶ glyph fade animation
- Disable haptics except completion
- Keep word timing exact — the reader is the product

### 15.3 Screen readers

RSVP and screen readers are fundamentally incompatible. The solution:
- Reader view has a "Play speed reader. Double-tap for accessible read-aloud instead." ARIA label on the stage
- Double-tap (with screen reader on) triggers a fallback mode that reads the full text via `SpeechSynthesisUtterance`
- Library, Settings, Completion, Welcome are fully screen-reader compliant with semantic HTML + ARIA roles

### 15.4 Color contrast

Default palette meets WCAG AA for all UI text. User-configurable Reader colors are not constrained — user choice wins. Settings → Appearance shows a live preview tile so the user sees the actual result before committing.

---

## 16. Deployment

### 16.1 Host

**Self-hosted on user's VPS** at `76.13.192.55` (solay.cloud). Subdomain: **`pace.solay.cloud`**.

Orchestrated via the existing Docker + Traefik stack used by `crea.solay.cloud` and `ai-salon.solay.cloud`.

### 16.2 Container

Single-stage build image: Vite build output served by nginx. No backend in MVP.

```dockerfile
# Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

`nginx.conf` highlights:
- `try_files $uri $uri/ /index.html;` for client-side routing
- Long cache for `/assets/*` (hashed), no-cache for `index.html` and `sw.js`
- `gzip on; gzip_types text/css application/javascript image/svg+xml;`
- `/share` POST passes through to `/share.html` which the SW handles client-side (no server logic needed for Web Share Target — the SW reads the payload)

### 16.3 Traefik labels

```yaml
services:
  pace:
    image: pace:latest
    restart: unless-stopped
    networks: [ traefik ]
    labels:
      - traefik.enable=true
      - traefik.http.routers.pace.rule=Host(`pace.solay.cloud`)
      - traefik.http.routers.pace.entrypoints=websecure
      - traefik.http.routers.pace.tls.certresolver=letsencrypt
      - traefik.http.services.pace.loadbalancer.server.port=80
```

### 16.4 Deploy flow

1. Build image locally or in a simple CI runner: `docker build -t pace:latest .`
2. `docker save pace:latest | ssh root@76.13.192.55 "docker load"`
3. On VPS, in `/opt/pace/`: `docker compose up -d` (pulls the newly-loaded image tag)

Or GitHub Actions later. For MVP, local-build + SSH ship is fine.

### 16.5 Environment

No env vars required in MVP (no backend, no analytics, no auth). Future: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` when auth lands.

---

## 17. Development Roadmap

### Phase 1 — Reader Core (Week 1)

- Vite scaffold, TypeScript strict, PWA plugin, design-system tokens
- `<ReaderWord>`, `<GuideLines>`, `ReaderEngine` class with tokenizer + pin calc + timing
- `/reader` route with hardcoded Marcus Aurelius sample
- **Exit:** open `localhost:5173/reader`, tap, watch sample read end-to-end at 350 WPM with correct pin placement.

### Phase 2 — Welcome + Library + Paste + Persistence (Week 2)

- Welcome screen with stubbed sign-in (anonymous flow only in v1)
- Dexie schema + repository functions
- Library screen with live query, continue-card, FAB
- New Reading bottom sheet + Paste Text screen
- **Exit:** paste a long essay, see it in Library, close browser, reopen, resume from the last word.

### Phase 3 — PDF Upload + Text Processing (Week 3)

- pdf.js integration, document picker via hidden file input
- Post-processing (de-hyphenation, header detection, page numbers)
- Error states for scanned PDFs
- **Exit:** pick a text-based PDF, see it in Library, read it correctly.

### Phase 4 — Settings + Polish (Week 4)

- Full Settings screen with all sections (§6.7)
- In-session settings drawer
- Export library (JSON download) + Clear all data
- Completion screen + haptics + reduce-motion handling
- Empty states, error states, all wordmark instances consistent
- **Exit:** every setting in §12 works live. Completion screen shows accurate stats.

### Phase 5 — PWA + Share + Deploy (Week 5)

- Manifest, icons, service worker, Web Share Target handler
- Dockerfile + nginx.conf + Traefik compose entry
- First deploy to `pace.solay.cloud`
- Smoke-test add-to-home-screen on iOS + Android
- **Exit:** install Pace from Safari/Chrome, share an article from another app, it opens in Pace's paste flow.

### Phase 6 — V2 (post-launch)

- URL article extraction (Readability.js)
- EPUB support (epub.js)
- Supabase Auth (Apple OAuth + magic link) + per-user library sync
- Spritz-style pin rule as a setting
- Audio pulse mode (metronomic tick per word)
- Long-press sentence context

---

## 18. Open Decisions

| # | Decision                                                       | Recommendation          | Impact                       |
|---|----------------------------------------------------------------|-------------------------|------------------------------|
| 1 | App icon design                                                | Defer to Week 5         | PWA install, branding        |
| 2 | Analytics in v1                                                | None; local-only        | Privacy stance, already in v1 brief §17.7 |
| 3 | "Read again at +10% WPM" in Completion                         | No — non-gamified       | Already resolved v1.0        |
| 4 | Paragraph-break indicator                                      | ¶ glyph at 25% opacity  | Already resolved v1.0        |
| 5 | Long-word strategy                                             | Stretch duration 1.5× cap | Already resolved v1.0      |
| 6 | Pin rule variants — expose Spritz as option                    | v2 only                 | Already resolved v1.0        |
| 7 | PWA install prompt behaviour                                   | Passive — browser decides; no custom install UI in v1 | UX clutter |
| 8 | Offline reader for PDFs                                        | Yes, once parsed they live in IndexedDB | Storage     |
| 9 | Error monitoring (Sentry etc.)                                 | No in v1; local console + user-visible error toasts only | Ops |

---

*End of brief v2.0.*
