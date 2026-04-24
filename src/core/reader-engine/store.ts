import { create } from 'zustand';
import { EMPTY_READER_STATE, ReaderEngine } from './engine';
import type { ReaderEngineState, ReaderSettings, ReaderToken } from './types';

/**
 * Zustand store wrapping a singleton `ReaderEngine`. React components
 * read the engine's public state reactively and dispatch actions
 * through thin wrappers.
 *
 * The engine instance lives at module scope (not in store state) so
 * the class-based lifecycle plays nicely with React StrictMode's
 * double-mount behavior: destroying the engine only cancels timers;
 * `initEngine` is idempotent in intent.
 *
 * See `.gsd/milestones/M001/slices/S02/tasks/T02-PLAN.md`.
 */

interface ReaderStore extends ReaderEngineState {
  initEngine: (
    tokens: ReaderToken[],
    settings?: Partial<ReaderSettings>,
    onFinish?: () => void,
  ) => void;
  destroyEngine: () => void;
  play: () => void;
  pause: () => void;
  seek: (target: number) => void;
  jump: (delta: number) => void;
  reset: () => void;
  updateSettings: (settings: Partial<ReaderSettings>) => void;
}

let engine: ReaderEngine | null = null;

export const useReaderStore = create<ReaderStore>((set) => ({
  ...EMPTY_READER_STATE,

  initEngine(tokens, settings, onFinish) {
    engine?.destroy();
    engine = new ReaderEngine({
      tokens,
      ...(settings !== undefined ? { settings } : {}),
      onChange: (state) => set(state),
      ...(onFinish !== undefined ? { onFinish } : {}),
    });
    set(engine.getState());
  },

  destroyEngine() {
    engine?.destroy();
    engine = null;
    set(EMPTY_READER_STATE);
  },

  play() {
    engine?.play();
  },

  pause() {
    engine?.pause();
  },

  seek(target) {
    engine?.seek(target);
  },

  jump(delta) {
    engine?.jump(delta);
  },

  reset() {
    engine?.reset();
  },

  updateSettings(settings) {
    engine?.updateSettings(settings);
  },
}));

/** Test-only: returns the active engine instance (or null). */
export function __getEngine(): ReaderEngine | null {
  return engine;
}
