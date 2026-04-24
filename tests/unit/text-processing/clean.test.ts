import { describe, it, expect } from 'vitest';
import {
  normalizeWhitespace,
  dehyphenate,
  stripHeadersAndPageNumbers,
  cleanText,
  isLikelyScanned,
} from '@/core/text-processing/clean';

describe('normalizeWhitespace', () => {
  it('converts CRLF line endings to LF', () => {
    // Arrange
    const input = 'a\r\nb';

    // Act
    const result = normalizeWhitespace(input);

    // Assert
    expect(result).toBe('a\nb');
  });

  it('collapses 3+ consecutive newlines into a paragraph break', () => {
    // Arrange
    const input = 'a\n\n\n\nb';

    // Act
    const result = normalizeWhitespace(input);

    // Assert
    expect(result).toBe('a\n\nb');
  });

  it('converts classic-Mac CR-only line endings to LF', () => {
    // Arrange
    const input = 'a\rb';

    // Act
    const result = normalizeWhitespace(input);

    // Assert
    expect(result).toBe('a\nb');
  });
});

describe('dehyphenate', () => {
  it('rejoins a word hyphenated across a line break', () => {
    // Arrange
    const input = 'com-\nmunity';

    // Act
    const result = dehyphenate(input);

    // Assert
    expect(result).toBe('community');
  });

  it('leaves legitimate in-line hyphens untouched', () => {
    // Arrange
    const input = 'state-of-the-art';

    // Act
    const result = dehyphenate(input);

    // Assert
    expect(result).toBe('state-of-the-art');
  });
});

describe('stripHeadersAndPageNumbers', () => {
  it('removes a header that repeats on more than 30% of pages', () => {
    // Arrange
    const header = 'CHAPTER ONE — THE BEGINNING';
    const pages = [
      `${header}\nThe first page body.`,
      `${header}\nThe second page body.`,
      `${header}\nThe third page body.`,
      `${header}\nThe fourth page body.`,
      `${header}\nThe fifth page body.`,
    ];
    const input = pages.join('\n\n');

    // Act
    const result = stripHeadersAndPageNumbers(input);

    // Assert
    expect(result).not.toContain(header);
    expect(result).toContain('The first page body.');
    expect(result).toContain('The fifth page body.');
  });

  it('drops lines that are purely numeric (page numbers)', () => {
    // Arrange
    const input = 'Some body text.\n42\nMore body text.';

    // Act
    const result = stripHeadersAndPageNumbers(input);

    // Assert
    expect(result).toBe('Some body text.\nMore body text.');
  });

  it('never removes a repeated line that is 40+ characters long', () => {
    // Arrange — this line is >= 40 chars, so it stays even if it repeats
    const longRepeated = 'This sentence is definitely forty characters.';
    expect(longRepeated.length).toBeGreaterThanOrEqual(40);
    const pages = [
      `${longRepeated}\nPage one body.`,
      `${longRepeated}\nPage two body.`,
      `${longRepeated}\nPage three body.`,
      `${longRepeated}\nPage four body.`,
    ];
    const input = pages.join('\n\n');

    // Act
    const result = stripHeadersAndPageNumbers(input);

    // Assert — long repeated lines are preserved
    const occurrences = result.split(longRepeated).length - 1;
    expect(occurrences).toBe(pages.length);
  });

  it('keeps a short line that appears on only one page', () => {
    // Arrange
    const pages = [
      'Short unique line\nPage one body.',
      'Page two body.',
      'Page three body.',
      'Page four body.',
    ];
    const input = pages.join('\n\n');

    // Act
    const result = stripHeadersAndPageNumbers(input);

    // Assert
    expect(result).toContain('Short unique line');
  });
});

describe('cleanText', () => {
  it('runs the full pipeline end-to-end over a synthetic document', () => {
    // Arrange — CRLF endings, a hyphenated word, a repeated header, a page number
    const header = 'The Book of Tests';
    const page1 = `${header}\r\nOnce upon a time in a com-\r\nmunity far away.\r\n1`;
    const page2 = `${header}\r\nThe hero walked onward.\r\n2`;
    const page3 = `${header}\r\nAnd the story ended.\r\n3`;
    const page4 = `${header}\r\nEpilogue and credits.\r\n4`;
    const input = [page1, page2, page3, page4].join('\r\n\r\n');

    // Act
    const result = cleanText(input);

    // Assert
    expect(result).not.toContain(header);
    expect(result).not.toMatch(/^\s*\d+\s*$/m);
    expect(result).toContain('community');
    expect(result).toContain('hero walked onward');
  });

  it('preserves paragraph breaks between bodies after cleanup', () => {
    // Arrange
    const input = 'First paragraph body.\n\nSecond paragraph body.';

    // Act
    const result = cleanText(input);

    // Assert
    expect(result).toBe('First paragraph body.\n\nSecond paragraph body.');
  });
});

describe('isLikelyScanned', () => {
  it('returns true for an empty string', () => {
    // Arrange
    const input = '';

    // Act
    const result = isLikelyScanned(input);

    // Assert
    expect(result).toBe(true);
  });

  it('returns false for a real block of readable text', () => {
    // Arrange
    const input =
      'This is a reasonably long paragraph of real text that should survive cleaning with plenty of characters.';

    // Act
    const result = isLikelyScanned(input);

    // Assert
    expect(result).toBe(false);
  });
});
