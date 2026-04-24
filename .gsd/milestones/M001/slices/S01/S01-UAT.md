# S01 · Non-blocking User Acceptance Test

Scope: verify that S01 (scaffold + design system + router) is usable before starting S02. Run this whenever convenient — S02 planning does **not** wait on your sign-off.

## Setup

```sh
# From the repo root on branch gsd/M001/S01-web (or main after squash-merge)
nvm use 20          # if you use nvm
npm install         # only needed if node_modules is missing
npm run dev         # defaults to :5173; pass -- --port 5199 if :5173 is taken
```

## Checks

### 1. Design tokens resolve

1. Open `http://localhost:5173/` in a browser
2. Open DevTools Console and run:
   ```js
   const s = getComputedStyle(document.documentElement);
   console.log({
     accent: s.getPropertyValue('--accent').trim(),
     stage:  s.getPropertyValue('--stage').trim(),
     ink:    s.getPropertyValue('--ink').trim(),
     reader: s.getPropertyValue('--reader').trim(),
   });
   ```
3. **Expected:** `{ accent: '#D94050', stage: '#080809', ink: '#F0F0F2', reader: '#0A0A0A' }`

### 2. Fonts load from Google Fonts

1. In DevTools → Network → Font tab, reload the page
2. Confirm requests to `fonts.googleapis.com` and `fonts.gstatic.com` succeed
3. Run in Console:
   ```js
   await document.fonts.ready;
   console.log({
     fraunces: document.fonts.check('1em Fraunces'),
     garamond: document.fonts.check('1em "EB Garamond"'),
     inter: document.fonts.check('1em Inter'),
     mono: document.fonts.check('1em "JetBrains Mono"'),
   });
   ```
4. **Expected:** all four `true`

### 3. Wordmark is pixel-faithful at hero size

1. Navigate to `/` — the Welcome stub
2. **Expected:** "Pace" renders in Fraunces 96px, the trailing `.` is a deep crimson (`#D94050`), italic, thinner weight, tucked slightly under the "e"
3. No layout shift after fonts finish loading (font-display: swap may cause a brief fallback flash — acceptable)

### 4. Routes render

Navigate manually to each URL and confirm it renders something meaningful without console errors:

| Path | Expected |
|------|----------|
| `/` | Welcome hero Wordmark + "WELCOME · TBD" eyebrow |
| `/library` | Header Wordmark + "LIBRARY · TBD" eyebrow |
| `/new` | "NEW READING · TBD" eyebrow |
| `/reader` | "READER · SAMPLE" eyebrow on a darker background (`--reader`) |
| `/reader/abc12345` | "READER · abc12345" eyebrow on `--reader` |
| `/settings` | "SETTINGS · TBD" eyebrow |
| `/completion/xyz99999` | "COMPLETION · xyz99999" eyebrow |

### 5. Build artifacts are valid

```sh
npm run build
ls dist/
cat dist/manifest.webmanifest | jq . 2>/dev/null || cat dist/manifest.webmanifest
```

**Expected:**
- `dist/sw.js`, `dist/workbox-*.js`, `dist/manifest.webmanifest` exist
- Manifest has `name: "Pace"`, `short_name: "Pace"`, `display: "standalone"`, `theme_color: "#0A0A0A"`
- Total bundle < 180 KB gzip (currently ~53 KB)

### 6. Mobile-only tweaks

1. Open DevTools → Device Toolbar → iPhone 14 / Android viewport
2. On `/` try to pull-to-refresh — should not rubber-band (overscroll-behavior: none)
3. On `/reader` the background is slightly darker than on `/library` — confirm the two surface tokens are visually distinct

## Reporting issues

File any failures as fix tasks in a new slice (`gsd/M001/S01-fix`) or as comments on this file — S02 will incorporate fixes as needed but won't block on them.
