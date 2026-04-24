/**
 * Text cleaning for the Pace PWA.
 *
 * See the Pace dev brief §8.2 and `.gsd/milestones/M001/slices/S04/S04-PLAN.md`.
 *
 * Raw text extracted from PDFs contains artifacts: Windows/Mac line endings,
 * soft hyphenation at line breaks, running headers/footers, and bare page
 * numbers. This module turns that raw string into clean reading text before
 * tokenization.
 */

const PARAGRAPH_SPLIT = /\n{2,}/;
const PAGE_NUMBER_LINE = /^\s*\d+\s*$/;
const HYPHEN_LINEBREAK = /([a-z])-\n([a-z])/gi;
const CR_LF = /\r\n/g;
const CR = /\r/g;
const THREE_OR_MORE_NEWLINES = /\n{3,}/g;

const HEADER_FOOTER_MAX_LENGTH = 40;
const HEADER_FOOTER_PAGE_RATIO = 0.3;
const HEADER_FOOTER_MIN_PAGES = 2;
const HEADER_FOOTER_MIN_HITS = 2;
const SCANNED_MIN_LENGTH = 50;

/**
 * Normalize line endings to `\n` and collapse 3+ consecutive newlines
 * into a double-newline paragraph break. Also trims leading/trailing
 * whitespace from the whole document.
 */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(CR_LF, '\n')
    .replace(CR, '\n')
    .replace(THREE_OR_MORE_NEWLINES, '\n\n')
    .trim();
}

/**
 * Rejoin words broken across lines by soft hyphenation.
 *
 * `"com-\nmunity"` becomes `"community"`. Legitimate hyphens inside a line
 * (e.g. `"state-of-the-art"`) are left alone because the regex only matches
 * a hyphen immediately followed by a newline and another letter.
 *
 * Heuristic: only trigger when the character after `-\n` is a letter.
 * Case-insensitive — we accept uppercase followers too because hyphenation
 * across lines sometimes lands on a capitalized token mid-sentence. False
 * positives on proper names like "Smith-\nJones" are rare in prose PDFs
 * and the cost of missing legitimate breaks is worse for readability.
 */
export function dehyphenate(text: string): string {
  return text.replace(HYPHEN_LINEBREAK, '$1$2');
}

function countOccurrences(lines: readonly string[], target: string): number {
  let count = 0;
  for (const line of lines) {
    if (line === target) {
      count += 1;
    }
  }
  return count;
}

function collectCandidateLines(pages: readonly string[]): Set<string> {
  const candidates = new Set<string>();
  for (const page of pages) {
    const lines = page.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 0 && trimmed.length < HEADER_FOOTER_MAX_LENGTH) {
        candidates.add(trimmed);
      }
    }
  }
  return candidates;
}

function findRepeatedHeaders(
  pages: readonly string[],
  candidates: ReadonlySet<string>,
): Set<string> {
  const threshold = pages.length * HEADER_FOOTER_PAGE_RATIO;
  const headers = new Set<string>();
  const trimmedLinesPerPage = pages.map((page) =>
    page.split('\n').map((line) => line.trim()),
  );

  for (const candidate of candidates) {
    let pageHits = 0;
    for (const lines of trimmedLinesPerPage) {
      if (countOccurrences(lines, candidate) > 0) {
        pageHits += 1;
      }
    }
    if (pageHits >= HEADER_FOOTER_MIN_HITS && pageHits > threshold) {
      headers.add(candidate);
    }
  }
  return headers;
}

function cleanPage(page: string, headers: ReadonlySet<string>): string {
  const kept: string[] = [];
  for (const line of page.split('\n')) {
    const trimmed = line.trim();
    if (PAGE_NUMBER_LINE.test(line)) {
      continue;
    }
    if (headers.has(trimmed)) {
      continue;
    }
    kept.push(line);
  }
  return kept.join('\n');
}

/**
 * Detect lines that repeat across >30% of "pages" (pages are separated by
 * `\n\n+`) and remove them along with bare page numbers. A line qualifies as
 * a header/footer candidate only if it is shorter than 40 characters.
 */
export function stripHeadersAndPageNumbers(text: string): string {
  const pages = text.split(PARAGRAPH_SPLIT);
  if (pages.length === 0) {
    return text;
  }

  // Header detection needs at least two pages to distinguish a "repeated"
  // line from normal content. With a single page, every short line would
  // look like a header to the ratio check.
  const headers =
    pages.length >= HEADER_FOOTER_MIN_PAGES
      ? findRepeatedHeaders(pages, collectCandidateLines(pages))
      : new Set<string>();

  const cleanedPages = pages.map((page) => cleanPage(page, headers));
  return cleanedPages.join('\n\n');
}

/**
 * Compose the full cleaning pipeline. Runs normalization a second time at
 * the end because removals can leave behind stacks of blank lines.
 */
export function cleanText(text: string): string {
  const normalized = normalizeWhitespace(text);
  const dehyphenated = dehyphenate(normalized);
  const stripped = stripHeadersAndPageNumbers(dehyphenated);
  return normalizeWhitespace(stripped);
}

/**
 * Heuristic for scanned-image PDFs that yield almost no extractable text.
 * Used to surface a friendly error instead of trying to read ~0 words.
 */
export function isLikelyScanned(text: string): boolean {
  return cleanText(text).trim().length < SCANNED_MIN_LENGTH;
}
