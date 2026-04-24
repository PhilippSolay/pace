# Pin — Developer Brief

**Version:** 1.0
**Date:** April 24, 2026
**Status:** Ready for scoping
**Working name:** *Pin* (placeholder — to be confirmed)

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
16. [Development Roadmap](#16-development-roadmap)
17. [Open Decisions](#17-open-decisions)

---

## 1. Product Overview

### Vision

A focused reading instrument — not a social product. Pin displays any text one word at a time, each word pinned to a fixed point on the screen so the eye never moves. The result is faster reading with deeper focus, on a surface that feels like a well-made tool rather than an app.

### Positioning

Pin is not competing with e-readers or read-it-later apps. It is a **reading mode** — an alternative way to move through a text when focus matters more than comfort browsing. Use cases include long-form essays, philosophical texts, technical articles, and any content the reader wants to actually finish rather than save forever.

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

**Geometric behavior:** The pin character's left edge sits on the stage's vertical centerline. Left-of-pin characters hang leftward via absolute positioning; right-of-pin characters flow rightward in normal flow. On even-length words this places more visual mass to the right of the centerline, producing the "slightly left" feel in the reference.

### Why this rule (versus alternatives)

Spritz-style ORP biases further left as words grow longer (`length 14+ → 5th character`). Pin's rule is more symmetric — the pin sits at the word's midpoint, or one-step-left on even-length words. Simpler, and the visual rhythm is more predictable. A variant (Spritz-style) may be added as a setting in v2.

### The pin must be visually distinct

The pin glyph renders in the user-configurable pin color (default `#D94050`). An optional soft radial glow behind the glyph reinforces focus. Two optional thin vertical guide lines sit above and below the pin at the stage centerline, acting as fixation anchors.

---

## 3. Target User

### Primary persona

**The focused reader.** 30–50, educated, knowledge worker or creative. Has a backlog of articles and essays they want to read but rarely finishes. Already tries to block distractions (focus apps, noise-cancelling headphones, paper notebooks). Curious about cognitive tools. Will pay once for quality over subscriptions.

### Use cases (ranked)

1. **Finish the essay** — Reading long-form pieces end-to-end without tab-hopping
2. **Process the backlog** — Clearing a stack of saved PDFs and pasted articles
3. **Re-read with attention** — Revisiting a text they've already skimmed, slowly and focused
4. **Study a dense passage** — Reading technical or philosophical material at reduced WPM to force attention

### Anti-persona

Speed-reading hobbyists chasing WPM records. Pin should feel like a comfortable reading mode, not a performance tool. The WPM indicator exists to inform, not to gamify.

---

## 4. MVP Scope

### In scope

- iOS native app (iPhone first, iPad later)
- Three input sources: **paste text**, **upload PDF**, **share sheet extension** (receive text/PDF from other apps)
- Reader with all controls specified in §7
- Library with persistence and resume position
- Settings: speed, font family, font size, colors, pin highlight, guide lines, punctuation pauses
- Completion summary

### Out of scope (v1)

- URL article extraction (v2)
- EPUB support (v2)
- iCloud sync across devices (v2)
- Audio/haptic cues (v2)
- Apple Watch companion (v3)
- Android (indefinitely deferred)

---

## 5. Information Architecture

### Screen inventory

| # | Screen              | Purpose                                    | Navigation                    |
|---|---------------------|--------------------------------------------|-------------------------------|
| 1 | Library             | List of saved texts, continue reading      | Root                          |
| 2 | New Reading Sheet   | Choose input source                        | Modal from Library `+` button |
| 3 | Paste Text          | Compose/paste text to read                 | Push from New Reading         |
| 4 | PDF Picker          | System document picker                     | Modal from New Reading        |
| 5 | Reader              | The reading surface                        | Push from Library or Paste    |
| 6 | In-session Settings | Adjust while reading                       | Swipe-up drawer over Reader   |
| 7 | Completion          | Session summary                            | Auto-shown at text end        |

### Navigation model

- **NavigationStack** with Library at root
- Reader pushes onto the stack; completion is modal on top of Reader
- In-session settings is a `.sheet` presented over the Reader with `.presentationDetents([.fraction(0.5)])`
- Share sheet extension opens directly into Paste Text (pre-filled) or PDF processing

---

## 6. Screen Specifications

### 6.1 Library

**Layout (top to bottom)**

1. App title `Pin.` — Fraunces 26pt, static
2. Text count (e.g. `7 TEXTS`) — JetBrains Mono 10pt, muted
3. **Featured card** — "Continue reading" — only if a text has `progress > 0 && progress < 1`. Shows title, percent complete, estimated time remaining, last opened date, and a thin progress bar.
4. `Library` section header
5. List of texts — each row: title (Fraunces 13pt), meta (source type, word count, estimated time) in JetBrains Mono 9pt
6. Floating `+` button, accent color, bottom-right, 48×48pt

**Interactions**

- Tap row → opens Reader at last position
- Swipe row left → reveals Delete action (red, haptic)
- Long-press row → context menu (Reset progress, Delete, Rename)
- Tap `+` → presents New Reading sheet

**Empty state**

Fraunces italic copy: *"Nothing to read yet."* + a prominent "Add your first text" button.

### 6.2 New Reading Sheet

**Presentation:** `.sheet` with `.presentationDetents([.medium])`.

**Content**

- Title: "New reading"
- Subtitle: "Choose a source"
- Three options as rows (icon + title + description + chevron):
  - **Paste text** — "Drop in anything from the clipboard"
  - **Upload PDF** — "Text-based PDFs only for now"
  - **From a URL** — Disabled, shows `SOON` badge (v2)

**Interactions**

- Tap "Paste text" → push Paste Text screen
- Tap "Upload PDF" → present `UIDocumentPickerViewController` for `.pdf` UTIs

### 6.3 Paste Text

- Large `TextEditor` filling the screen
- Placeholder: *"Paste or type here…"*
- Optional title field above editor (auto-generates from first line if empty)
- Bottom action bar: **Cancel** (dismiss) / **Start reading** (primary, accent)

**Validation:** minimum 20 words before "Start reading" enables.

### 6.4 Reader

**The primary surface.** Full-stage dark canvas.

**Elements**

- Stage background (`#0A0A0A` default, user-configurable)
- Current word with pin character at screen horizontal center
- Optional thin vertical guide lines top and bottom of the pin
- Hint text `tap · pause` — top-left, only on first launch of a session, fades after 3s
- Remaining time `MM:SS` — top-right, JetBrains Mono 8pt
- Thin progress bar — bottom edge, accent color, 2pt height
- Status bar is always visible but dimmed (rgba 0.5)

**Interactions**

- Tap stage → toggle play/pause
- Swipe down from top edge → dismiss session (confirms if progress would be lost)
- Swipe up from bottom edge → reveal In-session Settings drawer
- Swipe left → jump back 5 words
- Swipe right → jump forward 5 words
- Long-press stage → pause and reveal word-in-sentence context (v2)

**States**

- **Idle** (entered from Library) — word 1 rendered, paused, "Paused — tap to start" pill shown
- **Playing** — words cycle at target WPM
- **Paused** — current word held, "Paused" pill fades in after 500ms
- **Finished** — auto-transitions to Completion after final word

### 6.5 In-session Settings Drawer

**Presentation:** `.sheet(isPresented:)` with `.presentationDetents([.fraction(0.55)])` and `.presentationBackgroundInteraction(.enabled)` so the reader stays visible behind.

**Sections**

1. **Reading** — Speed slider (150–800 WPM), Font size slider (36–120pt)
2. **Appearance** — Pin color swatches (5 presets + custom), Font family picker, Background color, Text color
3. **Behavior** — Highlight pinned character (toggle), Center guide lines (toggle), Punctuation pauses (toggle)

Changes apply live. Reader remains paused while drawer is open.

### 6.6 Completion

**Layout**

- Eyebrow: `FINISHED` (accent)
- Display title: *"That's it — you're through."* (Fraunces italic, 40pt)
- Stats list (horizontal rule between each):
  - Pace (WPM)
  - Time (MM:SS)
  - Words (count)
  - Text (title)
- Actions: **Library** (secondary) / **Read again** (primary, accent)

No gamification. No shareables. The reader finished — that is enough.

---

## 7. Reader Engine — Technical Spec

### 7.1 Tokenization

```swift
func tokenize(_ text: String) -> [ReaderToken] {
    // Split on whitespace (any unicode whitespace), preserve punctuation attached to words.
    // Collapse multiple whitespace. Respect paragraph breaks as \n\n.
    // Em-dashes surrounded by spaces become standalone tokens.
}
```

Each `ReaderToken` has:

```swift
struct ReaderToken {
    let text: String           // "word," or "word." or "—"
    let isParagraphBreak: Bool // true for blank lines between paragraphs
    let index: Int             // position in original text
}
```

### 7.2 Pin character calculation

```swift
func pinIndex(for word: String) -> Int {
    let cleaned = word.trimmingCharacters(in: .punctuationCharacters)
    let len = max(cleaned.count, 1)
    let oneBased = Int(ceil(Double(len) / 2.0))
    // Map back to the original word index, skipping leading punctuation
    let leadingPunct = word.prefix { !$0.isLetter && !$0.isNumber }.count
    return leadingPunct + (oneBased - 1)
}
```

### 7.3 Timing

Base per-word duration: `baseDuration = 60.0 / wpm` (seconds).

**Punctuation multipliers** (applied when toggle is on):

| Trailing character | Multiplier |
|--------------------|-----------|
| `.` `!` `?`        | 2.3×      |
| `,` `;` `:` `—` `–`| 1.55×     |
| Paragraph break    | 2.5× + show ¶ glyph briefly |

**Long-word handling:** Words with `length > 12` receive an additional multiplier of `1 + (length - 12) × 0.05`, capped at `1.5×`. This prevents the lurch on words like "consequently."

### 7.4 Timer implementation

Use `Task` with `try await Task.sleep(for:)` rather than `Timer`. Reason: sub-millisecond accuracy is not needed, and async cancellation on pause/navigation is cleaner. Target accuracy: ±20ms per word.

```swift
@MainActor
final class ReaderEngine: ObservableObject {
    @Published var currentIndex: Int = 0
    @Published var isPlaying: Bool = false
    private var playbackTask: Task<Void, Never>?
    
    func play() {
        guard !isPlaying else { return }
        isPlaying = true
        playbackTask = Task { await advance() }
    }
    
    func pause() {
        isPlaying = false
        playbackTask?.cancel()
    }
    
    private func advance() async {
        while isPlaying && currentIndex < tokens.count {
            let token = tokens[currentIndex]
            let duration = computeDuration(for: token)
            try? await Task.sleep(for: .seconds(duration))
            if Task.isCancelled { return }
            currentIndex += 1
        }
        if currentIndex >= tokens.count { finish() }
    }
}
```

### 7.5 Rendering strategy

Use `Canvas` (SwiftUI) or three separate `Text` views positioned with `GeometryReader`. The center anchor approach:

- Container is full-stage, center-aligned
- Pin `Text` is the anchor; its `.position` places it at `(width/2, height/2)`
- Left portion is rendered in a `Text` view with `.offset` computed from pin width
- Right portion is rendered with `.offset(x: pinWidth/2)`

**Alternative** (preferred): Render the full word as a single `Text` with an `AttributedString` where the pin character has its color/weight overridden, then compute its x-offset so the pin character's leading edge lands on the stage's vertical center. Single text layer = no kerning drift between left/pin/right.

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

Use **PDFKit** (`PDFDocument`) — bundled with iOS, no third-party dependency.

```swift
func extractText(from pdf: PDFDocument) -> String {
    var pages: [String] = []
    for i in 0..<pdf.pageCount {
        guard let page = pdf.page(at: i) else { continue }
        pages.append(page.string ?? "")
    }
    return pages.joined(separator: "\n\n")
}
```

**Post-processing required:**

- **De-hyphenate line breaks:** `word-\nword` → `wordword` (preserve legitimate hyphens)
- **Remove headers/footers:** Heuristic — if a short line (< 40 chars) repeats on > 30% of pages, strip it
- **Remove page numbers:** Lines that are purely numeric at page boundaries
- **Collapse column artifacts:** Multi-column PDFs may produce out-of-order text; accept degraded quality in v1 and flag to user
- **Reject scanned PDFs:** If `page.string` returns empty or near-empty across all pages, show error: *"This PDF looks like scanned images. OCR support coming soon."*

### 8.3 Share sheet extension

Register as a Share target for:
- `public.plain-text`
- `public.pdf`

The extension saves the incoming content to the shared App Group container and opens Pin with a deep link that triggers the import flow.

---

## 9. Data Model

### 9.1 Persistence

**SwiftData** (iOS 17+). Single local store, no CloudKit sync in MVP.

### 9.2 Entities

```swift
@Model
final class ReadingText {
    @Attribute(.unique) var id: UUID
    var title: String
    var content: String         // raw text, post-processed
    var sourceType: SourceType  // .paste, .pdf, .shareExtension
    var createdAt: Date
    var updatedAt: Date
    var wordCount: Int
    
    // Session state
    var currentTokenIndex: Int
    var isCompleted: Bool
    var completedAt: Date?
    
    // Relationships
    @Relationship(deleteRule: .cascade) var sessions: [ReadingSession]
    
    init(title: String, content: String, sourceType: SourceType) { /* ... */ }
}

enum SourceType: String, Codable {
    case paste, pdf, shareExtension, url
}

@Model
final class ReadingSession {
    @Attribute(.unique) var id: UUID
    var startedAt: Date
    var endedAt: Date?
    var tokensRead: Int
    var averageWPM: Int
    
    var text: ReadingText?
}

@Model
final class UserPreferences {
    // Singleton — enforced at query time
    var wpm: Int = 350
    var fontFamily: String = "EB Garamond"
    var fontSize: Double = 72
    var backgroundColor: String = "#0A0A0A"  // hex
    var textColor: String = "#FFFFFF"
    var pinColor: String = "#D94050"
    var highlightPin: Bool = true
    var showGuideLines: Bool = true
    var punctuationPauses: Bool = true
}
```

### 9.3 Derived values

- **`estimatedMinutes`**: `wordCount / currentWPM`
- **`progressPercent`**: `currentTokenIndex / wordCount`
- **`isInProgress`**: `0 < progressPercent < 1`

---

## 10. Visual Design System

### 10.1 Colors

| Role              | Value       | Usage                                |
|-------------------|-------------|--------------------------------------|
| Stage             | `#080809`   | Background app chrome                |
| Reader            | `#0A0A0A`   | Reader stage (configurable)          |
| Surface           | `#16161C`   | Settings cards, sheets               |
| Line              | `#1E1E26`   | Hairline dividers                    |
| Line-2            | `#2A2A34`   | Elevated borders                     |
| Ink               | `#F0F0F2`   | Primary text                         |
| Ink Muted         | `#9A9AA6`   | Secondary text                       |
| Ink Subtle        | `#5A5A66`   | Tertiary text, placeholders          |
| **Pin · Accent**  | `#D94050`   | The only accent — used where attention goes |

### 10.2 Typography

| Family          | Weights  | Usage                                         |
|-----------------|----------|-----------------------------------------------|
| EB Garamond     | 400, 500 | Reading surface (40–96pt)                     |
| Fraunces        | 400, 500 | Titles, display (18–40pt), italic for emphasis |
| Inter           | 300–600  | UI labels, buttons, descriptions (11–14pt)   |
| JetBrains Mono  | 400, 500 | Metadata, numerals, eyebrow labels (8–11pt)   |

**Reading-surface font choices** (user-selectable):
- EB Garamond (default — classical, high legibility)
- Fraunces
- Georgia
- Inter
- JetBrains Mono

### 10.3 Spacing scale

Base unit: 4pt. Scale: 4, 8, 12, 16, 20, 24, 32, 48, 64.

### 10.4 Radii

- Cards / surfaces: 14pt
- Sheets: 20pt (top corners)
- Chips / swatches: 6pt
- FAB: circular (24pt radius)

### 10.5 Elevation

Flat design. No drop shadows on surfaces. Exception: FAB has a soft accent-tinted shadow (`0 8px 24px rgba(217,64,80,0.3)`).

---

## 11. Interaction Model

### 11.1 Gestures (Reader)

| Gesture                       | Action                                |
|-------------------------------|---------------------------------------|
| Tap anywhere                  | Toggle play/pause                     |
| Swipe left                    | Rewind 5 words                        |
| Swipe right                   | Fast-forward 5 words                  |
| Swipe down from top edge      | Dismiss session (with confirmation if progress) |
| Swipe up from bottom edge     | Open settings drawer                  |
| Long-press                    | (v2) Show sentence context            |

### 11.2 Haptics

Use `UIImpactFeedbackGenerator`:
- **Soft** — on play/pause toggle
- **Medium** — on paragraph break
- **Rigid** — on session completion

Respect `UIAccessibility.prefersReducedMotion` — disable all haptics except completion.

### 11.3 Edge cases

- **Incoming phone call or Siri:** Auto-pause. Don't resume automatically on return.
- **App backgrounded:** Auto-pause. Save `currentTokenIndex` immediately.
- **Device rotation:** Landscape support on iPad only. iPhone locks portrait in Reader.
- **Low power mode:** No behavior change — the app is already low-draw.
- **Font not loaded yet:** Fall back to `NSAttributedString` with `.bodyDesign(.serif)` attribute.

---

## 12. Settings Schema

Persisted in `UserPreferences` (see §9.2). All settings apply globally — per-text overrides are not supported in v1.

| Key              | Type       | Default      | Range / Values                |
|------------------|------------|--------------|-------------------------------|
| `wpm`            | Int        | 350          | 150–800, step 10              |
| `fontFamily`     | String     | EB Garamond  | 5 options (see §10.2)         |
| `fontSize`       | Double     | 72           | 36–120, step 2                |
| `backgroundColor`| Hex string | `#0A0A0A`    | any                           |
| `textColor`      | Hex string | `#FFFFFF`    | any                           |
| `pinColor`       | Hex string | `#D94050`    | any                           |
| `highlightPin`   | Bool       | true         |                               |
| `showGuideLines` | Bool       | true         |                               |
| `punctuationPauses` | Bool    | true         |                               |

---

## 13. Technical Architecture

### 13.1 Platform

- **Target:** iOS 17.0+ (SwiftData availability baseline)
- **Language:** Swift 5.9+
- **UI:** SwiftUI (100%)
- **Persistence:** SwiftData
- **PDF:** PDFKit (system framework)
- **Share extension:** App Extension target, App Group container

### 13.2 Module boundaries

```
Pin/
├─ App/
│  ├─ PinApp.swift
│  └─ RootView.swift
├─ Features/
│  ├─ Library/
│  ├─ NewReading/
│  ├─ Reader/
│  └─ Completion/
├─ Core/
│  ├─ ReaderEngine/          ← tokenizer, pin calc, timing
│  ├─ TextProcessing/        ← PDF extraction, cleanup
│  └─ Persistence/           ← SwiftData schema, migrations
├─ DesignSystem/
│  ├─ Colors.swift
│  ├─ Typography.swift
│  └─ Components/
└─ ShareExtension/
```

### 13.3 Dependencies

Goal: **zero** third-party dependencies in v1. Everything listed above ships with iOS. If a need arises, document it in a PR with justification.

### 13.4 Testing

- **Unit tests:** ReaderEngine (pin calculation, tokenization, timing math), TextProcessing (PDF de-hyphenation, header detection)
- **Snapshot tests:** Library row, Reader stage, Completion screen (dark mode only)
- **UI tests:** Critical path — add paste text, start reader, pause, resume, complete

---

## 14. Performance Requirements

| Metric                           | Target        | Notes                                    |
|----------------------------------|---------------|------------------------------------------|
| Cold launch to Library           | < 400 ms      | On iPhone 13 or newer                    |
| Library scroll                   | 60 fps        | Even with 100+ texts                     |
| PDF parse (10-page doc)          | < 2 s         | Show progress spinner above 500 ms       |
| PDF parse (100-page doc)         | < 15 s        | Parse on background queue                |
| Word render latency (tap to play)| < 50 ms       | First word should feel instant           |
| Word display timing accuracy     | ±20 ms        | Critical for perceived smoothness        |
| Memory footprint (Reader active) | < 80 MB       | Even with a 100k-word text loaded        |

---

## 15. Accessibility

### 15.1 Dynamic Type

- UI chrome (Library, Settings, Completion) respects Dynamic Type
- Reader surface does NOT auto-scale — the user's chosen font size is explicit and intentional

### 15.2 Reduce Motion

When `UIAccessibility.isReduceMotionEnabled`:
- Disable the soft radial glow behind the pin
- Disable paragraph-break ¶ glyph animation
- Keep timing exact — the reader is the product

### 15.3 VoiceOver

RSVP and VoiceOver are fundamentally incompatible — VoiceOver reads full text at its own pace. The solution:
- Reader's play button has label "Play speed reader. Or double-tap to enable VoiceOver reading of the full text."
- Double-tap enters a fallback mode that reads the full text via `AVSpeechSynthesizer` at normal speed
- Library, Settings, and Completion are fully VoiceOver compliant

### 15.4 Color contrast

Default palette meets WCAG AA for all UI text. The user-configurable Reader colors are not constrained — this is a reading instrument; user choice wins. But the settings screen shows a live preview with a subtle contrast indicator.

---

## 16. Development Roadmap

### Phase 1 — Reader Core (Week 1–2)

- Project scaffold, design system tokens, base typography
- `ReaderEngine` with tokenizer, pin calc, timing, play/pause
- Reader screen with tap-to-toggle
- Hardcoded sample text, no persistence
- **Exit criteria:** A developer can tap into the Reader, read a sample Marcus Aurelius passage end to end at 350 WPM with correct pin placement.

### Phase 2 — Input & Persistence (Week 3–4)

- SwiftData schema
- Paste Text screen
- PDF upload via document picker
- Library screen with list, continue-reading card, and `+` button
- **Exit criteria:** Paste or upload a PDF, close the app, reopen, resume from the last word.

### Phase 3 — Settings & Polish (Week 5)

- In-session settings drawer
- All settings persisted and applied live
- Completion screen
- Haptics, reduce-motion handling
- Empty states, error states (PDF parse failures, empty paste)
- **Exit criteria:** Every setting in §12 works. Completion screen shows accurate stats.

### Phase 4 — Extension & Ship (Week 6)

- Share Sheet extension
- App icon, launch screen
- App Store metadata, screenshots, privacy descriptions
- TestFlight beta with 10 users
- **Exit criteria:** Shipped to TestFlight.

### Phase 5 — V2 (post-launch)

- URL article extraction
- EPUB support
- iCloud sync via CloudKit
- iPad layout
- Audio/haptic pulse mode (metronomic tick per word — for hands-free visual-only reading)
- Spritz-style pin rule as an option

---

## 17. Open Decisions

| # | Decision                                                 | Recommendation                    | Impact                        |
|---|----------------------------------------------------------|-----------------------------------|-------------------------------|
| 1 | App name — keep *Pin* or rename?                         | Confirm or pick alternative       | Icon, store listing, identity |
| 2 | Launch price model                                       | One-time purchase, $9.99          | Monetization                  |
| 3 | Include "Read again at +10% WPM" in Completion?          | No — keep it non-gamified         | Product character             |
| 4 | Paragraph-break indicator — ¶ glyph, blank frame, or fade? | Brief ¶ glyph at 25% opacity    | Reader rhythm                 |
| 5 | Long-word strategy — stretch duration, split, or accept? | Stretch duration (currently specced) | Comprehension on long words |
| 6 | Pin rule variants — expose Spritz-style as option?       | v2 only                           | Settings complexity           |
| 7 | Analytics — local only or anonymized remote?             | Local only in v1                  | Privacy stance                |

---

*End of brief.*
