import { useMemo, type CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { getText } from '@/core/persistence/texts';
import { tokenize } from '@/core/reader-engine/tokenize';
import ReaderView from '@/features/reader/ReaderView';

/**
 * Reader route. Loads the ReadingText by id from Dexie, tokenizes its
 * content, and passes tokens + startIndex + textId down to ReaderView.
 *
 * On missing id or missing row: renders a minimal error surface with
 * a button back to the library.
 */
export default function Reader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const text = useLiveQuery(() => (id ? getText(id) : Promise.resolve(undefined)), [id]);

  const tokens = useMemo(() => (text ? tokenize(text.content) : []), [text]);

  if (!id) {
    return <ErrorSurface message="No text selected." onBack={() => navigate('/library')} />;
  }

  // Live-query returns undefined during the initial lookup. Keep the reader
  // stage black so we don't flash an error.
  if (text === undefined) {
    return <div style={{ minHeight: '100dvh', background: 'var(--reader)' }} />;
  }

  if (text === null || text === undefined || tokens.length === 0) {
    return (
      <ErrorSurface
        message="This text is empty or could not be loaded."
        onBack={() => navigate('/library')}
      />
    );
  }

  return (
    <ReaderView
      tokens={tokens}
      textId={text.id}
      startIndex={text.currentTokenIndex}
      {...(text.chapters && text.chapters.length > 0 ? { chapters: text.chapters } : {})}
    />
  );
}

interface ErrorSurfaceProps {
  message: string;
  onBack: () => void;
}

function ErrorSurface({ message, onBack }: ErrorSurfaceProps) {
  const frameStyle: CSSProperties = {
    minHeight: '100dvh',
    background: 'var(--reader)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  };

  const messageStyle: CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 18,
    color: 'var(--ink-2)',
  };

  const buttonStyle: CSSProperties = {
    height: 40,
    padding: '0 18px',
    borderRadius: 'var(--r-md)',
    background: 'var(--accent)',
    border: 'none',
    color: '#fff',
    fontFamily: 'var(--font-ui)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
  };

  return (
    <div style={frameStyle}>
      <div style={messageStyle}>{message}</div>
      <button type="button" style={buttonStyle} onClick={onBack}>
        Back to Library
      </button>
    </div>
  );
}
