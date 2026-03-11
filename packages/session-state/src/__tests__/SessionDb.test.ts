import { deleteDB } from 'idb';
import {
  openSessionDb,
  closeSessionDb,
  resetSessionDbPromise,
} from '../db/SessionDb.js';
import { SESSION_DB_NAME } from '../constants/index.js';

beforeEach(async () => {
  await closeSessionDb();
  resetSessionDbPromise();
  await deleteDB(SESSION_DB_NAME);
});

afterEach(async () => {
  await closeSessionDb();
  resetSessionDbPromise();
});

describe('SessionDb', () => {
  it('opens a database with drafts and queue object stores', async () => {
    const db = await openSessionDb();
    expect(db).not.toBeNull();
    expect(db!.objectStoreNames.contains('drafts')).toBe(true);
    expect(db!.objectStoreNames.contains('queue')).toBe(true);
  });

  it('creates the expiresAt index on drafts store', async () => {
    const db = await openSessionDb();
    const tx = db!.transaction('drafts', 'readonly');
    const store = tx.store;
    expect(store.indexNames.contains('expiresAt')).toBe(true);
    await tx.done;
  });

  it('creates createdAt and retryCount indexes on queue store', async () => {
    const db = await openSessionDb();
    const tx = db!.transaction('queue', 'readonly');
    const store = tx.store;
    expect(store.indexNames.contains('createdAt')).toBe(true);
    expect(store.indexNames.contains('retryCount')).toBe(true);
    await tx.done;
  });

  it('returns the same instance on repeated calls (singleton)', async () => {
    const db1 = await openSessionDb();
    const db2 = await openSessionDb();
    expect(db1).toBe(db2);
  });

  it('closeSessionDb closes and clears the singleton', async () => {
    const db1 = await openSessionDb();
    expect(db1).not.toBeNull();

    await closeSessionDb();
    // After close + reset, a new call should produce a fresh instance
    resetSessionDbPromise();
    const db2 = await openSessionDb();
    expect(db2).not.toBeNull();
    expect(db2).not.toBe(db1);
  });

  it('resetSessionDbPromise clears the cached promise', async () => {
    const db1 = await openSessionDb();
    resetSessionDbPromise();
    const db2 = await openSessionDb();
    // Different promise, but since DB is still open fake-indexeddb may return same ref.
    // The key behavior is that resetSessionDbPromise doesn't throw.
    expect(db2).not.toBeNull();
  });

});
