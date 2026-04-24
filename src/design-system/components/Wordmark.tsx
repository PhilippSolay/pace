import React from 'react';

/**
 * Pace wordmark — the brand mark rendered as `Pace` followed by an italic,
 * accent-colored period. Three sizes cover every surface in the app: `hero`
 * (welcome screen), `display` (design-system / specimen surfaces), and
 * `header` (library and in-app headers).
 *
 * See `.gsd/milestones/M001/slices/S01/S01-PLAN.md` T02.
 */

export interface WordmarkProps {
  size?: 'hero' | 'display' | 'header';
  className?: string;
  as?: 'span' | 'div' | 'h1';
}

interface SizeSpec {
  fontSize: number;
  letterSpacing: string;
  periodNudge: number;
}

const SIZE_SPECS: Record<NonNullable<WordmarkProps['size']>, SizeSpec> = {
  hero: { fontSize: 96, letterSpacing: '-0.04em', periodNudge: -2 },
  display: { fontSize: 44, letterSpacing: '-0.03em', periodNudge: 0 },
  header: { fontSize: 26, letterSpacing: '-0.03em', periodNudge: 0 },
};

function Wordmark({
  size = 'header',
  className,
  as = 'span',
}: WordmarkProps): React.ReactElement {
  const { fontSize, letterSpacing, periodNudge } = SIZE_SPECS[size];

  const rootStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontWeight: 400,
    color: 'var(--ink)',
    display: 'inline-flex',
    alignItems: 'baseline',
    fontSize,
    lineHeight: 1,
    letterSpacing,
  };

  const periodStyle: React.CSSProperties = {
    color: 'var(--accent)',
    fontStyle: 'italic',
    fontWeight: 300,
    marginLeft: periodNudge,
  };

  return React.createElement(
    as,
    { className, style: rootStyle },
    'Pace',
    React.createElement('span', { style: periodStyle }, '.'),
  );
}

export default Wordmark;
