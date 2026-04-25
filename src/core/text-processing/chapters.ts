/**
 * Chapter detection for imported texts.
 *
 * Scans cleaned text for chapter headings (Chapter I, CHAPTER 1, Part II,
 * "1. Introduction", etc.) and emits a list of `{ title, tokenIndex }`
 * markers so the Reader can offer chapter navigation.
 *
 * The token index is computed by counting whitespace-separated runs up to
 * the heading's character offset — same model as the reader-engine's
 * tokenize() (paragraph breaks count as one token there too, so this stays
 * close-but-not-pixel-perfect; it's good enough for "jump near the chapter
 * start", which is what the user wants).
 */

import type { ChapterMarker } from '@/core/persistence/schema';

const CHAPTER_HEADING_RE =
  /^(?:chapter|part|book)\s+(?:[ivxlcdm]+|\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)(?:\s*[:.\-—–]\s*.{1,80})?$/iu;

const NUMBERED_HEADING_RE = /^(\d+)\.\s+([A-Z][A-Za-z][^.!?\n]{2,80})$/u;

const MAX_CHAPTERS = 200;

interface DetectedHeading {
  title: string;
  charOffset: number;
}

function detectHeadings(text: string): DetectedHeading[] {
  const headings: DetectedHeading[] = [];
  const lines = text.split('\n');
  let charOffset = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed.length <= 120) {
      if (CHAPTER_HEADING_RE.test(trimmed)) {
        headings.push({ title: trimmed, charOffset });
      } else if (NUMBERED_HEADING_RE.test(trimmed)) {
        headings.push({ title: trimmed, charOffset });
      }
    }
    charOffset += line.length + 1; // +1 for the newline removed by split
    if (headings.length >= MAX_CHAPTERS) break;
  }
  return headings;
}

function tokenIndexFromCharOffset(text: string, charOffset: number): number {
  if (charOffset <= 0) return 0;
  // Replace paragraph-break runs with a single sentinel so they count as one
  // token (mirrors reader-engine/tokenize.ts behavior).
  const head = text.slice(0, charOffset);
  const collapsed = head.replace(/\n\s*\n+/g, '  ');
  const tokens = collapsed.split(/\s+/u).filter(Boolean);
  return tokens.length;
}

/**
 * Extract chapter markers from a cleaned text. Returns an empty list when
 * fewer than two headings are found — a single match in a non-chaptered
 * document is more often a false positive than a real chapter (e.g. a mid-
 * paragraph mention of "Chapter 5 examines…").
 */
export function detectChapters(text: string): ChapterMarker[] {
  const headings = detectHeadings(text);
  if (headings.length < 2) return [];
  return headings.map((h) => ({
    title: h.title,
    tokenIndex: tokenIndexFromCharOffset(text, h.charOffset),
  }));
}
