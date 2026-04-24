---
id: T02
parent: S01
milestone: M001
provides:
  - 11 color CSS variables + 4 font variables with system-first fallbacks + 5 radii + 9-step spacing scale (tokens.css)
  - Modern minimal reset with dvh units, overscroll lock, reduce-motion support, focus-visible-only rings (reset.css)
  - Wordmark component with hero/display/header variants — single source of truth for the Pace brand mark
  - Google Fonts loading for 4 shipped families; runtime cache declared in vite-plugin-pwa from T01
  - Design-fidelity audit report confirming no contradictions with the design handoff
requires:
  - slice: S01
    provides: Vite + React + TS + PWA scaffold (T01)
affects: [S01/T03, S02, S03, S05, S06]
key_files:
  - src/design-system/tokens.css
  - src/design-system/reset.css
  - src/design-system/components/Wordmark.tsx
  - src/main.tsx
  - src/app/App.tsx
  - index.html
  - .gsd/milestones/M001/slices/S01/tasks/T02-DESIGN-AUDIT.md
key_decisions:
  - "Dispatched 4 parallel agents for independent subtasks (tokens, reset, Wordmark, audit) — integration wiring done by me after"
  - "Applied YAGNI against audit findings: keep 9-step spacing scale (no 2px sub-grid tokens); no letter-spacing tokens (components inline with comments). Rationale: CSS vars are for cross-theme values; single-use literals stay inline"
  - "`color-scheme: dark` on :root so browser form controls pick up dark styling without JS"
  - "dvh (dynamic viewport height) on #root — handles Safari collapsing address bar without JS"
  - "overscroll-behavior: none on html+body — protects the future swipe-down-to-dismiss reader gesture from pull-to-refresh"
  - "Wordmark uses React.createElement for the `as` prop typing rather than JSX generic dance"
patterns_established:
  - "Design-system primitives live at src/design-system/components/ and are always consumed via default export"
  - "CSS variables are the only way to resolve colors/fonts/radii — no hardcoded hex or font-family strings outside tokens.css"
  - "Google Fonts: families imported via <link>; SW runtime-caches stylesheets + woff2 per the plugin config"
drill_down_paths:
  - .gsd/milestones/M001/slices/S01/tasks/T02-PLAN.md
  - .gsd/milestones/M001/slices/S01/tasks/T02-DESIGN-AUDIT.md
duration: 6min
verification_result: pass
completed_at: 2026-04-24T22:20:00Z
---

# T02: Design tokens + Google Fonts + Wordmark

**Tokens, reset, Wordmark primitive, and fonts wired — app renders "Pace." on a dark stage using only CSS variables; typecheck, lint, and build all clean.**

## What Happened

Dispatched 4 parallel agents: (1) tokens.css writer, (2) reset.css writer, (3) Wordmark.tsx writer, (4) design-fidelity audit against `/tmp/pace-design/pace/project/` source files.

Agents 1–3 produced deliverables that matched spec; agent 4 reported the implementation as clean (no contradictions) with three additive suggestions (2 px spacing sub-grid tokens, letter-spacing tokens, 3-size wordmark coverage). The 3-size wordmark was already in agent 3's output. The spacing and letter-spacing suggestions were declined under YAGNI — CSS variables are for values that change with theme; one-off literals stay inline with a comment.

After agents returned, I wired integration: Google Fonts `<link>` in `index.html` (4 families), CSS imports in `main.tsx` (tokens.css + reset.css), replaced the placeholder in `App.tsx` with `<Wordmark size="hero" as="h1" />` on a `--stage` background. `npm run typecheck` and `npm run lint` clean; `npm run build` succeeds with 1.74 KB CSS (0.91 KB gzip) and 143.44 KB JS (46.16 KB gzip), still well under the 180 KB budget.

## Deviations

- Audit recommended adding 2 px spacing sub-grid tokens (10/14/18/22/26/34/44/54) and letter-spacing tokens. Declined on YAGNI — components use literals inline for non-semantic values.
- Agent 3 added `lineHeight: 1` to the Wordmark root style (not in the plan but a correct design-fidelity addition from the welcome.jsx reference).

## Verification

### Observable Truths
| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | `npm run typecheck` exits 0 | ✓ PASS | clean stdout |
| 2 | `npm run lint` exits 0 | ✓ PASS | clean stdout |
| 3 | `npm run build` exits 0 | ✓ PASS | CSS 1.74 KB + JS 143.44 KB emitted; 5 precache entries |
| 4 | tokens.css declares 29 CSS variables | ✓ PASS | 11 colors + 4 fonts + 5 radii + 9 spacing |
| 5 | `--accent` resolves to `#D94050` | ✓ PASS | static inspection of tokens.css:41 |
| 6 | Wordmark has hero/display/header variants | ✓ PASS | SIZE_SPECS table in Wordmark.tsx:24-28 |
| 7 | App renders Wordmark (no hardcoded hex) | ✓ PASS | App.tsx uses `<Wordmark size="hero" />` + `var(--stage)` |

### Artifacts
| File | Expected | Status |
|------|----------|--------|
| tokens.css | 11 colors + 4 fonts + 5 radii + 9 spacing, comments | ✓ SUBSTANTIVE (80 lines) |
| reset.css | Modern reset with mobile-specific tweaks | ✓ SUBSTANTIVE (76 lines) |
| Wordmark.tsx | React+TS component with 3 size variants | ✓ SUBSTANTIVE (63 lines) |
| T02-DESIGN-AUDIT.md | Audit report from agent 4 | ✓ SUBSTANTIVE |

### Key Links
| From | To | Via | Status |
|------|----|----|--------|
| main.tsx | tokens.css | `import '@/design-system/tokens.css'` | ✓ WIRED |
| main.tsx | reset.css | `import '@/design-system/reset.css'` | ✓ WIRED |
| App.tsx | Wordmark | `import Wordmark from '@/design-system/components/Wordmark'` | ✓ WIRED |
| index.html | Google Fonts | `<link href="...fonts.googleapis.com/css2?..." />` | ✓ WIRED |

## Files Created/Modified

- `src/design-system/tokens.css` — 11 colors + 4 fonts + 5 radii + 9 spacing (new)
- `src/design-system/reset.css` — modern reset with dvh + overscroll-lock (new)
- `src/design-system/components/Wordmark.tsx` — 3-size brand mark (new)
- `src/main.tsx` — import tokens + reset
- `src/app/App.tsx` — render `<Wordmark size="hero" />` on `--stage`
- `index.html` — Google Fonts link for 4 families
- `.gsd/milestones/M001/slices/S01/tasks/T02-DESIGN-AUDIT.md` — agent 4 report
