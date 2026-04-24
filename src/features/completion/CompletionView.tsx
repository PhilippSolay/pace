import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getText, updateProgress } from '@/core/persistence/texts';
import { listSessionsForText } from '@/core/persistence/sessions';
import type { ReadingSession, ReadingText } from '@/core/persistence/schema';

/**
 * Completion screen shown after a reader finishes a text. Displays
 * PACE / TIME / WORDS / TEXT stats and offers "Read again" (resets
 * progress and re-enters the Reader) or "Library" navigation.
 *
 * See `.gsd/milestones/M001/slices/S06/S06-PLAN.md`.
 */

interface LoadedData {
  text: ReadingText | undefined;
  session: ReadingSession | undefined;
}

function computeTime(session?: ReadingSession): string {
  if (!session?.endedAt) return '—';
  const ms = session.endedAt - session.startedAt;
  const totalSeconds = Math.round(ms / 1000);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
}

export default function CompletionView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<LoadedData | null>(null);

  useEffect(() => {
    if (!id) {
      setData({ text: undefined, session: undefined });
      return;
    }
    let cancelled = false;
    async function load(textId: string) {
      const [text, sessions] = await Promise.all([
        getText(textId),
        listSessionsForText(textId),
      ]);
      if (cancelled) return;
      setData({ text, session: sessions[0] });
    }
    void load(id);
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (data === null) {
    return <div style={{ minHeight: '100dvh', background: 'var(--stage)' }} />;
  }

  if (!data.text) {
    return (
      <div style={{ ...S.frame, gap: 16 }}>
        <div style={S.errorMsg}>This text could not be found.</div>
        <button type="button" style={S.primaryBtn} onClick={() => navigate('/library')}>
          Back to Library
        </button>
      </div>
    );
  }

  const { text, session } = data;

  async function handleReadAgain() {
    if (!id) return;
    await updateProgress(id, 0);
    navigate(`/reader/${id}`);
  }

  const rows: Array<{ label: string; value: string; truncate?: boolean }> = [
    { label: 'PACE', value: session ? `${session.averageWPM} WPM` : '—' },
    { label: 'TIME', value: computeTime(session) },
    { label: 'WORDS', value: text.wordCount.toLocaleString() },
    { label: 'TEXT', value: text.title, truncate: true },
  ];

  return (
    <div style={S.frame}>
      <div style={S.eyebrow}>FINISHED</div>
      <h1 style={S.title}>That&apos;s it — you&apos;re through.</h1>

      <ul style={S.statsList}>
        {rows.map((r) => (
          <li key={r.label} style={S.statRow}>
            <span style={S.statLabel}>{r.label}</span>
            <span style={r.truncate ? { ...S.statValue, ...S.truncate } : S.statValue}>
              {r.value}
            </span>
          </li>
        ))}
      </ul>

      <div style={S.actionStack}>
        <button type="button" style={S.primaryBtn} onClick={handleReadAgain}>
          Read again
        </button>
        <button type="button" style={S.secondaryBtn} onClick={() => navigate('/library')}>
          Library
        </button>
      </div>
    </div>
  );
}

const btnBase: CSSProperties = {
  height: 44,
  borderRadius: 'var(--r-md)',
  fontFamily: 'var(--font-ui)',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
};

const S: Record<string, CSSProperties> = {
  frame: {
    minHeight: '100dvh',
    background: 'var(--stage)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  eyebrow: {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: '0.28em',
    color: 'var(--accent)',
    fontWeight: 500,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 40,
    color: 'var(--ink)',
    letterSpacing: '-0.02em',
    textAlign: 'center',
    margin: '16px 0 0',
    fontWeight: 400,
    lineHeight: 1.1,
  },
  statsList: {
    marginTop: 48,
    width: '100%',
    maxWidth: 320,
    listStyle: 'none',
    padding: 0,
    borderTop: '1px solid var(--line)',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid var(--line)',
    gap: 16,
  },
  statLabel: {
    fontFamily: 'var(--font-ui)',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: '0.22em',
    color: 'var(--ink-2)',
  },
  statValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: 14,
    letterSpacing: '0.04em',
    color: 'var(--ink)',
    textAlign: 'right',
  },
  truncate: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 },
  actionStack: {
    marginTop: 48,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    width: '100%',
    maxWidth: 320,
  },
  primaryBtn: { ...btnBase, border: 'none', background: 'var(--accent)', color: '#fff' },
  secondaryBtn: {
    ...btnBase,
    background: 'transparent',
    border: '1px solid var(--line-2)',
    color: 'var(--ink)',
  },
  errorMsg: { fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--ink-2)' },
};
