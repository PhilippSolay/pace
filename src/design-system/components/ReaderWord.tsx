import type { CSSProperties } from 'react';
import { pinIndex } from '@/core/reader-engine/pin';

/**
 * Single-word reader surface. The pin character sits with its left edge
 * on the stage's vertical centerline; left-of-pin characters hang via
 * absolute-positioned right-align, right-of-pin characters flow inline.
 *
 * See `.gsd/milestones/M001/slices/S02/tasks/T03-PLAN.md`.
 */

export interface ReaderWordProps {
  word: string;
  size?: number;
  glow?: boolean;
}

export default function ReaderWord({ word, size = 54, glow = true }: ReaderWordProps) {
  const idx = pinIndex(word);
  const left = word.slice(0, idx);
  const pin = word[idx] ?? '';
  const right = word.slice(idx + 1);

  const rootStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(0, -50%)',
    display: 'flex',
    alignItems: 'baseline',
    fontFamily: 'var(--font-reader)',
    fontWeight: 400,
    fontSize: size,
    color: 'var(--ink)',
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
    color: 'var(--accent)',
    position: 'relative',
    zIndex: 1,
  };

  const rightStyle: CSSProperties = {
    zIndex: 1,
  };

  const glowStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: '50%',
    width: size * 1.6,
    height: size * 1.2,
    transform: 'translate(-50%, -50%)',
    background:
      'radial-gradient(ellipse at center, color-mix(in oklab, var(--accent) 35%, transparent) 0%, transparent 65%)',
    pointerEvents: 'none',
    zIndex: 0,
  };

  return (
    <div style={rootStyle} aria-hidden>
      {glow && <div style={glowStyle} />}
      {left && <span style={leftStyle}>{left}</span>}
      <span style={pinStyle}>{pin}</span>
      {right && <span style={rightStyle}>{right}</span>}
    </div>
  );
}
