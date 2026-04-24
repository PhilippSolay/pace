# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? |
|---|------|-------|----------|--------|-----------|------------|
| D001 | M001 | scope | App name | Pace | User-confirmed via repo + folder name; supersedes brief's "Pin" placeholder (closes open decision §17.1) | No |
| D002 | M001 | library | Xcode project generation | xcodegen | Declarative project.yml keeps pbxproj out of diffs; already installed | Yes — if migrating to Tuist |
| D003 | M001 | arch | Minimum deployment target | iOS 17.0 | SwiftData availability baseline (brief §13.1) | No |
| D004 | M001 | arch | UI framework | SwiftUI 100% | Brief §13.1 mandates; no UIKit mixing | No |
| D005 | M001 | data | Persistence | SwiftData local store | Brief §13.1; no CloudKit sync in v1 | Yes — v2 CloudKit |
| D006 | M001 | convention | Third-party dependencies | Zero runtime deps | Brief §13.3; keep stack native | Yes — with PR justification |
| D007 | M001 | scope | Reading-surface gamification | None (no "Read again at +10% WPM") | Brief anti-persona; §17.3 | No |
| D008 | M001 | pattern | Paragraph-break indicator | ¶ glyph at 25% opacity, brief fade | §17.4 recommendation | Yes |
| D009 | M001 | pattern | Long-word handling | Stretch duration, capped 1.5× | §7.3 + §17.5 | Yes |
| D010 | M001 | scope | Spritz-style pin rule | v2 only, not in MVP settings | §17.6 | No |
| D011 | M001 | scope | Analytics | Local only, no remote telemetry | §17.7 | Yes — v2 opt-in |
| D012 | M001 | scope | Launch price model | Deferred until TestFlight — placeholder one-time $9.99 | §17.2 | Yes |
