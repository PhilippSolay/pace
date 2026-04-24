# S06: Completion + Haptics + Accessibility

**Goal:** Finishing a text auto-transitions to Completion; haptics fire where supported; reduce-motion disables non-essential effects; screen-reader incompatibility is surfaced honestly per D033.

## Must-Haves
- `src/features/completion/CompletionView.tsx` — eyebrow FINISHED + Fraunces italic display title "That's it — you're through." + stats (Pace WPM, Time MM:SS, Words, Text title) + two buttons (Library / Read again)
- `src/core/haptics/haptics.ts` — `haptics.soft()` / `.medium()` / `.rigid()` / `.finish()` respecting `prefers-reduced-motion` (finish fires regardless, others suppressed in reduce-motion)
- `src/core/accessibility/useReduceMotion.ts` — React hook wrapping matchMedia
- Session tracking: on Reader mount start a session via `startSession(textId)`, on finish `endSession(id, { tokensRead, averageWPM })`
- Reader `onFinish` navigates to `/completion/:id`
- Haptics wired: soft on play/pause, medium on paragraph-break, rigid on finish; all respect `prefs.haptics` toggle + reduce-motion
- Completion reads the most recent session for the text to compute Time and averageWPM
- `/completion/:id` route points to CompletionView

## Tasks
- [ ] T01 4 agents: CompletionView + haptics + reader-haptics-integration + session-tracking
