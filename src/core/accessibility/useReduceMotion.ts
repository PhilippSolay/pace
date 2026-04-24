/**
 * @module core/accessibility/useReduceMotion
 *
 * React hook wrapping `matchMedia('(prefers-reduced-motion: reduce)')`.
 * Returns `true` when the user has enabled reduce-motion at the OS level
 * and stays in sync when the setting changes mid-session.
 *
 * See `.gsd/milestones/M001/slices/S06/S06-PLAN.md` for the slice spec.
 */

import { useEffect, useState } from 'react';

const REDUCE_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function canQuery(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState<boolean>(() =>
    canQuery() ? window.matchMedia(REDUCE_MOTION_QUERY).matches : false,
  );

  useEffect(() => {
    if (!canQuery()) return;
    const mediaQuery = window.matchMedia(REDUCE_MOTION_QUERY);
    const handleChange = (event: MediaQueryListEvent): void => setReduceMotion(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reduceMotion;
}
