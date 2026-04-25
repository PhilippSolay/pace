/**
 * PDF text + metadata extraction for the Pace PWA.
 *
 * See `.gsd/milestones/M001/slices/S04/S04-PLAN.md` §8.2.
 *
 * Reads a PDF `File`, pulls metadata (title/author when available), and
 * iterates every page concatenating the text items. Cleaning + chapter
 * detection live in `clean.ts` / `chapters.ts`.
 */

import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

type TextItemLike = { str?: string };

interface PdfInfo {
  Title?: unknown;
  Author?: unknown;
}

export interface ExtractedPdf {
  text: string;
  title?: string;
  author?: string;
}

const PAGE_SEPARATOR = '\n\n';
const ITEM_SEPARATOR = ' ';

function extractItemText(item: TextItemLike): string {
  return 'str' in item && typeof item.str === 'string' ? item.str : '';
}

function pickStringField(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function extractText(file: File): Promise<ExtractedPdf> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;

  const result: ExtractedPdf = { text: '' };
  try {
    const meta = (await pdf.getMetadata()) as { info?: PdfInfo };
    const info = meta.info;
    if (info) {
      const title = pickStringField(info.Title);
      const author = pickStringField(info.Author);
      if (title) result.title = title;
      if (author) result.author = author;
    }
  } catch {
    // Metadata is best-effort — proceed without it on any failure.
  }

  const pageTexts: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items as TextItemLike[];
    pageTexts.push(items.map(extractItemText).join(ITEM_SEPARATOR));
  }

  result.text = pageTexts.join(PAGE_SEPARATOR);
  return result;
}
