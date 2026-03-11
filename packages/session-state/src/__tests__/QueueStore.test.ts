import { deleteDB } from 'idb';
import {
  closeSessionDb,
  resetSessionDbPromise,
} from '../db/SessionDb.js';
import {
  enqueue,
  listPending,
  markAttempt,
  remove,
  markFailed,
} from '../db/QueueStore.js';
import { SESSION_DB_NAME, QUEUE_DEFAULT_MAX_RETRIES } from '../constants/index.js';

beforeEach(async () => {
  await closeSessionDb();
  resetSessionDbPromise();
  await deleteDB(SESSION_DB_NAME);
});

afterEach(async () => {
  await closeSessionDb();
  resetSessionDbPromise();
});

describe('QueueStore', () => {
  describe('enqueue', () => {
    it('creates an operation with UUID, zero retryCount, and timestamps', async () => {
      const op = await enqueue({
        type: 'upload',
        target: '/api/docs',
        payload: { fileId: '123' },
      });

      expect(op).not.toBeNull();
      expect(op!.operationId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(op!.type).toBe('upload');
      expect(op!.target).toBe('/api/docs');
      expect(op!.payload).toEqual({ fileId: '123' });
      expect(op!.retryCount).toBe(0);
      expect(op!.maxRetries).toBe(QUEUE_DEFAULT_MAX_RETRIES);
      expect(op!.createdAt).toBeTruthy();
      expect(op!.lastAttemptAt).toBeNull();
      expect(op!.lastError).toBeNull();
    });

    it('uses default maxRetries of 5', async () => {
      const op = await enqueue({
        type: 'acknowledgment',
        target: '/api/ack',
        payload: null,
      });
      expect(op!.maxRetries).toBe(5);
    });

    it('accepts custom maxRetries', async () => {
      const op = await enqueue({
        type: 'form-save',
        target: '/api/forms',
        payload: {},
        maxRetries: 10,
      });
      expect(op!.maxRetries).toBe(10);
    });
  });

  describe('listPending', () => {
    it('returns operations sorted by createdAt ASC', async () => {
      // Insert operations with distinct timestamps to guarantee sort order
      const { openSessionDb } = await import('../db/SessionDb.js');
      const db = await openSessionDb();

      const makeOp = (id: string, createdAt: string) => ({
        operationId: id,
        type: 'upload' as const,
        target: '/test',
        payload: null,
        retryCount: 0,
        maxRetries: 5,
        createdAt,
        lastAttemptAt: null,
        lastError: null,
      });

      await db!.put('queue', makeOp('op-c', '2026-01-03T00:00:00.000Z'));
      await db!.put('queue', makeOp('op-a', '2026-01-01T00:00:00.000Z'));
      await db!.put('queue', makeOp('op-b', '2026-01-02T00:00:00.000Z'));

      const pending = await listPending();
      expect(pending).toHaveLength(3);
      expect(pending[0].operationId).toBe('op-a');
      expect(pending[1].operationId).toBe('op-b');
      expect(pending[2].operationId).toBe('op-c');
    });

    it('excludes failed operations (retryCount >= maxRetries)', async () => {
      const op = await enqueue({
        type: 'upload',
        target: '/fail',
        payload: null,
        maxRetries: 1,
      });
      await markAttempt(op!.operationId, 'network error');

      const pending = await listPending();
      expect(pending).toHaveLength(0);
    });

    it('returns empty array when no operations exist', async () => {
      const pending = await listPending();
      expect(pending).toEqual([]);
    });
  });

  describe('markAttempt', () => {
    it('increments retryCount and sets lastAttemptAt', async () => {
      const op = await enqueue({ type: 'upload', target: '/test', payload: null });

      const updated = await markAttempt(op!.operationId);
      expect(updated!.retryCount).toBe(1);
      expect(updated!.lastAttemptAt).toBeTruthy();
      expect(updated!.lastError).toBeNull();
    });

    it('records the error string when provided', async () => {
      const op = await enqueue({ type: 'upload', target: '/test', payload: null });

      const updated = await markAttempt(op!.operationId, 'timeout');
      expect(updated!.lastError).toBe('timeout');
    });

    it('returns null for nonexistent operationId', async () => {
      const result = await markAttempt('nonexistent-id');
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('deletes an operation from the store', async () => {
      const op = await enqueue({ type: 'upload', target: '/test', payload: null });
      await remove(op!.operationId);

      const pending = await listPending();
      expect(pending).toHaveLength(0);
    });

    it('is a no-op for nonexistent operationId', async () => {
      await remove('nonexistent-id');
    });
  });

  describe('markFailed', () => {
    it('sets retryCount equal to maxRetries', async () => {
      const op = await enqueue({
        type: 'upload',
        target: '/test',
        payload: null,
        maxRetries: 5,
      });

      const failed = await markFailed(op!.operationId, 'permanent failure');
      expect(failed!.retryCount).toBe(5);
      expect(failed!.lastError).toBe('permanent failure');
      expect(failed!.lastAttemptAt).toBeTruthy();
    });

    it('keeps the operation in the store (for UI surfacing)', async () => {
      const op = await enqueue({ type: 'upload', target: '/test', payload: null });
      await markFailed(op!.operationId, 'fatal');

      // Not in pending (failed), but still in DB
      const pending = await listPending();
      expect(pending).toHaveLength(0);

      // Verify it's still in the store by direct DB access
      const { openSessionDb } = await import('../db/SessionDb.js');
      const db = await openSessionDb();
      const record = await db!.get('queue', op!.operationId);
      expect(record).toBeTruthy();
      expect(record!.lastError).toBe('fatal');
    });

    it('returns null for nonexistent operationId', async () => {
      const result = await markFailed('nonexistent-id', 'error');
      expect(result).toBeNull();
    });
  });

});
