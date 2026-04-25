/**
 * Pace PWA — Persistence Layer Schema
 *
 * Dexie.js (IndexedDB) schema + typed DB class for the Pace mobile RSVP reader.
 * Persistence is local-only; no server sync. Three tables: texts, sessions,
 * preferences. Repository functions live in sibling modules (`texts.ts`,
 * `sessions.ts`, `preferences.ts`) and import the `db` singleton from here.
 *
 * See: .gsd/milestones/M001/slices/S03/tasks/T01-PLAN.md §9
 *      (persistence schema, indices, and the singleton DB pattern).
 */

import Dexie, { Table } from 'dexie';

/**
 * How a ReadingText entered the library.
 * - `paste`: pasted raw text into the import dialog
 * - `pdf`:   imported from a local PDF file
 * - `share`: received via the Web Share Target API
 * - `url`:   fetched/extracted from a URL
 */
export type SourceType = 'paste' | 'pdf' | 'share' | 'url';

/**
 * A single reading in the user's library.
 * Indexed by `id` (UUID v4); secondary indices on `updatedAt` (for recency
 * sorts) and `isCompleted` (for library filtering).
 */
export interface ReadingText {
  id: string;                       // UUID v4
  title: string;
  author?: string;                  // optional attribution shown in Library meta row
  url?: string;                     // optional source URL — small external-link icon in Library
  content: string;                  // raw post-processed text
  sourceType: SourceType;
  createdAt: number;                // epoch ms
  updatedAt: number;
  wordCount: number;
  currentTokenIndex: number;
  isCompleted: boolean;
  completedAt?: number;
}

/**
 * A single reading session against a ReadingText. Multiple sessions may
 * exist per text as the user pauses and resumes. Indexed by `id`, with
 * secondary indices on `textId` and `startedAt` for per-text history.
 */
export interface ReadingSession {
  id: string;
  textId: string;
  startedAt: number;
  endedAt?: number;
  tokensRead: number;
  averageWPM: number;
}

/**
 * User preferences — always a single row keyed by the literal `'singleton'`.
 * Contains reading tunables (wpm, typography, colors) and UX flags
 * (haptics, guide lines, welcome completion).
 */
export interface UserPreferences {
  id: 'singleton';
  wpm: number;
  fontFamily: string;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  pinColor: string;
  highlightPin: boolean;
  showGuideLines: boolean;
  punctuationPauses: boolean;
  haptics: boolean;
  hasCompletedWelcome: boolean;
}

/**
 * Default preferences seeded on first launch. Consumers should deep-copy
 * this object before mutating (or, preferably, treat it as immutable and
 * construct new objects via spread).
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  id: 'singleton',
  wpm: 350,
  fontFamily: 'EB Garamond',
  fontSize: 72,
  backgroundColor: '#0A0A0A',
  textColor: '#F0F0F2',
  pinColor: '#D94050',
  highlightPin: true,
  showGuideLines: true,
  punctuationPauses: false,
  haptics: true,
  hasCompletedWelcome: false,
};

/**
 * Typed Dexie database for Pace. Version 1 declares three object stores:
 * - `texts`        PK `id`, indices on `updatedAt`, `isCompleted`
 * - `sessions`     PK `id`, indices on `textId`, `startedAt`
 * - `preferences`  PK `id` (singleton row)
 */
export class PaceDB extends Dexie {
  texts!: Table<ReadingText, string>;
  sessions!: Table<ReadingSession, string>;
  preferences!: Table<UserPreferences, string>;

  constructor() {
    super('pace');
    this.version(1).stores({
      texts: 'id, updatedAt, isCompleted',
      sessions: 'id, textId, startedAt',
      preferences: 'id',
    });
  }
}

/**
 * Module-scope singleton database instance. Import this directly from
 * repository modules — do not construct additional `PaceDB` instances,
 * as Dexie treats each constructor call as a separate connection.
 */
export const db = new PaceDB();
