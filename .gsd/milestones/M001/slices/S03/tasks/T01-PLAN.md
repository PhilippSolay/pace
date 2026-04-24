# T01: Persistence layer — Dexie schema + 3 repos + tests

**Slice:** S03
**Milestone:** M001

## Goal

Land the Dexie-backed persistence layer. Four modules under `src/core/persistence/` plus unit tests, all driven by a shared schema.

## Must-Haves

### Truths
- `npm run test` passes; new tests bring total to ~70
- Coverage on `src/core/persistence/**` ≥ 95%
- A ReadingText round-trips through `createText` + `getText` with identical content
- `listTexts` returns newest-updated first
- `updateProgress(id, index)` bumps `updatedAt` and updates `currentTokenIndex`
- `getPreferences()` auto-creates the singleton row on first call with `DEFAULT_PREFERENCES`
- `setPreference({ hasCompletedWelcome: true })` persists across a fresh DB instance (fake-indexeddb test)

### Artifacts
- `src/core/persistence/schema.ts` — `PaceDB` class + `db` singleton + 3 interface exports + `DEFAULT_PREFERENCES` constant
- `src/core/persistence/texts.ts` — text repository functions
- `src/core/persistence/preferences.ts` — preferences repository (singleton row)
- `src/core/persistence/sessions.ts` — session repository
- `tests/unit/persistence/texts.test.ts`
- `tests/unit/persistence/preferences.test.ts`
- `tests/unit/persistence/sessions.test.ts`
- `tests/setup.ts` — `import 'fake-indexeddb/auto'`
- `package.json` — adds `dexie`, `dexie-react-hooks`, `fake-indexeddb` (dev)
- `vite.config.ts` — adds `test.setupFiles: ['./tests/setup.ts']`

### Schema (authoritative — all agents work against this)

```ts
// schema.ts
import Dexie, { Table } from 'dexie';

export type SourceType = 'paste' | 'pdf' | 'share' | 'url';

export interface ReadingText {
  id: string;                       // UUID v4
  title: string;
  content: string;                  // raw post-processed text
  sourceType: SourceType;
  createdAt: number;                // epoch ms
  updatedAt: number;
  wordCount: number;                // computed at create time
  currentTokenIndex: number;        // 0-based token index
  isCompleted: boolean;
  completedAt?: number;
}

export interface ReadingSession {
  id: string;
  textId: string;                   // FK to ReadingText.id
  startedAt: number;
  endedAt?: number;
  tokensRead: number;
  averageWPM: number;
}

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
  punctuationPauses: false,  // per D028 — design default is OFF
  haptics: true,
  hasCompletedWelcome: false,
};

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

export const db = new PaceDB();
```

### Repository function signatures

**texts.ts:**
```ts
createText(input: { title: string; content: string; sourceType: SourceType }): Promise<ReadingText>
getText(id: string): Promise<ReadingText | undefined>
listTexts(): Promise<ReadingText[]>  // sorted by updatedAt desc
updateText(id: string, patch: Partial<ReadingText>): Promise<void>
deleteText(id: string): Promise<void>
updateProgress(id: string, currentTokenIndex: number): Promise<void>
markCompleted(id: string): Promise<void>
```

**preferences.ts:**
```ts
getPreferences(): Promise<UserPreferences>  // auto-creates singleton if missing
setPreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]): Promise<void>
updatePreferences(patch: Partial<UserPreferences>): Promise<void>
resetPreferences(): Promise<void>
```

**sessions.ts:**
```ts
startSession(textId: string): Promise<ReadingSession>
endSession(id: string, patch: { tokensRead: number; averageWPM: number }): Promise<void>
```

## Steps

1. `npm install dexie dexie-react-hooks`
2. `npm install -D fake-indexeddb`
3. Write `tests/setup.ts` with `import 'fake-indexeddb/auto';`
4. Add `test.setupFiles: ['./tests/setup.ts']` to `vite.config.ts`
5. Dispatch 4 parallel agents per the S03-PLAN (schema, texts, prefs+sessions, tests)
6. After agents return, verify typecheck, lint, tests, build all clean
7. Commit + T01-SUMMARY

## Context

- Use `crypto.randomUUID()` for text IDs (standard on all target browsers)
- `wordCount` computed as `content.trim().split(/\s+/u).length` at create time (cheap approximation; the tokenizer from S02 handles the real tokenization later)
- `updateProgress` does a transaction: `updatedAt = Date.now()` + `currentTokenIndex = patch`
- `listTexts` must use `db.texts.orderBy('updatedAt').reverse().toArray()` — uses the `updatedAt` index declared in schema
- `getPreferences()` uses `.get('singleton')`; if undefined, `.put(DEFAULT_PREFERENCES)` then return it. Guard against race via a module-scoped Promise cache (memoize first call)
- Tests run in jsdom + fake-indexeddb. Reset the DB between tests: `afterEach(() => db.delete().then(() => db.open()))` or similar — verify the pattern works with fake-indexeddb's persistence model
