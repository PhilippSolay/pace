import { describe, it, expect } from 'vitest';
import { computeDuration } from '@/core/reader-engine/timing';
import type { ReaderToken, ReaderSettings } from '@/core/reader-engine/types';

/**
 * Test helpers — keep fixture construction trivial so each assertion
 * stays focused on the behavior under test.
 */
const word = (text: string, index = 0): ReaderToken => ({
  text,
  isParagraphBreak: false,
  index,
});

const paragraphBreak = (index = 0): ReaderToken => ({
  text: '',
  isParagraphBreak: true,
  index,
});

const settings = (overrides: Partial<ReaderSettings> = {}): ReaderSettings => ({
  wpm: 350,
  punctuationPauses: true,
  ...overrides,
});

/**
 * Default WPM of 350 → base = 60000 / 350 ≈ 171.4285714... ms/word.
 */
const BASE_MS_AT_350 = 60_000 / 350;

describe('computeDuration', () => {
  describe('base duration', () => {
    it('returns 60000/wpm for a plain word with default settings', () => {
      // Arrange
      const token = word('hello');

      // Act
      const result = computeDuration(token, settings());

      // Assert
      expect(result).toBeCloseTo(171.428, 2);
    });
  });

  describe('punctuation multipliers (punctuationPauses: true)', () => {
    it('applies the 2.3x sentence-end multiplier for trailing period', () => {
      const result = computeDuration(word('hello.'), settings());

      expect(result).toBeCloseTo(BASE_MS_AT_350 * 2.3, 1);
    });

    it('applies the 1.55x mid-clause multiplier for trailing comma', () => {
      const result = computeDuration(word('hello,'), settings());

      expect(result).toBeCloseTo(BASE_MS_AT_350 * 1.55, 1);
    });

    it('applies the 1.55x mid-clause multiplier for trailing semicolon', () => {
      const result = computeDuration(word('hello;'), settings());

      expect(result).toBeCloseTo(BASE_MS_AT_350 * 1.55, 1);
    });

    it('applies the 1.55x mid-clause multiplier for trailing em-dash', () => {
      const result = computeDuration(word('hello—'), settings());

      expect(result).toBeCloseTo(BASE_MS_AT_350 * 1.55, 1);
    });

    it('applies the 1.55x mid-clause multiplier for trailing en-dash', () => {
      const result = computeDuration(word('hello–'), settings());

      expect(result).toBeCloseTo(BASE_MS_AT_350 * 1.55, 1);
    });

    it('applies the 2.5x paragraph-break multiplier for a break token', () => {
      const result = computeDuration(paragraphBreak(), settings());

      expect(result).toBeCloseTo(BASE_MS_AT_350 * 2.5, 1);
    });
  });

  describe('punctuationPauses: false', () => {
    it('skips the punctuation multiplier but still returns base for short words', () => {
      // "hello." has cleaned length 5 (≤ 12), so no long-word multiplier.
      const result = computeDuration(
        word('hello.'),
        settings({ punctuationPauses: false }),
      );

      expect(result).toBeCloseTo(BASE_MS_AT_350, 1);
    });
  });

  describe('long-word multiplier (always applied)', () => {
    it('does NOT treat a 12-letter word as long (threshold is strictly greater)', () => {
      // "consequences" has exactly 12 letters → NOT > 12 → multiplier 1.0.
      const result = computeDuration(word('consequences'), settings());

      expect(result).toBeCloseTo(BASE_MS_AT_350, 1);
    });

    it('applies a proportional bonus for a 15-letter word', () => {
      // "extraordinarily" = 15 letters → 1 + (15 - 12) * 0.05 = 1.15.
      const result = computeDuration(word('extraordinarily'), settings());

      expect(result).toBeCloseTo(BASE_MS_AT_350 * 1.15, 1);
    });

    it('caps the long-word multiplier at 1.5 for extreme-length words', () => {
      // "electroencephalographically" = 27 letters → raw 1 + (27 - 12) * 0.05
      // = 1 + 15 * 0.05 = 1.75 → CAPPED at 1.5.
      const result = computeDuration(
        word('electroencephalographically'),
        settings(),
      );

      expect(result).toBeCloseTo(BASE_MS_AT_350 * 1.5, 1);
    });
  });

  describe('combined punctuation + long-word', () => {
    it('multiplies punctuation-only when the base word is not long', () => {
      // "consequently." → cleaned "consequently" (12 chars, NOT long) +
      // trailing period → 2.3 * 1.0.
      const result = computeDuration(word('consequently.'), settings());

      expect(result).toBeCloseTo(BASE_MS_AT_350 * 2.3, 1);
    });

    it('multiplies both punctuation AND long-word when the cleaned word is long', () => {
      // "consequently-itis." → strip trailing "." → "consequently-itis".
      // Hyphen is interior and NOT stripped, so cleanedLen = 17.
      // long-word multiplier = 1 + (17 - 12) * 0.05 = 1.25.
      // punctuation multiplier = 2.3.
      const text = 'consequently-itis.';
      const cleanedLen = text.slice(0, -1).length; // 17
      const longWordMult = 1 + (cleanedLen - 12) * 0.05;
      const expected = BASE_MS_AT_350 * 2.3 * longWordMult;

      const result = computeDuration(word(text), settings());

      expect(result).toBeCloseTo(expected, 1);
    });
  });

  describe('edge cases', () => {
    it('returns base for a degenerate empty-text non-break token', () => {
      const token: ReaderToken = { text: '', isParagraphBreak: false, index: 0 };

      const result = computeDuration(token, settings());

      expect(result).toBeCloseTo(BASE_MS_AT_350, 1);
    });
  });
});
