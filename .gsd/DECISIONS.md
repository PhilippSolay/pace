# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? |
|---|------|-------|----------|--------|-----------|------------|
| D001 | M001 | scope | App name | Pace | User-confirmed via repo + folder name; supersedes brief's "Pin" placeholder (closes open decision v1 §17.1) | No |
| D002 | M001 | library | Xcode project generation | xcodegen | Declarative project.yml keeps pbxproj out of diffs; already installed | **Superseded by D013** |
| D003 | M001 | arch | Minimum deployment target | iOS 17.0 | SwiftData availability baseline (brief §13.1) | **Superseded by D014** |
| D004 | M001 | arch | UI framework | SwiftUI 100% | Brief §13.1 mandates; no UIKit mixing | **Superseded by D015** |
| D005 | M001 | data | Persistence | SwiftData local store | Brief §13.1; no CloudKit sync in v1 | **Superseded by D017** |
| D006 | M001 | convention | Third-party dependencies | Zero runtime deps | Brief §13.3; keep stack native | **Superseded by D019** |
| D007 | M001 | scope | Reading-surface gamification | None (no "Read again at +10% WPM") | Brief anti-persona; §17.3 | No |
| D008 | M001 | pattern | Paragraph-break indicator | ¶ glyph at 25% opacity, brief fade | §17.4 recommendation | Yes |
| D009 | M001 | pattern | Long-word handling | Stretch duration, capped 1.5× | §7.3 + §17.5 | Yes |
| D010 | M001 | scope | Spritz-style pin rule | v2 only, not in MVP settings | §17.6 | No |
| D011 | M001 | scope | Analytics | Local only, no remote telemetry | §17.7 | Yes — v2 opt-in |
| D012 | M001 | scope | Launch price model | Deferred — placeholder one-time $9.99 | §17.2 | Yes |
| D013 | M001 | arch | **Platform pivot: native → web** | Installable PWA (mobile web app) | Faster ship, no App Store gate, cross-device, preserves 100% of reader UX on mobile browsers; design handoff is already React | No — this is the product now |
| D014 | M001 | arch | Build tool | Vite 5 + TypeScript 5 strict | Zero-config SPA with first-class PWA support via vite-plugin-pwa; simpler than Next.js for SPA needs | Yes — migrate to Next.js if SSR becomes relevant |
| D015 | M001 | arch | UI framework | React 18 | Design handoff is React; largest ecosystem for required libs (Dexie-hooks, pdf.js wrappers) | No |
| D016 | M001 | library | Router | React Router 6 | Familiarity, maturity, no server assumptions | Yes — TanStack Router if we need file-based routes |
| D017 | M001 | data | Persistence | Dexie.js over IndexedDB | Best-in-class IndexedDB wrapper, live-query hooks, tiny footprint (~20 KB gzip) | Yes — replace with SQLite/WASM if local-relational becomes important |
| D018 | M001 | library | PDF parser | pdfjs-dist (Mozilla) | Same engine as Firefox's built-in viewer; supports text extraction via `getTextContent()` | No |
| D019 | M001 | convention | Third-party dependencies | Minimal — only react, react-router, dexie, zustand, pdfjs-dist runtime | Keep bundle small but don't hand-roll IndexedDB or PDF parsing | Yes |
| D020 | M001 | library | Styling | Vanilla CSS + CSS variables | Handoff uses inline-style + CSS vars; drops in unchanged, no Tailwind overhead, no CSS-in-JS runtime | Yes |
| D021 | M001 | library | State | Zustand (reader + settings) + dexie-react-hooks (library data) | Zustand is lighter than Redux for this scope; live-query hooks remove manual subscriptions for lists | Yes |
| D022 | M001 | scope | Auth in MVP | Anonymous only — Apple/email buttons visible on Welcome but surface "coming soon" toast | Ship faster; v1 is local-first so no sync to gate. Supabase Auth in v2 | Yes — pull forward if demand |
| D023 | M001 | infra | Host | Self-hosted Docker on user's VPS (76.13.192.55) via Traefik at `pace.solay.cloud` | User already runs `crea.solay.cloud` + `ai-salon.solay.cloud` on this stack; matches existing ops pattern | Yes — move to Vercel/Cloudflare if VPS load is an issue |
| D024 | M001 | arch | Share integration | Web Share Target API (PWA manifest) | Native share sheet is N/A on web; Web Share Target is the equivalent for installed PWAs | No |
| D025 | M001 | pattern | Fonts | Google Fonts CDN via `<link>` in index.html | Handoff uses this; self-hosting adds build complexity without perf win (fonts cached by SW on first visit) | Yes — self-host if we need finer control |
| D026 | M001 | scope | Welcome screen added | Spec'd in design handoff; v1 shows anonymous path only | Honors design handoff while deferring auth scope | No |
| D027 | M001 | scope | Standalone Settings screen added | Spec'd in design handoff §6.7; drawer becomes subset-for-mid-session-tweaks | Full settings live in Settings screen; drawer narrowed to speed/size/pin | No |
| D028 | M001 | pattern | `punctuationPauses` default | OFF in v2 (was ON in v1 brief) | Design handoff shows toggle off in Settings screen; respect designer intent | Yes |
| D029 | M001 | pattern | Typography — user-selectable alternatives | 4 display + 6 reader + 2 UI + 2 mono options | Design handoff tweaks panel exposes these | Yes |
