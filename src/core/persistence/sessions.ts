/**
 * Repository for the `ReadingSession` table.
 *
 * Sessions record when a user started/ended reading a text. Used by the
 * Completion screen (S06) for "finished in X minutes" stats and by history
 * views for per-text session lists.
 *
 * See: .gsd/milestones/M001/slices/S03/tasks/T01-PLAN.md
 */

import { db, type ReadingSession } from './schema';

/** Start a new session for a text; returns the persisted row. */
export async function startSession(textId: string): Promise<ReadingSession> {
  const row: ReadingSession = {
    id: crypto.randomUUID(),
    textId,
    startedAt: Date.now(),
    tokensRead: 0,
    averageWPM: 0,
  };
  await db.sessions.add(row);
  return row;
}

/** Stamp endedAt + final metrics onto an existing session. No-op if missing. */
export async function endSession(
  id: string,
  patch: { tokensRead: number; averageWPM: number },
): Promise<void> {
  await db.sessions.update(id, { endedAt: Date.now(), ...patch });
}

/** List all sessions for a text, newest-first. */
export async function listSessionsForText(
  textId: string,
): Promise<ReadingSession[]> {
  const rows = await db.sessions
    .where('textId')
    .equals(textId)
    .reverse()
    .sortBy('startedAt');
  return rows;
}
