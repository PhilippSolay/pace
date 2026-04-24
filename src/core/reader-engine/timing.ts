/**
 * @module core/reader-engine/timing
 *
 * Pure per-token display-duration calculator for the Pace reader engine.
 *
 * Given a `ReaderToken` and the active `ReaderSettings`, `computeDuration`
 * returns the number of milliseconds that token should remain on screen
 * during RSVP playback. Behavior is specified by §7.3 of the Pace dev brief:
 *
 *   base = 60_000 / settings.wpm
 *
 *   punctuationMultiplier (only applied when `punctuationPauses === true`):
 *     - `.` `!` `?`                     → 2.3
 *     - `,` `;` `:` `—` (U+2014) `–` (U+2013) → 1.55
 *     - paragraph break                  → 2.5
 *
 *   longWordMultiplier (ALWAYS applied, regardless of `punctuationPauses`):
 *     - let cleanedLen = length of `token.text` with leading & trailing
 *       punctuation stripped
 *     - if cleanedLen > 12: min(1 + (cleanedLen - 12) * 0.05, 1.5)
 *     - else:               1.0
 *
 *   duration = base * punctuationMultiplier * longWordMultiplier
 *
 * For paragraph-break tokens the long-word multiplier does not apply
 * (there is no word), and the result collapses to `base * 2.5`.
 *
 * This module is pure: no side effects, no I/O, no persistence.
 */

import type { ReaderToken, ReaderSettings } from './types';

/**
 * Milliseconds per minute — used to convert WPM to the per-word base.
 */
const MS_PER_MINUTE = 60_000;

/**
 * Paragraph-break pause multiplier (brief §7.3).
 */
const PARAGRAPH_BREAK_MULTIPLIER = 2.5;

/**
 * Sentence-ending punctuation class multiplier (brief §7.3).
 */
const SENTENCE_END_MULTIPLIER = 2.3;

/**
 * Mid-sentence punctuation class multiplier (brief §7.3).
 */
const MID_CLAUSE_MULTIPLIER = 1.55;

/**
 * Length threshold at which the long-word multiplier activates. Words
 * whose cleaned length is STRICTLY GREATER THAN this value begin to
 * receive a bonus proportional to the overshoot.
 */
const LONG_WORD_THRESHOLD = 12;

/**
 * Per-character slope of the long-word multiplier above the threshold.
 */
const LONG_WORD_SLOPE = 0.05;

/**
 * Upper bound on the long-word multiplier. Prevents extreme-length
 * outliers (technical terms, URLs) from halting playback.
 */
const LONG_WORD_CAP = 1.5;

/**
 * Regex for stripping leading non-alphanumeric characters (Unicode-aware).
 * Mirrors the definition in `pin.ts` so the two modules stay consistent.
 */
const LEADING_NON_ALNUM = /^[^\p{L}\p{N}]+/u;

/**
 * Regex for stripping trailing non-alphanumeric characters (Unicode-aware).
 */
const TRAILING_NON_ALNUM = /[^\p{L}\p{N}]+$/u;

/**
 * Resolve the punctuation multiplier for a word token based on its
 * trailing character.
 *
 * Per the brief, we look at the LAST character of `token.text`. Closing
 * quotes or brackets that follow the punctuation (e.g. `word,"`) will
 * cause a miss — this is an accepted v1 imperfection.
 */
function getPunctuationMultiplier(text: string): number {
  if (text.length === 0) {
    return 1;
  }

  const lastChar = text.charAt(text.length - 1);

  if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
    return SENTENCE_END_MULTIPLIER;
  }

  if (
    lastChar === ',' ||
    lastChar === ';' ||
    lastChar === ':' ||
    lastChar === '—' ||
    lastChar === '–'
  ) {
    return MID_CLAUSE_MULTIPLIER;
  }

  return 1;
}

/**
 * Compute the cleaned length (letters and digits only) of a word by
 * stripping leading and trailing punctuation.
 */
function getCleanedLength(text: string): number {
  const leadingStripped = text.replace(LEADING_NON_ALNUM, '');
  const cleaned = leadingStripped.replace(TRAILING_NON_ALNUM, '');
  return cleaned.length;
}

/**
 * Compute the long-word multiplier for a word token. Always-on (does
 * not depend on `punctuationPauses`).
 */
function getLongWordMultiplier(text: string): number {
  const cleanedLen = getCleanedLength(text);

  if (cleanedLen <= LONG_WORD_THRESHOLD) {
    return 1;
  }

  const overshoot = cleanedLen - LONG_WORD_THRESHOLD;
  const raw = 1 + overshoot * LONG_WORD_SLOPE;

  return Math.min(raw, LONG_WORD_CAP);
}

/**
 * Compute the display duration (in milliseconds) for a single reader
 * token under the supplied settings. Pure function — no hidden state,
 * no allocations beyond primitives.
 *
 * See module docstring for the full derivation.
 */
export function computeDuration(
  token: ReaderToken,
  settings: ReaderSettings,
): number {
  const baseMs = MS_PER_MINUTE / settings.wpm;

  if (token.isParagraphBreak) {
    if (!settings.punctuationPauses) {
      return baseMs;
    }
    return baseMs * PARAGRAPH_BREAK_MULTIPLIER;
  }

  // Guard against the degenerate "empty word token" case. The tokenizer
  // is not expected to emit these, but we keep the function total.
  if (token.text.length === 0) {
    return baseMs;
  }

  const punctuationMultiplier = settings.punctuationPauses
    ? getPunctuationMultiplier(token.text)
    : 1;
  const longWordMultiplier = getLongWordMultiplier(token.text);

  return baseMs * punctuationMultiplier * longWordMultiplier;
}
