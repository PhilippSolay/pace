import { useEffect, useMemo, type CSSProperties } from 'react';
import { useReaderStore } from '@/core/reader-engine/store';
import { tokenize } from '@/core/reader-engine/tokenize';
import { MARCUS_AURELIUS_PASSAGE } from '@/core/reader-engine/samples';
import ReaderWord from '@/design-system/components/ReaderWord';
import GuideLines from '@/design-system/components/GuideLines';
import GestureLayer from './GestureLayer';

/**
 * Full /reader surface. Wires the engine store to ReaderWord +
 * GuideLines + gesture handlers.
 *
 * S02 uses a hardcoded sample; S03 replaces the sample import with
 * a Dexie-backed text lookup keyed by route param.
 *
 * See `.gsd/milestones/M001/slices/S02/tasks/T04-PLAN.md`.
 */

const DEFAULT_WPM = 350;

function formatRemaining(index: number, totalTokens: number, wpm: number): string {
  const remaining = Math.max(totalTokens - index, 0);
  const totalSeconds = Math.round((remaining / wpm) * 60);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
}

export default function ReaderView() {
  const index = useReaderStore((s) => s.index);
  const isPlaying = useReaderStore((s) => s.isPlaying);
  const totalTokens = useReaderStore((s) => s.totalTokens);
  const word = useReaderStore((s) => s.word);
  const progress = useReaderStore((s) => s.progress);
  const initEngine = useReaderStore((s) => s.initEngine);
  const destroyEngine = useReaderStore((s) => s.destroyEngine);
  const play = useReaderStore((s) => s.play);
  const pause = useReaderStore((s) => s.pause);
  const jump = useReaderStore((s) => s.jump);

  const tokens = useMemo(() => tokenize(MARCUS_AURELIUS_PASSAGE), []);

  useEffect(() => {
    initEngine(tokens, { wpm: DEFAULT_WPM, punctuationPauses: true }, () => {
      // S06 will transition to Completion; S02 logs for visibility.
      console.info('[Pace] reader finished');
    });
    return () => destroyEngine();
  }, [tokens, initEngine, destroyEngine]);

  useEffect(() => {
    function handleVisibility() {
      if (document.hidden && isPlaying) pause();
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isPlaying, pause]);

  function handleTap() {
    if (isPlaying) pause();
    else play();
  }

  function handleSettingsRequest() {
    // Placeholder — real settings drawer lands in S05.
    console.info('[Pace] settings requested');
  }

  const stageStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    minHeight: '100dvh',
    background: 'var(--reader)',
    overflow: 'hidden',
  };

  const topBarStyle: CSSProperties = {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    pointerEvents: 'none',
  };

  const hintStyle: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 8,
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.22)',
    fontWeight: 500,
    opacity: index === 0 && !isPlaying ? 1 : 0,
    transition: 'opacity 180ms',
  };

  const remainingStyle: CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    letterSpacing: '0.12em',
    color: isPlaying ? 'rgba(255, 255, 255, 0.32)' : 'rgba(255, 255, 255, 0.18)',
    fontWeight: 500,
  };

  const pausedPillStyle: CSSProperties = {
    position: 'absolute',
    bottom: 46,
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '8px 14px',
    borderRadius: 999,
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(8px)',
    fontFamily: 'var(--font-ui)',
    fontSize: 9.5,
    fontWeight: 500,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.65)',
    pointerEvents: 'none',
  };

  const progressBarStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    background: 'transparent',
    pointerEvents: 'none',
  };

  const progressFillStyle: CSSProperties = {
    width: `${progress * 100}%`,
    height: '100%',
    background: 'var(--accent)',
  };

  const paragraphGlyphStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontFamily: 'var(--font-reader)',
    fontSize: 48,
    color: 'var(--ink)',
    opacity: 0.25,
    pointerEvents: 'none',
  };

  const currentToken = tokens[index];
  const showIdleHint = index === 0 && !isPlaying;
  const isParagraphBreak = currentToken?.isParagraphBreak === true;

  return (
    <GestureLayer
      onTap={handleTap}
      onSwipeLeft={() => jump(-5)}
      onSwipeRight={() => jump(5)}
      onSwipeUp={handleSettingsRequest}
      style={stageStyle}
    >
      <div style={topBarStyle}>
        <span style={hintStyle}>tap · pause</span>
        <span style={remainingStyle}>
          {formatRemaining(index, totalTokens, DEFAULT_WPM)}
        </span>
      </div>

      {isParagraphBreak ? (
        <div style={paragraphGlyphStyle} aria-hidden>
          ¶
        </div>
      ) : word ? (
        <>
          <GuideLines word={word} size={54} />
          <ReaderWord word={word} size={54} glow />
        </>
      ) : null}

      {showIdleHint && <div style={pausedPillStyle}>Paused — tap to start</div>}

      <div style={progressBarStyle}>
        <div style={progressFillStyle} />
      </div>

      <span
        style={{
          position: 'absolute',
          left: -9999,
          top: -9999,
          width: 1,
          height: 1,
          overflow: 'hidden',
        }}
      >
        Pace speed reader is not compatible with screen readers. To read this
        text, use your device&apos;s built-in Read-Aloud feature on the original
        source.
      </span>
    </GestureLayer>
  );
}
