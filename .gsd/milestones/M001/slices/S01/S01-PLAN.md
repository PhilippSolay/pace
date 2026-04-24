# S01: Scaffold + Design System + Router

**Goal:** Buildable Vite + React + TypeScript project with PWA plugin configured, design-system tokens wired as CSS variables, Google Fonts loading, React Router shell with stubbed routes, and a specimen route (`/_ds`) that renders every color swatch and typography style.

**Demo:** `npm run dev` serves the app at `http://localhost:5173/_ds` with every color swatch labeled, every typeface rendering its sample string, and the "Pace." wordmark correct. `npm run build` produces a `dist/` bundle; `npm run preview` serves it. Lighthouse PWA category ≥ 50 (full 90+ score waits for S07).

## Must-Haves

- Vite 5 + TypeScript 5 strict + React 18 + vite-plugin-pwa installed and configured
- `tsconfig.json` with `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- `src/design-system/tokens.css` exposing all 11 color variables + 5 radii + 4 font variables from brief §10
- `index.html` linking the Google Fonts CSS with all 10 families (EB Garamond, Fraunces, Inter, JetBrains Mono, Spectral, Lora, Crimson Pro, Manrope, IBM Plex Mono, Newsreader)
- React Router 6 with stub routes: `/` (Welcome placeholder), `/library`, `/new`, `/reader`, `/reader/:id`, `/settings`, `/completion/:id`, `/_ds`
- `/_ds` specimen page renders all design tokens — throwaway, removed in a later slice
- `manifest.webmanifest` generated with correct name, short_name, theme_color, background_color, start_url
- `npm run build` exits 0 with zero type errors and zero lint errors
- Placeholder 192/512 PNG icons (auto-generated via plugin from a single SVG source)
- `Wordmark` component rendering "Pace." with accent italic light period — used on every screen
- `.editorconfig`, `.eslintrc.cjs`, `.prettierrc`, `.nvmrc` (Node 20)

## Tasks

- [ ] **T01: Vite + React + TS + PWA scaffold**
  `npm create vite@latest . -- --template react-ts`, add vite-plugin-pwa, React Router, configure strict TS, ESLint, Prettier. Confirm `npm run dev` serves `Hello` and `npm run build` exits 0.

- [ ] **T02: Design system tokens + reset**
  Write `src/design-system/tokens.css` with all 11 color vars + font vars + radii + spacing scale. Write `src/design-system/reset.css`. Import both in `main.tsx`. Verify at runtime that `getComputedStyle(document.documentElement).getPropertyValue('--accent') === '#D94050'`.

- [ ] **T03: Google Fonts + Wordmark component**
  Add `<link>` to `index.html` with the full family string. Write `src/design-system/components/Wordmark.tsx` — renders `Pace<span class="wordmark-period">.</span>` with the accent italic treatment. Write small CSS module. Add a Playwright smoke test that waits for `document.fonts.ready` and asserts Fraunces is loaded.

- [ ] **T04: Router + stub routes + first-run redirect gate**
  Install `react-router-dom`. Set up routes per must-haves. Each route is a simple `<div>` with its name. Wire a top-level effect that reads (eventually, from Dexie) `hasCompletedWelcome` and routes to `/` or `/library` — in S01 use a URL param `?welcome=1` placeholder, proper Dexie gate lands in S03.

- [ ] **T05: Specimen route `/_ds`**
  Render 11 color swatches with `--token`, hex, usage per brief §10.1. Render 4 typeface rows with sample strings per design handoff's design-system screen. Render Slider, Toggle, Eyebrow placeholders (implementations in S01 T06 or deferred).

- [ ] **T06: Slider, Toggle, Eyebrow primitives**
  Port the three from `/tmp/pace-design/pace/project/screens/*.jsx` into React+TS components living at `src/design-system/components/`. Pure visuals; no behavior yet (Slider accepts `value`, no `onChange` — interactivity comes later).

- [ ] **T07: PWA manifest + placeholder icons + build verification**
  Configure vite-plugin-pwa with manifest fields. Generate 192 + 512 + maskable icons from a single SVG source (use `pwa-assets-generator` or write a tiny script). Verify `dist/manifest.webmanifest` valid, `dist/sw.js` exists, Lighthouse PWA audit scores ≥ 50 (full 90+ after share-target in S07).

## Files Likely Touched

- Root: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `.eslintrc.cjs`, `.prettierrc`, `.editorconfig`, `.nvmrc`, `index.html`, `.gitignore` (amend)
- `src/main.tsx`, `src/vite-env.d.ts`
- `src/app/App.tsx`, `src/app/routes/Welcome.tsx`, `src/app/routes/Library.tsx`, `src/app/routes/NewReading.tsx`, `src/app/routes/Reader.tsx`, `src/app/routes/Settings.tsx`, `src/app/routes/Completion.tsx`, `src/app/routes/DesignSystem.tsx`
- `src/design-system/tokens.css`, `src/design-system/reset.css`
- `src/design-system/components/Wordmark.tsx`, `Slider.tsx`, `Toggle.tsx`, `Eyebrow.tsx`
- `public/icons/icon-source.svg`, generated `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`
- `tests/unit/tokens.test.ts` (verify CSS vars are readable in jsdom)
- `tests/e2e/fonts.spec.ts` (Playwright: fonts load)

## Risks

- **Google Fonts as a runtime dependency** — if `fonts.googleapis.com` is blocked (user behind corp firewall, network off on first load), app falls back to system fonts. Acceptable for MVP given SW will cache on first successful load.
- **vite-plugin-pwa icons:** default auto-generation needs a source SVG. If icon design isn't ready, ship a Pace-wordmark SVG as placeholder — user can replace later without code changes.
- **Strict TS `noUncheckedIndexedAccess`** adds friction in engine code. Worth it for catching tokenizer off-by-one bugs; accept the friction.
- **Lighthouse PWA ≥ 50 gate in S01**: without a share_target and with placeholder icons we won't hit 90 yet. The ≥ 50 gate proves the plumbing works; full score lives in S07.
