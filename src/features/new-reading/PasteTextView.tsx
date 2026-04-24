/**
 * Pace PWA — Paste Text composition view
 *
 * Full-screen composition surface for the `/new/paste` route. The user
 * optionally names the text, pastes or types the body, watches the live
 * word count, and commits the result to Dexie via `createText` — at which
 * point the reader opens on the freshly-minted id. Title falls back to the
 * first line of content (when it reads like a title) or `Untitled`.
 *
 * See: .gsd/milestones/M001/slices/S03/S03-PLAN.md §6.3 + §8.1
 */
import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

import { createText } from '@/core/persistence/texts';

const STATUS_BAR_HEIGHT = 44;
const MIN_TOKENS = 20;
const TITLE_MAX_CHARS = 80;

const stageStyle: CSSProperties = {
  width: '100%', height: '100dvh', background: 'var(--stage)',
  display: 'flex', flexDirection: 'column', overflow: 'hidden',
};
const topBarStyle: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 20px', flexShrink: 0,
};
const cancelButtonStyle: CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.18em',
  textTransform: 'uppercase', color: 'var(--ink-2)',
  background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
};
const primaryButtonStyle = (disabled: boolean): CSSProperties => ({
  fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 500,
  letterSpacing: '0.18em', textTransform: 'uppercase',
  height: 36, padding: '0 14px', borderRadius: 'var(--r-md)',
  background: 'var(--accent)', color: '#fff', border: 'none',
  opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
});
const scrollStyle: CSSProperties = {
  flex: 1, overflow: 'auto', padding: '8px 20px 20px',
  display: 'flex', flexDirection: 'column',
};
const titleInputStyle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400,
  color: 'var(--ink)', letterSpacing: '-0.02em',
  background: 'transparent', border: 'none', outline: 'none',
  width: '100%', padding: '12px 0',
};
const dividerStyle: CSSProperties = {
  height: 1, background: 'var(--line)', marginBottom: 14, flexShrink: 0,
};
const bodyTextareaStyle: CSSProperties = {
  fontFamily: 'var(--font-reader)', fontSize: 17, lineHeight: 1.5,
  color: 'var(--ink)', background: 'transparent',
  border: 'none', outline: 'none', width: '100%',
  minHeight: 'calc(100dvh - 300px)', resize: 'none', padding: 0,
};
const footerBaseStyle: CSSProperties = {
  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em',
  textTransform: 'uppercase', marginTop: 12,
};

function computeTokenCount(content: string): number {
  return content.trim().split(/\s+/u).filter(Boolean).length;
}

function deriveTitle(content: string): string {
  const firstLine = content.split('\n')[0]?.trim() ?? '';
  if (!firstLine || firstLine.length > TITLE_MAX_CHARS) return 'Untitled';
  if (/[.!?]$/.test(firstLine)) return 'Untitled';
  return firstLine;
}

function normalizeBody(content: string): string {
  return content.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function PasteTextView() {
  const navigate = useNavigate();
  const [titleInput, setTitleInput] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pick up a share-target draft stashed by the /share route. Runs once on
  // mount; cleared after read so a subsequent manual /new/paste visit is blank.
  useEffect(() => {
    const raw = sessionStorage.getItem('pace:shareDraft');
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as { title?: string; content?: string };
      if (draft.title) setTitleInput(draft.title);
      if (draft.content) setBody(draft.content);
    } catch {
      // ignore parse errors — malformed draft is effectively no draft
    } finally {
      sessionStorage.removeItem('pace:shareDraft');
    }
  }, []);

  const tokenCount = computeTokenCount(body);
  const canSubmit = tokenCount >= MIN_TOKENS && !isSubmitting;

  const handleStart = async (): Promise<void> => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const title = titleInput.trim() || deriveTitle(body);
      const content = normalizeBody(body);
      const text = await createText({ title, content, sourceType: 'paste' });
      navigate(`/reader/${text.id}`, { replace: true });
    } catch {
      setIsSubmitting(false);
    }
  };

  const footerColor = tokenCount >= MIN_TOKENS ? 'var(--ink-2)' : 'var(--ink-3)';

  return (
    <div style={stageStyle}>
      <div style={{ height: STATUS_BAR_HEIGHT, flexShrink: 0 }} />
      <div style={topBarStyle}>
        <button type="button" style={cancelButtonStyle} onClick={() => navigate(-1)}>
          Cancel
        </button>
        <button type="button" style={primaryButtonStyle(!canSubmit)}
          disabled={!canSubmit} onClick={() => { void handleStart(); }}>
          Start reading
        </button>
      </div>

      <div style={scrollStyle}>
        <input type="text" value={titleInput} placeholder="Title (optional)"
          maxLength={TITLE_MAX_CHARS} style={titleInputStyle}
          onChange={(e) => setTitleInput(e.target.value)} />
        <div style={dividerStyle} />
        <textarea value={body} placeholder="Paste or type here…"
          style={bodyTextareaStyle}
          onChange={(e) => setBody(e.target.value)} />
        <div style={{ ...footerBaseStyle, color: footerColor }}>
          {`${tokenCount} words`}
          {tokenCount < MIN_TOKENS && (
            <span style={{ color: 'var(--ink-3)' }}>
              {` · paste at least ${MIN_TOKENS} words to start`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PasteTextView;
