# T01: Project scaffold via xcodegen

**Slice:** S01
**Milestone:** M001

## Goal

Produce a buildable SwiftUI iOS 17 app skeleton (`Pace.xcodeproj`) with folder layout matching brief §13.2, managed declaratively via `project.yml`.

## Must-Haves

### Truths
- `xcodegen generate` completes without errors and produces `Pace.xcodeproj`
- `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcodebuild -scheme Pace -destination 'generic/platform=iOS Simulator' -configuration Debug build` exits 0
- App target bundle identifier is `cloud.solay.pace`
- Deployment target is iOS 17.0
- Swift language version is 5.9 or higher

### Artifacts
- `project.yml` — xcodegen spec (≥ 30 lines, defines one iOS app target + one unit-test target)
- `Pace/App/PaceApp.swift` — `@main struct PaceApp: App` with `WindowGroup { RootView() }` (min 12 lines)
- `Pace/App/RootView.swift` — placeholder `ZStack { Color.black.ignoresSafeArea(); Text("Pace").foregroundStyle(.white) }` (min 10 lines)
- Empty directories (`.gitkeep` files) under `Pace/Features/{Library,NewReading,Reader,Completion}/`, `Pace/Core/{ReaderEngine,TextProcessing,Persistence}/`, `Pace/DesignSystem/{Components}/`, `Pace/Resources/Fonts/`
- `Pace/Info.plist` with `UILaunchScreen` dict + `UIApplicationSceneManifest` for SwiftUI lifecycle
- `PaceTests/PaceTests.swift` — stub test case to verify the test target links

### Key Links
- `PaceApp.swift` → `RootView` via `RootView()` construction
- `project.yml` → `Pace/` via `sources` stanza
- `project.yml` → `PaceTests/` via `sources` stanza on the test target

## Steps

1. Write `project.yml` with:
   - `name: Pace`
   - `options: { bundleIdPrefix: cloud.solay, deploymentTarget: { iOS: "17.0" }, xcodeVersion: "26.0" }`
   - Target `Pace`: type `application`, platform `iOS`, sources `Pace`, Info `Pace/Info.plist`, settings `{ PRODUCT_BUNDLE_IDENTIFIER: cloud.solay.pace, SWIFT_VERSION: "5.9", ENABLE_PREVIEWS: YES, IPHONEOS_DEPLOYMENT_TARGET: "17.0", TARGETED_DEVICE_FAMILY: "1" }` (iPhone only in MVP)
   - Target `PaceTests`: type `bundle.unit-test`, dependencies `[Pace]`, sources `PaceTests`
2. Create directory tree: `Pace/App`, `Pace/Features/{Library,NewReading,Reader,Completion}`, `Pace/Core/{ReaderEngine,TextProcessing,Persistence}`, `Pace/DesignSystem/{Components}`, `Pace/Resources/Fonts`, `PaceTests`
3. Drop `.gitkeep` into every currently-empty directory so they round-trip through git
4. Write `Pace/App/PaceApp.swift` and `Pace/App/RootView.swift`
5. Write minimal `Pace/Info.plist` (SwiftUI lifecycle + launch screen dict)
6. Write `PaceTests/PaceTests.swift` with one passing `XCTest` case
7. Run `xcodegen generate` — confirm `Pace.xcodeproj` is created
8. Run `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer xcodebuild -scheme Pace -destination 'generic/platform=iOS Simulator' -configuration Debug -quiet build`
9. If build succeeds, write T01-SUMMARY and mark done

## Context

- xcodegen 2.45 is installed at `/opt/homebrew/bin/xcodegen`
- Xcode 26.4.1 lives at `/Applications/Xcode.app`; `xcode-select` points to CLT, so every `xcodebuild` call needs the `DEVELOPER_DIR` prefix until the user switches
- `.xcodeproj/` is tracked; `.xcodeproj/xcuserdata/` is gitignored (already handled in `.gitignore`)
- No `.swiftpm` yet — stay Xcode-native for now, revisit if a SPM extraction helps S02 unit tests
- Do NOT generate pbxproj by hand; regenerating from `project.yml` must always produce the same tree
