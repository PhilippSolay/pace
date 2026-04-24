/**
 * @module core/haptics/haptics
 *
 * Vibration API wrapper for Pace. Supported on Android Chrome; no-op on
 * iOS Safari (brief §11.2). Gated by the user's `haptics` preference and
 * the OS `prefers-reduced-motion` setting per D033 and brief §15.2.
 *
 * See `.gsd/milestones/M001/slices/S06/S06-PLAN.md` for the slice spec.
 *
 * Gating matrix:
 *   haptics=false                       → all no-op (including finish)
 *   haptics=true, reduceMotion=false    → all fire
 *   haptics=true, reduceMotion=true     → only finish fires
 */

const SOFT_MS = 10;
const MEDIUM_MS = 20;
const RIGID_MS = 30;
const FINISH_PATTERN: readonly number[] = [30, 10, 30];

export interface HapticsAPI {
  soft: () => void;
  medium: () => void;
  rigid: () => void;
  finish: () => void;
}

function getVibrateFn(): ((pattern: number | number[]) => boolean) | null {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return null;
  }
  const fn = navigator.vibrate;
  return typeof fn === 'function' ? fn.bind(navigator) : null;
}

export function createHaptics(enabled: boolean, reduceMotion: boolean): HapticsAPI {
  const vibrate = getVibrateFn();

  const fireShort = (ms: number): void => {
    if (!enabled || reduceMotion || vibrate === null) return;
    vibrate(ms);
  };

  const fireFinish = (): void => {
    if (!enabled || vibrate === null) return;
    vibrate([...FINISH_PATTERN]);
  };

  return {
    soft: () => fireShort(SOFT_MS),
    medium: () => fireShort(MEDIUM_MS),
    rigid: () => fireShort(RIGID_MS),
    finish: fireFinish,
  };
}
