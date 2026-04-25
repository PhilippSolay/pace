/**
 * Repository functions for the `ReadingText` table.
 *
 * Provides CRUD + progress-tracking API on top of the Dexie IndexedDB store
 * defined in `./schema`. Consumed by the Library and Reader surfaces.
 *
 * See: .gsd/milestones/M001/slices/S03/tasks/T01-PLAN.md
 */

import { db, type ReadingText, type SourceType } from './schema';

/** Create a new reading text with a fresh id, timestamps, and word count. */
export async function createText(input: {
  title: string;
  content: string;
  sourceType: SourceType;
  author?: string;
  url?: string;
}): Promise<ReadingText> {
  const now = Date.now();
  const wordCount = input.content.trim().split(/\s+/u).filter(Boolean).length;
  const row: ReadingText = {
    id: crypto.randomUUID(),
    title: input.title,
    ...(input.author ? { author: input.author } : {}),
    ...(input.url ? { url: input.url } : {}),
    content: input.content,
    sourceType: input.sourceType,
    createdAt: now,
    updatedAt: now,
    wordCount,
    currentTokenIndex: 0,
    isCompleted: false,
  };
  await db.texts.add(row);
  return row;
}

/** Fetch a single text by id, or undefined if not found. */
export async function getText(id: string): Promise<ReadingText | undefined> {
  return db.texts.get(id);
}

/** List all texts sorted by updatedAt descending (newest first). */
export async function listTexts(): Promise<ReadingText[]> {
  return db.texts.orderBy('updatedAt').reverse().toArray();
}

/** Apply a partial update to a text, bumping updatedAt automatically. */
export async function updateText(
  id: string,
  patch: Partial<Omit<ReadingText, 'id'>>,
): Promise<void> {
  await db.texts.update(id, { ...patch, updatedAt: Date.now() });
}

/** Delete a text row and cascade-delete its sessions in a single transaction. */
export async function deleteText(id: string): Promise<void> {
  await db.transaction('rw', db.texts, db.sessions, async () => {
    await db.sessions.where('textId').equals(id).delete();
    await db.texts.delete(id);
  });
}

/** Persist reading progress by updating currentTokenIndex and updatedAt. */
export async function updateProgress(
  id: string,
  currentTokenIndex: number,
): Promise<void> {
  await db.texts.update(id, { currentTokenIndex, updatedAt: Date.now() });
}

/** Mark a text as completed, stamping isCompleted, completedAt, and updatedAt. */
export async function markCompleted(id: string): Promise<void> {
  const now = Date.now();
  await db.texts.update(id, {
    isCompleted: true,
    completedAt: now,
    updatedAt: now,
  });
}
