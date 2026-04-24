# S01: Scaffold + Design System + Router

**Goal:** Buildable Vite + React + TypeScript project with PWA plugin configured, design-system tokens wired as CSS variables, Google Fonts loading, React Router shell with stubbed routes, and a working `Wordmark` + `Eyebrow` primitive.

**Demo:** `npm run dev` serves the app at `localhost:5173/` rendering the Pace wordmark in Fraunces. `/library` and `/reader` each render a one-liner stub. `npm run build` exits 0; `dist/sw.js` + `dist/manifest.webmanifest` exist. No throwaway specimen route — tokens are proven by their use in real routes.

## Must-Haves

- Vite 5 + React 18 + TypeScript 5 strict + vite-plugin-pwa (✓ done in T01)
- `src/design-system/tokens.css` with all 11 color variables + 4 font variables + 5 radii + spacing scale
- `src/design-system/reset.css` — minimal normalize
- Google Fonts `<link>` in `index.html` with only the 4 shipped families (EB Garamond, Fraunces, Inter, JetBrains Mono); Georgia is a system font, no import
- `Wordmark` component — renders "Pace." with accent italic light period
- `Eyebrow` component — mono uppercase small-caps label used across Library/Settings/Reader
- React Router 6 with route stubs for `/`, `/library`, `/new`, `/reader`, `/reader/:id`, `/settings`, `/completion/:id`
- `npm run build` exits 0 with 0 TS errors and 0 lint errors

**Intentionally NOT in S01:**
- Slider, Toggle — deferred to S05 (settings drawer is where they first matter)
- `/_ds` specimen route — dropped; tokens proven by real-route use
- First-run routing gate — deferred to S03 (needs Dexie)
- Full PWA Lighthouse ≥ 90 — baseline plumbing ships here, full gate is S07

## Tasks

- [x] **T01: Vite + React + TS + PWA scaffold** *(done — see T01-SUMMARY.md)*

- [x] **T02: Design tokens + Google Fonts + Wordmark** *(done — see T02-SUMMARY.md, T02-DESIGN-AUDIT.md)*
  Write `src/design-system/tokens.css` (11 color vars, 4 font vars, 5 radii, 9-step spacing), `src/design-system/reset.css`, add Google Fonts `<link>` to `index.html` for 4 families, write `src/design-system/components/Wordmark.tsx`, wire imports into `main.tsx`. Verify at runtime: `getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() === '#D94050'` and `document.fonts.check('1em Fraunces')` resolves true after `document.fonts.ready`.

- [x] **T03: Router + route stubs + Eyebrow primitive** *(done — see T03-SUMMARY.md)*
  Install nothing new (`react-router-dom` already in T01 deps). Wire `<BrowserRouter>` in `main.tsx`; split `App.tsx` into a routes config. Each route renders a one-line stub referencing the feature it'll become. Write `src/design-system/components/Eyebrow.tsx`. Use it on the Library stub as a smoke test that CSS vars + fonts + primitives all compose.

## Files Likely Touched

- `src/design-system/tokens.css` (new)
- `src/design-system/reset.css` (new)
- `src/design-system/components/Wordmark.tsx` (new)
- `src/design-system/components/Eyebrow.tsx` (new)
- `src/main.tsx` (add CSS imports + Router)
- `src/app/App.tsx` (rewrite as routes config)
- `src/app/routes/Welcome.tsx`, `Library.tsx`, `NewReading.tsx`, `Reader.tsx`, `Settings.tsx`, `Completion.tsx` (stubs — each < 15 lines)
- `index.html` (add Google Fonts link)
- `tests/unit/tokens.test.ts` (optional — verify CSS custom-property resolution)

## Risks

- **Google Fonts as runtime dep** — if `fonts.googleapis.com` is blocked on first load, app falls back to system fonts. SW caches on first successful load (configured in T01's vite.config.ts). Acceptable.
- **Strict TS noUncheckedIndexedAccess** adds friction with router `useParams`. Worth it; unwrap with explicit `!` or guard where we control the input.
