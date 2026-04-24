/**
 * @module core/reader-engine/tokenize
 *
 * Pure tokenizer for the Pace reader engine.
 *
 * Splits a source string into a flat `ReaderToken[]` consumed by the
 * timing and pin modules. Behavior is specified by §7.1 of the Pace
 * dev brief:
 *
 *  - Split on Unicode whitespace (`/\s+/u`), collapsing runs implicitly.
 *  - Punctuation attached to a word stays attached (e.g. `"hello,"`).
 *  - Blank lines (`/\n\s*\n+/`) become a single paragraph-break token
 *    with `text === ''` and `isParagraphBreak === true`.
 *  - Em-dashes (`—`) and en-dashes (`–`) that are surrounded by spaces
 *    become standalone tokens; attached dashes (e.g. `"word—word"`)
 *    stay inside the word token.
 *  - Empty or whitespace-only input returns `[]`.
 *  - `index` is assigned in emission order (`0, 1, 2, ...`).
 *
 * This module is pure: no side effects, no I/O, no persistence.
 */

import type { ReaderToken } from './types';

/**
 * Private Unicode sentinel used to mark paragraph boundaries during
 * the split phase. U+E000 is in the Private Use Area, guaranteed to
 * never appear in well-formed natural-language text. Surrounding it
 * with spaces guarantees that the subsequent `/\s+/u` split isolates
 * it as its own piece.
 */
const PARAGRAPH_SENTINEL = '';
const SENTINEL_WITH_PADDING = ` ${PARAGRAPH_SENTINEL} `;

/**
 * Matcher for a piece that is exactly a single dash character — either
 * an em-dash (U+2014) or an en-dash (U+2013). Used to detect the
 * standalone-dash case after splitting on whitespace.
 */
const STANDALONE_DASH_REGEX = /^[—–]$/;

/**
 * Tokenize a source string into a flat array of reader tokens.
 *
 * @param text Raw source text. May contain CRLF, LF, or mixed line
 *   endings; may be empty or whitespace-only.
 * @returns A frozen-ordering array of `ReaderToken`, each with a
 *   sequential `index`. Returns `[]` for empty or whitespace-only
 *   input.
 */
export function tokenize(text: string): ReaderToken[] {
  if (text.length === 0) {
    return [];
  }

  // Normalize line endings so CRLF paragraph breaks match the LF regex.
  const normalized = text.replace(/\r\n/g, '\n');

  // Replace paragraph-break runs with a padded sentinel. Padding ensures
  // the sentinel is isolated when we split on whitespace next.
  const withSentinels = normalized.replace(/\n\s*\n+/g, SENTINEL_WITH_PADDING);

  // Split on Unicode whitespace. Leading/trailing whitespace produces
  // empty strings, which we filter below.
  const pieces = withSentinels.split(/\s+/u);

  const tokens: ReaderToken[] = [];
  let index = 0;

  for (const piece of pieces) {
    if (piece.length === 0) {
      continue;
    }

    if (piece === PARAGRAPH_SENTINEL) {
      tokens.push({ text: '', isParagraphBreak: true, index });
      index += 1;
      continue;
    }

    if (STANDALONE_DASH_REGEX.test(piece)) {
      tokens.push({ text: piece, isParagraphBreak: false, index });
      index += 1;
      continue;
    }

    tokens.push({ text: piece, isParagraphBreak: false, index });
    index += 1;
  }

  return tokens;
}
