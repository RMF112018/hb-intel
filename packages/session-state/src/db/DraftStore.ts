/**
 * DraftStore — Draft persistence with TTL — SF12-T03, D-01/D-05
 */
import type { IDraftEntry } from '../types/index.js';
import { DRAFT_DEFAULT_TTL_HOURS } from '../constants/index.js';
import { openSessionDb, type IDraftEntryRecord } from './SessionDb.js';

/**
 * Computes an ISO expiration timestamp from a savedAt timestamp and TTL in hours.
 */
export function computeExpiresAt(savedAt: string, ttlHours: number): string {
  const d = new Date(savedAt);
  d.setTime(d.getTime() + ttlHours * 60 * 60 * 1000);
  return d.toISOString();
}

/**
 * Strips the internal `expiresAt` field, returning the public IDraftEntry shape.
 */
function toPublic(record: IDraftEntryRecord): IDraftEntry {
  const { expiresAt: _expiresAt, ...entry } = record;
  return entry;
}

/**
 * Saves a draft to IndexedDB with a computed expiration timestamp.
 * Returns the public IDraftEntry on success, or null if IDB is unavailable.
 */
export async function saveDraft(
  draftKey: string,
  value: unknown,
  ttlHours: number = DRAFT_DEFAULT_TTL_HOURS,
): Promise<IDraftEntry | null> {
  const db = await openSessionDb();
  if (!db) return null;

  try {
    const savedAt = new Date().toISOString();
    const record: IDraftEntryRecord = {
      draftKey,
      value,
      savedAt,
      ttlHours,
      expiresAt: computeExpiresAt(savedAt, ttlHours),
    };
    await db.put('drafts', record);
    return toPublic(record);
    /* v8 ignore start */
  } catch (err) {
    console.warn('[session-state] saveDraft failed:', err);
    return null;
  }
  /* v8 ignore stop */
}

/**
 * Loads a draft by key. Returns null if missing, expired, or IDB unavailable.
 * Expired drafts trigger a background cleanup (non-blocking).
 */
export async function loadDraft<T = unknown>(draftKey: string): Promise<T | null> {
  const db = await openSessionDb();
  if (!db) return null;

  try {
    const record = await db.get('drafts', draftKey);
    if (!record) return null;

    if (new Date(record.expiresAt) <= new Date()) {
      // Expired — trigger background cleanup
      db.delete('drafts', draftKey).catch(() => {});
      return null;
    }

    return record.value as T;
    /* v8 ignore start */
  } catch (err) {
    console.warn('[session-state] loadDraft failed:', err);
    return null;
  }
  /* v8 ignore stop */
}

/**
 * Deletes a draft by key. No-op if missing or IDB unavailable.
 */
export async function clearDraft(draftKey: string): Promise<void> {
  const db = await openSessionDb();
  if (!db) return;

  try {
    await db.delete('drafts', draftKey);
    /* v8 ignore start */
  } catch (err) {
    console.warn('[session-state] clearDraft failed:', err);
  }
  /* v8 ignore stop */
}

/**
 * Purges all drafts whose expiresAt is at or before the given ISO timestamp.
 * Uses the `expiresAt` index with an upper-bound range for efficient cursor scan.
 */
export async function purgeExpiredDrafts(nowIso?: string): Promise<number> {
  const db = await openSessionDb();
  if (!db) return 0;

  try {
    const cutoff = nowIso ?? new Date().toISOString();
    const tx = db.transaction('drafts', 'readwrite');
    const index = tx.store.index('expiresAt');
    const range = IDBKeyRange.upperBound(cutoff);

    let cursor = await index.openCursor(range);
    let count = 0;
    while (cursor) {
      await cursor.delete();
      count++;
      cursor = await cursor.continue();
    }

    await tx.done;
    return count;
    /* v8 ignore start */
  } catch (err) {
    console.warn('[session-state] purgeExpiredDrafts failed:', err);
    return 0;
  }
  /* v8 ignore stop */
}
