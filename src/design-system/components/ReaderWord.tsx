import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { pinIndex } from '@/core/reader-engine/pin';

/**
 * Single-word reader surface. The pin character's CENTER sits on the
 * stage's vertical centerline so the eye locks onto it without drift.
 * We measure the pin glyph at runtime and translate the word container
 * left by half its width — the resulting micro-shifts between words
 * are invisible at typical reading WPM, while a wider letter ('w')
 * vs a narrow one ('i') no longer pushes the focal point off-center.
 *
 * Note: the brief §2 originally specified "pin's left edge on the
 * stage centerline" for a stable anchor, but real-world testing showed
 * the eye reads "centered" not "left-anchored" — so we center.
 *
 * See `.gsd/milestones/M001/slices/S02/tasks/T03-PLAN.md`.
 */

export interface ReaderWordProps {
  word: string;
  size?: number;
  glow?: boolean;
  color?: string;
  pinColor?: string;
}

const FALLBACK_PIN_WIDTH_RATIO = 0.4;

export default function ReaderWord({
  word,
  size = 54,
  glow = true,
  color = 'var(--ink)',
  pinColor = 'var(--accent)',
}: ReaderWordProps) {
  const idx = pinIndex(word);
  const left = word.slice(0, idx);
  const pin = word[idx] ?? '';
  const right = word.slice(idx + 1);

  const pinRef = useRef<HTMLSpanElement>(null);
  const [pinWidth, setPinWidth] = useState<number>(size * FALLBACK_PIN_WIDTH_RATIO);

  useLayoutEffect(() => {
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const el = pinRef.current;
      if (!el) return;
      setPinWidth(el.getBoundingClientRect().width);
    };
    measure();
    void document.fonts?.ready.then(measure);
    return () => {
      cancelled = true;
    };
  }, [pin, size]);

  const rootStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: `translate(-${pinWidth / 2}px, -50%)`,
    display: 'flex',
    alignItems: 'baseline',
    fontFamily: 'var(--font-reader)',
    fontWeight: 400,
    fontSize: size,
    color,
    lineHeight: 1,
    letterSpacing: '0.005em',
    pointerEvents: 'none',
  };

  const leftStyle: CSSProperties = {
    position: 'absolute',
    right: '100%',
    whiteSpace: 'pre',
    zIndex: 1,
  };

  const pinStyle: CSSProperties = {
    color: pinColor,
    position: 'relative',
    zIndex: 1,
  };

  const rightStyle: CSSProperties = {
    zIndex: 1,
  };

  const glowStyle: CSSProperties = {
    position: 'absolute',
    left: pinWidth / 2,
    top: '50%',
    width: size * 1.6,
    height: size * 1.2,
    transform: 'translate(-50%, -50%)',
    background: `radial-gradient(ellipse at center, color-mix(in oklab, ${pinColor} 35%, transparent) 0%, transparent 65%)`,
    pointerEvents: 'none',
    zIndex: 0,
  };

  return (
    <div style={rootStyle} aria-hidden>
      {glow && <div style={glowStyle} />}
      {left && <span style={leftStyle}>{left}</span>}
      <span ref={pinRef} style={pinStyle}>
        {pin}
      </span>
      {right && <span style={rightStyle}>{right}</span>}
    </div>
  );
}
