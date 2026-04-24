import { lazy, Suspense } from 'react';

const PdfImportFlow = lazy(() => import('@/features/new-reading/PdfImportFlow'));

export default function NewReadingPdf() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100dvh', background: 'var(--stage)' }} />}>
      <PdfImportFlow />
    </Suspense>
  );
}
