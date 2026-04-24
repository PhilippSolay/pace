import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/core/persistence/schema';
import type { ReadingSession } from '@/core/persistence/schema';
import {
  endSession,
  listSessionsForText,
  startSession,
} from '@/core/persistence/sessions';

const TIMESTAMP_GAP_MS = 10;
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('persistence/sessions', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('startSession returns a row with startedAt and zeroed counters', async () => {
    const before = Date.now();
    const session = await startSession('text-1');
    const after = Date.now();

    expect(session.id).toBeTruthy();
    expect(session).toMatchObject({
      textId: 'text-1',
      tokensRead: 0,
      averageWPM: 0,
    });
    expect(session.startedAt).toBeGreaterThanOrEqual(before);
    expect(session.startedAt).toBeLessThanOrEqual(after);
    expect(session.endedAt).toBeUndefined();
  });

  it('endSession stamps endedAt, tokensRead, and averageWPM', async () => {
    const session = await startSession('text-1');
    const before = Date.now();

    await endSession(session.id, { tokensRead: 100, averageWPM: 380 });

    const stored = (await db.sessions.get(session.id)) as ReadingSession;
    expect(stored.tokensRead).toBe(100);
    expect(stored.averageWPM).toBe(380);
    expect(typeof stored.endedAt).toBe('number');
    expect(stored.endedAt!).toBeGreaterThanOrEqual(before);
  });

  it('endSession does not throw on a nonexistent id (no-op)', async () => {
    await expect(
      endSession('nonexistent', { tokensRead: 10, averageWPM: 200 }),
    ).resolves.not.toThrow();

    const count = await db.sessions.count();
    expect(count).toBe(0);
  });

  it('listSessionsForText returns sessions newest-first', async () => {
    const first = await startSession('text-1');
    await wait(TIMESTAMP_GAP_MS);
    const second = await startSession('text-1');
    await wait(TIMESTAMP_GAP_MS);
    const third = await startSession('text-1');

    const list = await listSessionsForText('text-1');

    expect(list).toHaveLength(3);
    expect(list[0]?.id).toBe(third.id);
    expect(list[1]?.id).toBe(second.id);
    expect(list[2]?.id).toBe(first.id);
    expect(list[0]!.startedAt).toBeGreaterThan(list[1]!.startedAt);
    expect(list[1]!.startedAt).toBeGreaterThan(list[2]!.startedAt);
  });

  it('listSessionsForText returns [] when no sessions exist for the textId', async () => {
    await startSession('text-1');

    const list = await listSessionsForText('other-text');

    expect(list).toEqual([]);
  });
});
