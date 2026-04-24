/**
 * Pin index calculation for the Pace reader engine.
 *
 * Per dev brief §2 + §7.2, the pin is the character that the eye anchors on
 * during RSVP display. Its 1-indexed position within the *cleaned* word
 * (letters and digits only, after stripping leading and trailing punctuation)
 * is `ceil(cleanedLength / 2)`. This module returns the 0-indexed position
 * mapped back into the ORIGINAL word string so downstream rendering can
 * highlight the correct character without re-stripping punctuation.
 */

const LEADING_NON_ALNUM = /^[^\p{L}\p{N}]+/u;
const TRAILING_NON_ALNUM = /[^\p{L}\p{N}]+$/u;

/**
 * Returns the 0-indexed position of the pin character within the original
 * word string, accounting for leading punctuation.
 *
 * Degenerate inputs (empty string, or strings with no letters/digits) clamp
 * to 0 so the caller can still render the word without a null branch.
 */
export function pinIndex(word: string): number {
  const leadingStripped = word.replace(LEADING_NON_ALNUM, '');
  const cleaned = leadingStripped.replace(TRAILING_NON_ALNUM, '');

  if (cleaned.length === 0) {
    return 0;
  }

  const len = Math.max(cleaned.length, 1);
  const oneBased = Math.ceil(len / 2);
  const leadingPunct = word.length - leadingStripped.length;

  return leadingPunct + (oneBased - 1);
}
