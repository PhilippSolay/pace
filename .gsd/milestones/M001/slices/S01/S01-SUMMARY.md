---
id: S01
milestone: M001
title: "Scaffold + Design System + Router"
provides:
  - Vite 5 + React 18 + TypeScript 5 strict + vite-plugin-pwa scaffold
  - Design-system tokens (11 colors, 4 font vars with fallbacks, 5 radii, 9-step spacing)
  - Modern minimal CSS reset with dvh units and overscroll lock
  - Wordmark primitive (hero/display/header) and Eyebrow primitive
  - BrowserRouter with 7 stub routes across the §6 surface map
  - Google Fonts loading for 4 families + SW runtime cache
  - ESLint + Prettier + EditorConfig + strict TS with noUncheckedIndexedAccess + exactOptionalPropertyTypes
requires: []
produced_commits:
  - f8bb016  feat(S01/T01): Vite + React + TS + PWA scaffold
  - c8715f0  feat(S01/T02): design tokens + Google Fonts + Wordmark
  - HEAD     feat(S01/T03): BrowserRouter + route stubs + Eyebrow primitive
drill_down_paths:
  - .gsd/milestones/M001/slices/S01/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S01/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S01/tasks/T02-DESIGN-AUDIT.md
  - .gsd/milestones/M001/slices/S01/tasks/T03-SUMMARY.md
verification_result: pass
completed_at: 2026-04-24T22:30:00Z
---

# S01: Scaffold + Design System + Router — slice summary

**App compiles and boots: strict-TS Vite scaffold, 29 CSS variables wired, 4 Google Fonts loading, two design-system primitives in place, and 7-route BrowserRouter showing Pace. and contextual eyebrow labels across all §6 surfaces.**

## What Happened

Three tasks, three commits, all on `gsd/M001/S01-web`:

1. **T01** — Vite + React + TS strict + vite-plugin-pwa scaffold, ESLint + Prettier, path alias `@/*`, Workbox runtime cache for Google Fonts. Written manually to avoid clobbering existing `.gsd/` and briefs.

2. **T02** — dispatched 4 parallel agents (tokens, reset, Wordmark, design audit). Audit returned CLEAN — no contradictions vs the `/tmp/pace-design/pace/project/` handoff. Applied YAGNI to the two additive suggestions (2 px spacing sub-grid and letter-spacing tokens stay inline). Integration wiring (Google Fonts link, CSS imports, App render) done by me.

3. **T03** — Eyebrow primitive, 7 route stubs + shared RouteStub helper, BrowserRouter in `App.tsx`. Reader stub uses `--reader` background; all others use `--stage`.

## Bundle Trajectory

| After | JS gzip | CSS gzip | Total gzip |
|-------|---------|----------|------------|
| T01   | 45.95 KB | — | 45.95 KB |
| T02   | 46.16 KB | 0.91 KB | 47.07 KB |
| T03   | 52.41 KB | 0.91 KB | 53.32 KB |

Budget is 180 KB gzip initial. Current 30% of budget used; pdfjs is the next big addition (lazy-loaded in S04).

## Boundary-Map Contract (S01 → downstream)

All produced interfaces match the S01 section of [M001-ROADMAP.md Boundary Map](../../M001-ROADMAP.md#s01--s02):

- ✓ `package.json` + `vite.config.ts` — Vite 5 + React 18 + TS strict + PWA
- ✓ `index.html` — Google Fonts `<link>` + root div
- ✓ `src/main.tsx` — React root + (BrowserRouter moved into App.tsx; noted for S02 consumers)
- ✓ `src/app/App.tsx` + `src/app/routes/*.tsx` — route stubs
- ✓ `src/design-system/tokens.css` — 11 colors + 4 fonts + 5 radii + spacing scale
- ✓ `src/design-system/reset.css`
- ✓ `src/design-system/components/Eyebrow.tsx`
- ✓ `src/design-system/components/Wordmark.tsx`
- ✗ `src/design-system/components/Slider.tsx` — deferred to S05 per scope trim
- ✗ `src/design-system/components/Toggle.tsx` — deferred to S05 per scope trim
- ✓ `public/manifest.webmanifest` (via plugin)
- ✗ `/_ds` specimen route — dropped per scope trim (tokens proven through real-route use)

One contract deviation: `BrowserRouter` lives in `App.tsx` not `main.tsx`. Downstream consumers should import from `@/app/App` if they need the router context, or `useParams` / `useNavigate` from `react-router-dom` directly.

## Key Decisions (promoted to DECISIONS.md register)

- D020 + D021 stand (vanilla CSS + Zustand will land in S02; not needed in S01)
- No new decisions surfaced during S01 — all choices followed plan + trim

## Known Issues / Debt

- **Orphan iOS branch `gsd/M001/S01` and `Pace.xcodeproj/`** on disk — cleanup pending user approval (destructive git + rm).
- **Port 5173 sometimes occupied** by another project's dev server (SvelteKit response was observed during T01). Mitigation: `npm run dev -- --port 5199` when blocked.
- **Manifest referenced icons don't exist yet** (`/icons/icon-192.png` etc.). Build emits manifest anyway; browser shows "no icon found" warning in dev. Resolved by S07 via `pwa-assets-generator` or manual icon creation.

## Next Slice

**S02: Reader Engine + Reader View** (`risk:high`). Exit criteria: `/reader` plays a hardcoded Marcus Aurelius passage at 350 WPM with correct pin placement, tap toggles play/pause, swipes ±5 words.
