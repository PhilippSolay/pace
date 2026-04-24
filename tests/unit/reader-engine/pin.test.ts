import { describe, it, expect } from 'vitest';
import { pinIndex } from '@/core/reader-engine/pin';

describe('pinIndex', () => {
  describe('brief §2 table (lengths 1-10, no punctuation)', () => {
    it.each([
      { word: 'a', expected: 0, cleanedLen: 1 },
      { word: 'go', expected: 0, cleanedLen: 2 },
      { word: 'the', expected: 1, cleanedLen: 3 },
      { word: 'word', expected: 1, cleanedLen: 4 },
      { word: 'hello', expected: 2, cleanedLen: 5 },
      { word: 'letter', expected: 2, cleanedLen: 6 },
      { word: 'meaning', expected: 3, cleanedLen: 7 },
      { word: 'anchored', expected: 3, cleanedLen: 8 },
      { word: 'beginning', expected: 4, cleanedLen: 9 },
      { word: 'considered', expected: 4, cleanedLen: 10 },
    ])(
      'returns $expected for "$word" (cleaned length $cleanedLen)',
      ({ word, expected }) => {
        expect(pinIndex(word)).toBe(expected);
      },
    );
  });

  describe('edge cases', () => {
    it('returns 0 for an empty string (degenerate, no error)', () => {
      expect(pinIndex('')).toBe(0);
    });

    it('returns 0 for a punctuation-only string with no letters or digits', () => {
      expect(pinIndex('!!!')).toBe(0);
    });

    it('ignores trailing punctuation when computing the pin', () => {
      // "hello," cleans to "hello" (len 5), pin at 1-indexed 3 → 0-indexed 2
      expect(pinIndex('hello,')).toBe(2);
    });

    it('shifts the pin right by the count of leading punctuation', () => {
      // '"hello"' — leading " (1 char), cleaned "hello" (len 5), pin at
      // 1-indexed 3 within cleaned → 1 + (3 - 1) = 3 within original
      expect(pinIndex('"hello"')).toBe(3);
    });

    it('treats precomposed unicode letters as single code units', () => {
      // 'café' in NFC has .length 4 — 'c','a','f','é'. Pin at 1-indexed 2
      // → 0-indexed 1 ('a').
      expect(pinIndex('café')).toBe(1);
    });
  });
});
