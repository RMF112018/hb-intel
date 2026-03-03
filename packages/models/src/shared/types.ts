/**
 * Shared type aliases used across all domains.
 *
 * @module shared/types
 */

/** Sort direction for list queries. */
export type SortOrder = 'asc' | 'desc';

/** ISO-8601 date string (e.g. `"2026-03-03T12:00:00Z"`). */
export type DateString = string;

/** Opaque entity identifier — numeric or UUID depending on the persistence layer. */
export type EntityId = string | number;
