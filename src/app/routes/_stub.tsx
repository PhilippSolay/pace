import type { CSSProperties, ReactNode } from 'react';

/**
 * Shared S01 stub shell — every route centers its content on a themed
 * background. Replaced by each feature's real container as slices land.
 */

interface RouteStubProps {
  children: ReactNode;
  background?: string;
}

const FRAME_STYLE: CSSProperties = {
  minHeight: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: 24,
};

export function RouteStub({ children, background = 'var(--stage)' }: RouteStubProps) {
  return <div style={{ ...FRAME_STYLE, background }}>{children}</div>;
}
