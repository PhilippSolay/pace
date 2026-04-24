/**
 * PDF text extraction for the Pace PWA.
 *
 * See `.gsd/milestones/M001/slices/S04/S04-PLAN.md` §8.2.
 *
 * Reads a PDF `File`, iterates every page, concatenates the text items,
 * and returns the raw joined string. Cleaning lives in `clean.ts`.
 */

import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

type TextItemLike = { str?: string };

const PAGE_SEPARATOR = '\n\n';
const ITEM_SEPARATOR = ' ';

function extractItemText(item: TextItemLike): string {
  return 'str' in item && typeof item.str === 'string' ? item.str : '';
}

export async function extractText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;

  const pageTexts: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = content.items as TextItemLike[];
    pageTexts.push(items.map(extractItemText).join(ITEM_SEPARATOR));
  }

  return pageTexts.join(PAGE_SEPARATOR);
}
