# T02 Design-fidelity audit

Scope: cross-check brief §10 tokens + §6.1/§6.2 wordmark specs against the authoritative design handoff in `/tmp/pace-design/pace/project/`.

Authoritative source: `Pace.html` `:root` (lines 11–32). Visual verification: `screens/design-system.jsx`. Usage cross-check: welcome/library/settings/reader screens.

---

## Tokens — match?

### Colors (11)

| token | my-plan (brief §10.1) | handoff `:root` | status | fix |
|---|---|---|---|---|
| `--page-bg`   | `#030303` | `#030303` (Pace.html:12)  | ✓ | — |
| `--stage`     | `#080809` | `#080809` (Pace.html:13)  | ✓ | — |
| `--reader`    | `#0A0A0A` | `#0A0A0A` (Pace.html:14)  | ✓ | — |
| `--surface`   | `#101014` | `#101014` (Pace.html:15)  | ✓ | — |
| `--surface-2` | `#16161C` | `#16161C` (Pace.html:16)  | ✓ | — |
| `--line`      | `#1E1E26` | `#1E1E26` (Pace.html:17)  | ✓ | — |
| `--line-2`    | `#2A2A34` | `#2A2A34` (Pace.html:18)  | ✓ | — |
| `--ink`       | `#F0F0F2` | `#F0F0F2` (Pace.html:19)  | ✓ | — |
| `--ink-2`     | `#9A9AA6` | `#9A9AA6` (Pace.html:20)  | ✓ | — |
| `--ink-3`     | `#5A5A66` | `#5A5A66` (Pace.html:21)  | ✓ | — |
| `--accent`    | `#D94050` | `#D94050` (Pace.html:22)  | ✓ | — |

Usage strings in `design-system.jsx:4–14` match brief §10.1 "Usage" column verbatim.

### Fonts (4)

| token | my-plan | handoff | status | fix |
|---|---|---|---|---|
| `--font-display` | `'Fraunces', serif`       | `'Fraunces', serif`       (Pace.html:28) | ✓ | — |
| `--font-reader`  | `'EB Garamond', serif`    | `'EB Garamond', serif`    (Pace.html:29) | ✓ | — |
| `--font-ui`      | `'Inter', sans-serif`     | `'Inter', sans-serif`     (Pace.html:30) | ✓ | — |
| `--font-mono`    | `'JetBrains Mono', monospace` | `'JetBrains Mono', monospace` (Pace.html:31) | ✓ | — |

Weight axes in brief §10.2 Google Fonts import match what's needed by the screens (Fraunces 300/400/500 italic 400, Inter 300–600, EB Garamond 400/500 italic 400, JetBrains Mono 400/500). Matches `Pace.html:9`.

### Radii (5)

| token | my-plan | handoff `:root` | status | fix |
|---|---|---|---|---|
| `--r-xl`  | 20 px | 20 px (Pace.html:26) | ✓ | — |
| `--r-lg`  | 14 px | 14 px (Pace.html:23) | ✓ | — |
| `--r-md`  | 10 px | 10 px (Pace.html:24) | ✓ | — |
| `--r-sm`  | 6 px  | 6 px  (Pace.html:25) | ✓ | — |
| `--r-fab` | 50%   | 50%   (Pace.html:27) | ✓ | — |

`--r-md: 10px` is used: buttons in design-system.jsx:122–123 + welcome.jsx:46,58 + input boxes design-system.jsx:132,138. So brief's Radii table is complete.

### Spacing scale (brief §10.3: 4, 8, 12, 16, 20, 24, 32, 48, 64)

Empirical spacing values observed across screens (px): 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 34, 40, 44, 48, 54, 64, 96. Status: ⚠ partial match.

- Values **in** brief scale: 4, 8, 12, 16, 20, 24, 32, 48, 64 — all used.
- Off-scale values found (non-exhaustive): `10` (gap, welcome.jsx:44, library.jsx:75,162), `14` (gap & padding, design-system.jsx:23,44,48,78,117,159), `18` (gap, design-system.jsx:177; margin reader.jsx:190), `22` (padding, design-system.jsx:78; height guides reader.jsx:65,71), `26` (padding, design-system.jsx:78), `34` (bottom positioning, welcome.jsx:8, library.jsx:163), `44` (height, safe-area, button heights — everywhere), `54` (paddingTop welcome.jsx:8), `10px 14px` (radius pill reader.jsx:130).

The `10` and `14` values are dominant gap/padding units. They're on the 2-px sub-grid, not the 4-px grid.

Fix: extend spacing scale to acknowledge the **2-px sub-grid used for tight UI** (gaps, hairline paddings): `2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 34, 40, 44, 48, 54, 64`. Or: document that brief §10.3 is the **macro** scale and that 2-px increments are allowed for dense component internals. Either works — but `--space-10` / `--space-14` need to exist in `tokens.css` or the components will drift.

---

## Wordmark treatment — match?

### Hero (Welcome — brief §6.1 row 1 vs `welcome.jsx:13–21`)

| property | my-plan | handoff | status |
|---|---|---|---|
| fontFamily | Fraunces (`--font-display`) | `var(--font-display)` | ✓ |
| fontWeight | 400 | 400 | ✓ |
| fontSize | 96 px | 96 px | ✓ |
| letterSpacing | −0.04em | −0.04em | ✓ |
| lineHeight | (unspecified in brief) | 1 | ⚠ add to spec |
| color | `--ink` | `--ink` | ✓ |
| period color | accent | `--accent` | ✓ |
| period fontStyle | italic | italic | ✓ |
| period fontWeight | 300 | 300 | ✓ |
| period marginLeft | −2 px | −2 px | ✓ |
| alignment | baseline flex | `display:flex; alignItems:baseline` | ✓ |

Brief wordmark spec for Welcome is **accurate**. Missing only `lineHeight: 1`.

Subtitle (brief §6.1 row 2 vs `welcome.jsx:22–27`): Fraunces italic 300, 16 px, `--ink-2`, marginTop 20 px — matches. Brief missed `letter-spacing: -0.01em` (welcome.jsx:25).

Metadata row (brief §6.1 row 3 vs `welcome.jsx:30–40`): Mono 8.5 px, letter-spacing 0.22em, `--ink-3` — matches. Brief missed `fontWeight: 500` (welcome.jsx:36) and the 2×2 `border-radius: 50%` separator dots in `--ink-3`.

### Header (Library — brief §6.2 row 2 vs `library.jsx:28–34`)

| property | my-plan | handoff | status |
|---|---|---|---|
| fontFamily | display (Fraunces) | `var(--font-display)` | ✓ |
| fontWeight | (not stated) | 400 | ⚠ add |
| fontSize | 26 px | 26 px | ✓ |
| letterSpacing | (not stated) | −0.03em | ⚠ add |
| period treatment | accent italic | `--accent` italic weight 300 | ✓ |
| period marginLeft | not stated | — (no nudge at 26 px) | ⚠ note |

Library header wordmark has **no `marginLeft: -2`** on the period (library.jsx:33), unlike the 96 px hero. Brief §6.2 row 2 is silent on this. Fix: state that the −2 px nudge is hero-only.

Right cluster (brief §6.2 row 2): "7 TEXTS" — brief says UI, `letter-spacing: 0.2em`. Handoff uses `font-ui`, 9.5 px, 0.2em, `--ink-3`, fontWeight 500 (library.jsx:37–40). ✓ — just add `fontWeight: 500`.

### Display (Design-system reference — `design-system.jsx:23–36`)

| property | handoff |
|---|---|
| fontFamily | display | 
| fontSize | 44 px |
| letterSpacing | −0.03em |
| period | accent italic 300, no marginLeft nudge |

This is the "display" size between hero (96) and header (26). Brief doesn't list a third wordmark scale. Not a blocker for T02, but if we build a reusable `<Wordmark>` component it needs to accept `size: 'hero' | 'display' | 'header'` with the right defaults.

---

## Details found in handoff that my plan doesn't capture

1. **Letter-spacing scale** — brief mentions letter-spacing only in-line. The handoff uses a distinct set of values worth promoting to tokens or at minimum documenting:
   - `-0.04em` — wordmark hero (96 px)
   - `-0.03em` — wordmark display/header (44, 26 px)
   - `-0.02em` — "Settings" screen title (settings.jsx:64), display typography samples (design-system.jsx:97)
   - `-0.01em` — welcome subtitle, continue-card title (library.jsx:71)
   - `-0.005em` — library row title (library.jsx:114)
   - `0` — body
   - `0.005em` — reader word (reader.jsx:21)
   - `0.04em` — mono hex-code labels (design-system.jsx:55,58)
   - `0.06em`, `0.08em` — mono small labels
   - `0.12em` — reader timer (reader.jsx:108), mono subhead (settings.jsx:77)
   - `0.2em` — eyebrows like "7 TEXTS", "CONTINUE READING"
   - `0.22em` — mono eyebrow small (metadata row welcome, reader overlay, component labels)
   - `0.28em` — mono eyebrow standard (section labels across design-system, settings)

   Fix: add `--track-tight` (−0.04em), `--track-snug` (−0.02em), `--track-body` (0), `--track-wide` (0.2em), `--track-eyebrow` (0.28em) — or just list them in a `typography.md`.

2. **`lineHeight: 1`** on all wordmark display text (welcome.jsx:17, reader.jsx:20). Brief silent.

3. **Wordmark period nudge rule** — `−2 px` only applies at hero size (96 px). Header (26 px) and display (44 px) omit it.

4. **Roundness runtime scaler** — `Pace.html:56–83` shows radii are multiplied by a `roundness` tweak (default `0.4`, range 0–2). The `:root` values are the "1.0" values, which is what the brief captures. At default tweak (`0.4`), rendered radii are `xl=8, lg=6, md=4, sm=2, fab=3`. This is a designer knob, not a user-facing setting (per D030 scope-tightening); we should ship with the `:root` "1.0" values. Worth a comment in `tokens.css` so no one is confused by screenshots.

5. **Mono font size 8.5 / 9 / 9.5 / 10 / 10.5 / 11** — the handoff uses half-pixel mono sizes liberally (welcome.jsx:35 uses 8.5, design-system.jsx:55 uses 10.5). Brief's type samples don't enumerate sub-pixel sizes.

6. **Continue-card gradient** — brief §6.2 has `linear-gradient(145deg, #1A1418 0%, #0F0A0C 100%)` — matches library.jsx:54 exactly. ✓

7. **Library continue-card accent stripe** — brief §6.2 says "3 px accent left stripe". library.jsx:58–61 confirms `width: 3, background: var(--accent)`. ✓

8. **FAB shadow** — brief §10.5 has `0 8px 24px rgba(217,64,80,0.3), 0 2px 6px rgba(0,0,0,0.5)`. library.jsx:167 confirms verbatim. ✓

9. **Settings section eyebrows** — use `--font-mono` 9 px, 0.28em, weight 500, `--ink-3` (settings.jsx:39–41). Library's "LIBRARY" eyebrow uses `--font-ui` 9.5 px 0.28em (library.jsx:90–93). Two different eyebrows — brief §6.2 only mentions the UI one. Add the mono variant too.

---

## Blockers or rewrites needed before T02 commits

None that block. Two must-add items for `tokens.css`:

1. **Spacing 2-px sub-grid values** (`10, 14, 18, 22, 26, 34, 44, 54`) — either extend the scale or add them as one-off utility values. Otherwise component code will hard-code and drift.
2. **Wordmark component spec** — brief specifies Welcome wordmark fully, Library wordmark partially, and omits the 44 px "display" size. Decide: (a) three fixed variants in a `<Wordmark size="hero|display|header" />` component, or (b) ad-hoc inline style per screen. Current plan is unclear.

Nice-to-adds (non-blocking):
- Add `lineHeight: 1` to wordmark spec in brief §6.1.
- Note that period `−2 px` nudge is hero-only (brief §6.1).
- Add the `letter-spacing` scale to brief §10 or a separate typography doc.
- Add two eyebrow styles (mono and UI) to brief §10.2.

---

## Confidence

**HIGH.** All 11 colors, 4 fonts, and 5 radii match bit-exact. Welcome wordmark spec is accurate. The divergences found are additive (missing values the brief should capture), not contradictory.
