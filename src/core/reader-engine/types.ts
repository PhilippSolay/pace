/**
 * @module core/reader-engine/types
 *
 * Shared type vocabulary for the Pace reader engine.
 *
 * This module defines the pure type surface used by the reader engine's
 * four composable modules (tokenize, pin, timing) and the stateful class
 * that wires them together (engine).
 *
 * MODULE BOUNDARY: types-only. No runtime code is exported from this file
 * except for the `DEFAULT_READER_SETTINGS` constant, which is a frozen
 * default-value table consumed by the engine constructor. Importing this
 * module must not produce any side effects.
 *
 * Strict-mode notes for consumers:
 * - `exactOptionalPropertyTypes: true` — optional fields on these
 *   interfaces (e.g. `onFinish?`) may be omitted entirely, but callers
 *   must NOT explicitly pass `undefined` for them.
 * - `noUncheckedIndexedAccess: true` — any `tokens[i]` access yields
 *   `ReaderToken | undefined`; downstream code is responsible for
 *   narrowing before use.
 */

/**
 * A single token produced by the tokenizer.
 *
 * A token is either:
 *  - a word (possibly with attached punctuation, e.g. `"hello,"` or `"—"`), or
 *  - a paragraph-break marker, in which case `text` is the empty string `""`
 *    and `isParagraphBreak` is `true`.
 *
 * `index` is the token's 0-indexed position within the tokens array.
 */
export interface ReaderToken {
  text: string;
  isParagraphBreak: boolean;
  index: number;
}

/**
 * The subset of user preferences that affect reader timing.
 *
 * The full `UserPreferences` type lives in `core/persistence` (S03);
 * this interface is the narrow slice the reader engine actually reads
 * so that the engine does not depend on the persistence layer.
 *
 *  - `wpm`: target words-per-minute (valid range 150–800, default 350).
 *  - `punctuationPauses`: when `false`, timing skips punctuation
 *    multipliers and treats every token as a plain word.
 */
export interface ReaderSettings {
  wpm: number;
  punctuationPauses: boolean;
}

/**
 * Default reader settings applied when the engine is constructed
 * without explicit settings, and used as the merge base for any
 * `Partial<ReaderSettings>` supplied by the caller.
 */
export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  wpm: 350,
  punctuationPauses: true,
};

/**
 * Public, immutable snapshot of the reader engine's state.
 *
 * The engine emits a fresh `ReaderEngineState` object on every
 * index change (never mutates a previous snapshot).
 *
 *  - `index`: current token index, in the range `0..tokens.length`.
 *  - `isPlaying`: whether the engine's internal tick is active.
 *  - `totalTokens`: total number of tokens in the source.
 *  - `word`: `text` of the current token, or `''` if a paragraph break.
 *  - `progress`: normalized progress in `[0, 1]`.
 *  - `isFinished`: `true` when `index >= totalTokens`.
 */
export interface ReaderEngineState {
  index: number;
  isPlaying: boolean;
  totalTokens: number;
  word: string;
  progress: number;
  isFinished: boolean;
}

/**
 * Constructor options for the `ReaderEngine` class.
 *
 * Optional fields follow `exactOptionalPropertyTypes` semantics: they
 * may be omitted from the object literal, but callers must not pass
 * `undefined` explicitly. `settings`, when supplied, is shallow-merged
 * on top of `DEFAULT_READER_SETTINGS`.
 */
export interface ReaderEngineOptions {
  tokens: ReaderToken[];
  settings?: Partial<ReaderSettings>;
  onFinish?: () => void;
  onChange?: (state: ReaderEngineState) => void;
}
