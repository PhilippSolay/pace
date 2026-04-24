---
id: T03
parent: S02
milestone: M001
provides:
  - ReaderWord component — single-word display with pin character + optional radial glow
  - GuideLines component — measured-width vertical bars above/below the pin glyph
  - MARCUS_AURELIUS_PASSAGE + SAMPLE_TITLE — hardcoded dev sample (deleted in S03)
requires:
  - slice: S02
    provides: pin.ts from T01 (used by both ReaderWord and GuideLines)
affects: [S02/T04, S05/settings preview]
key_files:
  - src/design-system/components/ReaderWord.tsx
  - src/design-system/components/GuideLines.tsx
  - src/core/reader-engine/samples.ts
key_decisions:
  - "ReaderWord uses absolute-positioned left span + inline pin+right flow (per brief §7.5 preferred approach) — single-text-layout alternative deferred unless kerning drift becomes visible"
  - "GuideLines measure pin-glyph width via hidden span + useLayoutEffect, then re-measure after document.fonts.ready — avoids first-paint misalignment"
  - "ReaderWord is aria-hidden — RSVP is incompatible with screen readers (D033); the /reader container will surface the accessibility note"
  - "Used pin[idx] ?? '' fallback for noUncheckedIndexedAccess compliance"
  - "Sample passage is George Long 1862 translation (public domain); 4 paragraphs with explicit \\n\\n breaks to exercise paragraph-break token handling"
patterns_established:
  - "Components that depend on engine logic (pinIndex, tokenize) import from @/core/reader-engine/* — no circular imports via design-system"
  - "Pin-width-dependent positioning always measures the glyph at runtime; don't hardcode font-metric ratios"
drill_down_paths:
  - .gsd/milestones/M001/slices/S02/tasks/T03-PLAN.md
duration: 8min
verification_result: pass
completed_at: 2026-04-25T00:45:00Z
---

# T03: ReaderWord + GuideLines + sample text

**Reader's visual primitives shipped: ReaderWord renders with pin highlighting + glow; GuideLines measures pin-glyph width and positions 1px × 22px bars above/below; Marcus Aurelius sample ready for T04 to tokenize.**

## What Happened

Wrote `ReaderWord.tsx` (~75 lines) following brief §7.5 + the design handoff's `reader.jsx` (lines 1–40). Root container absolute-positioned at `top: 50%, left: 50%`; left portion via `position: absolute; right: 100%` so pin's left edge sits on the stage vertical centerline; pin character in `var(--accent)`; optional radial-gradient glow sized `1.6× × 1.2×` the font size with `color-mix(in oklab, accent 35%, transparent)`.

Wrote `GuideLines.tsx` (~83 lines). Hidden measurement span uses the same font + size + letter-spacing as ReaderWord. `useLayoutEffect` reads `getBoundingClientRect().width` on mount and again after `document.fonts.ready` resolves (fonts load async; first paint uses fallback metrics). Two bars at `left: calc(50% + measuredWidth/2)` with transforms positioning above/below by `size/2` plus/minus bar height.

Wrote `samples.ts` with the `MARCUS_AURELIUS_PASSAGE` string — 4 paragraphs separated by `\n\n` (exercises the T01 tokenizer's paragraph-break detection), about 300 words.

One detour: the original generation attempt tripped a false-positive content filter mid-file. Recovered by keeping `GuideLines.tsx` focused and writing `samples.ts` in a separate turn with a shorter, cleaner passage.

## Deviations

- Skipped the alternate "single-Text-with-AttributedString" rendering strategy mentioned in brief §7.5 — the three-span absolute-positioned approach matches the reference design exactly and works. Revisit only if kerning drift is visible in QA.

## Verification

### Observable Truths
| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | typecheck clean | ✓ PASS | |
| 2 | lint clean | ✓ PASS | |
| 3 | build clean | ✓ PASS | bundle unchanged (components are tree-shaken until T04 imports) |
| 4 | tests still pass | ✓ PASS | 53/53 |
| 5 | ReaderWord uses pinIndex correctly | ✓ PASS | import + slice call |
| 6 | GuideLines awaits document.fonts.ready | ✓ PASS | useLayoutEffect body confirms |

### Artifacts
| File | Lines | Status |
|------|-------|--------|
| ReaderWord.tsx | 76 | ✓ SUBSTANTIVE |
| GuideLines.tsx | 83 | ✓ SUBSTANTIVE |
| samples.ts | 24 | ✓ SUBSTANTIVE |

## Files Created/Modified

- `src/design-system/components/ReaderWord.tsx` (new)
- `src/design-system/components/GuideLines.tsx` (new)
- `src/core/reader-engine/samples.ts` (new)
