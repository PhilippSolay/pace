/**
 * Repository for the `UserPreferences` singleton row.
 *
 * Exactly one preferences row exists, keyed by the literal `'singleton'`.
 * First-read auto-seeds from `DEFAULT_PREFERENCES`; reads are memoized via a
 * module-scoped Promise so concurrent callers share one initialization.
 *
 * See: .gsd/milestones/M001/slices/S03/tasks/T01-PLAN.md
 */

import { db, DEFAULT_PREFERENCES, type UserPreferences } from './schema';

const SINGLETON_ID = 'singleton' as const;

let cached: Promise<UserPreferences> | null = null;

function invalidate(): void {
  cached = null;
}

async function loadOrSeed(): Promise<UserPreferences> {
  const existing = await db.preferences.get(SINGLETON_ID);
  if (existing) return existing;
  await db.preferences.put(DEFAULT_PREFERENCES);
  return DEFAULT_PREFERENCES;
}

/** Return the preferences singleton, auto-seeding on first call. */
export async function getPreferences(): Promise<UserPreferences> {
  if (!cached) cached = loadOrSeed();
  return cached;
}

/** Update a single preference field (ergonomic for toggles). */
export async function setPreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K],
): Promise<void> {
  await getPreferences();
  await db.preferences.update(SINGLETON_ID, { [key]: value });
  invalidate();
}

/** Apply a partial patch to the singleton. */
export async function updatePreferences(
  patch: Partial<Omit<UserPreferences, 'id'>>,
): Promise<void> {
  await getPreferences();
  await db.preferences.update(SINGLETON_ID, patch);
  invalidate();
}

/** Replace the singleton with DEFAULT_PREFERENCES (Settings → Clear all data). */
export async function resetPreferences(): Promise<void> {
  await db.preferences.put(DEFAULT_PREFERENCES);
  invalidate();
}
