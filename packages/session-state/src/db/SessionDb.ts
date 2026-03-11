/**
 * SessionDb — idb-based IndexedDB connection manager — SF12-T03, D-01
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

import type { IDraftEntry, IQueuedOperation } from '../types/index.js';
import {
  SESSION_DB_NAME,
  SESSION_DB_VERSION,
  DRAFT_STORE_NAME,
  QUEUE_STORE_NAME,
} from '../constants/index.js';

/**
 * Internal record shape stored in the `drafts` object store.
 * Extends IDraftEntry with a computed `expiresAt` for index-based purge.
 */
export interface IDraftEntryRecord extends IDraftEntry {
  expiresAt: string;
}

/**
 * Typed idb schema for the session-state database.
 */
export interface SessionDbSchema extends DBSchema {
  [DRAFT_STORE_NAME]: {
    key: string;
    value: IDraftEntryRecord;
    indexes: { expiresAt: string };
  };
  [QUEUE_STORE_NAME]: {
    key: string;
    value: IQueuedOperation;
    indexes: { createdAt: string; retryCount: number };
  };
}

let dbPromise: Promise<IDBPDatabase<SessionDbSchema> | null> | null = null;

/**
 * Opens (or returns cached) the session-state IndexedDB.
 * Returns `null` when IndexedDB is unavailable.
 */
export function openSessionDb(): Promise<IDBPDatabase<SessionDbSchema> | null> {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    try {
      return await openDB<SessionDbSchema>(SESSION_DB_NAME, SESSION_DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(DRAFT_STORE_NAME)) {
            const drafts = db.createObjectStore(DRAFT_STORE_NAME, { keyPath: 'draftKey' });
            drafts.createIndex('expiresAt', 'expiresAt');
          }
          if (!db.objectStoreNames.contains(QUEUE_STORE_NAME)) {
            const queue = db.createObjectStore(QUEUE_STORE_NAME, { keyPath: 'operationId' });
            queue.createIndex('createdAt', 'createdAt');
            queue.createIndex('retryCount', 'retryCount');
          }
        },
      });
      /* v8 ignore start */
    } catch (err) {
      console.warn('[session-state] IndexedDB unavailable:', err);
      return null;
    }
    /* v8 ignore stop */
  })();

  return dbPromise;
}

/**
 * Closes the cached database connection and clears the singleton.
 * Intended for test teardown and explicit cleanup.
 */
export async function closeSessionDb(): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  db?.close();
  dbPromise = null;
}

/**
 * Clears the singleton promise without closing the connection.
 * Useful for test isolation when the underlying DB is deleted externally.
 */
export function resetSessionDbPromise(): void {
  dbPromise = null;
}
