/**
 * Pace PWA — URL article import flow
 *
 * Full-screen stage for the `/new/url` route. Lets the user paste a URL,
 * lazily loads the Readability extractor, fetches and parses the article
 * via a public CORS proxy, persists the result, and opens the reader.
 *
 * See: src/core/text-processing/article.ts
 */
import { useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { createText } from '@/core/persistence/texts';

type FlowState =
  | 'idle'
  | 'fetching'
  | 'parsing'
  | 'success'
  | 'error-fetch'
  | 'error-empty';

const SLOW_FETCH_MS = 800;
const SUCCESS_NAV_DELAY_MS = 400;
const SPINNER_KEYFRAMES = '@keyframes pace-spin { to { transform: rotate(360deg); } }';

const stageStyle: CSSProperties = {
  width: '100%', height: '100dvh', background: 'var(--stage)',
  display: 'flex', flexDirection: 'column', padding: 24, gap: 18,
};
const headerStyle: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  paddingTop: 20,
};
const titleStyle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22,
  color: 'var(--ink)', margin: 0,
};
const cancelStyle: CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 11, letterSpacing: '0.18em',
  textTransform: 'uppercase', color: 'var(--ink-2)',
  background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
};
const inputStyle: CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 400,
  color: 'var(--ink)', background: 'transparent',
  border: 'none', borderBottom: '1px solid var(--line-2)',
  outline: 'none', width: '100%', padding: '12px 0',
};
const helpStyle: CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--ink-3)',
  margin: 0, lineHeight: 1.5,
};
const primaryButtonStyle = (disabled: boolean): CSSProperties => ({
  fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 500,
  letterSpacing: '0.18em', textTransform: 'uppercase',
  height: 40, padding: '0 18px', borderRadius: 'var(--r-md)',
  background: 'var(--accent)', color: '#fff', border: 'none',
  opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
  alignSelf: 'flex-start',
});
const messageStyle: CSSProperties = {
  fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16,
  color: 'var(--ink)', margin: 0, lineHeight: 1.4,
};
const subMessageStyle: CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-3)',
  margin: 0,
};
const spinnerStyle: CSSProperties = {
  width: 28, height: 28, borderRadius: '50%',
  border: '2px solid var(--line)', borderTopColor: 'var(--accent)',
  animation: 'pace-spin 0.9s linear infinite', alignSelf: 'flex-start',
};
const overlayStyle: CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start',
  marginTop: 8,
};

function UrlImportFlow(): JSX.Element {
  const navigate = useNavigate();
  const [state, setState] = useState<FlowState>('idle');
  const [url, setUrl] = useState('');
  const [errorDetail, setErrorDetail] = useState('');
  const [isSlow, setIsSlow] = useState(false);
  const slowTimerRef = useRef<number | null>(null);

  const trimmed = url.trim();
  const canSubmit = trimmed.length > 0 && state !== 'fetching' && state !== 'parsing';

  const startFetch = async (): Promise<void> => {
    if (!canSubmit) return;
    setState('fetching');
    setIsSlow(false);
    setErrorDetail('');
    if (slowTimerRef.current !== null) window.clearTimeout(slowTimerRef.current);
    slowTimerRef.current = window.setTimeout(() => setIsSlow(true), SLOW_FETCH_MS);

    try {
      const articleModule = await import('@/core/text-processing/article');
      const article = await articleModule.extractArticle(trimmed);
      setState('parsing');

      const text = await createText({
        title: article.title,
        content: article.content,
        sourceType: 'url',
        url: article.url,
        ...(article.author ? { author: article.author } : {}),
      });
      setState('success');
      window.setTimeout(
        () => navigate(`/reader/${text.id}`, { replace: true }),
        SUCCESS_NAV_DELAY_MS,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setErrorDetail(message);
      if (/empty|render via/i.test(message)) setState('error-empty');
      else setState('error-fetch');
    } finally {
      if (slowTimerRef.current !== null) {
        window.clearTimeout(slowTimerRef.current);
        slowTimerRef.current = null;
      }
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    void startFetch();
  };

  const resetToIdle = (): void => { setState('idle'); setIsSlow(false); setErrorDetail(''); };

  const isLoading = state === 'fetching' || state === 'parsing';

  return (
    <div style={stageStyle}>
      <style>{SPINNER_KEYFRAMES}</style>

      <div style={headerStyle}>
        <h1 style={titleStyle}>From a URL</h1>
        <button type="button" style={cancelStyle} onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          type="url"
          value={url}
          autoFocus
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="https://…"
          style={inputStyle}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
        />
        <p style={helpStyle}>
          Paste an article link. Pace fetches the page, strips ads and chrome, and
          keeps just the body — like Reader Mode in Safari.
        </p>
        <button
          type="submit"
          style={primaryButtonStyle(!canSubmit)}
          disabled={!canSubmit}
        >
          Fetch &amp; read
        </button>
      </form>

      <div style={overlayStyle}>
        {state === 'fetching' && (
          <>
            <div style={spinnerStyle} />
            <p style={messageStyle}>Fetching the page…</p>
            {isSlow && <p style={subMessageStyle}>Some sites take a few seconds.</p>}
          </>
        )}
        {state === 'parsing' && (
          <>
            <div style={spinnerStyle} />
            <p style={messageStyle}>Extracting the article…</p>
          </>
        )}
        {state === 'success' && (
          <p style={messageStyle}>Saved. Opening reader…</p>
        )}
        {state === 'error-fetch' && (
          <>
            <p style={{ ...messageStyle, color: 'var(--accent)' }}>
              Couldn&apos;t fetch this URL.
            </p>
            <p style={subMessageStyle}>
              {errorDetail || 'The site may block scraping or the proxy may be down.'}
              {' '}Try another URL.
            </p>
            <button type="button" style={primaryButtonStyle(false)} onClick={resetToIdle}>
              Try again
            </button>
          </>
        )}
        {state === 'error-empty' && (
          <>
            <p style={{ ...messageStyle, color: 'var(--accent)' }}>
              No article body found.
            </p>
            <p style={subMessageStyle}>
              The page may render its content with JavaScript, which Pace can&apos;t
              follow. Try a more text-heavy article (blog post, news piece).
            </p>
            <button type="button" style={primaryButtonStyle(false)} onClick={resetToIdle}>
              Try another URL
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default UrlImportFlow;
