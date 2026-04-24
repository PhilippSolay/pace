import type { CSSProperties, ReactNode } from 'react';

/**
 * Eyebrow — mono uppercase small-caps label. Used to introduce sections
 * (LIBRARY, READING, APPEARANCE, ACCOUNT, etc.) and surface ephemeral
 * status labels across Library, Reader, and Settings. Matches the
 * pattern in the design handoff's settings.jsx Eyebrow helper.
 *
 * See `.gsd/milestones/M001/slices/S01/S01-PLAN.md` T03.
 */

export interface EyebrowProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

const BASE_STYLE: CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  fontWeight: 500,
  letterSpacing: '0.28em',
  color: 'var(--ink-3)',
  textTransform: 'uppercase',
};

export default function Eyebrow({ children, style, className }: EyebrowProps) {
  return (
    <div className={className} style={{ ...BASE_STYLE, ...style }}>
      {children}
    </div>
  );
}
