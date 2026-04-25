/**
 * Pace PWA — PDF import flow
 *
 * Full-screen stage for the `/new/pdf` route. Lets the user pick a
 * text-based PDF, lazily loads pdfjs + cleaners (so the heavy parser is
 * not in the initial bundle), extracts + cleans the text, persists it
 * via `createText`, and opens the reader on the new id. Handles scanned
 * PDFs, encrypted/damaged files, and slow parses with explicit UI states.
 *
 * See: .gsd/milestones/M001/slices/S04/S04-PLAN.md
 */
import { useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

import { createText } from '@/core/persistence/texts';

type FlowState =
  | 'idle'
  | 'parsing'
  | 'cleaning'
  | 'success'
  | 'error-scanned'
  | 'error-generic';

const SLOW_PARSE_MS = 500;
const SUCCESS_NAV_DELAY_MS = 400;
const SPINNER_KEYFRAMES = '@keyframes pace-spin { to { transform: rotate(360deg); } }';

const stageStyle: CSSProperties = {
  width: '100%', height: '100dvh', background: 'var(--stage)',
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', padding: 24, gap: 16, textAlign: 'center',
};
const messageStyle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18,
  color: 'var(--ink)', margin: 0, maxWidth: 320, lineHeight: 1.4,
};
const subMessageStyle: CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-3)',
  margin: 0, maxWidth: 320,
};
const primaryButtonStyle: CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 500,
  letterSpacing: '0.18em', textTransform: 'uppercase',
  height: 36, padding: '0 18px', borderRadius: 'var(--r-md)',
  background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer',
};
const ghostButtonStyle: CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.18em',
  textTransform: 'uppercase', color: 'var(--ink-2)',
  background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
};
const spinnerStyle: CSSProperties = {
  width: 32, height: 32, borderRadius: '50%',
  border: '2px solid var(--line)', borderTopColor: 'var(--accent)',
  animation: 'pace-spin 0.9s linear infinite',
};
const buttonRowStyle: CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
};

function DocIcon(): JSX.Element {
  return (
    <svg width={48} height={48} viewBox="0 0 24 24" fill="none"
      stroke="var(--ink-2)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function parseErrorKind(error: unknown): FlowState {
  const message = error instanceof Error ? error.message : '';
  if (/scanned|image/i.test(message)) return 'error-scanned';
  return 'error-generic';
}

function PdfImportFlow(): JSX.Element {
  const navigate = useNavigate();
  const [state, setState] = useState<FlowState>('idle');
  const [isSlow, setIsSlow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = (): void => { inputRef.current?.click(); };
  const resetToIdle = (): void => { setState('idle'); setIsSlow(false); };

  const handleFile = async (file: File): Promise<void> => {
    setState('parsing');
    setIsSlow(false);
    const slowTimer = window.setTimeout(() => setIsSlow(true), SLOW_PARSE_MS);
    try {
      const [pdfModule, cleanModule, chaptersModule] = await Promise.all([
        import('@/core/text-processing/pdf'),
        import('@/core/text-processing/clean'),
        import('@/core/text-processing/chapters'),
      ]);
      const extracted = await pdfModule.extractText(file);
      setState('cleaning');
      const cleaned = cleanModule.cleanText(extracted.text);
      if (cleanModule.isLikelyScanned(cleaned)) {
        setState('error-scanned');
        return;
      }
      const fallbackTitle = file.name.replace(/\.pdf$/iu, '') || 'Untitled';
      const title = extracted.title ?? fallbackTitle;
      const chapters = chaptersModule.detectChapters(cleaned);
      const text = await createText({
        title,
        content: cleaned,
        sourceType: 'pdf',
        ...(extracted.author ? { author: extracted.author } : {}),
        ...(chapters.length > 0 ? { chapters } : {}),
      });
      setState('success');
      window.setTimeout(
        () => navigate(`/reader/${text.id}`, { replace: true }),
        SUCCESS_NAV_DELAY_MS,
      );
    } catch (error: unknown) {
      console.error('[Pace] PDF import failed', error);
      setState(parseErrorKind(error));
    } finally {
      window.clearTimeout(slowTimer);
    }
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void handleFile(file);
  };

  return (
    <div style={stageStyle}>
      <style>{SPINNER_KEYFRAMES}</style>
      <input ref={inputRef} type="file" accept="application/pdf"
        style={{ display: 'none' }} onChange={onInputChange} />

      {state === 'idle' && (
        <>
          <DocIcon />
          <p style={messageStyle}>Choose a text-based PDF to read.</p>
          <div style={buttonRowStyle}>
            <button type="button" style={primaryButtonStyle} onClick={openPicker}>
              Choose PDF
            </button>
            <button type="button" style={ghostButtonStyle} onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </>
      )}

      {(state === 'parsing' || state === 'cleaning') && (
        <>
          <div style={spinnerStyle} />
          <p style={messageStyle}>
            {state === 'parsing' ? 'Parsing PDF…' : 'Cleaning up text…'}
          </p>
          {isSlow && (
            <p style={subMessageStyle}>This may take a moment for large PDFs.</p>
          )}
        </>
      )}

      {state === 'error-scanned' && (
        <>
          <p style={{ ...messageStyle, color: 'var(--accent)' }}>¶</p>
          <p style={messageStyle}>
            This PDF looks like scanned images. OCR support coming soon.
          </p>
          <div style={buttonRowStyle}>
            <button type="button" style={primaryButtonStyle} onClick={resetToIdle}>
              Choose another
            </button>
            <button type="button" style={ghostButtonStyle} onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </>
      )}

      {state === 'error-generic' && (
        <>
          <p style={{ ...messageStyle, color: 'var(--accent)' }}>¶</p>
          <p style={messageStyle}>
            Couldn&apos;t read this PDF. Is it password-protected or damaged?
          </p>
          <div style={buttonRowStyle}>
            <button type="button" style={primaryButtonStyle} onClick={resetToIdle}>
              Retry
            </button>
            <button type="button" style={ghostButtonStyle} onClick={() => navigate(-1)}>
              Back
            </button>
          </div>
        </>
      )}

      {state === 'success' && (
        <p style={messageStyle}>Saved. Opening reader…</p>
      )}
    </div>
  );
}

export default PdfImportFlow;
