# S01: Scaffold + Design System

**Goal:** Buildable SwiftUI iOS app target with declarative project generation, folder structure per brief §13.2, design-system tokens (colors + typography), and a placeholder RootView rendering a typography specimen.

**Demo:** `DEVELOPER_DIR=... xcodebuild -scheme Pace -destination 'generic/platform=iOS Simulator' build` succeeds clean; launching in the simulator shows a dark stage with "Pace." in Fraunces and each color/typeface swatch visible.

## Must-Haves

- `project.yml` + generated `Pace.xcodeproj` — SwiftUI iOS app target, iOS 17 deployment, Swift 5.9, bundle id `cloud.solay.pace`
- Folder layout: `Pace/App/`, `Pace/Features/`, `Pace/Core/ReaderEngine/`, `Pace/Core/TextProcessing/`, `Pace/Core/Persistence/`, `Pace/DesignSystem/{Colors,Typography,Components}`
- `DesignSystem/Colors.swift` — static `Palette` enum exposing all 9 tokens from brief §10.1 as `Color`
- `DesignSystem/Typography.swift` — `Font.pace(family:size:weight:)` resolver; families registered in `Info.plist` under `UIAppFonts`; fonts bundled under `Pace/Resources/Fonts/`
- `App/PaceApp.swift` + `App/RootView.swift` — app entry with NavigationStack showing the specimen
- `xcodebuild build` exits 0 with no warnings (treating new warnings as errors via `SWIFT_TREAT_WARNINGS_AS_ERRORS` is deferred to ship; S01 just needs clean build)

## Tasks

- [ ] **T01: Project scaffold via xcodegen**
  Write `project.yml`, run `xcodegen generate`, create empty source folders per boundary map, commit baseline `PaceApp.swift` stub that shows an empty black screen. Verify `xcodebuild build` succeeds.

- [ ] **T02: Fetch and register fonts**
  Download EB Garamond, Fraunces, Inter, JetBrains Mono from Google Fonts (static TTFs only — no variable fonts for v1 stability). Add to `Pace/Resources/Fonts/`, wire into `Info.plist` `UIAppFonts`, confirm `UIFont.familyNames` sees them at runtime via a quick unit test.

- [ ] **T03: Implement DesignSystem/Colors.swift**
  `enum Palette` with all 9 §10.1 colors as `Color` computed props; include a `.hex(String)` helper for runtime user-configurable stage/text/pin colors (Used by S05).

- [ ] **T04: Implement DesignSystem/Typography.swift**
  `enum Typeface { case garamond, fraunces, inter, mono }` with PostScript names; `Font.pace(_:size:weight:)` helper; expose semantic styles `.eyebrow`, `.displayLarge`, `.readerDefault`, `.bodyLabel`, `.metaMono`.

- [ ] **T05: RootView typography specimen**
  `RootView` renders: "Pace." title (Fraunces 26pt), eyebrow "VERSION 0.1" (JetBrains Mono 10pt), four rows showing each typeface with a sample string, nine color swatches with their names and hex values. Stage background `Palette.stage`. This is throwaway — replaced by LibraryView in S03.

## Files Likely Touched

- `project.yml` (new)
- `Pace.xcodeproj/` (generated)
- `Pace/App/PaceApp.swift`, `Pace/App/RootView.swift`
- `Pace/DesignSystem/Colors.swift`, `Pace/DesignSystem/Typography.swift`
- `Pace/Resources/Fonts/*.ttf` (bundled)
- `Pace/Info.plist` (or target-embedded plist)
- `PaceTests/FontRegistrationTests.swift` (T02 verification)
- `.gitattributes` (mark .ttf as binary if needed)

## Risks

- **Font licensing:** EB Garamond, Fraunces, Inter, JetBrains Mono are all SIL OFL — redistributable in app bundles. Capture license texts under `Pace/Resources/Fonts/LICENSES/`.
- **xcodegen schema drift:** xcodegen 2.45 may not support every Xcode 26 build setting. If generation warns, lock known-good settings in `configFiles`.
- **Font file size:** Bundling 4 families × 2 weights × TTF could add ~2–4 MB. Acceptable for MVP; compressed app assets later if needed.
