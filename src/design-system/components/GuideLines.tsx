import type { CSSProperties } from 'react';

/**
 * Two thin vertical bars sitting above and below the pin character,
 * anchored to the stage's vertical centerline. Per brief §2 the pin
 * character's left edge sits on the centerline, and the guide lines
 * mark that fixation anchor. They stay put across word changes —
 * earlier versions measured the pin glyph and tracked its right edge,
 * which produced visible horizontal jitter as letter widths varied.
 *
 * See `.gsd/milestones/M001/slices/S02/tasks/T03-PLAN.md`.
 */

export interface GuideLinesProps {
  word: string;
  size?: number;
}

const BAR_HEIGHT = 22;

export default function GuideLines({ word: _word, size = 54 }: GuideLinesProps) {
  const barBase: CSSProperties = {
    position: 'absolute',
    left: '50%',
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
      <div aria-hidden style={topBarStyle} />
      <div aria-hidden style={bottomBarStyle} />
    </>
  );
}
