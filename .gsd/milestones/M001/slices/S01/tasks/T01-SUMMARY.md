---
id: T01
parent: S01
milestone: M001
provides:
  - Vite 5 + React 18 + TypeScript 5 strict scaffold, buildable and dev-serveable
  - vite-plugin-pwa configured with manifest, service worker, Google Fonts runtime cache
  - Strict TS flags (noUncheckedIndexedAccess, exactOptionalPropertyTypes) enabled from day one
  - ESLint + Prettier + EditorConfig toolchain, zero warnings on scaffold
  - Path alias @/* → src/*
  - .gitignore amended with Node/Vite patterns (Xcode/Swift patterns kept for history)
requires: []
affects: [S01/T02, S01/T03, S01/T04, S01/T05, S01/T06, S01/T07]
key_files:
  - package.json
  - vite.config.ts
  - tsconfig.json
  - index.html
  - src/main.tsx
  - src/app/App.tsx
  - .eslintrc.cjs
  - .prettierrc
key_decisions:
  - "Wrote scaffold manually instead of running npm create vite — avoids interactive prompts about the non-empty directory and keeps existing files (.gsd/, briefs, Pace-handoff.zip) untouched"
  - "Workbox runtimeCaching for Google Fonts (both stylesheets and woff2) baked in from S01 — offline-capable fonts without waiting for S07"
  - "Build script runs tsc --noEmit first, then vite build — type errors fail the build"
  - "React Router not yet installed (promised in T04); scaffold App.tsx is a single div to prove the React mount works"
patterns_established:
  - "Path alias @/* resolves to src/* in both TS (tsconfig paths) and Vite (resolve.alias with fileURLToPath)"
  - "PWA manifest lives in vite.config.ts, not a standalone JSON file — single source of truth with the rest of the build config"
drill_down_paths:
  - .gsd/milestones/M001/slices/S01/tasks/T01-PLAN.md
duration: 12min
verification_result: pass
completed_at: 2026-04-24T21:55:00Z
---

# T01: Vite + React + TS + PWA scaffold

**Pace's web MVP boots: strict-TS Vite scaffold with PWA plugin, dev server + production build both green, service worker + manifest generated.**

## What Happened

Wrote `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/app/App.tsx`, `src/vite-env.d.ts`, `.eslintrc.cjs`, `.prettierrc`, `.editorconfig`, `.nvmrc` manually — skipping the interactive `npm create vite` step because the working directory already holds `.gsd/`, briefs, and the design handoff zip.

`npm install` pulled 483 packages. A type error from `vite.config.ts` (`node:url`) was fixed by adding `@types/node`.

`npm run typecheck` → 0 errors. `npm run lint` → 0 errors. `npm run build` → BUILD OK, 45.95 KB gzip initial JS, dist/sw.js + dist/manifest.webmanifest produced. `npm run dev --port 5199` → Vite ready in 654 ms, `curl localhost:5199` returns the Pace HTML shell with React mount point + Google Fonts preconnects.

## Deviations

- **Port 5173 was occupied** by another project's dev server (looked like SvelteKit from the response body) — ran dev verification on port 5199. Documented; not a blocker. User can `lsof -i :5173` to find the squatter if curious.
- **React Router wasn't installed in T01 itself** — moved to T04 per plan structure. Scaffold App.tsx is a single div.
- **No `dist/` output verification for icons** — T01 installs the manifest but placeholder icons at `icons/icon-192.png` etc. don't exist yet; build still succeeds because vite-plugin-pwa only references them in the manifest. T07 generates the actual icon assets.

## Verification

### Observable Truths
| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `npm run typecheck` exits 0 | ✓ PASS | clean stdout |
| 2 | `npm run lint` exits 0 | ✓ PASS | clean stdout |
| 3 | `npm run build` exits 0 | ✓ PASS | `✓ built in 2.09s`; dist/ populated |
| 4 | `dist/manifest.webmanifest` valid | ✓ PASS | name/short_name/theme_color/standalone/portrait all present |
| 5 | `dist/sw.js` exists | ✓ PASS | 1427 bytes + workbox chunk 21445 bytes |
| 6 | `npm run dev` serves HTML with React mount | ✓ PASS | HTTP 200 + `<div id="root"></div>` + `/src/main.tsx` script |
| 7 | TS strict flags active | ✓ PASS | noUncheckedIndexedAccess + exactOptionalPropertyTypes would otherwise accept loose code that tsc now rejects |

### Artifacts
| File | Expected | Status |
|------|----------|--------|
| package.json | Pace metadata + scripts + deps | ✓ SUBSTANTIVE |
| vite.config.ts | React + PWA plugins + runtime cache | ✓ SUBSTANTIVE (71 lines) |
| tsconfig.json | Strict TS with extra strict flags | ✓ SUBSTANTIVE |
| src/main.tsx + App.tsx | React root + placeholder | ✓ SUBSTANTIVE |
| .eslintrc.cjs + .prettierrc | Lint config | ✓ SUBSTANTIVE |

### Key Links
| From | To | Via | Status |
|------|----|----|--------|
| main.tsx | App.tsx | `import App from '@/app/App'` | ✓ WIRED |
| vite.config.ts | vite-plugin-pwa | `VitePWA({...})` in plugins | ✓ WIRED |
| package.json build | vite + tsc | `tsc --noEmit && vite build` | ✓ WIRED |

## Files Created/Modified

- `package.json` — deps, devDeps, scripts
- `vite.config.ts` — React + PWA config
- `tsconfig.json` — strict TS
- `index.html` — app shell with preconnects
- `src/main.tsx`, `src/app/App.tsx`, `src/vite-env.d.ts`
- `.eslintrc.cjs`, `.prettierrc`, `.editorconfig`, `.nvmrc`
- `.gitignore` — added Node/Vite patterns (kept Xcode/Swift for pre-pivot history)
