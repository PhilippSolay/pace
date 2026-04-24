# T03: ReaderWord + GuideLines + sample text

**Slice:** S02
**Milestone:** M001

## Goal

Land the two design-system primitives that render a single word with pin highlighting + optional glow + optional guide-lines, plus a hardcoded Marcus Aurelius passage for `/reader` to consume.

## Must-Haves

### Truths
- `<ReaderWord word="considered" size={54} glow />` renders with `consider` left of center, red `e` on center, `d` to the right
- Pin character uses `var(--accent)`; rest uses `var(--ink)`; font is `var(--font-reader)`
- `<GuideLines word="considered" size={54} />` renders two 1 × 22 px bars positioned at the measured pin-glyph center
- `samples.ts` exports `MARCUS_AURELIUS_PASSAGE` (string) of ~250–350 words

### Artifacts
- `src/design-system/components/ReaderWord.tsx` — ≥ 50 lines
- `src/design-system/components/GuideLines.tsx` — ≥ 45 lines (with measurement logic)
- `src/core/reader-engine/samples.ts` — ≥ 15 lines including the passage

### Key Links
- `ReaderWord` → `pin.ts` (imports `pinIndex`)
- `ReaderWord` → `tokens.css` (uses `var(--accent)`, `var(--ink)`, `var(--font-reader)`)
- `GuideLines` → `pin.ts` + `tokens.css`

## Steps

1. Write `ReaderWord.tsx`:
   - Reference implementation in `/tmp/pace-design/pace/project/screens/reader.jsx` lines 1–40
   - Container: absolute centered, flex baseline-aligned
   - Left span: `position: absolute; right: 100%; white-space: pre;`
   - Pin span: inline, accent color
   - Right span: inline flow
   - Glow: absolute radial-gradient, size-based dimensions, `pointer-events: none; z-index: 0;`
   - Props: `word: string`, `size?: number = 54`, `glow?: boolean = true`
2. Write `GuideLines.tsx`:
   - Reference `/tmp/pace-design/pace/project/screens/reader.jsx` lines 43–77
   - Hidden measurer span using same font+size; `useLayoutEffect` to read `getBoundingClientRect().width`
   - Two bars positioned at `left: calc(50% + measured/2)`, top/bottom of the size-relative vertical center
   - Fallback width `size * 0.35` before measurement completes
3. Write `samples.ts`:
   - Export `MARCUS_AURELIUS_PASSAGE: string` — use Meditations Book II passage (~300 words, common Loeb translation). Include 2–3 paragraph breaks
4. Add component-level test if trivial (render test via `@testing-library/react` — optional in S02; skip if install churn not worth it)
5. Typecheck, lint, build — all clean
6. Commit + T03-SUMMARY

## Context

- `ReaderWord` is the **central visual moment** of the product — get it pixel-faithful. Verify against the design handoff's rendering in welcome.jsx + reader.jsx.
- `GuideLines` only work after fonts are loaded (otherwise measurement uses fallback font and is off). Await `document.fonts.ready` inside the effect before the first measurement.
- Sample text: public domain (Meditations is pre-1928). Don't import from a package; hardcode the string.
- Do NOT add `@testing-library/react` just for T03 — unit-test render behavior in T04 if needed.
