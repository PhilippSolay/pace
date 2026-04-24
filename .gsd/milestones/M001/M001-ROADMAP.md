# M001: Pace v1 — iOS RSVP Reader MVP

**Vision:** Ship an iPhone reading instrument that displays any text one word at a time, pinned to a fixed anchor so the eye never moves, with a Library for paste/PDF input, live settings, and a completion summary. TestFlight-ready by milestone end.

**Success Criteria:**
- A user on iOS 17+ can paste a long-form essay or upload a text PDF, open it in the Reader, control play/pause and speed with tap + gestures, pause/resume across app launches, adjust every setting in brief §12 live, finish the text, and see a completion summary with accurate stats.
- Reader displays the pin character at the stage's horizontal centerline per `ceil(length ÷ 2)`, with punctuation and long-word timing multipliers applied.
- Share Sheet extension accepts `public.plain-text` and `public.pdf` from other apps.
- Zero third-party runtime dependencies.
- Project builds on Xcode 26 for iOS 17 simulator and device without warnings at `-O`.

---

## Slices

- [ ] **S01: Scaffold + Design System** `risk:low` `depends:[]`
  > After this: app builds via `xcodebuild`, launches to a placeholder RootView rendering a typography specimen with all color tokens and font families loaded.

- [ ] **S02: Reader Engine + Reader View** `risk:high` `depends:[S01]`
  > After this: tapping into the Reader plays a hardcoded Marcus Aurelius sample at 350 WPM with correct pin placement, tap toggles play/pause, swipe jumps ±5 words. (Brief Phase 1 exit criteria.)

- [ ] **S03: Library + SwiftData + Paste Input** `risk:medium` `depends:[S02]`
  > After this: paste text from the New Reading sheet, see it in the Library with meta, tap to read, background the app, relaunch, resume from the last word.

- [ ] **S04: PDF Upload + Text Processing** `risk:medium` `depends:[S03]`
  > After this: pick a text-based PDF via the document picker; it's parsed, de-hyphenated, headers/footers stripped, added to the Library, and reads correctly.

- [ ] **S05: In-Session Settings Drawer** `risk:low` `depends:[S02]`
  > After this: swipe up from the Reader bottom edge to adjust WPM, font size, colors, pin color, font family, highlight/guides/punctuation toggles — all live, all persisted.

- [ ] **S06: Completion + Haptics + Accessibility** `risk:low` `depends:[S02]`
  > After this: finishing a text auto-transitions to the Completion screen with Pace/Time/Words/Text stats; haptics fire on play/pause/paragraph/finish; reduce-motion and VoiceOver fallback modes work.

- [ ] **S07: Share Extension + Launch Polish** `risk:medium` `depends:[S03, S04]`
  > After this: share plain text or a PDF from Safari to Pace, app icon and launch screen are final, empty/error states are polished, TestFlight-submittable build artefact exists.

---

## Boundary Map

### S01 → S02
Produces:
  `Pace.xcodeproj` + `project.yml` → buildable SwiftUI iOS app target "Pace"
  `DesignSystem/Colors.swift` → `Palette.stage`, `.reader`, `.surface`, `.line`, `.line2`, `.ink`, `.inkMuted`, `.inkSubtle`, `.accent` (Color static members)
  `DesignSystem/Typography.swift` → `Font.pace(_:size:)`, weights registered for EB Garamond / Fraunces / Inter / JetBrains Mono
  `App/PaceApp.swift`, `App/RootView.swift` → app entry point + NavigationStack
  `Info.plist` → font file registrations under `UIAppFonts`

Consumes: nothing (leaf node)

### S02 → S03, S05, S06
Produces:
  `Core/ReaderEngine/ReaderToken.swift` → `struct ReaderToken { text, isParagraphBreak, index }`
  `Core/ReaderEngine/Tokenizer.swift` → `func tokenize(_ text: String) -> [ReaderToken]`
  `Core/ReaderEngine/PinCalculator.swift` → `func pinIndex(for word: String) -> Int`
  `Core/ReaderEngine/ReaderEngine.swift` → `@MainActor class ReaderEngine: ObservableObject` with `currentIndex`, `isPlaying`, `play()`, `pause()`, `seek(to:)`, `jump(by:)`, `onFinish` callback
  `Features/Reader/ReaderView.swift` → SwiftUI view accepting `ReaderEngine` + `ReaderSettings`
  `Features/Reader/ReaderSettings.swift` → value type bundling wpm/font/colors/toggles

Consumes from S01:
  `DesignSystem/Colors.swift`, `DesignSystem/Typography.swift`, `App/RootView.swift` (push target)

### S03 → S04, S05, S06, S07
Produces:
  `Core/Persistence/ReadingText.swift` → `@Model ReadingText` with id/title/content/sourceType/createdAt/updatedAt/wordCount/currentTokenIndex/isCompleted/completedAt
  `Core/Persistence/ReadingSession.swift` → `@Model ReadingSession`
  `Core/Persistence/UserPreferences.swift` → `@Model UserPreferences` singleton
  `Core/Persistence/PaceModelContainer.swift` → `static let shared: ModelContainer`
  `Features/Library/LibraryView.swift` → list + continue card + `+` FAB
  `Features/NewReading/NewReadingSheet.swift` → modal with Paste / Upload PDF / URL(soon)
  `Features/NewReading/PasteTextView.swift` → TextEditor with title detection + 20-word validation

Consumes from S01, S02:
  `DesignSystem/*`, `ReaderEngine`, `ReaderSettings`

### S04 → S07
Produces:
  `Core/TextProcessing/PDFExtractor.swift` → `func extractText(from: PDFDocument) -> String`
  `Core/TextProcessing/TextCleaner.swift` → de-hyphenation, header/footer stripping, column collapse
  `Features/NewReading/PDFImportFlow.swift` → document picker + progress + error surfaces

Consumes from S03: `ReadingText`, `PaceModelContainer`

### S05 → S06
Produces:
  `Features/Reader/SettingsDrawer.swift` → sheet bound to `UserPreferences` with live updates
  `UserPreferences` now contains all §12 fields

Consumes from S02, S03: `ReaderEngine` (live WPM/font changes), `UserPreferences` model

### S06 → S07
Produces:
  `Features/Completion/CompletionView.swift` → stats card + Library / Read again actions
  `Core/Haptics/Haptics.swift` → `Haptics.softTap()`, `.mediumParagraph()`, `.rigidFinish()` (reduce-motion aware)
  `Core/Accessibility/VoiceOverFallback.swift` → AVSpeechSynthesizer wrapper

Consumes from S02, S03: `ReaderEngine.onFinish`, `ReadingSession` for stats

### S07 → (ship)
Produces:
  `ShareExtension/` target (`public.plain-text`, `public.pdf`) writing to App Group
  `Pace/Assets.xcassets/AppIcon.appiconset/` final icons
  Launch screen storyboard (required by App Store)
  Polished empty + error states across all features

Consumes from all prior slices

---

## Execution Notes

- Each slice lives on `gsd/M001/S##` branch, squash-merges to main as one commit
- Must-haves per task are observable and either static (file exists / exports present), command-runnable (`xcodebuild` succeeds, tests pass), or behavioral (simulator flow works)
- Build verification always prefixes with `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer` until user runs `sudo xcode-select -s /Applications/Xcode.app`
