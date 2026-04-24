# M001: Pace v1 MVP — Context

**Gathered:** 2026-04-24
**Status:** Ready for planning (discussion phase skipped per user)

## Source Material

- **Brief:** [`pin_dev_brief.md`](../../../pin_dev_brief.md) at repo root (28KB, v1.0, Apr 2026). Note: filename retains original "pin_" prefix; content is authoritative despite the placeholder product name.
- **Design file:** `https://api.anthropic.com/v1/design/h/Zz5YARxoMqnqbqJPfKSg4Q?open_file=Pace.html` — 404 from WebFetch (likely requires Anthropic session auth). Proceeding from brief alone; if user provides an exported copy, integrate into slice work.

## Locked Decisions (see DECISIONS.md)

- D001: App name = **Pace** (not Pin)
- D002: xcodegen for Xcode project generation
- D003: iOS 17.0 minimum (SwiftData)
- D004: SwiftUI 100%, no UIKit mixing
- D005: SwiftData local, no CloudKit in v1
- D006: Zero third-party runtime dependencies
- D007–D012: Brief §17 resolved — see register

## Product Shape (from brief)

- **Platform:** iPhone iOS 17+ native, portrait-locked in Reader
- **Core loop:** paste/upload text → Library → Reader (RSVP with pin-at-midpoint rule) → Completion
- **Reader math:** `pinPosition(length) = ceil(length ÷ 2)`; base WPM 350; punctuation multipliers 1.55× / 2.3×; long-word cap 1.5×
- **Palette:** near-black stages, single accent `#D94050`, four typeface families (EB Garamond, Fraunces, Inter, JetBrains Mono)
- **Zero gamification**, no social, no recommendations

## Module Boundaries (brief §13.2)

```
Pace/
├─ App/                     ← PaceApp, RootView
├─ Features/                ← Library, NewReading, Reader, Completion
├─ Core/
│  ├─ ReaderEngine/         ← tokenizer, pin calc, timing
│  ├─ TextProcessing/       ← PDF extraction, cleanup
│  └─ Persistence/          ← SwiftData schema
├─ DesignSystem/            ← Colors, Typography, Components
└─ ShareExtension/          ← share sheet target
```

## Verification Environment

- `xcodebuild` requires `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer` prefix (command-line tools are the default; Xcode 26.4.1 is installed but not selected)
- iOS 17 simulator available for UI verification
- No CI configured yet; local verification only until ship milestone

## Agent's Discretion

- Exact xcodegen `project.yml` shape and target structure
- Font-loading mechanism (bundle vs Google Fonts API)
- Test framework choice (XCTest default)
- SwiftData migration strategy if schema evolves
- Snapshot-test library selection (swift-snapshot-testing is common; only add if needed)

## Deferred to v2 (per brief §4 + §17)

URL article extraction, EPUB, iCloud sync, iPad layout, audio/haptic pulse mode, Spritz pin rule option, long-press sentence context.
