# S05: Standalone Settings Screen + In-Session Drawer

**Goal:** Library gear opens the full Settings screen; bottom-up swipe in Reader opens a two-knob drawer; all preferences persist live to Dexie and apply immediately.

## Must-Haves
- Full SettingsView matching design handoff settings.jsx §6.7 MINUS Account section (per D032 — v1 subset)
- Sections: READING (speed/font-size sliders, font picker), APPEARANCE (preview tile + bg/text/pin color rows), BEHAVIOR (4 toggles), DATA (export JSON / clear all), ABOUT (version only)
- SettingsDrawer in Reader — the mid-session subset (speed, size, pin color swatches)
- `useLiveQuery` on preferences so UI reflects changes everywhere
- Reader consumes preferences: wpm, fontSize (passed to ReaderWord), backgroundColor (replaces hardcoded var(--reader)), textColor, pinColor, highlightPin, showGuideLines, punctuationPauses
- Export: download a JSON Blob with all texts + sessions + preferences
- Clear all: confirm prompt → db.delete() → reset preferences to defaults → navigate `/`

## Tasks
- [ ] T01 4 agents: SettingsView + SettingsDrawer + reader-preferences wiring + FontColorPickers
