import { computeDuration } from './timing';
import {
  DEFAULT_READER_SETTINGS,
  type ReaderEngineOptions,
  type ReaderEngineState,
  type ReaderSettings,
  type ReaderToken,
} from './types';

/**
 * Stateful RSVP reader engine. Composes the pure T01 modules behind a
 * minimal class API with timer control and event listeners.
 *
 * The class is framework-agnostic — no React or Zustand imports. A
 * React-friendly wrapper lives in `./store.ts`.
 *
 * See `.gsd/milestones/M001/slices/S02/tasks/T02-PLAN.md`.
 */

type ChangeListener = (state: ReaderEngineState) => void;
type FinishListener = () => void;
type TimeoutHandle = ReturnType<typeof setTimeout>;

const EMPTY_STATE: ReaderEngineState = {
  index: 0,
  isPlaying: false,
  totalTokens: 0,
  word: '',
  progress: 0,
  isFinished: false,
};

export class ReaderEngine {
  private tokens: ReaderToken[];
  private settings: ReaderSettings;
  private index = 0;
  private playing = false;
  private timeoutId: TimeoutHandle | null = null;
  private changeListeners = new Set<ChangeListener>();
  private finishListeners = new Set<FinishListener>();
  private destroyed = false;

  constructor(options: ReaderEngineOptions) {
    this.tokens = options.tokens;
    this.settings = { ...DEFAULT_READER_SETTINGS, ...options.settings };
    if (options.onChange) this.changeListeners.add(options.onChange);
    if (options.onFinish) this.finishListeners.add(options.onFinish);
  }

  /** Subscribe to state changes. Returns an unsubscribe function. */
  onChange(listener: ChangeListener): () => void {
    this.changeListeners.add(listener);
    return () => {
      this.changeListeners.delete(listener);
    };
  }

  /** Subscribe to completion. Returns an unsubscribe function. */
  onFinish(listener: FinishListener): () => void {
    this.finishListeners.add(listener);
    return () => {
      this.finishListeners.delete(listener);
    };
  }

  /** Current snapshot — immutable, re-derived from internals. */
  getState(): ReaderEngineState {
    const totalTokens = this.tokens.length;
    const isFinished = this.index >= totalTokens && totalTokens > 0;
    const current = this.tokens[this.index];
    const word = current?.isParagraphBreak ? '' : (current?.text ?? '');
    const progress = totalTokens === 0 ? 0 : Math.min(this.index / totalTokens, 1);
    return {
      index: this.index,
      isPlaying: this.playing,
      totalTokens,
      word,
      progress,
      isFinished,
    };
  }

  getCurrentToken(): ReaderToken | undefined {
    return this.tokens[this.index];
  }

  play(): void {
    if (this.destroyed || this.playing || this.tokens.length === 0) return;
    if (this.index >= this.tokens.length) return;
    this.playing = true;
    this.emitChange();
    this.scheduleNext();
  }

  pause(): void {
    if (!this.playing) return;
    this.playing = false;
    this.clearTimeout();
    this.emitChange();
  }

  /** Clamp `target` to `[0, totalTokens]` and reposition. */
  seek(target: number): void {
    if (this.destroyed) return;
    const clamped = Math.max(0, Math.min(target, this.tokens.length));
    if (clamped === this.index) return;
    this.index = clamped;
    if (this.playing) {
      this.clearTimeout();
      if (this.index >= this.tokens.length) {
        this.finish();
        return;
      }
      this.scheduleNext();
    }
    this.emitChange();
  }

  jump(delta: number): void {
    this.seek(this.index + delta);
  }

  reset(): void {
    this.pause();
    this.index = 0;
    this.emitChange();
  }

  updateSettings(next: Partial<ReaderSettings>): void {
    this.settings = { ...this.settings, ...next };
    // If playing, the next scheduled tick will already use the new
    // settings (scheduleNext reads this.settings each call).
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.playing = false;
    this.clearTimeout();
    this.changeListeners.clear();
    this.finishListeners.clear();
  }

  private scheduleNext(): void {
    if (!this.playing || this.destroyed) return;
    const token = this.tokens[this.index];
    if (!token) {
      this.finish();
      return;
    }
    const ms = computeDuration(token, this.settings);
    this.timeoutId = setTimeout(() => {
      this.timeoutId = null;
      this.advance();
    }, ms);
  }

  private advance(): void {
    if (!this.playing || this.destroyed) return;
    this.index += 1;
    if (this.index >= this.tokens.length) {
      this.finish();
      return;
    }
    this.emitChange();
    this.scheduleNext();
  }

  private finish(): void {
    this.playing = false;
    this.clearTimeout();
    this.emitChange();
    for (const listener of this.finishListeners) listener();
  }

  private clearTimeout(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private emitChange(): void {
    const state = this.getState();
    for (const listener of this.changeListeners) listener(state);
  }
}

export { EMPTY_STATE as EMPTY_READER_STATE };
