# T01: Vite + React + TS + PWA scaffold

**Slice:** S01
**Milestone:** M001
**Supersedes:** The iOS/xcodegen scaffold attempt (see T01-SUMMARY.md, now historical — branch `gsd/M001/S01` still holds that commit for audit).

## Goal

Produce a buildable Vite 5 + React 18 + TypeScript 5 strict project with vite-plugin-pwa configured, ESLint + Prettier in place, `npm run dev` serving a working `Hello` page, and `npm run build` exiting 0.

## Must-Haves

### Truths
- `npm run dev` starts Vite and serves `http://localhost:5173/` rendering `<App />`
- `npm run build` exits 0 with no TS errors and no lint errors
- `npm run preview` serves the production bundle
- `dist/manifest.webmanifest` exists with `name: "Pace"`, `short_name: "Pace"`, `start_url: "/"`, `display: "standalone"`, `theme_color: "#0A0A0A"`, `background_color: "#080809"`
- `dist/sw.js` exists (Workbox-generated service worker)
- TypeScript compile is strict: `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`

### Artifacts
- `package.json` — declares deps (react, react-dom, react-router-dom) + devDeps (vite, @vitejs/plugin-react, vite-plugin-pwa, typescript, @types/react, @types/react-dom, eslint, prettier, @typescript-eslint/*, eslint-config-prettier) + scripts (`dev`, `build`, `preview`, `lint`, `typecheck`)
- `vite.config.ts` — imports `@vitejs/plugin-react` and `vite-plugin-pwa`; PWA plugin configured with `registerType: 'autoUpdate'`, manifest fields, `workbox: { globPatterns: ['**/*.{js,css,html,svg,png,ico}'] }`
- `tsconfig.json` — strict mode flags set
- `tsconfig.node.json` — for Vite config
- `.eslintrc.cjs` — extends `eslint:recommended`, `plugin:@typescript-eslint/recommended`, `plugin:react-hooks/recommended`, `prettier`
- `.prettierrc` — single quotes, semi, trailing comma all, print width 100
- `.editorconfig` — LF, UTF-8, 2-space indent
- `.nvmrc` — `20`
- `.gitignore` — amend existing with `node_modules/`, `dist/`, `dev-dist/`, `.vite/`, `coverage/`
- `index.html` — minimal shell: `<div id="root"></div>`, viewport meta, theme-color meta, preconnect to fonts.googleapis.com (actual font link added in T03)
- `src/main.tsx` — React root mounting `<App />`
- `src/app/App.tsx` — placeholder: `<div>Hello, Pace.</div>`
- `src/vite-env.d.ts` — Vite type reference

### Key Links
- `main.tsx` → `src/app/App.tsx` via `import App from './app/App'`
- `vite.config.ts` → `vite-plugin-pwa` via `VitePWA({ ... })` in the `plugins: []` array
- `package.json` `"type": "module"` so `.ts` configs resolve as ESM

## Steps

1. `npm create vite@latest . -- --template react-ts` (answer prompts: do NOT overwrite the `.gitignore`, `.gsd/`, `pin_dev_brief.md`, or `pace_dev_brief.md`). If Vite refuses because the directory is non-empty, scaffold to a temp dir and copy files in.
2. `npm install vite-plugin-pwa react-router-dom`
3. `npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier eslint-plugin-react-hooks prettier`
4. Write `vite.config.ts` with React + PWA plugins
5. Tighten `tsconfig.json` — add `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`
6. Write `.eslintrc.cjs`, `.prettierrc`, `.editorconfig`, `.nvmrc`
7. Replace `index.html` with Pace-specific head (title, meta viewport, theme color, preconnect)
8. Verify scripts: add `typecheck: tsc --noEmit`, `lint: eslint . --ext ts,tsx`, amend `build: tsc --noEmit && vite build` so build runs typecheck first
9. Amend `.gitignore` with `node_modules/`, `dist/`, `dev-dist/`, `.vite/`, `coverage/`
10. Run `npm run typecheck` — expect 0 errors
11. Run `npm run lint` — expect 0 errors
12. Run `npm run build` — expect 0 errors + `dist/` with `sw.js` + `manifest.webmanifest`
13. Run `npm run dev` briefly in background to verify the dev server starts; kill with `pkill -f 'vite'` when verified
14. Write `.gsd/milestones/M001/slices/S01/tasks/T01-SUMMARY.md` (this version supersedes the iOS-era summary, which stays on the orphan branch)

## Context

- Node 20+ required. `.nvmrc` pins this.
- The repo already has `.gitignore` with iOS/Xcode patterns — keep those but add Node/Vite patterns.
- Do NOT install: `@use-gesture/react`, `framer-motion`, `styled-components`, `tailwindcss`. Gesture work hand-rolled in S02. Animations in vanilla CSS. No CSS-in-JS runtime. No Tailwind.
- Placeholder icons not in T01 scope — T07 wires the full icon pipeline. For now, PWA plugin uses whatever `vite-plugin-pwa` defaults produce.
- The orphan `Pace.xcodeproj/` folder and `gsd/M001/S01` branch are harmless; leave them.
