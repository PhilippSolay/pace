/**
 * Floating action button for the Library screen. Stateless presentational
 * component pinned to the viewport bottom-right via `position: fixed` so
 * it stays put while the library list scrolls. Dual shadow matches brief §10.5.
 *
 * See: .gsd/milestones/M001/slices/S03/S03-PLAN.md
 */
import type { CSSProperties } from 'react';

export interface FabProps {
  onClick: () => void;
  label?: string;
}

const FAB_STYLE: CSSProperties = {
  position: 'fixed',
  right: 20,
  // calc + safe-area-inset-bottom so the FAB clears the iOS home-indicator
  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
  width: 48,
  height: 48,
  borderRadius: 'var(--r-fab)',
  border: 'none',
  background: 'var(--accent)',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 24px rgba(217,64,80,0.3), 0 2px 6px rgba(0,0,0,0.5)',
  zIndex: 20,
};

function Fab({ onClick, label = 'Add a new text' }: FabProps) {
  return (
    <button type="button" aria-label={label} onClick={onClick} style={FAB_STYLE}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  );
}

export default Fab;
