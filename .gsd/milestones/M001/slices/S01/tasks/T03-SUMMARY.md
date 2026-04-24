---
id: T03
parent: S01
milestone: M001
provides:
  - BrowserRouter with 7 stub routes (/, /library, /new, /reader, /reader/:id, /settings, /completion/:id)
  - Eyebrow primitive — mono uppercase small-caps label used across all §6 screens
  - RouteStub helper — shared S01 container that every route renders inside
  - Demonstrates composition — routes use Wordmark + Eyebrow + CSS vars with no hardcoded values
requires:
  - slice: S01
    provides: Vite + PWA scaffold (T01), design tokens + Wordmark (T02)
affects: [S02, S03, S05, S06, S07]
key_files:
  - src/app/App.tsx
  - src/app/routes/_stub.tsx
  - src/app/routes/Welcome.tsx
  - src/app/routes/Library.tsx
  - src/app/routes/NewReading.tsx
  - src/app/routes/Reader.tsx
  - src/app/routes/Settings.tsx
  - src/app/routes/Completion.tsx
  - src/design-system/components/Eyebrow.tsx
key_decisions:
  - "Route stubs use a shared RouteStub helper — keeps S01 visual consistent and is trivial to delete as real feature containers land slice-by-slice"
  - "/ routes to Welcome for now. The Dexie-backed hasCompletedWelcome gate lands in S03 when the preferences table exists"
  - "Reader stub uses `var(--reader)` background while other stubs use `var(--stage)` — proves the two distinct surface tokens resolve correctly"
  - "No lazy-loading on routes in S01 — the bundle is 52 KB gzip, well under the 180 KB budget. Revisit when pdfjs lands in S04"
patterns_established:
  - "Route components default-export a PascalCase name matching the file"
  - "Stub routes compose Wordmark + Eyebrow + RouteStub and nothing else"
  - "useParams typed explicitly — `<{ id: string }>` generic satisfies noUncheckedIndexedAccess"
drill_down_paths:
  - .gsd/milestones/M001/slices/S01/S01-PLAN.md
duration: 5min
verification_result: pass
completed_at: 2026-04-24T22:28:00Z
---

# T03: Router + stub routes + Eyebrow primitive

**BrowserRouter wired; 7 stub routes live; Eyebrow primitive in place. App composes Wordmark + Eyebrow + route-stub shell entirely through CSS variables.**

## What Happened

Wrote `Eyebrow.tsx` per the settings.jsx reference pattern (mono 9px, 0.28em letter-spacing, `--ink-3`, uppercase transform, weight 500). Created `src/app/routes/` with seven stub components plus a shared `_stub.tsx` container that centers content on a themed background (`--stage` or `--reader` depending on the route). Rewrote `App.tsx` from a single-div placeholder into a `<BrowserRouter>` + `<Routes>` config mapping each path to its stub.

`npm run typecheck`, `npm run lint`, `npm run build` all clean. Bundle grew 46 → 52 KB gzip (+6 KB for React Router) — still well under the 180 KB budget.

## Deviations

- None. Plan said "install nothing new" — React Router was added in T01, so this held.

## Verification

### Observable Truths
| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | typecheck exits 0 | ✓ PASS | clean stdout |
| 2 | lint exits 0 | ✓ PASS | clean stdout |
| 3 | build exits 0 | ✓ PASS | `✓ built in 5.20s`, 52.41 KB gzip JS |
| 4 | 7 routes declared | ✓ PASS | App.tsx:12-20 — 7 `<Route>` children |
| 5 | No hardcoded hexes in routes | ✓ PASS | grep shows only `var(--*)` usages |
| 6 | Eyebrow matches design handoff pattern | ✓ PASS | settings.jsx:36-46 cross-check |

### Artifacts
| File | Expected | Status |
|------|----------|--------|
| App.tsx | BrowserRouter + 7 Routes | ✓ SUBSTANTIVE (22 lines) |
| 6 route stubs + _stub.tsx | Compose Wordmark/Eyebrow, no side effects | ✓ SUBSTANTIVE |
| Eyebrow.tsx | Mono uppercase label component | ✓ SUBSTANTIVE (30 lines) |

### Key Links
| From | To | Via | Status |
|------|----|----|--------|
| App.tsx | 6 route components | default imports | ✓ WIRED |
| Library.tsx | Eyebrow + Wordmark | design-system components | ✓ WIRED |
| _stub.tsx | tokens.css | `background: var(--stage)` | ✓ WIRED |

## Files Created/Modified

- `src/design-system/components/Eyebrow.tsx` (new)
- `src/app/App.tsx` — replaced placeholder with router
- `src/app/routes/_stub.tsx` (new — shared container)
- `src/app/routes/{Welcome,Library,NewReading,Reader,Settings,Completion}.tsx` (new)
