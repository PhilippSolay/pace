# S04: PDF Upload + Text Processing

**Goal:** Pick a text-based PDF from New Reading → parsed + cleaned + saved to Library → reads correctly.

## Must-Haves
- `src/core/text-processing/pdf.ts` — `extractText(file: File): Promise<string>` using pdfjs-dist
- `src/core/text-processing/clean.ts` — de-hyphenation + header/footer + page-number strip
- `src/features/new-reading/PdfImportFlow.tsx` — hidden file input + progress + error surfaces
- Lazy-load pdfjs so initial bundle stays ≤ 180 KB
- Unit tests for text-processing functions (no PDF I/O — test clean() with synthetic input)
- NewReadingSheet "Upload PDF" wires to `/new/pdf` → PdfImportFlow

## Tasks (1 big task with 4 parallel agents)
- [ ] T01 4 agents: pdf.ts + clean.ts + PdfImportFlow + tests
