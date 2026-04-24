import { describe, it, expect } from 'vitest';
import { tokenize } from '@/core/reader-engine/tokenize';

describe('tokenize', () => {
  it('returns [] for an empty string', () => {
    // Arrange
    const input = '';

    // Act
    const result = tokenize(input);

    // Assert
    expect(result).toEqual([]);
  });

  it('returns [] for a whitespace-only string', () => {
    // Arrange
    const input = '   \t  \n  ';

    // Act
    const result = tokenize(input);

    // Assert
    expect(result).toEqual([]);
  });

  it('tokenizes a single word into one token with index 0', () => {
    // Arrange
    const input = 'hello';

    // Act
    const result = tokenize(input);

    // Assert
    expect(result).toEqual([{ text: 'hello', isParagraphBreak: false, index: 0 }]);
  });

  it('tokenizes two words with sequential indices', () => {
    // Arrange
    const input = 'hello world';

    // Act
    const result = tokenize(input);

    // Assert
    expect(result).toEqual([
      { text: 'hello', isParagraphBreak: false, index: 0 },
      { text: 'world', isParagraphBreak: false, index: 1 },
    ]);
  });

  it('preserves attached punctuation on words', () => {
    // Arrange
    const input = 'hello, world.';

    // Act
    const result = tokenize(input);

    // Assert
    expect(result).toEqual([
      { text: 'hello,', isParagraphBreak: false, index: 0 },
      { text: 'world.', isParagraphBreak: false, index: 1 },
    ]);
  });

  it('emits a paragraph-break token for a blank line', () => {
    // Arrange
    const input = 'one\n\ntwo';

    // Act
    const result = tokenize(input);

    // Assert
    expect(result).toEqual([
      { text: 'one', isParagraphBreak: false, index: 0 },
      { text: '', isParagraphBreak: true, index: 1 },
      { text: 'two', isParagraphBreak: false, index: 2 },
    ]);
  });

  it('collapses multiple blank lines into a single paragraph-break token', () => {
    // Arrange
    const input = 'one\n\n\n\ntwo';

    // Act
    const result = tokenize(input);

    // Assert
    expect(result).toEqual([
      { text: 'one', isParagraphBreak: false, index: 0 },
      { text: '', isParagraphBreak: true, index: 1 },
      { text: 'two', isParagraphBreak: false, index: 2 },
    ]);
  });

  it('treats space-surrounded em-dash as a standalone token', () => {
    // Arrange
    const input = 'word — word';

    // Act
    const result = tokenize(input);

    // Assert
    expect(result).toEqual([
      { text: 'word', isParagraphBreak: false, index: 0 },
      { text: '—', isParagraphBreak: false, index: 1 },
      { text: 'word', isParagraphBreak: false, index: 2 },
    ]);
  });

  it('treats space-surrounded en-dash as a standalone token', () => {
    // Arrange
    const input = 'word – word';

    // Act
    const result = tokenize(input);

    // Assert
    expect(result).toEqual([
      { text: 'word', isParagraphBreak: false, index: 0 },
      { text: '–', isParagraphBreak: false, index: 1 },
      { text: 'word', isParagraphBreak: false, index: 2 },
    ]);
  });

  it('keeps an attached em-dash inside the word token', () => {
    // Arrange
    const input = 'word—word';

    // Act
    const result = tokenize(input);

    // Assert
    expect(result).toEqual([{ text: 'word—word', isParagraphBreak: false, index: 0 }]);
  });

  it('preserves Unicode accents in tokens', () => {
    // Arrange
    const input = 'café déjà';

    // Act
    const result = tokenize(input);

    // Assert
    expect(result).toEqual([
      { text: 'café', isParagraphBreak: false, index: 0 },
      { text: 'déjà', isParagraphBreak: false, index: 1 },
    ]);
  });

  it('treats CRLF paragraph breaks the same as LF paragraph breaks', () => {
    // Arrange
    const input = 'one\r\n\r\ntwo';

    // Act
    const result = tokenize(input);

    // Assert
    expect(result).toEqual([
      { text: 'one', isParagraphBreak: false, index: 0 },
      { text: '', isParagraphBreak: true, index: 1 },
      { text: 'two', isParagraphBreak: false, index: 2 },
    ]);
  });

  it('ignores leading and trailing whitespace without emitting empty tokens', () => {
    // Arrange
    const input = '   hello world   ';

    // Act
    const result = tokenize(input);

    // Assert
    expect(result).toEqual([
      { text: 'hello', isParagraphBreak: false, index: 0 },
      { text: 'world', isParagraphBreak: false, index: 1 },
    ]);
  });
});
