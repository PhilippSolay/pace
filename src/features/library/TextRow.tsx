/**
 * Pace PWA — Library TextRow
 *
 * A single row in the Library list showing one `ReadingText`'s title, meta
 * strip (source · words · estimated minutes · READ), and an optional
 * in-progress bar. Swipe-left reveals a Delete action; tap opens the text.
 *
 * Design ref: project/screens/library.jsx lines 98-158.
 * See: .gsd/milestones/M001/slices/S03/S03-PLAN.md §6.2
 */

import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { ReadingText, SourceType } from '@/core/persistence/schema';

export interface TextRowProps {
  text: ReadingText;
  onOpen: () => void;
  onDelete: () => void;
}

const DEFAULT_WPM = 350;
const SWIPE_COMMIT_PX = 10;
const SWIPE_OPEN_PX = 40;
const VERTICAL_CANCEL_PX = 30;
const TAP_TOLERANCE_PX = 10;
const TAP_MAX_DURATION_MS = 250;
const DELETE_ACTION_WIDTH = 78;

const SOURCE_LABELS: Record<SourceType, string> = {
  paste: 'PASTED', pdf: 'PDF', share: 'SHARED', url: 'URL',
};

function estimateMinutes(wordCount: number, wpm: number = DEFAULT_WPM): number {
  return Math.max(1, Math.round(wordCount / wpm));
}

interface PointerStart { x: number; y: number; t: number; cancelled: boolean; }

function TextRow({ text, onOpen, onDelete }: TextRowProps): JSX.Element {
  const [swipeOpen, setSwipeOpen] = useState(false);
  const startRef = useRef<PointerStart | null>(null);

  const progress = text.wordCount > 0
    ? Math.min(1, text.currentTokenIndex / text.wordCount) : 0;
  const showProgressBar = progress > 0 && progress < 1 && !text.isCompleted;

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>): void => {
    startRef.current = { x: e.clientX, y: e.clientY, t: Date.now(), cancelled: false };
  };
  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const start = startRef.current;
    if (!start || start.cancelled) return;
    const dx = e.clientX - start.x;
    if (Math.abs(e.clientY - start.y) > VERTICAL_CANCEL_PX) { start.cancelled = true; return; }
    if (!swipeOpen && dx < -SWIPE_COMMIT_PX) setSwipeOpen(true);
  };
  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>): void => {
    const start = startRef.current;
    startRef.current = null;
    if (!start || start.cancelled) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const isTap = Math.abs(dx) < TAP_TOLERANCE_PX && Math.abs(dy) < TAP_TOLERANCE_PX
      && Date.now() - start.t < TAP_MAX_DURATION_MS;
    if (isTap && !swipeOpen) { onOpen(); return; }
    if (dx <= -SWIPE_OPEN_PX) setSwipeOpen(true);
    else if (swipeOpen && dx >= SWIPE_OPEN_PX) setSwipeOpen(false);
  };

  const metaDot = <span style={{ color: 'var(--ink-3)' }}>·</span>;

  return (
    <div style={{ position: 'relative', borderBottom: '1px solid var(--line)', overflow: 'hidden' }}>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { startRef.current = null; }}
        style={{
          padding: '12px 2px',
          transform: swipeOpen ? `translateX(-${DELETE_ACTION_WIDTH}px)` : 'translateX(0)',
          transition: 'transform 180ms ease',
          touchAction: 'pan-y',
          cursor: swipeOpen ? 'default' : 'pointer',
        }}
      >
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 400,
          color: text.isCompleted ? 'var(--ink-2)' : 'var(--ink)',
          letterSpacing: '-0.005em',
        }}>{text.title}</div>
        <div style={{
          fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 500,
          color: 'var(--ink-2)', marginTop: 4, letterSpacing: '0.08em',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>{(text.author ?? SOURCE_LABELS[text.sourceType]).toUpperCase()}</span>
          {metaDot}<span>{text.wordCount.toLocaleString()} WORDS</span>
          {metaDot}<span>{estimateMinutes(text.wordCount)} MIN</span>
          {text.isCompleted && (<>{metaDot}<span style={{ color: 'var(--accent)' }}>READ</span></>)}
          {text.url && (
            <a
              href={text.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="Open source"
              style={{
                marginLeft: 4, color: 'var(--ink-3)',
                display: 'inline-flex', alignItems: 'center',
              }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M14 3h7v7" />
                <path d="M10 14L21 3" />
                <path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6" />
              </svg>
            </a>
          )}
        </div>
        {showProgressBar && (
          <div style={{ height: 1, background: 'var(--line-2)', marginTop: 8, position: 'relative' }}>
            <div style={{
              width: `${progress * 100}%`, height: '100%',
              background: 'var(--accent)', opacity: 0.8,
            }} />
          </div>
        )}
      </div>
      {swipeOpen && (
        <div
          onClick={onDelete}
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 1,
            width: DELETE_ACTION_WIDTH, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 500,
            cursor: 'pointer',
          }}
        >Delete</div>
      )}
    </div>
  );
}

export default TextRow;
