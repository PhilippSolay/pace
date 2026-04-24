import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/core/persistence/schema';
import type { ReadingText } from '@/core/persistence/schema';
import {
  createText,
  deleteText,
  getText,
  listTexts,
  markCompleted,
  updateProgress,
  updateText,
} from '@/core/persistence/texts';
import { startSession } from '@/core/persistence/sessions';

// Small helper: the "newest-first" ordering tests rely on observable deltas
// between `updatedAt` timestamps. Date.now() can return the same value twice
// in a row, so we sleep a few ms to guarantee a strictly greater tick.
const TIMESTAMP_GAP_MS = 10;
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('persistence/texts', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('createText returns a row with all fields populated', async () => {
    const before = Date.now();
    const row = await createText({
      title: 'Hello',
      content: 'one two three four five',
      sourceType: 'paste',
    });
    const after = Date.now();

    expect(row.id).toBeTruthy();
    expect(row.id.length).toBeGreaterThan(0);
    expect(row).toMatchObject({
      title: 'Hello',
      content: 'one two three four five',
      sourceType: 'paste',
      isCompleted: false,
      currentTokenIndex: 0,
      wordCount: 5,
    });
    expect(row.createdAt).toBeGreaterThanOrEqual(before);
    expect(row.createdAt).toBeLessThanOrEqual(after);
    expect(row.updatedAt).toBe(row.createdAt);
    expect(row.completedAt).toBeUndefined();
  });

  it('getText returns the created row', async () => {
    const created = await createText({
      title: 'Readable',
      content: 'alpha beta gamma',
      sourceType: 'paste',
    });

    const fetched = await getText(created.id);

    expect(fetched).toBeDefined();
    expect(fetched).toMatchObject({
      id: created.id,
      title: 'Readable',
      content: 'alpha beta gamma',
      wordCount: 3,
    });
  });

  it('getText returns undefined for a nonexistent id', async () => {
    const fetched = await getText('nonexistent');
    expect(fetched).toBeUndefined();
  });

  it('listTexts returns newest first', async () => {
    const first = await createText({
      title: 'First',
      content: 'a b c',
      sourceType: 'paste',
    });
    await wait(TIMESTAMP_GAP_MS);
    const second = await createText({
      title: 'Second',
      content: 'd e f',
      sourceType: 'paste',
    });

    const list = await listTexts();

    expect(list).toHaveLength(2);
    expect(list[0]?.id).toBe(second.id);
    expect(list[1]?.id).toBe(first.id);
    expect(list[0]!.updatedAt).toBeGreaterThan(list[1]!.updatedAt);
  });

  it('listTexts on an empty DB returns []', async () => {
    const list = await listTexts();
    expect(list).toEqual([]);
  });

  it('updateText persists the change and bumps updatedAt', async () => {
    const row = await createText({
      title: 'Old title',
      content: 'one two',
      sourceType: 'paste',
    });
    const originalUpdatedAt = row.updatedAt;
    await wait(TIMESTAMP_GAP_MS);

    await updateText(row.id, { title: 'new' });

    const fetched = (await getText(row.id)) as ReadingText;
    expect(fetched.title).toBe('new');
    expect(fetched.updatedAt).toBeGreaterThan(originalUpdatedAt);
  });

  it('updateProgress sets currentTokenIndex and bumps updatedAt', async () => {
    const row = await createText({
      title: 'Progress',
      content: 'many words here',
      sourceType: 'paste',
    });
    const originalUpdatedAt = row.updatedAt;
    await wait(TIMESTAMP_GAP_MS);

    await updateProgress(row.id, 42);

    const fetched = (await getText(row.id)) as ReadingText;
    expect(fetched.currentTokenIndex).toBe(42);
    expect(fetched.updatedAt).toBeGreaterThan(originalUpdatedAt);
  });

  it('markCompleted sets isCompleted=true and stamps completedAt', async () => {
    const row = await createText({
      title: 'Finish me',
      content: 'done',
      sourceType: 'paste',
    });
    const before = Date.now();

    await markCompleted(row.id);

    const fetched = (await getText(row.id)) as ReadingText;
    expect(fetched.isCompleted).toBe(true);
    expect(typeof fetched.completedAt).toBe('number');
    expect(fetched.completedAt!).toBeGreaterThanOrEqual(before);
  });

  it('deleteText removes the row', async () => {
    const row = await createText({
      title: 'Doomed',
      content: 'goodbye world',
      sourceType: 'paste',
    });

    await deleteText(row.id);

    const fetched = await getText(row.id);
    expect(fetched).toBeUndefined();
  });

  it('deleteText cascades to associated sessions', async () => {
    const row = await createText({
      title: 'With sessions',
      content: 'session text',
      sourceType: 'paste',
    });
    const session = await startSession(row.id);

    // Sanity-check that the session exists before deletion
    const before = await db.sessions.get(session.id);
    expect(before).toBeDefined();

    await deleteText(row.id);

    const afterSession = await db.sessions.get(session.id);
    expect(afterSession).toBeUndefined();
  });
});
