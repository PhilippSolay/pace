import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { pinIndex } from '@/core/reader-engine/pin';

/**
 * Two thin vertical bars sitting above and below the pin character,
 * centered on the measured width of the pin glyph (not the stage's
 * vertical centerline — pin widths vary across fonts).
 *
 * See `.gsd/milestones/M001/slices/S02/tasks/T03-PLAN.md`.
 */

export interface GuideLinesProps {
  word: string;
  size?: number;
}

const FALLBACK_RATIO = 0.35;
const BAR_HEIGHT = 22;

export default function GuideLines({ word, size = 54 }: GuideLinesProps) {
  const idx = pinIndex(word);
  const pin = word[idx] ?? '';
  const measureRef = useRef<HTMLSpanElement>(null);
  const [pinWidth, setPinWidth] = useState<number>(size * FALLBACK_RATIO);

  useLayoutEffect(() => {
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const el = measureRef.current;
      if (!el) return;
      setPinWidth(el.getBoundingClientRect().width);
    };
    // Measure immediately on mount; re-measure once fonts have loaded.
    measure();
    void document.fonts?.ready.then(measure);
    return () => {
      cancelled = true;
    };
  }, [pin, size]);

  const measurerStyle: CSSProperties = {
    position: 'absolute',
    visibility: 'hidden',
    pointerEvents: 'none',
    fontFamily: 'var(--font-reader)',
    fontWeight: 400,
    fontSize: size,
    letterSpacing: '0.005em',
    whiteSpace: 'pre',
  };

  const barBase: CSSProperties = {
    position: 'absolute',
    left: `calc(50% + ${pinWidth / 2}px)`,
    top: '50%',
    width: 1,
    height: BAR_HEIGHT,
    background: 'rgba(255, 255, 255, 0.3)',
    pointerEvents: 'none',
  };

  const topBarStyle: CSSProperties = {
    ...barBase,
    transform: `translate(-0.5px, calc(-${size / 2}px - 100%))`,
  };

  const bottomBarStyle: CSSProperties = {
    ...barBase,
    transform: `translate(-0.5px, ${size / 2}px)`,
  };

  return (
    <>
      <span ref={measureRef} aria-hidden style={measurerStyle}>
        {pin}
      </span>
      <div aria-hidden style={topBarStyle} />
      <div aria-hidden style={bottomBarStyle} />
    </>
  );
}
