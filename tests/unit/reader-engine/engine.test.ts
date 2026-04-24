import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReaderEngine } from '@/core/reader-engine/engine';
import type { ReaderSettings, ReaderToken } from '@/core/reader-engine/types';

function word(text: string, index: number): ReaderToken {
  return { text, isParagraphBreak: false, index };
}

function paragraphBreak(index: number): ReaderToken {
  return { text: '', isParagraphBreak: true, index };
}

function makeSettings(overrides: Partial<ReaderSettings> = {}): ReaderSettings {
  return { wpm: 600, punctuationPauses: false, ...overrides };
}

describe('ReaderEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initial state reflects first token, not playing', () => {
    const engine = new ReaderEngine({
      tokens: [word('one', 0), word('two', 1)],
      settings: makeSettings(),
    });
    const state = engine.getState();
    expect(state.index).toBe(0);
    expect(state.isPlaying).toBe(false);
    expect(state.word).toBe('one');
    expect(state.totalTokens).toBe(2);
    expect(state.isFinished).toBe(false);
  });

  it('play() toggles isPlaying and fires onChange', () => {
    const onChange = vi.fn();
    const engine = new ReaderEngine({
      tokens: [word('a', 0), word('b', 1)],
      settings: makeSettings(),
      onChange,
    });
    engine.play();
    expect(engine.getState().isPlaying).toBe(true);
    expect(onChange).toHaveBeenCalled();
  });

  it('advances through tokens at the computed duration', () => {
    const tokens = [word('a', 0), word('b', 1), word('c', 2)];
    const engine = new ReaderEngine({
      tokens,
      settings: makeSettings({ wpm: 600 }), // baseMs = 100
    });
    engine.play();
    expect(engine.getState().index).toBe(0);
    vi.advanceTimersByTime(100);
    expect(engine.getState().index).toBe(1);
    vi.advanceTimersByTime(100);
    expect(engine.getState().index).toBe(2);
  });

  it('pause() cancels the pending timeout', () => {
    const engine = new ReaderEngine({
      tokens: [word('a', 0), word('b', 1)],
      settings: makeSettings({ wpm: 600 }),
    });
    engine.play();
    vi.advanceTimersByTime(50);
    engine.pause();
    expect(engine.getState().isPlaying).toBe(false);
    vi.advanceTimersByTime(500);
    // index never advanced past 0 because pause cancelled the tick
    expect(engine.getState().index).toBe(0);
  });

  it('jump(+n) advances index; jump(-n) retreats; both clamp at bounds', () => {
    const tokens = [word('a', 0), word('b', 1), word('c', 2), word('d', 3)];
    const engine = new ReaderEngine({ tokens, settings: makeSettings() });
    engine.jump(2);
    expect(engine.getState().index).toBe(2);
    engine.jump(-1);
    expect(engine.getState().index).toBe(1);
    engine.jump(-999);
    expect(engine.getState().index).toBe(0);
    engine.jump(999);
    expect(engine.getState().index).toBe(4); // clamp = totalTokens (past-the-end)
  });

  it('seek while playing reschedules the next tick', () => {
    const tokens = [word('a', 0), word('b', 1), word('c', 2), word('d', 3)];
    const engine = new ReaderEngine({
      tokens,
      settings: makeSettings({ wpm: 600 }),
    });
    engine.play();
    engine.seek(2);
    expect(engine.getState().index).toBe(2);
    vi.advanceTimersByTime(100);
    expect(engine.getState().index).toBe(3);
  });

  it('onFinish fires when the last token completes', () => {
    const onFinish = vi.fn();
    const engine = new ReaderEngine({
      tokens: [word('a', 0), word('b', 1)],
      settings: makeSettings({ wpm: 600 }),
      onFinish,
    });
    engine.play();
    vi.advanceTimersByTime(100);
    vi.advanceTimersByTime(100);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(engine.getState().isFinished).toBe(true);
    expect(engine.getState().isPlaying).toBe(false);
  });

  it('reset() returns to index 0 and pauses', () => {
    const engine = new ReaderEngine({
      tokens: [word('a', 0), word('b', 1), word('c', 2)],
      settings: makeSettings({ wpm: 600 }),
    });
    engine.play();
    vi.advanceTimersByTime(150);
    engine.reset();
    expect(engine.getState().index).toBe(0);
    expect(engine.getState().isPlaying).toBe(false);
  });

  it('paragraph break tokens expose empty word, 2.5× multiplier respected', () => {
    const tokens = [word('one', 0), paragraphBreak(1), word('two', 2)];
    const engine = new ReaderEngine({
      tokens,
      settings: makeSettings({ wpm: 600, punctuationPauses: true }),
    });
    engine.play();
    expect(engine.getState().word).toBe('one');
    vi.advanceTimersByTime(100);
    // Now sitting on the paragraph break
    expect(engine.getState().word).toBe('');
    // Paragraph break has 2.5× multiplier → 250 ms. Just before the tick,
    // we should still be on the break:
    vi.advanceTimersByTime(249);
    expect(engine.getState().word).toBe('');
    // Then the tick fires and we land on 'two':
    vi.advanceTimersByTime(1);
    expect(engine.getState().word).toBe('two');
  });

  it('destroy() cancels timers and clears listeners', () => {
    const onChange = vi.fn();
    const onFinish = vi.fn();
    const engine = new ReaderEngine({
      tokens: [word('a', 0), word('b', 1)],
      settings: makeSettings({ wpm: 600 }),
      onChange,
      onFinish,
    });
    engine.play();
    const changesBefore = onChange.mock.calls.length;
    engine.destroy();
    vi.advanceTimersByTime(500);
    expect(onChange.mock.calls.length).toBe(changesBefore);
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('updateSettings takes effect on the next scheduled tick', () => {
    const tokens = [word('a', 0), word('b', 1), word('c', 2)];
    const engine = new ReaderEngine({
      tokens,
      settings: makeSettings({ wpm: 600 }), // baseMs = 100
    });
    engine.play();
    vi.advanceTimersByTime(100);
    expect(engine.getState().index).toBe(1);
    engine.updateSettings({ wpm: 1200 }); // baseMs = 50
    vi.advanceTimersByTime(50);
    // Current timeout was scheduled with the OLD wpm, so new timing
    // only kicks in after the currently-pending timeout fires.
    // Without a reschedule the next tick still uses 100ms.
    // Advance another 50ms to reach the original 100ms tick.
    vi.advanceTimersByTime(50);
    expect(engine.getState().index).toBe(2);
  });
});
